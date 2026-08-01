from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User, CustomerProfile, CustomerAddress

customer_bp = Blueprint('customer', __name__, url_prefix='/api/v1/customer')

@customer_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.deleted_at is not None:
        return jsonify({"error": "User not found"}), 404
        
    cp = user.customer_profile
    if not cp:
        return jsonify({"error": "Profile not found"}), 404
        
    return jsonify({
        "id": cp.id,
        "email": user.email,
        "firstName": cp.first_name,
        "lastName": cp.last_name,
        "phoneNumber": cp.phone_number,
        "avatarUrl": cp.avatar_url,
        "rewardPointsBalance": cp.reward_points_balance,
        "notificationSettings": cp.notification_settings,
        "privacySettings": cp.privacy_settings
    }), 200

@customer_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.deleted_at is not None:
        return jsonify({"error": "User not found"}), 404
        
    cp = user.customer_profile
    if not cp:
        return jsonify({"error": "Profile not found"}), 404
        
    data = request.get_json() or {}
    
    # Update fields
    if "firstName" in data:
        cp.first_name = data["firstName"].strip()
    if "lastName" in data:
        cp.last_name = data["lastName"].strip()
    if "phoneNumber" in data:
        cp.phone_number = data["phoneNumber"].strip()
    if "avatarUrl" in data:
        cp.avatar_url = data["avatarUrl"]
    if "notificationSettings" in data:
        cp.notification_settings = str(data["notificationSettings"])
    if "privacySettings" in data:
        cp.privacy_settings = str(data["privacySettings"])
        
    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200

@customer_bp.route('/addresses', methods=['GET'])
@jwt_required()
def get_addresses():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.customer_profile:
        return jsonify({"error": "Profile not found"}), 404
        
    addresses = CustomerAddress.query.filter_by(
        customer_id=user.customer_profile.id,
        deleted_at=None
    ).all()
    
    return jsonify([{
        "id": addr.id,
        "label": addr.label,
        "streetAddress": addr.street_address,
        "city": addr.city,
        "latitude": float(addr.latitude),
        "longitude": float(addr.longitude),
        "deliveryInstructions": addr.delivery_instructions,
        "isDefault": addr.is_default
    } for addr in addresses]), 200

@customer_bp.route('/addresses', methods=['POST'])
@jwt_required()
def add_address():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.customer_profile:
        return jsonify({"error": "Profile not found"}), 404
        
    data = request.get_json() or {}
    label = data.get('label', 'Home')
    street_address = data.get('streetAddress')
    city = data.get('city', 'Nairobi')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    delivery_instructions = data.get('deliveryInstructions')
    is_default = data.get('isDefault', False)
    
    if not street_address or latitude is None or longitude is None:
        return jsonify({"error": "Street address, latitude, and longitude are required"}), 400
        
    # Reset other defaults if this is default
    if is_default:
        CustomerAddress.query.filter_by(
            customer_id=user.customer_profile.id,
            is_default=True
        ).update({CustomerAddress.is_default: False})
        
    addr = CustomerAddress(
        customer_id=user.customer_profile.id,
        label=label,
        street_address=street_address,
        city=city,
        latitude=latitude,
        longitude=longitude,
        delivery_instructions=delivery_instructions,
        is_default=is_default
    )
    db.session.add(addr)
    db.session.commit()
    
    return jsonify({"message": "Address added successfully", "id": addr.id}), 201
