import uuid
from datetime import datetime
from database import db

class FloristProfile(db.Model):
    __tablename__ = 'florist_profiles'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    store_name = db.Column(db.String(255), unique=True, nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(512), nullable=True)
    banner_url = db.Column(db.String(512), nullable=True)
    legal_business_name = db.Column(db.String(255), nullable=False)
    business_registration_number = db.Column(db.String(100), unique=True, nullable=True)
    mpesa_till_number = db.Column(db.String(20), nullable=False)
    mpesa_paybill_number = db.Column(db.String(20), nullable=True)
    mpesa_account_number = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Numeric(9, 6), nullable=False)
    longitude = db.Column(db.Numeric(9, 6), nullable=False)
    address_text = db.Column(db.Text, nullable=False)
    delivery_radius_km = db.Column(db.Numeric(5, 2), default=15.00, nullable=False)
    minimum_order_amount = db.Column(db.Numeric(12, 2), default=0.00, nullable=False)
    
    # Statuses: 'pending_review', 'approved', 'suspended', 'rejected'
    verification_status = db.Column(db.String(50), default='pending_review', nullable=False)
    commission_override_rate = db.Column(db.Numeric(5, 2), nullable=True)  # overrides platform global (e.g. 20%)
    rating_avg = db.Column(db.Numeric(3, 2), default=0.00, nullable=False)
    rating_count = db.Column(db.Integer, default=0, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', back_populates='florist_profile')
    business_hours = db.relationship('BusinessHour', backref='florist', cascade="all, delete-orphan")

class BusinessHour(db.Model):
    __tablename__ = 'business_hours'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    florist_id = db.Column(db.String(36), db.ForeignKey('florist_profiles.id', ondelete='CASCADE'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0 (Sunday) to 6 (Saturday)
    open_time = db.Column(db.String(5), nullable=False)  # HH:MM format
    close_time = db.Column(db.String(5), nullable=False)  # HH:MM format
    is_closed = db.Column(db.Boolean, default=False, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('florist_id', 'day_of_week', name='unique_florist_day'),
    )
