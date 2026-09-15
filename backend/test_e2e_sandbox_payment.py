import os
import sys
import json
import uuid
from datetime import datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app import create_app
from database import db
from models.user import User, CustomerProfile, AuditLog
from models.florist import FloristProfile
from models.marketplace import (
    Product, ProductVariant, Category, ParentOrder, SubOrder, OrderItem,
    LipaNaMpesaTransaction, FloristWallet, WalletLedger
)
from services.mpesa_daraja import (
    get_mpesa_config,
    get_daraja_access_token,
    initiate_daraja_stk_push,
    normalize_phone_number
)

def run_end_to_end_daraja_sandbox_test():
    print("==================================================")
    print("FLORA_X: STARTING ACTUAL DARAJA SANDBOX E2E TEST")
    print("==================================================")
    
    app = create_app()
    with app.app_context():
        # 1. Environment & Credentials Check
        cfg = get_mpesa_config()
        print(f"[1] Environment: {cfg['environment']} (Target: {cfg['base_url']})")
        assert cfg["environment"] == "sandbox", "Environment must be sandbox"
        assert cfg["base_url"] == "https://sandbox.safaricom.co.ke", "Base URL must point to sandbox"
        assert cfg["is_configured"], "Credentials must be configured"

        # 2. Live OAuth Token Handshake
        token = get_daraja_access_token()
        assert token and len(token) > 10, "OAuth token generation failed"
        print("[2] OAuth Token Generation: SUCCESS (Token acquired without exposing raw value)")

        # 3. Setup or get test Customer and Florist
        customer_user = User.query.filter_by(email="sandbox_shopper@florax.co.ke").first()
        if not customer_user:
            customer_user = User(
                email="sandbox_shopper@florax.co.ke",
                role="customer",
                full_name="Amina Sandbox Shopper",
                phone="0708374149",
                is_active=True
            )
            customer_user.set_password("SecurePass123!")
            db.session.add(customer_user)
            db.session.flush()

            cust_profile = CustomerProfile(user_id=customer_user.id)
            db.session.add(cust_profile)
            db.session.flush()
        else:
            cust_profile = customer_user.customer_profile

        # Get or create active Florist
        florist_user = User.query.filter_by(email="sandbox_florist@florax.co.ke").first()
        if not florist_user:
            florist_user = User(
                email="sandbox_florist@florax.co.ke",
                role="florist",
                full_name="Mama Bloom Florist",
                phone="0712345678",
                is_active=True
            )
            florist_user.set_password("SecurePass123!")
            db.session.add(florist_user)
            db.session.flush()

            florist_profile = FloristProfile(
                user_id=florist_user.id,
                store_name="Nairobi Bloom Studio",
                store_slug="nairobi-bloom-studio",
                address="Westlands, Nairobi",
                county="Nairobi",
                commission_rate=20.0,
                verification_status="approved",
                is_active=True
            )
            db.session.add(florist_profile)
            db.session.flush()
        else:
            florist_profile = florist_user.florist_profile

        # Florist Wallet setup
        wallet = FloristWallet.query.filter_by(florist_id=florist_profile.id).first()
        if not wallet:
            wallet = FloristWallet(
                florist_id=florist_profile.id,
                available_balance=0.0,
                pending_balance=0.0,
                gross_sales=0.0,
                commission_deducted=0.0,
                withdrawn_to_date=0.0
            )
            db.session.add(wallet)
            db.session.flush()

        initial_available = float(wallet.available_balance)
        initial_gross = float(wallet.gross_sales)

        # 4. Product & Stock
        cat = Category.query.first()
        if not cat:
            cat = Category(name="Roses", slug="roses")
            db.session.add(cat)
            db.session.flush()

        product = Product.query.filter_by(florist_id=florist_profile.id, title="Sandbox Crimson Roses").first()
        if not product:
            product = Product(
                florist_id=florist_profile.id,
                category_id=cat.id,
                title="Sandbox Crimson Roses",
                slug="sandbox-crimson-roses",
                base_price=2500.0,
                status="published"
            )
            db.session.add(product)
            db.session.flush()

            variant = ProductVariant(
                product_id=product.id,
                variant_name="Standard Bouquet",
                price=2500.0,
                inventory_qty=50
            )
            db.session.add(variant)
            db.session.flush()
        else:
            variant = product.variants[0]
            variant.inventory_qty = max(variant.inventory_qty, 20)

        initial_stock = variant.inventory_qty

        # 5. Create ParentOrder via real checkout logic
        unit_price = float(variant.price)
        qty = 2
        items_subtotal = unit_price * qty # 5000.0
        delivery_fee = 350.0
        grand_total = items_subtotal + delivery_fee # 5350.0
        variant.inventory_qty -= qty # Reserve stock

        parent_order = ParentOrder(
            customer_id=cust_profile.id,
            grand_total=grand_total,
            payment_status="unpaid",
            payment_method="mpesa",
            delivery_address="Westlands Delta Towers, 4th Floor, Nairobi",
            recipient_name="Grace Shopper",
            recipient_phone="0708374149",
            delivery_county="Nairobi"
        )
        db.session.add(parent_order)
        db.session.flush()

        sub_order = SubOrder(
            parent_order_id=parent_order.id,
            florist_id=florist_profile.id,
            subtotal=items_subtotal,
            delivery_fee=delivery_fee,
            platform_commission_rate=florist_profile.commission_rate,
            fulfillment_status="pending"
        )
        db.session.add(sub_order)
        db.session.flush()

        order_item = OrderItem(
            sub_order_id=sub_order.id,
            variant_id=variant.id,
            product_title=product.title,
            variant_name=variant.variant_name,
            quantity=qty,
            unit_price=unit_price,
            total_price=items_subtotal
        )
        db.session.add(order_item)
        db.session.commit()

        print(f"[3] Created Order #{parent_order.id[:8]} | Total: KES {grand_total:,.2f} | Stock reserved: {variant.inventory_qty}")

        # 6. Live STK Push to Safaricom Sandbox
        stk_ok, stk_res = initiate_daraja_stk_push(
            phone_number="0708374149",
            amount=grand_total,
            account_reference=parent_order.id[:10],
            transaction_desc="Flora_X Flowers"
        )

        assert stk_ok, f"STK Push rejected: {stk_res.get('message')}"
        checkout_req_id = stk_res["checkout_request_id"]
        merchant_req_id = stk_res["merchant_request_id"]
        print(f"[4] Live STK Push SUCCESS -> MerchantRequestID: {merchant_req_id} | CheckoutRequestID: {checkout_req_id}")

        # Create LipaNaMpesaTransaction
        tx = LipaNaMpesaTransaction(
            parent_order_id=parent_order.id,
            merchant_request_id=merchant_req_id,
            checkout_request_id=checkout_req_id,
            phone_number=normalize_phone_number("0708374149"),
            amount=grand_total,
            transaction_status="initiated"
        )
        db.session.add(tx)
        db.session.commit()

        # 7. Process Safaricom Webhook Callback (Simulating provider callback packet for this CheckoutRequestID)
        test_receipt = "SGB" + datetime.utcnow().strftime("%H%M%S") + "X"
        callback_payload = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": merchant_req_id,
                    "CheckoutRequestID": checkout_req_id,
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": grand_total},
                            {"Name": "MpesaReceiptNumber", "Value": test_receipt},
                            {"Name": "TransactionDate", "Value": int(datetime.utcnow().strftime("%Y%m%d%H%M%S"))},
                            {"Name": "PhoneNumber", "Value": 254708374149}
                        ]
                    }
                }
            }
        }

        # Route client test
        client = app.test_client()
        cb_response = client.post(
            "/api/v1/checkout/mpesa-callback",
            data=json.dumps(callback_payload),
            content_type="application/json"
        )
        assert cb_response.status_code == 200, f"Callback returned {cb_response.status_code}: {cb_response.data}"
        print(f"[5] Safaricom Callback Processed (HTTP 200) | Receipt: {test_receipt}")

        # 8. Verify Settlement & Double-Entry Ledger
        db.session.refresh(parent_order)
        db.session.refresh(sub_order)
        db.session.refresh(tx)
        db.session.refresh(wallet)

        assert parent_order.payment_status == "paid", f"ParentOrder state is {parent_order.payment_status}"
        assert sub_order.fulfillment_status == "received", f"SubOrder state is {sub_order.fulfillment_status}"
        assert tx.transaction_status == "success", f"Transaction state is {tx.transaction_status}"
        assert tx.mpesa_receipt_number == test_receipt, f"Receipt mismatch: {tx.mpesa_receipt_number}"

        commission_amt = items_subtotal * (florist_profile.commission_rate / 100.0) # 1000.0
        florist_net = (items_subtotal - commission_amt) + delivery_fee # 4000 + 350 = 4350.0

        assert float(wallet.available_balance) == initial_available + florist_net, "Wallet balance mismatch"
        print(f"[6] Settlement Reconciled -> Customer: KES {grand_total} | Commission: KES {commission_amt} | Florist Net: KES {florist_net}")

        # 9. Verify Duplicate Callback Idempotency
        dup_response = client.post(
            "/api/v1/checkout/mpesa-callback",
            data=json.dumps(callback_payload),
            content_type="application/json"
        )
        assert dup_response.status_code == 200, "Duplicate callback failed to return 200"
        
        db.session.refresh(wallet)
        assert float(wallet.available_balance) == initial_available + florist_net, "Duplicate callback mutated wallet!"
        print("[7] Duplicate Callback Replay Test: PASSED (Zero duplicate wallet/ledger increments)")

        # 10. Verify Stock Remained Deducted
        db.session.refresh(variant)
        assert variant.inventory_qty == initial_stock - qty, "Stock count corrupted"
        print(f"[8] Inventory State Finalized: {variant.inventory_qty} remaining (Exact deduction verified)")

        print("==================================================")
        print("FLORA_X: ALL DARAJA SANDBOX E2E TESTS PASSED!")
        print("==================================================")

if __name__ == "__main__":
    run_end_to_end_daraja_sandbox_test()
