import json
import uuid
import os
from datetime import datetime, timedelta
from decimal import Decimal
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User, CustomerProfile
from models.marketplace import (
    Product, ProductVariant, ParentOrder, SubOrder, OrderItem,
    OrderTimelineEvent, LipaNaMpesaTransaction, FloristWallet, WalletLedger
)

checkout_bp = Blueprint('checkout', __name__, url_prefix='/api/v1/checkout')

def is_development_environment():
    """
    Checks if the application is strictly running in a local/development environment.
    Returns False in production, Render deployment, or when production configuration is active.
    """
    env_name = (current_app.config.get('ENV') or os.environ.get('FLASK_ENV') or os.environ.get('APP_ENV') or '').lower()
    is_prod_env = env_name == 'production' or os.environ.get('RENDER') is not None or os.environ.get('NODE_ENV') == 'production'
    is_dev_mode = env_name == 'development' or current_app.config.get('DEBUG') is True or os.environ.get('ENABLE_PAYMENT_SIMULATOR') == 'true'
    
    return is_dev_mode and not is_prod_env

@checkout_bp.route('/create-session', methods=['POST'])
@jwt_required()
def create_session():
    """
    Validates cart items, performs pessimistic stock locking & reservation,
    calculates multi-vendor delivery fees and 20% platform commissions,
    splits orders by florist, and registers Parent and child SubOrders.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.deleted_at is not None:
        return jsonify({
            "success": False,
            "error": {
                "code": "RESOURCE_NOT_FOUND",
                "message": "User session not found or inactive."
            }
        }), 404

    cp = user.customer_profile
    if not cp:
        return jsonify({
            "success": False,
            "error": {
                "code": "RESOURCE_NOT_FOUND",
                "message": "Customer profile is required to proceed with checkout."
            }
        }), 404

    data = request.get_json() or {}
    recipient_name = data.get('recipient_name', '').strip()
    recipient_phone = data.get('recipient_phone', '').strip()
    delivery_address = data.get('delivery_address', '').strip()
    delivery_latitude = data.get('delivery_latitude')
    delivery_longitude = data.get('delivery_longitude')
    delivery_date_str = data.get('delivery_date', '')
    delivery_instructions = data.get('delivery_instructions', '')
    delivery_slot = data.get('delivery_slot', 'Standard (9 AM - 5 PM)')
    items = data.get('items', [])

    # Validation
    if not recipient_name or not recipient_phone or not delivery_address or not delivery_date_str or not items:
        return jsonify({
            "success": False,
            "error": {
                "code": "VALIDATION_FAILED",
                "message": "Missing required shipping or items parameters.",
                "details": [
                    {"field": "recipient_name", "issue": "Recipient name is required."} if not recipient_name else {},
                    {"field": "recipient_phone", "issue": "Recipient phone number is required."} if not recipient_phone else {},
                    {"field": "delivery_address", "issue": "Delivery address is required."} if not delivery_address else {},
                    {"field": "delivery_date", "issue": "Delivery date is required."} if not delivery_date_str else {},
                    {"field": "items", "issue": "Cart items list is required."} if not items else {}
                ]
            }
        }), 422

    try:
        delivery_date = datetime.strptime(delivery_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({
            "success": False,
            "error": {
                "code": "VALIDATION_FAILED",
                "message": "Delivery date must be in YYYY-MM-DD format."
            }
        }), 422

    try:
        # We wrap in a transaction to ensure all inventory changes and orders are committed atomically
        # Group items by florist to split orders
        florist_orders = {}

        for item in items:
            product_id = item.get('product_id')
            size = item.get('size', 'Standard')
            qty = int(item.get('quantity', 1))
            gift_card_message = item.get('cardMessage', item.get('gift_card_message', ''))

            if qty <= 0:
                continue

            product = Product.query.get(product_id)
            if not product or product.deleted_at is not None or not product.is_active:
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "VALIDATION_FAILED",
                        "message": f"Product with ID {product_id} is inactive or does not exist."
                    }
                }), 422

            # Pessimistic locking of the variant row to avoid race conditions
            variant = ProductVariant.query.filter_by(product_id=product.id, title=size).with_for_update().first()
            if not variant:
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "VALIDATION_FAILED",
                        "message": f"Product variant '{size}' for '{product.title}' is not available."
                    }
                }), 422

            if variant.inventory_qty < qty:
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "VALIDATION_FAILED",
                        "message": f"Insufficient inventory for '{product.title}' ({size}). Only {variant.inventory_qty} remaining."
                    }
                }), 422

            # Reserve/deduct inventory immediately
            variant.inventory_qty -= qty

            # Add to florist bucket
            florist_id = product.florist_id
            if florist_id not in florist_orders:
                florist_orders[florist_id] = {
                    "subtotal": Decimal('0.00'),
                    "items": [],
                    "gift_message": gift_card_message
                }

            item_price = Decimal(str(variant.price))
            item_total = item_price * qty
            florist_orders[florist_id]["subtotal"] += item_total
            florist_orders[florist_id]["items"].append({
                "variant_id": variant.id,
                "quantity": qty,
                "unit_price": item_price,
                "gift_card_message": gift_card_message
            })

            # Use the latest message if multiple items have card messages
            if gift_card_message:
                florist_orders[florist_id]["gift_message"] = gift_card_message

        if not florist_orders:
            return jsonify({
                "success": False,
                "error": {
                    "code": "VALIDATION_FAILED",
                    "message": "No valid items to checkout."
                }
            }), 422

        # Financial Calculations
        base_delivery_fee = Decimal('350.00')  # Flat KES fee per florist
        total_delivery_fees = Decimal('0.00')
        grand_subtotal = Decimal('0.00')

        # Calculate totals
        for florist_id, details in florist_orders.items():
            total_delivery_fees += base_delivery_fee
            grand_subtotal += details["subtotal"]

        grand_total = grand_subtotal + total_delivery_fees

        # Create ParentOrder container
        parent_order = ParentOrder(
            customer_id=cp.id,
            grand_total=grand_total,
            discount_amount=Decimal('0.00'),
            payment_status='unpaid'
        )
        db.session.add(parent_order)
        db.session.flush()  # Generate ID

        # Create child SubOrders
        for florist_id, details in florist_orders.items():
            sub_total = details["subtotal"]
            delivery_fee = base_delivery_fee
            
            # Platform commission on florist items subtotal (default 20%)
            active_commission_percent = Decimal('20.00')
            commission_rate = active_commission_percent / Decimal('100.00')
            platform_commission = (sub_total * commission_rate).quantize(Decimal('0.01'))
            # Florist earnings include delivery fee but deduct platform commission
            florist_net_earnings = sub_total - platform_commission + delivery_fee

            sub_order = SubOrder(
                parent_order_id=parent_order.id,
                florist_id=florist_id,
                sub_total=sub_total,
                delivery_fee=delivery_fee,
                tax_amount=Decimal('0.00'),
                platform_commission=platform_commission,
                florist_net_earnings=florist_net_earnings,
                fulfillment_status='received',
                recipient_name=recipient_name,
                recipient_phone=recipient_phone,
                delivery_address=delivery_address,
                delivery_latitude=Decimal(str(delivery_latitude or -1.2921)),
                delivery_longitude=Decimal(str(delivery_longitude or 36.8219)),
                delivery_date=delivery_date,
                delivery_slot=delivery_slot,
                gift_card_message=details["gift_message"] or None,
                delivery_instructions=delivery_instructions or None
            )
            db.session.add(sub_order)
            db.session.flush()

            # Create OrderItems for the SubOrder
            for i in details["items"]:
                order_item = OrderItem(
                    sub_order_id=sub_order.id,
                    variant_id=i["variant_id"],
                    quantity=i["quantity"],
                    unit_price=i["unit_price"]
                )
                db.session.add(order_item)

            # Create OrderTimelineEvent
            timeline = OrderTimelineEvent(
                sub_order_id=sub_order.id,
                event_status='received',
                description='Order split registered and awaiting secure settlement confirmation.',
                notified_customer=False
            )
            db.session.add(timeline)

        db.session.commit()

        return jsonify({
            "success": True,
            "data": {
                "parent_order_id": parent_order.id,
                "grand_total": float(grand_total),
                "breakdown": {
                    "items_subtotal": float(grand_subtotal),
                    "discount_amount": 0.0,
                    "delivery_fees_total": float(total_delivery_fees),
                    "tax_total": 0.0
                }
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": {
                "code": "SERVER_ERROR",
                "message": f"An error occurred during order splitting: {str(e)}"
            }
        }), 500


@checkout_bp.route('/pay-mpesa', methods=['POST'])
@jwt_required()
def pay_mpesa():
    """
    Registers a pending payment transaction intent for Safaricom Lipa Na M-Pesa.
    Preserves historical payment transaction records without deleting failed attempts.
    Re-reserves inventory if retrying a previously failed order payment.
    """
    data = request.get_json() or {}
    parent_order_id = data.get('parent_order_id')
    mpesa_phone = data.get('mpesa_phone', '').strip()

    if not parent_order_id or not mpesa_phone:
        return jsonify({
            "success": False,
            "error": {
                "code": "VALIDATION_FAILED",
                "message": "parent_order_id and mpesa_phone parameters are required."
            }
        }), 422

    parent_order = ParentOrder.query.get(parent_order_id)
    if not parent_order:
        return jsonify({
            "success": False,
            "error": {
                "code": "RESOURCE_NOT_FOUND",
                "message": "The specified Parent Order could not be found."
            }
        }), 404

    if parent_order.payment_status == 'paid':
        return jsonify({
            "success": False,
            "error": {
                "code": "BAD_REQUEST",
                "message": "This order is already paid and settled."
            }
        }), 400

    try:
        # Standardize Kenyan phone number formatting
        cleaned_phone = mpesa_phone
        if cleaned_phone.startswith('0'):
            cleaned_phone = '254' + cleaned_phone[1:]
        elif cleaned_phone.startswith('+'):
            cleaned_phone = cleaned_phone[1:]

        # If retrying a failed payment, re-validate and re-reserve stock
        if parent_order.payment_status == 'failed':
            for sub_order in parent_order.sub_orders:
                for item in sub_order.items:
                    variant = ProductVariant.query.filter_by(id=item.variant_id).with_for_update().first()
                    if not variant or variant.inventory_qty < item.quantity:
                        return jsonify({
                            "success": False,
                            "error": {
                                "code": "VALIDATION_FAILED",
                                "message": f"Inventory for item in order is no longer available for payment retry."
                            }
                        }), 422
                    variant.inventory_qty -= item.quantity
            parent_order.payment_status = 'unpaid'

        # Cancel any previous initiated transactions for this order without deleting history
        old_initiated = LipaNaMpesaTransaction.query.filter_by(
            parent_order_id=parent_order_id,
            transaction_status='initiated'
        ).all()
        for ot in old_initiated:
            ot.transaction_status = 'cancelled'
            ot.error_description = 'Superceded by a new payment retry attempt.'
        db.session.flush()

        # Create unique request keys mimicking Safaricom Daraja responses
        merchant_req_id = "req-" + str(uuid.uuid4())
        checkout_req_id = "ws_CO_" + datetime.utcnow().strftime("%d%m%Y%H%M%S") + "_" + str(uuid.uuid4())[:6]

        tx = LipaNaMpesaTransaction(
            parent_order_id=parent_order_id,
            merchant_request_id=merchant_req_id,
            checkout_request_id=checkout_req_id,
            phone_number=cleaned_phone,
            amount=parent_order.grand_total,
            transaction_status='initiated'
        )
        db.session.add(tx)
        db.session.commit()

        # STK Push execution log
        print(f"[M-PESA STK PUSH LOG] Transmitting KES {parent_order.grand_total} request to {cleaned_phone}...")

        return jsonify({
            "success": True,
            "message": "STK Push prompt initialized. Check your phone to enter your PIN.",
            "data": {
                "merchant_request_id": merchant_req_id,
                "checkout_request_id": checkout_req_id
            }
        }), 202

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": {
                "code": "SERVER_ERROR",
                "message": f"An error occurred initiating payment: {str(e)}"
            }
        }), 500


def process_mpesa_callback_internal(checkout_request_id, result_code, mpesa_receipt_number=None, error_desc=None, payload=None):
    """
    Internal function to process payment confirmation and manage ledger and inventory states.
    Ensures transactional safety, prevents duplicate processing, and handles failure releases.
    Guarantees idempotency even during late callbacks or duplicate webhook notifications.
    """
    # Lock the transaction row to prevent concurrent webhook calls from double-crediting
    tx = LipaNaMpesaTransaction.query.filter_by(checkout_request_id=checkout_request_id).with_for_update().first()
    if not tx:
        return False, "Transaction not found"

    # Already settled, prevent double execution
    if tx.transaction_status in ['success', 'failed', 'cancelled']:
        return True, "Already processed"

    parent_order = ParentOrder.query.get(tx.parent_order_id)
    if not parent_order:
        return False, "Order not found"

    # Idempotency Protection: If the order was already settled by another transaction attempt, ignore late callbacks
    if parent_order.payment_status == 'paid':
        tx.transaction_status = 'cancelled' if result_code != 0 else 'success'
        tx.error_description = 'Order is already settled by another transaction attempt.'
        tx.completed_at = datetime.utcnow()
        db.session.flush()
        return True, "Order already paid"

    try:
        tx.callback_payload = json.dumps(payload) if payload else None
        tx.completed_at = datetime.utcnow()

        if result_code == 0:
            # Success settlement
            tx.transaction_status = 'success'
            tx.mpesa_receipt_number = mpesa_receipt_number or "MPESA" + str(uuid.uuid4())[:8].upper()
            
            parent_order.payment_status = 'paid'

            # Cancel all other initiated attempts for this parent order
            other_txs = LipaNaMpesaTransaction.query.filter(
                LipaNaMpesaTransaction.parent_order_id == parent_order.id,
                LipaNaMpesaTransaction.id != tx.id,
                LipaNaMpesaTransaction.transaction_status == 'initiated'
            ).all()
            for ot in other_txs:
                ot.transaction_status = 'cancelled'
                ot.error_description = 'Order settled by another payment attempt.'

            # Update child SubOrders and wallets
            for sub_order in parent_order.sub_orders:
                sub_order.fulfillment_status = 'received'

                # Timeline event
                timeline = OrderTimelineEvent(
                    sub_order_id=sub_order.id,
                    event_status='paid',
                    description=f"Settlement captured successfully! M-Pesa Receipt: {tx.mpesa_receipt_number}.",
                    notified_customer=True
                )
                db.session.add(timeline)

                # Escrow Ledger credit to Florist Wallet pending balance
                wallet = FloristWallet.query.filter_by(florist_id=sub_order.florist_id).with_for_update().first()
                if not wallet:
                    wallet = FloristWallet(
                        florist_id=sub_order.florist_id,
                        available_balance=Decimal('0.00'),
                        pending_balance=Decimal('0.00'),
                        withdrawn_to_date=Decimal('0.00')
                    )
                    db.session.add(wallet)
                    db.session.flush()

                # Credit pending balance
                wallet.pending_balance += Decimal(str(sub_order.florist_net_earnings))

                # Create double-entry WalletLedger record
                ledger = WalletLedger(
                    wallet_id=wallet.id,
                    amount=Decimal(str(sub_order.florist_net_earnings)),
                    entry_type='credit_earnings',
                    sub_order_id=sub_order.id,
                    description=f"Payment verified for Order {sub_order.id}. Sourced items subtotal KES {sub_order.sub_total}, platform fee 20% deducted, KES {sub_order.delivery_fee} logistics added.",
                    balance_snapshot=wallet.pending_balance + wallet.available_balance
                )
                db.session.add(ledger)

        else:
            # Payment failed or cancelled
            tx.transaction_status = 'failed'
            tx.error_description = error_desc or "Payment cancelled or rejected by user."
            
            parent_order.payment_status = 'failed'

            # Roll back reserved inventory! Avoid leak.
            for sub_order in parent_order.sub_orders:
                sub_order.fulfillment_status = 'cancelled'

                timeline = OrderTimelineEvent(
                    sub_order_id=sub_order.id,
                    event_status='payment_failed',
                    description=f"Transaction unsuccessful: {tx.error_description}. Restoring botanical inventories.",
                    notified_customer=True
                )
                db.session.add(timeline)

                for item in sub_order.items:
                    variant = ProductVariant.query.get(item.variant_id)
                    if variant:
                        variant.inventory_qty += item.quantity

        db.session.flush()
        return True, "Processed successfully"

    except Exception as e:
        db.session.rollback()
        raise e


@checkout_bp.route('/mpesa-callback', methods=['POST'])
def mpesa_callback():
    """
    Receives asymmetric webhook callback from Safaricom Daraja API when STK Push completes.
    Uses transaction locks for security and returns immediate 200 to Safaricom.
    """
    payload = request.get_json() or {}
    
    body = payload.get('Body', {})
    stk_callback = body.get('stkCallback', {})
    checkout_request_id = stk_callback.get('CheckoutRequestID')
    result_code = stk_callback.get('ResultCode')
    result_desc = stk_callback.get('ResultDesc')

    if not checkout_request_id:
        return jsonify({
            "ResponseCode": "1",
            "ResponseDesc": "Missing checkout request identification."
        }), 400

    try:
        # Extract metadata for successful payments
        mpesa_receipt_number = None
        callback_metadata = stk_callback.get('CallbackMetadata', {})
        metadata_items = callback_metadata.get('Item', [])
        
        for item in metadata_items:
            if item.get('Name') == 'MpesaReceiptNumber':
                mpesa_receipt_number = item.get('Value')

        success, message = process_mpesa_callback_internal(
            checkout_request_id=checkout_request_id,
            result_code=result_code,
            mpesa_receipt_number=mpesa_receipt_number,
            error_desc=result_desc,
            payload=payload
        )

        if success:
            db.session.commit()
            return jsonify({
                "ResponseCode": "0",
                "ResponseDesc": "Callback processed and database transaction records updated successfully."
            }), 200
        else:
            return jsonify({
                "ResponseCode": "1",
                "ResponseDesc": f"Callback processing failed: {message}"
            }), 422

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "ResponseCode": "1",
            "ResponseDesc": f"A database collision occurred processing callback: {str(e)}"
        }), 500


@checkout_bp.route('/verify/<parent_order_id>', methods=['GET'])
@jwt_required()
def verify_payment(parent_order_id):
    """
    Checks the payment status of a Parent Order.
    Auto-simulations are STRICTLY restricted to local development environments only.
    In production / sandbox environments, auto-simulation NEVER fires.
    """
    parent_order = ParentOrder.query.get(parent_order_id)
    if not parent_order:
        return jsonify({
            "success": False,
            "error": {
                "code": "RESOURCE_NOT_FOUND",
                "message": "Order not found."
            }
        }), 404

    # Fetch active transaction
    tx = LipaNaMpesaTransaction.query.filter_by(parent_order_id=parent_order_id).order_by(LipaNaMpesaTransaction.created_at.desc()).first()
    
    # Auto-simulate M-Pesa STK push approval ONLY in local development after 2.5 seconds
    if is_development_environment() and tx and tx.transaction_status == 'initiated':
        elapsed = datetime.utcnow() - tx.created_at
        if elapsed > timedelta(seconds=2.5):
            print(f"[M-PESA SANDBOX] Automatically simulating successful M-Pesa callback for Checkout {tx.checkout_request_id}...")
            try:
                receipt = "SGB" + "".join(str(uuid.uuid4().int)[:7]) + "XA"
                success, msg = process_mpesa_callback_internal(
                    checkout_request_id=tx.checkout_request_id,
                    result_code=0,
                    mpesa_receipt_number=receipt,
                    error_desc="Success",
                    payload={"Body": {"stkCallback": {"ResultCode": 0, "ResultDesc": "Sandbox Simulated Success"}}}
                )
                if success:
                    db.session.commit()
                    # Refresh parent_order row
                    db.session.refresh(parent_order)
                    # Refresh tx row
                    db.session.refresh(tx)
            except Exception as e:
                db.session.rollback()
                print(f"[M-PESA SANDBOX ERROR] Failed to simulate callback: {str(e)}")

    # Return status
    receipt_num = tx.mpesa_receipt_number if tx else None

    return jsonify({
        "success": True,
        "data": {
            "parent_order_id": parent_order.id,
            "payment_status": parent_order.payment_status,
            "mpesa_receipt_number": receipt_num
        }
    }), 200
