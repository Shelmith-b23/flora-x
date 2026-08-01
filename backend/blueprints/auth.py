import uuid
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, 
    get_jwt_identity, get_jwt, get_jti
)
from database import db
from models.user import User, Role, CustomerProfile, UserSession, PasswordReset
from models.florist import FloristProfile
from services.email_sms import send_verification_email, send_password_reset_email, send_welcome_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    first_name = data.get('firstName', '').strip()
    last_name = data.get('lastName', '').strip()
    phone_number = data.get('phoneNumber', '').strip()
    role = data.get('role', 'customer').strip().lower() # customer or florist
    
    if not email or not password or not first_name or not last_name or not phone_number:
        return jsonify({"error": "All fields are required"}), 400
        
    if role not in ['customer', 'florist']:
        return jsonify({"error": "Invalid registration role"}), 400

    # 1. Duplicate email check
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email is already registered"}), 409
        
    # 2. Duplicate phone check
    existing_profile = CustomerProfile.query.filter_by(phone_number=phone_number).first()
    if existing_profile:
        return jsonify({"error": "Phone number is already associated with an account"}), 409

    try:
        # Create User
        user = User(email=email, role_id=role, is_verified=False)
        user.set_password(password)
        db.session.add(user)
        db.session.flush() # flush to get user ID
        
        # Create Profile
        customer_profile = CustomerProfile(
            user_id=user.id,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number
        )
        db.session.add(customer_profile)
        
        # Create Verification Token
        token = str(uuid.uuid4())
        reset_entry = PasswordReset(
            user_id=user.id,
            token_hash=token, # in production, store SHA256 hashed token
            purpose='email_verification',
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        db.session.add(reset_entry)
        db.session.commit()
        
        # Trigger simulated verification email
        app_url = os.getenv("APP_URL", "https://florax.co.ke")
        send_verification_email(email, token, app_url)
        
        return jsonify({
            "message": "Registration successful. Verification email dispatched.",
            "userId": user.id,
            "role": user.role_id,
            "isVerified": False
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    remember_me = data.get('rememberMe', False)
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or user.deleted_at is not None:
        return jsonify({"error": "Invalid email or password"}), 401
        
    # Check brute-force lockout
    if user.locked_until and user.locked_until > datetime.utcnow():
        diff = user.locked_until - datetime.utcnow()
        minutes = int(diff.total_seconds() / 60) + 1
        return jsonify({"error": f"Account locked. Try again in {minutes} minutes."}), 423
        
    if not user.check_password(password):
        # Increment login attempts
        user.login_attempts += 1
        if user.login_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
            db.session.commit()
            return jsonify({"error": "Account locked due to consecutive failures. Try again in 15 minutes."}), 423
            
        db.session.commit()
        return jsonify({"error": "Invalid email or password"}), 401

    # Reset attempts on success
    user.login_attempts = 0
    user.locked_until = None
    
    # Check verification status for security (some systems allow partial login)
    # Check florist onboarding status if florist
    onboarding_step = None
    verification_status = None
    if user.role_id == 'florist':
        fp = FloristProfile.query.filter_by(user_id=user.id).first()
        if fp:
            verification_status = fp.verification_status
        else:
            onboarding_step = 'business_info' # Onboarding wizard pending

    # Create Session Tokens
    access_token = create_access_token(identity=user.id, additional_claims={"role": user.role_id})
    refresh_token = create_refresh_token(identity=user.id)
    
    # Store refresh token in UserSession for auditable withdrawal / sign-out everywhere
    jti = get_jti(refresh_token)
    session_expiry = datetime.utcnow() + (timedelta(days=30) if remember_me else timedelta(days=7))
    session = UserSession(
        user_id=user.id,
        refresh_token_hash=jti, # Storing JWT JTI as index for revocation
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string,
        expires_at=session_expiry
    )
    db.session.add(session)
    db.session.commit()
    
    # Fetch customer profile
    cp = user.customer_profile
    user_data = {
        "id": user.id,
        "email": user.email,
        "role": user.role_id,
        "isVerified": user.is_verified,
        "profile": {
            "firstName": cp.first_name if cp else "",
            "lastName": cp.last_name if cp else "",
            "phoneNumber": cp.phone_number if cp else "",
            "avatarUrl": cp.avatar_url if cp else None
        }
    }
    
    if user.role_id == 'florist':
        user_data["floristStatus"] = verification_status
        if onboarding_step:
            user_data["onboardingStep"] = onboarding_step

    response = make_response(jsonify({
        "message": "Login successful",
        "accessToken": access_token,
        "user": user_data
    }))
    
    # Secure Cookie settings for refresh token
    # SameSite=None + Secure=True are critical for the AI Studio iframe sandbox
    cookie_expiry = 30 * 86400 if remember_me else 7 * 86400
    response.set_cookie(
        'refresh_token',
        refresh_token,
        max_age=cookie_expiry,
        httponly=True,
        secure=True,
        samesite='None',
        path='/api/v1/auth/refresh' # limit access
    )
    
    return response


@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    # Attempt to read refresh token from secure cookie
    refresh_token = request.cookies.get('refresh_token')
    if not refresh_token:
        # Fallback to JSON payload
        data = request.get_json() or {}
        refresh_token = data.get('refreshToken')
        
    if not refresh_token:
        return jsonify({"error": "Refresh token is missing"}), 401
        
    try:
        # Standard decoding inside Flask JWT Extended
        # (This typically uses jwt_required(refresh=True) but we write it explicitly for ease of cookies/json fallback)
        from flask_jwt_extended import decode_token
        decoded = decode_token(refresh_token)
        user_id = decoded['sub']
        jti = decoded['jti']
        
        # Verify from DB session table to support immediate revocation
        session = UserSession.query.filter_by(refresh_token_hash=jti, is_revoked=False).first()
        if not session or session.expires_at < datetime.utcnow():
            return jsonify({"error": "Session revoked or expired"}), 401
            
        user = User.query.get(user_id)
        if not user or user.deleted_at is not None:
            return jsonify({"error": "User no longer exists"}), 401
            
        # Re-issue Access Token (15 min lifespan)
        access_token = create_access_token(identity=user.id, additional_claims={"role": user.role_id})
        
        return jsonify({
            "accessToken": access_token
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Invalid refresh token"}), 401


@auth_bp.route('/logout', methods=['POST'])
@jwt_required(optional=True)
def logout():
    # If refresh token in cookie, revoke session JTI
    refresh_token = request.cookies.get('refresh_token')
    if refresh_token:
        try:
            from flask_jwt_extended import decode_token
            decoded = decode_token(refresh_token)
            jti = decoded['jti']
            session = UserSession.query.filter_by(refresh_token_hash=jti).first()
            if session:
                session.is_revoked = True
                db.session.commit()
        except:
            pass
            
    response = make_response(jsonify({"message": "Successfully logged out"}))
    response.delete_cookie('refresh_token', path='/api/v1/auth/refresh')
    return response


@auth_bp.route('/google', methods=['POST'])
def google_auth():
    data = request.get_json() or {}
    id_token = data.get('idToken')
    
    if not id_token:
        return jsonify({"error": "Google ID Token is required"}), 400
        
    # In production: verify Google JWT using google-auth library
    # mock verification for demonstration or staging
    import requests
    try:
        # Example using google's validation endpoint
        google_resp = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}").json()
        if "error_description" in google_resp:
            return jsonify({"error": "Google verification failed"}), 401
            
        email = google_resp.get("email", "").strip().lower()
        google_id = google_resp.get("sub")
        first_name = google_resp.get("given_name", "Google")
        last_name = google_resp.get("family_name", "User")
        avatar_url = google_resp.get("picture")
        
        # Find customer profile or user by email
        user = User.query.filter_by(email=email).first()
        if not user:
            # Create standard customer role immediately
            user = User(email=email, role_id='customer', is_verified=True)
            db.session.add(user)
            db.session.flush()
            
            # Make profile
            profile = CustomerProfile(
                user_id=user.id,
                first_name=first_name,
                last_name=last_name,
                phone_number=f"G-{google_id[:10]}",  # Google mock temp phone
                google_id=google_id,
                avatar_url=avatar_url
            )
            db.session.add(profile)
            db.session.commit()
        else:
            # Match existing profile or map
            profile = CustomerProfile.query.filter_by(user_id=user.id).first()
            if profile and not profile.google_id:
                profile.google_id = google_id
                profile.avatar_url = avatar_url
                db.session.commit()
                
        # Generate Access / Refresh tokens
        access_token = create_access_token(identity=user.id, additional_claims={"role": user.role_id})
        refresh_token = create_refresh_token(identity=user.id)
        
        jti = get_jti(refresh_token)
        session = UserSession(
            user_id=user.id,
            refresh_token_hash=jti,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        db.session.add(session)
        db.session.commit()
        
        user_data = {
            "id": user.id,
            "email": user.email,
            "role": user.role_id,
            "isVerified": user.is_verified,
            "profile": {
                "firstName": profile.first_name if profile else first_name,
                "lastName": profile.last_name if profile else last_name,
                "phoneNumber": profile.phone_number if profile else "",
                "avatarUrl": profile.avatar_url if profile else avatar_url
            }
        }
        
        response = make_response(jsonify({
            "message": "Google Login successful",
            "accessToken": access_token,
            "user": user_data
        }))
        
        response.set_cookie(
            'refresh_token',
            refresh_token,
            max_age=7*86400,
            httponly=True,
            secure=True,
            samesite='None',
            path='/api/v1/auth/refresh'
        )
        return response
        
    except Exception as e:
        return jsonify({"error": f"Google validation error: {str(e)}"}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    user = User.query.filter_by(email=email).first()
    # Security: do not leak whether email exists
    if not user or user.deleted_at is not None:
        return jsonify({"message": "Password recovery email dispatched if address exists."}), 200
        
    token = str(uuid.uuid4())
    reset_entry = PasswordReset(
        user_id=user.id,
        token_hash=token,
        purpose='password_reset',
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.session.add(reset_entry)
    db.session.commit()
    
    # Dispatch simulated email
    app_url = os.getenv("APP_URL", "https://florax.co.ke")
    send_password_reset_email(email, token, app_url)
    
    return jsonify({"message": "Password recovery email dispatched if address exists."}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token')
    password = data.get('password')
    
    if not token or not password:
        return jsonify({"error": "Token and new password are required"}), 400
        
    reset_entry = PasswordReset.query.filter_by(
        token_hash=token, 
        purpose='password_reset',
        used_at=None
    ).first()
    
    if not reset_entry or reset_entry.expires_at < datetime.utcnow():
        return jsonify({"error": "Invalid or expired recovery token"}), 400
        
    user = User.query.get(reset_entry.user_id)
    if not user or user.deleted_at is not None:
        return jsonify({"error": "User associated with this token no longer exists"}), 400
        
    # Reset Password
    user.set_password(password)
    user.login_attempts = 0 # Unlock if locked
    user.locked_until = None
    
    # Mark token used
    reset_entry.used_at = datetime.utcnow()
    
    # Revoke all sessions for secure force sign-out
    UserSession.query.filter_by(user_id=user.id).update({UserSession.is_revoked: True})
    
    db.session.commit()
    return jsonify({"message": "Password reset completed successfully. Please login with your new credentials."}), 200


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json() or {}
    token = data.get('token')
    
    if not token:
        return jsonify({"error": "Token is required"}), 400
        
    reset_entry = PasswordReset.query.filter_by(
        token_hash=token,
        purpose='email_verification',
        used_at=None
    ).first()
    
    if not reset_entry or reset_entry.expires_at < datetime.utcnow():
        return jsonify({"error": "Verification link has expired or is invalid."}), 400
        
    user = User.query.get(reset_entry.user_id)
    if not user or user.deleted_at is not None:
        return jsonify({"error": "User does not exist"}), 400
        
    # Update state
    user.is_verified = True
    reset_entry.used_at = datetime.utcnow()
    db.session.commit()
    
    # Trigger welcome email
    first_name = "User"
    if user.customer_profile:
        first_name = user.customer_profile.first_name
    send_welcome_email(user.email, first_name)
    
    return jsonify({"message": "Email address verified successfully. Welcome to Flora_X!"}), 200
import os
