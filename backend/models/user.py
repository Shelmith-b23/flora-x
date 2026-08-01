import uuid
from datetime import datetime
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

# Helper table or model for Roles
class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.String(50), primary_key=True)
    description = db.Column(db.Text, nullable=True)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for Google Auth users
    role_id = db.Column(db.String(50), db.ForeignKey('roles.id'), nullable=False, default='customer')
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    
    # Lockout / Security fields
    login_attempts = db.Column(db.Integer, default=0, nullable=False)
    locked_until = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)  # Soft Delete

    # Relationships
    role = db.relationship('Role', backref='users')
    customer_profile = db.relationship('CustomerProfile', uselist=False, back_populates='user', cascade="all, delete-orphan")
    florist_profile = db.relationship('FloristProfile', uselist=False, back_populates='user', cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

class CustomerProfile(db.Model):
    __tablename__ = 'customer_profiles'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    avatar_url = db.Column(db.String(512), nullable=True)
    reward_points_balance = db.Column(db.Integer, default=0, nullable=False)
    
    notification_settings = db.Column(db.Text, default='{"email": true, "sms": true}', nullable=False)
    privacy_settings = db.Column(db.Text, default='{"share_data": false}', nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = db.relationship('User', back_populates='customer_profile')
    addresses = db.relationship('CustomerAddress', backref='customer', cascade="all, delete-orphan")

class CustomerAddress(db.Model):
    __tablename__ = 'customer_addresses'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customer_profiles.id', ondelete='CASCADE'), nullable=False)
    label = db.Column(db.String(100), nullable=False, default='Home')  # e.g., Home, Work
    street_address = db.Column(db.Text, nullable=False)
    city = db.Column(db.String(100), default='Nairobi', nullable=False)
    latitude = db.Column(db.Numeric(9, 6), nullable=False)
    longitude = db.Column(db.Numeric(9, 6), nullable=False)
    delivery_instructions = db.Column(db.Text, nullable=True)
    is_default = db.Column(db.Boolean, default=False, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

class UserSession(db.Model):
    __tablename__ = 'user_sessions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    refresh_token_hash = db.Column(db.String(255), unique=True, nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_revoked = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class PasswordReset(db.Model):
    __tablename__ = 'password_resets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token_hash = db.Column(db.String(255), unique=True, nullable=False)
    purpose = db.Column(db.String(50), nullable=False, default='password_reset')  # password_reset or email_verification
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(150), nullable=False)  # e.g., approve_florist, reactivate_user, suspend_user
    target_table = db.Column(db.String(100), nullable=False)
    target_id = db.Column(db.String(36), nullable=False)
    old_values = db.Column(db.Text, nullable=True)  # JSON string
    new_values = db.Column(db.Text, nullable=True)  # JSON string
    ip_address = db.Column(db.String(45), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
