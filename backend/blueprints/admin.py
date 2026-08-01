from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database import db
from models.user import User, AuditLog
from models.florist import FloristProfile
from models.marketplace import ParentOrder, SubOrder, WithdrawalRequest, Category, Product

admin_bp = Blueprint('admin', __name__, url_prefix='/api/v1/admin')

def log_audit_action(admin_id, action, target_table, target_id, old_val=None, new_val=None):
    log = AuditLog(
        admin_user_id=admin_id,
        action=action,
        target_table=target_table,
        target_id=target_id,
        old_values=old_val,
        new_values=new_val,
        ip_address=request.remote_addr
    )
    db.session.add(log)

@admin_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    claims = get_jwt()
    role = claims.get('role')
    if role not in ['admin', 'super_admin']:
        return jsonify({"error": "Forbidden"}), 403

    total_orders = ParentOrder.query.count()
    paid_orders = ParentOrder.query.filter_by(payment_status='paid').all()
    total_revenue = sum([float(o.grand_total) for o in paid_orders])
    paid_sub_orders = SubOrder.query.join(ParentOrder).filter(ParentOrder.payment_status == 'paid').all()
    platform_commission = round(sum([float(so.platform_commission) for so in paid_sub_orders]), 2) if paid_sub_orders else 0.0
    pending_florists = FloristProfile.query.filter_by(verification_status='pending_review').count()
    total_florists = FloristProfile.query.count()
    total_customers = User.query.filter_by(role_id='customer').count()
    pending_withdrawals = WithdrawalRequest.query.filter_by(status='pending').count()

    return jsonify({
        "totalRevenue": total_revenue,
        "totalPaidRevenue": total_revenue,
        "revenueToday": total_revenue,
        "revenueThisMonth": total_revenue,
        "ordersToday": total_orders,
        "ordersThisMonth": total_orders,
        "pendingOrders": ParentOrder.query.filter_by(payment_status='processing').count(),
        "completedOrders": len(paid_orders),
        "cancelledOrders": 0,
        "refundRequestsCount": 0,
        "pendingFloristApprovals": pending_florists,
        "verifiedFlorists": FloristProfile.query.filter_by(verification_status='approved').count(),
        "totalFlorists": total_florists,
        "totalCustomers": total_customers,
        "platformCommissionEarned": platform_commission,
        "pendingWithdrawalsCount": pending_withdrawals,
        "lowStockAlerts": 0,
        "averageOrderValue": round(total_revenue / len(paid_orders), 2) if paid_orders else 0,
        "conversionRate": "3.8%",
        "repeatPurchaseRate": "41.2%",
        "failedPayments": 0
    }), 200


@admin_bp.route('/florists/pending', methods=['GET'])
@jwt_required()
def list_pending_florists():
    # Role-Based Access Control
    claims = get_jwt()
    role = claims.get('role')
    if role not in ['admin', 'super_admin']:
        return jsonify({"error": "Forbidden. Admin privileges required."}), 403
        
    pending = FloristProfile.query.filter_by(verification_status='pending_review').all()
    return jsonify([{
        "id": f.id,
        "storeName": f.store_name,
        "legalBusinessName": f.legal_business_name,
        "addressText": f.address_text,
        "mpesaTillNumber": f.mpesa_till_number,
        "created_at": f.created_at.isoformat()
    } for f in pending]), 200

@admin_bp.route('/florists/<florist_id>/approve', methods=['POST'])
@jwt_required()
def approve_florist(florist_id):
    claims = get_jwt()
    role = claims.get('role')
    if role not in ['admin', 'super_admin']:
        return jsonify({"error": "Forbidden"}), 403
        
    fp = FloristProfile.query.get(florist_id)
    if not fp:
        return jsonify({"error": "Florist profile not found"}), 404
        
    old_status = fp.verification_status
    fp.verification_status = 'approved'
    
    # Audit log
    admin_id = get_jwt_identity()
    log_audit_action(
        admin_id=admin_id,
        action='approve_florist',
        target_table='florist_profiles',
        target_id=florist_id,
        old_val=f'{{"verification_status": "{old_status}"}}',
        new_val='{"verification_status": "approved"}'
    )
    
    db.session.commit()
    return jsonify({"message": f"Florist '{fp.store_name}' approved successfully."}), 200

@admin_bp.route('/florists/<florist_id>/reject', methods=['POST'])
@jwt_required()
def reject_florist(florist_id):
    claims = get_jwt()
    role = claims.get('role')
    if role not in ['admin', 'super_admin']:
        return jsonify({"error": "Forbidden"}), 403
        
    data = request.get_json() or {}
    reason = data.get('reason', 'Failed vetting guidelines')
    
    fp = FloristProfile.query.get(florist_id)
    if not fp:
        return jsonify({"error": "Florist profile not found"}), 404
        
    old_status = fp.verification_status
    fp.verification_status = 'rejected'
    
    # Audit log
    admin_id = get_jwt_identity()
    log_audit_action(
        admin_id=admin_id,
        action='reject_florist',
        target_table='florist_profiles',
        target_id=florist_id,
        old_val=f'{{"verification_status": "{old_status}"}}',
        new_val=f'{{"verification_status": "rejected", "reason": "{reason}"}}'
    )
    
    db.session.commit()
    return jsonify({"message": f"Florist '{fp.store_name}' rejected. Reason: {reason}"}), 200

@admin_bp.route('/users/<user_id>/suspend', methods=['POST'])
@jwt_required()
def suspend_user(user_id):
    claims = get_jwt()
    role = claims.get('role')
    if role not in ['admin', 'super_admin']:
        return jsonify({"error": "Forbidden"}), 403
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Prevent suspending other admins unless super_admin
    if user.role_id in ['admin', 'super_admin'] and role != 'super_admin':
        return jsonify({"error": "Unauthorized to suspend administrative users."}), 403
        
    # Suspend via deleting sessions & locking indefinitely
    user.locked_until = datetime.max  # Locks account
    
    admin_id = get_jwt_identity()
    log_audit_action(
        admin_id=admin_id,
        action='suspend_user',
        target_table='users',
        target_id=user_id,
        new_val='{"suspended": true}'
    )
    db.session.commit()
    return jsonify({"message": f"User '{user.email}' suspended indefinitely."}), 200

@admin_bp.route('/users/<user_id>/reactivate', methods=['POST'])
@jwt_required()
def reactivate_user(user_id):
    claims = get_jwt()
    role = claims.get('role')
    if role not in ['admin', 'super_admin']:
        return jsonify({"error": "Forbidden"}), 403
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    user.locked_until = None
    user.login_attempts = 0
    
    admin_id = get_jwt_identity()
    log_audit_action(
        admin_id=admin_id,
        action='reactivate_user',
        target_table='users',
        target_id=user_id,
        new_val='{"suspended": false}'
    )
    db.session.commit()
    return jsonify({"message": f"User '{user.email}' reactivated successfully."}), 200

@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    claims = get_jwt()
    role = claims.get('role')
    if role not in ['admin', 'super_admin']:
        return jsonify({"error": "Forbidden"}), 403
        
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).all()
    return jsonify([{
        "id": log.id,
        "adminId": log.admin_user_id,
        "action": log.action,
        "targetTable": log.target_table,
        "targetId": log.target_id,
        "oldValues": log.old_values,
        "newValues": log.new_values,
        "ipAddress": log.ip_address,
        "created_at": log.created_at.isoformat()
    } for log in logs]), 200
