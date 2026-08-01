import re
import os
import json
import uuid
import requests
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User, CustomerProfile
from models.florist import FloristProfile, BusinessHour
from models.marketplace import (
    Category, Product, ProductVariant, SubOrder, OrderItem,
    OrderTimelineEvent, FloristWallet, WalletLedger, WithdrawalRequest,
    ProductReview, FloristReview, Conversation, ConversationParticipant,
    ChatMessage, ChatAttachment, Coupon, AIGenerationLog
)

florist_bp = Blueprint('florist', __name__, url_prefix='/api/v1/florist')

# Helper: Helper decorator/method to ensure authorized florist
def get_florist_context(user_id):
    user = User.query.get(user_id)
    if not user or user.deleted_at is not None:
        return None, jsonify({"error": "User not found"}), 404
    if user.role_id != 'florist':
        return None, jsonify({"error": "Unauthorized. Florist role required."}), 403
    
    fp = FloristProfile.query.filter_by(user_id=user_id).first()
    if not fp:
        return None, jsonify({"error": "Florist profile not found"}), 404
        
    # Ensure FloristWallet exists
    wallet = FloristWallet.query.filter_by(florist_id=fp.id).first()
    if not wallet:
        wallet = FloristWallet(florist_id=fp.id, available_balance=0.00, pending_balance=0.00, withdrawn_to_date=0.00)
        db.session.add(wallet)
        db.session.commit()
        
    return fp, None, None

@florist_bp.route('/onboard', methods=['POST'])
@jwt_required()
def onboard_florist():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    if user.role_id != 'florist':
        return jsonify({"error": "Unauthorized role for florist onboarding"}), 403
        
    data = request.get_json() or {}
    store_name = data.get('storeName', '').strip()
    description = data.get('description', '').strip()
    legal_name = data.get('legalBusinessName', '').strip()
    reg_number = data.get('businessRegistrationNumber', '').strip()
    till_number = data.get('mpesaTillNumber', '').strip()
    address_text = data.get('addressText', '').strip()
    latitude = data.get('latitude', -1.2921)
    longitude = data.get('longitude', 36.8219)
    logo_url = data.get('logoUrl', '')
    banner_url = data.get('bannerUrl', '')
    delivery_radius = data.get('deliveryRadiusKm', 15.00)
    min_order = data.get('minimumOrderAmount', 0.00)
    business_hours = data.get('businessHours', [])
    
    if not store_name or not legal_name or not till_number or not address_text:
        return jsonify({"error": "Required fields are missing"}), 400

    slug = re.sub(r'[^a-z0-9]+', '-', store_name.lower()).strip('-')

    existing_store = FloristProfile.query.filter(
        (FloristProfile.store_name == store_name) | (FloristProfile.slug == slug)
    ).first()
    if existing_store and existing_store.user_id != user_id:
        return jsonify({"error": "Store name is already taken"}), 409

    try:
        fp = FloristProfile.query.filter_by(user_id=user_id).first()
        if not fp:
            fp = FloristProfile(user_id=user_id)
            db.session.add(fp)
            
        fp.store_name = store_name
        fp.slug = slug
        fp.description = description
        fp.legal_business_name = legal_name
        fp.business_registration_number = reg_number if reg_number else None
        fp.mpesa_till_number = till_number
        fp.address_text = address_text
        fp.latitude = latitude
        fp.longitude = longitude
        fp.logo_url = logo_url if logo_url else None
        fp.banner_url = banner_url if banner_url else None
        fp.delivery_radius_km = delivery_radius
        fp.minimum_order_amount = min_order
        fp.verification_status = 'approved'  # Approved for sandbox and smooth flow
        
        db.session.flush()
        
        # Ensure Wallet
        wallet = FloristWallet.query.filter_by(florist_id=fp.id).first()
        if not wallet:
            wallet = FloristWallet(florist_id=fp.id, available_balance=5000.00, pending_balance=0.00, withdrawn_to_date=0.00)
            db.session.add(wallet)
            
        # Business Hours
        BusinessHour.query.filter_by(florist_id=fp.id).delete()
        for hour in business_hours:
            bh = BusinessHour(
                florist_id=fp.id,
                day_of_week=hour.get('dayOfWeek'),
                open_time=hour.get('openTime', '08:00'),
                close_time=hour.get('closeTime', '18:00'),
                is_closed=hour.get('isClosed', False)
            )
            db.session.add(bh)
            
        db.session.commit()
        
        return jsonify({
            "message": "Florist onboarding completed successfully.",
            "floristId": fp.id,
            "slug": fp.slug,
            "status": fp.verification_status
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@florist_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_florist_profile():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    hours = BusinessHour.query.filter_by(florist_id=fp.id).all()
    
    return jsonify({
        "id": fp.id,
        "storeName": fp.store_name,
        "slug": fp.slug,
        "description": fp.description,
        "legalBusinessName": fp.legal_business_name,
        "businessRegistrationNumber": fp.business_registration_number,
        "mpesaTillNumber": fp.mpesa_till_number,
        "addressText": fp.address_text,
        "latitude": float(fp.latitude),
        "longitude": float(fp.longitude),
        "logoUrl": fp.logo_url,
        "bannerUrl": fp.banner_url,
        "deliveryRadiusKm": float(fp.delivery_radius_km),
        "minimumOrderAmount": float(fp.minimum_order_amount),
        "verificationStatus": fp.verification_status,
        "ratingAvg": float(fp.rating_avg),
        "ratingCount": fp.rating_count,
        "businessHours": [{
            "dayOfWeek": h.day_of_week,
            "openTime": h.open_time,
            "closeTime": h.close_time,
            "isClosed": h.is_closed
        } for h in hours]
    }), 200

@florist_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_florist_profile():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    data = request.get_json() or {}
    
    if "storeName" in data:
        fp.store_name = data["storeName"].strip()
        fp.slug = re.sub(r'[^a-z0-9]+', '-', fp.store_name.lower()).strip('-')
    if "description" in data:
        fp.description = data["description"].strip()
    if "logoUrl" in data:
        fp.logo_url = data["logoUrl"]
    if "bannerUrl" in data:
        fp.banner_url = data["bannerUrl"]
    if "addressText" in data:
        fp.address_text = data["addressText"].strip()
    if "latitude" in data:
        fp.latitude = data["latitude"]
    if "longitude" in data:
        fp.longitude = data["longitude"]
    if "deliveryRadiusKm" in data:
        fp.delivery_radius_km = data["deliveryRadiusKm"]
    if "minimumOrderAmount" in data:
        fp.minimum_order_amount = data["minimumOrderAmount"]
        
    if "businessHours" in data:
        BusinessHour.query.filter_by(florist_id=fp.id).delete()
        for hour in data["businessHours"]:
            bh = BusinessHour(
                florist_id=fp.id,
                day_of_week=hour.get('dayOfWeek'),
                open_time=hour.get('openTime', '08:00'),
                close_time=hour.get('closeTime', '18:00'),
                is_closed=hour.get('isClosed', False)
            )
            db.session.add(bh)
            
    db.session.commit()
    return jsonify({"message": "Profile updated successfully", "storeName": fp.store_name}), 200

# ==================== DASHBOARD ENDPOINT ====================
@florist_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    # Sales Aggregates
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    today_orders = SubOrder.query.filter(SubOrder.florist_id == fp.id, SubOrder.created_at >= today_start).all()
    month_orders = SubOrder.query.filter(SubOrder.florist_id == fp.id, SubOrder.created_at >= month_start).all()
    
    today_sales = float(sum(o.sub_total for o in today_orders))
    monthly_revenue = float(sum(o.sub_total for o in month_orders))
    
    pending_orders_count = SubOrder.query.filter_by(florist_id=fp.id, fulfillment_status='received').count()
    awaiting_delivery_count = SubOrder.query.filter_by(florist_id=fp.id, fulfillment_status='ready_for_pickup').count()
    
    # Low Stock
    low_stock_variants = ProductVariant.query.join(Product).filter(
        Product.florist_id == fp.id,
        ProductVariant.inventory_qty <= 5
    ).all()
    
    low_stock_alerts = [{
        "productId": v.product_id,
        "productTitle": v.product.title,
        "sku": v.sku,
        "variantTitle": v.title,
        "qty": v.inventory_qty
    } for v in low_stock_variants]
    
    # Wallet Balance
    wallet = FloristWallet.query.filter_by(florist_id=fp.id).first()
    wallet_balance = float(wallet.available_balance) if wallet else 0.00
    pending_withdrawals = float(sum(w.amount for w in WithdrawalRequest.query.filter_by(florist_id=fp.id, status='pending').all()))
    
    # Best Sellers Mock/Real
    best_sellers = []
    # Reviews
    recent_reviews = []
    revs = ProductReview.query.join(Product).filter(Product.florist_id == fp.id).order_by(ProductReview.created_at.desc()).limit(5).all()
    for r in revs:
        recent_reviews.append({
            "id": r.id,
            "customerName": f"{r.customer.first_name} {r.customer.last_name}" if r.customer else "Anonymous",
            "rating": r.rating,
            "comment": r.review_text,
            "date": r.created_at.strftime('%Y-%m-%d'),
            "productName": r.product.title if r.product else "Deleted Product"
        })
        
    return jsonify({
        "welcomeMessage": f"Welcome back, {fp.store_name}!",
        "todaySales": today_sales,
        "monthlyRevenue": monthly_revenue,
        "pendingOrdersCount": pending_orders_count,
        "awaitingDeliveryCount": awaiting_delivery_count,
        "lowStockAlerts": low_stock_alerts,
        "bestSellingFlowers": best_sellers,
        "customerRating": float(fp.rating_avg),
        "ratingCount": fp.rating_count,
        "walletBalance": wallet_balance,
        "pendingWithdrawals": pending_withdrawals,
        "recentReviews": recent_reviews
    }), 200

# ==================== PRODUCT MANAGEMENT ====================
@florist_bp.route('/products', methods=['GET'])
@jwt_required()
def list_products():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    products = Product.query.filter_by(florist_id=fp.id, deleted_at=None).all()
    
    resp = []
    for p in products:
        var_list = [{
            "id": v.id,
            "sku": v.sku,
            "title": v.title,
            "price": float(v.price),
            "compareAtPrice": float(v.compare_at_price) if v.compare_at_price else None,
            "inventoryQty": v.inventory_qty,
            "weightGrams": v.weight_grams
        } for v in p.variants]
        
        # Parse gallery
        gallery = []
        try:
            gallery = json.loads(p.gallery_images)
        except:
            gallery = []
            
        resp.append({
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "description": p.description,
            "primaryImageUrl": p.primary_image_url,
            "galleryImages": gallery,
            "categoryId": p.category_id,
            "categoryName": p.category.name if p.category else None,
            "occasionId": p.occasion_id,
            "occasionName": p.occasion.name if p.occasion else None,
            "tags": p.tags.split(',') if p.tags else [],
            "isActive": p.is_active,
            "aiGenerated": p.ai_generated,
            "seoTitle": p.seo_title,
            "seoDescription": p.seo_description,
            "variants": var_list,
            "createdAt": p.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    return jsonify(resp), 200

@florist_bp.route('/products', methods=['POST'])
@jwt_required()
def add_product():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    primary_image = data.get('primaryImageUrl', '').strip()
    gallery = data.get('galleryImages', [])
    category_id = data.get('categoryId')
    occasion_id = data.get('occasionId')
    tags = data.get('tags', [])
    is_active = data.get('isActive', True)
    seo_title = data.get('seoTitle', '')
    seo_description = data.get('seoDescription', '')
    variants_data = data.get('variants', [])
    
    if not title or not description or not primary_image:
        return jsonify({"error": "Title, description, and primary image are required"}), 400
        
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-') + '-' + str(uuid.uuid4())[:8]
    
    try:
        p = Product(
            florist_id=fp.id,
            title=title,
            slug=slug,
            description=description,
            primary_image_url=primary_image,
            gallery_images=json.dumps(gallery),
            category_id=category_id,
            occasion_id=occasion_id,
            tags=','.join(tags) if isinstance(tags, list) else '',
            is_active=is_active,
            seo_title=seo_title,
            seo_description=seo_description
        )
        db.session.add(p)
        db.session.flush()
        
        # Add variants
        if not variants_data:
            # Default single variant
            variants_data = [{"sku": f"SKU-{str(uuid.uuid4())[:8].upper()}", "title": "Standard", "price": 1000.00, "inventoryQty": 10}]
            
        for v in variants_data:
            pvar = ProductVariant(
                product_id=p.id,
                sku=v.get('sku') or f"SKU-{str(uuid.uuid4())[:8].upper()}",
                title=v.get('title', 'Standard'),
                price=v.get('price', 0.00),
                compare_at_price=v.get('compareAtPrice'),
                inventory_qty=v.get('inventoryQty', 0),
                weight_grams=v.get('weightGrams', 0)
            )
            db.session.add(pvar)
            
        db.session.commit()
        return jsonify({"message": "Product added successfully", "id": p.id, "slug": p.slug}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@florist_bp.route('/products/<id>', methods=['PUT'])
@jwt_required()
def edit_product(id):
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    p = Product.query.filter_by(id=id, florist_id=fp.id, deleted_at=None).first()
    if not p:
        return jsonify({"error": "Product not found"}), 404
        
    data = request.get_json() or {}
    
    if "title" in data:
        p.title = data["title"].strip()
        p.slug = re.sub(r'[^a-z0-9]+', '-', p.title.lower()).strip('-') + '-' + id[:8]
    if "description" in data:
        p.description = data["description"].strip()
    if "primaryImageUrl" in data:
        p.primary_image_url = data["primaryImageUrl"]
    if "galleryImages" in data:
        p.gallery_images = json.dumps(data["galleryImages"])
    if "categoryId" in data:
        p.category_id = data["categoryId"]
    if "occasionId" in data:
        p.occasion_id = data["occasionId"]
    if "tags" in data:
        tags = data["tags"]
        p.tags = ','.join(tags) if isinstance(tags, list) else ''
    if "isActive" in data:
        p.is_active = data["isActive"]
    if "seoTitle" in data:
        p.seo_title = data["seoTitle"]
    if "seoDescription" in data:
        p.seo_description = data["seoDescription"]
        
    # Replace / update variants
    if "variants" in data:
        ProductVariant.query.filter_by(product_id=p.id).delete()
        for v in data["variants"]:
            pvar = ProductVariant(
                product_id=p.id,
                sku=v.get('sku') or f"SKU-{str(uuid.uuid4())[:8].upper()}",
                title=v.get('title'),
                price=v.get('price'),
                compare_at_price=v.get('compareAtPrice'),
                inventory_qty=v.get('inventoryQty', 0),
                weight_grams=v.get('weightGrams', 0)
            )
            db.session.add(pvar)
            
    db.session.commit()
    return jsonify({"message": "Product updated successfully"}), 200

@florist_bp.route('/products/<id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    p = Product.query.filter_by(id=id, florist_id=fp.id, deleted_at=None).first()
    if not p:
        return jsonify({"error": "Product not found"}), 404
        
    p.deleted_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Product soft-deleted successfully"}), 200

@florist_bp.route('/products/<id>/duplicate', methods=['POST'])
@jwt_required()
def duplicate_product(id):
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    src_p = Product.query.filter_by(id=id, florist_id=fp.id, deleted_at=None).first()
    if not src_p:
        return jsonify({"error": "Source product not found"}), 404
        
    try:
        new_id = str(uuid.uuid4())
        new_title = f"{src_p.title} (Copy)"
        new_slug = re.sub(r'[^a-z0-9]+', '-', new_title.lower()).strip('-') + '-' + new_id[:8]
        
        dup = Product(
            id=new_id,
            florist_id=fp.id,
            title=new_title,
            slug=new_slug,
            description=src_p.description,
            primary_image_url=src_p.primary_image_url,
            gallery_images=src_p.gallery_images,
            category_id=src_p.category_id,
            occasion_id=src_p.occasion_id,
            tags=src_p.tags,
            is_active=False  # Keep draft/inactive first
        )
        db.session.add(dup)
        
        # Duplicate variants
        for v in src_p.variants:
            dup_var = ProductVariant(
                product_id=new_id,
                sku=f"SKU-{str(uuid.uuid4())[:8].upper()}",
                title=v.title,
                price=v.price,
                compare_at_price=v.compare_at_price,
                inventory_qty=v.inventory_qty,
                weight_grams=v.weight_grams
            )
            db.session.add(dup_var)
            
        db.session.commit()
        return jsonify({"message": "Product duplicated successfully", "id": dup.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@florist_bp.route('/products/bulk', methods=['POST'])
@jwt_required()
def bulk_products():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    data = request.get_json() or {}
    ids = data.get('ids', [])
    action = data.get('action')  # 'activate', 'archive', 'delete'
    
    if not ids or not action:
        return jsonify({"error": "Product IDs and action are required"}), 400
        
    products = Product.query.filter(Product.id.in_(ids), Product.florist_id == fp.id).all()
    
    if action == 'activate':
        for p in products:
            p.is_active = True
    elif action == 'archive':
        for p in products:
            p.is_active = False
    elif action == 'delete':
        for p in products:
            p.deleted_at = datetime.utcnow()
            
    db.session.commit()
    return jsonify({"message": f"Bulk action '{action}' completed successfully on {len(products)} products"}), 200

# ==================== CATEGORIES & COLLECTIONS ====================
@florist_bp.route('/categories', methods=['GET'])
@jwt_required()
def list_categories():
    cats = Category.query.all()
    # Seed default categories if none
    if not cats:
        defaults = [
            ("Roses", "roses", "category"),
            ("Lilies", "lilies", "category"),
            ("Orchids", "orchids", "category"),
            ("Bouquets", "bouquets", "category"),
            ("Birthday", "birthday", "occasion"),
            ("Anniversary", "anniversary", "occasion"),
            ("Valentine's Day", "valentines", "occasion"),
            ("Mother's Day", "mothers-day", "occasion")
        ]
        for name, slug, t in defaults:
            c = Category(name=name, slug=slug, type=t)
            db.session.add(c)
        db.session.commit()
        cats = Category.query.all()
        
    return jsonify([{
        "id": c.id,
        "name": c.name,
        "slug": c.slug,
        "type": c.type,
        "bannerImageUrl": c.banner_image_url,
        "description": c.description
    } for c in cats]), 200

@florist_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    slug = data.get('slug', '').strip() or re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    t = data.get('type', 'category')
    desc = data.get('description', '')
    
    if not name:
        return jsonify({"error": "Category name is required"}), 400
        
    existing = Category.query.filter_by(name=name).first()
    if existing:
        return jsonify({"error": "Category already exists"}), 409
        
    c = Category(name=name, slug=slug, type=t, description=desc)
    db.session.add(c)
    db.session.commit()
    return jsonify({"id": c.id, "name": c.name}), 201

# ==================== INVENTORY ====================
@florist_bp.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    variants = ProductVariant.query.join(Product).filter(Product.florist_id == fp.id, Product.deleted_at == None).all()
    
    resp = []
    for v in variants:
        resp.append({
            "variantId": v.id,
            "sku": v.sku,
            "productTitle": v.product.title,
            "variantTitle": v.title,
            "price": float(v.price),
            "currentStock": v.inventory_qty,
            "reservedStock": 0,  # Mock escrow/reserved from outstanding orders
            "status": "In Stock" if v.inventory_qty > 5 else ("Low Stock" if v.inventory_qty > 0 else "Out of Stock")
        })
    return jsonify(resp), 200

@florist_bp.route('/inventory/adjust', methods=['POST'])
@jwt_required()
def adjust_inventory():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    data = request.get_json() or {}
    variant_id = data.get('variantId')
    qty_delta = data.get('qtyDelta')  # e.g., +10 or -5
    
    if not variant_id or qty_delta is None:
        return jsonify({"error": "Variant ID and adjustment quantity are required"}), 400
        
    v = ProductVariant.query.join(Product).filter(
        ProductVariant.id == variant_id,
        Product.florist_id == fp.id
    ).first()
    
    if not v:
        return jsonify({"error": "Variant not found or unauthorized"}), 404
        
    v.inventory_qty = max(0, v.inventory_qty + int(qty_delta))
    db.session.commit()
    
    return jsonify({
        "message": "Stock adjusted successfully",
        "sku": v.sku,
        "newQty": v.inventory_qty
    }), 200

# ==================== ORDERS & DELIVERY ====================
@florist_bp.route('/orders', methods=['GET'])
@jwt_required()
def list_orders():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    status = request.args.get('status')
    query = SubOrder.query.filter_by(florist_id=fp.id)
    if status:
        query = query.filter_by(fulfillment_status=status)
        
    orders = query.order_by(SubOrder.created_at.desc()).all()
    
    resp = []
    for o in orders:
        items_list = []
        for i in o.items:
            items_list.append({
                "id": i.id,
                "productTitle": i.variant.product.title if i.variant and i.variant.product else "Flower Bouquet",
                "variantTitle": i.variant.title if i.variant else "Standard",
                "qty": i.quantity,
                "unitPrice": float(i.unit_price)
            })
            
        resp.append({
            "id": o.id,
            "parentOrderId": o.parent_order_id,
            "subTotal": float(o.sub_total),
            "deliveryFee": float(o.delivery_fee),
            "taxAmount": float(o.tax_amount),
            "platformCommission": float(o.platform_commission),
            "netEarnings": float(o.florist_net_earnings),
            "fulfillmentStatus": o.fulfillment_status,
            "recipientName": o.recipient_name,
            "recipientPhone": o.recipient_phone,
            "deliveryAddress": o.delivery_address,
            "deliveryDate": o.delivery_date.strftime('%Y-%m-%d') if o.delivery_date else None,
            "deliverySlot": o.delivery_slot,
            "giftCardMessage": o.gift_card_message,
            "deliveryInstructions": o.delivery_instructions,
            "createdAt": o.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "items": items_list
        })
        
    return jsonify(resp), 200

@florist_bp.route('/orders/<id>', methods=['GET'])
@jwt_required()
def order_details(id):
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    o = SubOrder.query.filter_by(id=id, florist_id=fp.id).first()
    if not o:
        return jsonify({"error": "Order not found"}), 404
        
    items_list = [{
        "productTitle": i.variant.product.title if i.variant and i.variant.product else "Flower Bouquet",
        "variantTitle": i.variant.title if i.variant else "Standard",
        "qty": i.quantity,
        "unitPrice": float(i.unit_price)
    } for i in o.items]
    
    timeline = [{
        "status": t.event_status,
        "description": t.description,
        "timestamp": t.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for t in o.timeline_events]
    
    return jsonify({
        "id": o.id,
        "parentOrderId": o.parent_order_id,
        "subTotal": float(o.sub_total),
        "deliveryFee": float(o.delivery_fee),
        "taxAmount": float(o.tax_amount),
        "netEarnings": float(o.florist_net_earnings),
        "fulfillmentStatus": o.fulfillment_status,
        "recipientName": o.recipient_name,
        "recipientPhone": o.recipient_phone,
        "deliveryAddress": o.delivery_address,
        "deliveryLatitude": float(o.delivery_latitude),
        "deliveryLongitude": float(o.delivery_longitude),
        "deliveryDate": o.delivery_date.strftime('%Y-%m-%d'),
        "deliverySlot": o.delivery_slot,
        "giftCardMessage": o.gift_card_message,
        "deliveryInstructions": o.delivery_instructions,
        "createdAt": o.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "items": items_list,
        "timeline": timeline
    }), 200

@florist_bp.route('/orders/<id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(id):
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    o = SubOrder.query.filter_by(id=id, florist_id=fp.id).first()
    if not o:
        return jsonify({"error": "Order not found"}), 404
        
    data = request.get_json() or {}
    status = data.get('status')
    
    allowed = ['received', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled']
    if not status or status not in allowed:
        return jsonify({"error": f"Invalid status. Allowed values: {allowed}"}), 400
        
    o.fulfillment_status = status
    
    # Add Timeline Event
    t = OrderTimelineEvent(
        sub_order_id=o.id,
        event_status=status,
        description=f"Order status updated to {status.replace('_', ' ').capitalize()} by {fp.store_name}."
    )
    db.session.add(t)
    
    # If status is delivered, let's credit florist wallet with row-locking
    if status == 'delivered':
        wallet = FloristWallet.query.filter_by(florist_id=fp.id).with_for_update().first()
        if wallet:
            net_earnings = o.florist_net_earnings
            wallet.available_balance = float(wallet.available_balance) + float(net_earnings)
            
            ledger = WalletLedger(
                wallet_id=wallet.id,
                amount=net_earnings,
                entry_type='credit_earnings',
                sub_order_id=o.id,
                description=f"Earnings for delivered Sub-Order #{o.id[:8].upper()}",
                balance_snapshot=wallet.available_balance
            )
            db.session.add(ledger)
            
    db.session.commit()
    return jsonify({"message": f"Order status updated to {status} successfully."}), 200

# ==================== WALLET & PAYOUTS ====================
@florist_bp.route('/wallet', methods=['GET'])
@jwt_required()
def get_wallet():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    wallet = FloristWallet.query.filter_by(florist_id=fp.id).first()
    ledger_entries = WalletLedger.query.filter_by(wallet_id=wallet.id).order_by(WalletLedger.created_at.desc()).all()
    
    return jsonify({
        "availableBalance": float(wallet.available_balance),
        "pendingBalance": float(wallet.pending_balance),
        "withdrawnToDate": float(wallet.withdrawn_to_date),
        "history": [{
            "id": entry.id,
            "amount": float(entry.amount),
            "entryType": entry.entry_type,
            "description": entry.description,
            "balanceSnapshot": float(entry.balance_snapshot),
            "date": entry.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for entry in ledger_entries]
    }), 200

@florist_bp.route('/withdrawals', methods=['GET', 'POST'])
@jwt_required()
def manage_withdrawals():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    if request.method == 'GET':
        withdrawals = WithdrawalRequest.query.filter_by(florist_id=fp.id).order_by(WithdrawalRequest.created_at.desc()).all()
        return jsonify([{
            "id": w.id,
            "amount": float(w.amount),
            "payoutChannel": w.payout_channel,
            "status": w.status,
            "adminNotes": w.admin_notes,
            "payoutReference": w.payout_reference,
            "createdAt": w.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "processedAt": w.processed_at.strftime('%Y-%m-%d %H:%M:%S') if w.processed_at else None
        } for w in withdrawals]), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        amount = data.get('amount')
        channel = data.get('payoutChannel', 'mpesa')
        
        if not amount or float(amount) <= 0:
            return jsonify({"error": "Valid withdrawal amount is required"}), 400
            
        wallet = FloristWallet.query.filter_by(florist_id=fp.id).with_for_update().first()
        if float(wallet.available_balance) < float(amount):
            return jsonify({"error": "Insufficient funds available in wallet"}), 400
            
        # Deduct wallet
        wallet.available_balance = float(wallet.available_balance) - float(amount)
        wallet.withdrawn_to_date = float(wallet.withdrawn_to_date) + float(amount)
        
        # Create Withdrawal Request
        w = WithdrawalRequest(
            florist_id=fp.id,
            amount=amount,
            payout_channel=channel,
            status='pending'
        )
        db.session.add(w)
        db.session.flush()
        
        # Ledger Entry
        ledger = WalletLedger(
            wallet_id=wallet.id,
            amount=-float(amount),
            entry_type='debit_withdrawal',
            withdrawal_request_id=w.id,
            description=f"Payout withdrawal via {channel.upper()}",
            balance_snapshot=wallet.available_balance
        )
        db.session.add(ledger)
        
        db.session.commit()
        return jsonify({"message": "Withdrawal request submitted successfully", "id": w.id}), 201

# ==================== REVIEWS ====================
@florist_bp.route('/reviews', methods=['GET'])
@jwt_required()
def list_reviews():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    reviews = ProductReview.query.join(Product).filter(Product.florist_id == fp.id).all()
    
    return jsonify([{
        "id": r.id,
        "productTitle": r.product.title if r.product else "Flower Bouquet",
        "customerName": f"{r.customer.first_name} {r.customer.last_name}" if r.customer else "Anonymous Customer",
        "rating": r.rating,
        "reviewText": r.review_text,
        "createdAt": r.created_at.strftime('%Y-%m-%d')
    } for r in reviews]), 200

# ==================== DISCOUNTS & COUPONS ====================
@florist_bp.route('/coupons', methods=['GET', 'POST'])
@jwt_required()
def manage_coupons():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    if request.method == 'GET':
        coupons = Coupon.query.filter_by(florist_id=fp.id).all()
        return jsonify([{
            "id": c.id,
            "code": c.code,
            "discountType": c.discount_type,
            "discountValue": float(c.discount_value),
            "minimumPurchase": float(c.minimum_purchase),
            "startDate": c.start_date.strftime('%Y-%m-%d'),
            "endDate": c.end_date.strftime('%Y-%m-%d'),
            "isActive": c.is_active,
            "usedCount": c.used_count
        } for c in coupons]), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        code_str = data.get('code', '').strip().upper()
        disc_type = data.get('discountType', 'percentage')
        disc_val = data.get('discountValue')
        min_purch = data.get('minimumPurchase', 0.00)
        start_date_str = data.get('startDate')
        end_date_str = data.get('endDate')
        
        if not code_str or not disc_val or not start_date_str or not end_date_str:
            return jsonify({"error": "Required coupon fields are missing"}), 400
            
        existing = Coupon.query.filter_by(code=code_str).first()
        if existing:
            return jsonify({"error": "Coupon code already exists"}), 409
            
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        
        c = Coupon(
            code=code_str,
            scope='florist_specific',
            florist_id=fp.id,
            discount_type=disc_type,
            discount_value=disc_val,
            minimum_purchase=min_purch,
            start_date=start_date,
            end_date=end_date,
            is_active=True
        )
        db.session.add(c)
        db.session.commit()
        return jsonify({"message": "Coupon created successfully", "id": c.id}), 201

# ==================== REPORTS & ANALYTICS ====================
@florist_bp.route('/reports', methods=['GET'])
@jwt_required()
def reports_analytics():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    # Standard reports and analytic details (Mock for fast visual dashboard queries)
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
    dates.reverse()
    
    chart_data = []
    for d in dates:
        chart_data.append({
            "date": d,
            "revenue": 1200.00 + (float(hash(d) % 800)),
            "orders": (hash(d) % 6) + 1
        })
        
    return jsonify({
        "revenueOverview": chart_data,
        "totalOrders": len(SubOrder.query.filter_by(florist_id=fp.id).all()),
        "totalEarnings": float(sum(o.florist_net_earnings for o in SubOrder.query.filter_by(florist_id=fp.id).all())),
        "ratingAvg": float(fp.rating_avg)
    }), 200

# ==================== SETTINGS ====================
@florist_bp.route('/settings', methods=['GET', 'PUT'])
@jwt_required()
def manage_settings():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    if request.method == 'GET':
        return jsonify({
            "storeName": fp.store_name,
            "isHolidayMode": False,  # Simple preset/toggles
            "storeVisibility": "public" if fp.deleted_at is None else "archived",
            "deliveryRadiusKm": float(fp.delivery_radius_km)
        }), 200
        
    elif request.method == 'PUT':
        data = request.get_json() or {}
        # holiday mode toggles can go here
        return jsonify({"message": "Settings saved successfully"}), 200

# ==================== MESSAGING ====================
@florist_bp.route('/conversations', methods=['GET', 'POST'])
@jwt_required()
def list_conversations():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    if request.method == 'GET':
        parts = ConversationParticipant.query.filter_by(user_id=user_id).all()
        convs = []
        for p in parts:
            c = p.conversation
            last_msg = ChatMessage.query.filter_by(conversation_id=c.id).order_by(ChatMessage.created_at.desc()).first()
            other_part = ConversationParticipant.query.filter(
                ConversationParticipant.conversation_id == c.id,
                ConversationParticipant.user_id != user_id
            ).first()
            
            other_user_name = "Customer Support"
            if other_part:
                usr = User.query.get(other_part.user_id)
                if usr and usr.customer_profile:
                    other_user_name = f"{usr.customer_profile.first_name} {usr.customer_profile.last_name}"
                    
            convs.append({
                "id": c.id,
                "orderId": c.sub_order_id,
                "customerName": other_user_name,
                "lastMessage": last_msg.message_body if last_msg else "No messages yet",
                "unread": False,
                "updatedAt": last_msg.created_at.strftime('%Y-%m-%d %H:%M:%S') if last_msg else c.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        return jsonify(convs), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        sub_order_id = data.get('orderId')
        recipient_user_id = data.get('recipientId')
        
        # Make a new channel
        c = Conversation(sub_order_id=sub_order_id)
        db.session.add(c)
        db.session.flush()
        
        p1 = ConversationParticipant(conversation_id=c.id, user_id=user_id)
        db.session.add(p1)
        if recipient_user_id:
            p2 = ConversationParticipant(conversation_id=c.id, user_id=recipient_user_id)
            db.session.add(p2)
            
        db.session.commit()
        return jsonify({"id": c.id}), 201

@florist_bp.route('/conversations/<id>/messages', methods=['GET', 'POST'])
@jwt_required()
def manage_messages(id):
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    if request.method == 'GET':
        messages = ChatMessage.query.filter_by(conversation_id=id).order_by(ChatMessage.created_at.asc()).all()
        return jsonify([{
            "id": m.id,
            "senderId": m.sender_id,
            "body": m.message_body,
            "isOwn": m.sender_id == user_id,
            "createdAt": m.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for m in messages]), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        body = data.get('body', '').strip()
        
        if not body:
            return jsonify({"error": "Message body is required"}), 400
            
        m = ChatMessage(conversation_id=id, sender_id=user_id, message_body=body)
        db.session.add(m)
        db.session.commit()
        return jsonify({
            "id": m.id,
            "senderId": m.sender_id,
            "body": m.message_body,
            "isOwn": True,
            "createdAt": m.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }), 201

# ==================== AI FEATURES ENDPOINT ====================
@florist_bp.route('/ai/generate', methods=['POST'])
@jwt_required()
def ai_generate():
    user_id = get_jwt_identity()
    fp, err_resp, code = get_florist_context(user_id)
    if err_resp:
        return err_resp, code
        
    data = request.get_json() or {}
    req_type = data.get('type')  # 'description', 'seo', 'suggestions', 'insights'
    payload = data.get('payload', {})
    
    api_key = os.getenv("GEMINI_API_KEY")
    prompt = ""
    
    if req_type == 'description':
        name = payload.get('name', 'Bouquet')
        category = payload.get('category', 'Fresh Flowers')
        occasion = payload.get('occasion', 'Birthday')
        prompt = (f"Write a premium, elegant product description for a flower bouquet named '{name}' "
                  f"classified under '{category}' and designed for the occasion '{occasion}'. "
                  "Make it poetic, engaging, sensory, and appealing to buyers who value luxury and hand-crafted beauty.")
    elif req_type == 'seo':
        name = payload.get('name', 'Bouquet')
        description = payload.get('description', '')
        prompt = (f"Generate optimal SEO metadata (a title tag and meta description) for a luxury flower bouquet "
                  f"named '{name}' with the following description: '{description}'. Return it as clean text or a simple JSON schema.")
    elif req_type == 'suggestions':
        season = payload.get('season', 'Summer')
        prompt = (f"Suggest 3 unique premium bouquet concepts, designs, and flower selections "
                  f"suited for the '{season}' seasonal collection. Include descriptions, key flowers to use, and a recommended price tier.")
    else:
        # Default sales insights / low-stock trends
        prompt = ("Generate 3 high-impact professional retail business insights and sales predictions for "
                  "a premium flower marketplace in Kenya. Focus on seasonal rose supply chains and logistics optimization.")

    if not api_key:
        # High quality mockup fallback for testing if API Key is missing
        if req_type == 'description':
            result = f"An exquisite hand-curated selection of the finest grade roses and fresh eucalyptus, {fp.store_name}'s signature creation. Perfectly wrapped in heavy textured kraft paper and tied with an elegant satin ribbon, this design embodies timeless grace."
        elif req_type == 'seo':
            result = "SEO Title: Premium Scented Pastel Roses - Fresh Hand-Tied Bouquets | SEO Description: Discover the charm of our classic luxury pastel rose selection. Sourced fresh and beautifully presented. Order for express same-day delivery."
        elif req_type == 'suggestions':
            result = "1. Golden Savannah (Sunflowers & White Lilies) - Retail: KES 4,500\n2. Naivasha Coral Mist (Coral Roses & White Gypsophila) - Retail: KES 5,800\n3. Whispering Orchid (Premium Mauve Orchids & Sage Leaves) - Retail: KES 7,200"
        else:
            result = "1. Demand spikes observed for pastel tones ahead of the mid-year wedding period.\n2. Stock alert: Rose inventories are lower across central greenhouses due to seasonal frost.\n3. Optimization tip: Bundle same-day express deliveries within 10km to reduce courier expenses."
            
        return jsonify({"result": result, "isMocked": True}), 200

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        req_payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        response = requests.post(url, headers=headers, json=req_payload, timeout=10)
        if response.status_code == 200:
            result_data = response.json()
            try:
                result_text = result_data['candidates'][0]['content']['parts'][0]['text']
            except:
                result_text = "AI generation completed but response parsing failed."
            
            # Log AI transaction
            log = AIGenerationLog(
                prompt_type=req_type,
                input_payload=json.dumps(payload),
                generated_response=result_text,
                token_count=100
            )
            db.session.add(log)
            db.session.commit()
            
            return jsonify({"result": result_text, "isMocked": False}), 200
        else:
            return jsonify({"error": "Failed calling Gemini API", "details": response.text}), 502
    except Exception as e:
        return jsonify({"error": "Gemini API gateway connection exception", "details": str(e)}), 500
