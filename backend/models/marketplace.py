import uuid
from datetime import datetime
from database import db

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    type = db.Column(db.String(50), nullable=False, default='category')  # 'category' or 'occasion'
    banner_image_url = db.Column(db.String(512), nullable=True)
    description = db.Column(db.Text, nullable=True)

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    florist_id = db.Column(db.String(36), db.ForeignKey('florist_profiles.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    primary_image_url = db.Column(db.String(512), nullable=False)
    gallery_images = db.Column(db.Text, default='[]', nullable=False)  # JSON-serialized list of URLs
    category_id = db.Column(db.String(36), db.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    occasion_id = db.Column(db.String(36), db.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    tags = db.Column(db.Text, nullable=True)  # Comma-separated or JSON list of tags
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    ai_generated = db.Column(db.Boolean, default=False, nullable=False)
    seo_title = db.Column(db.String(255), nullable=True)
    seo_description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    florist = db.relationship('FloristProfile', backref=db.backref('products_relation', cascade="all, delete-orphan"))
    category = db.relationship('Category', foreign_keys=[category_id], backref='category_products')
    occasion = db.relationship('Category', foreign_keys=[occasion_id], backref='occasion_products')
    variants = db.relationship('ProductVariant', backref='product', cascade="all, delete-orphan")

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    sku = db.Column(db.String(100), unique=True, nullable=False)
    title = db.Column(db.String(150), nullable=False)  # e.g., 'Standard', 'Deluxe', 'Grandee'
    price = db.Column(db.Numeric(12, 2), nullable=False)
    compare_at_price = db.Column(db.Numeric(12, 2), nullable=True)
    inventory_qty = db.Column(db.Integer, default=0, nullable=False)
    weight_grams = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class ParentOrder(db.Model):
    __tablename__ = 'parent_orders'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customer_profiles.id'), nullable=False)
    grand_total = db.Column(db.Numeric(12, 2), nullable=False)
    discount_amount = db.Column(db.Numeric(12, 2), default=0.00, nullable=False)
    payment_status = db.Column(db.String(50), default='unpaid', nullable=False)  # 'unpaid', 'processing', 'paid', 'failed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    sub_orders = db.relationship('SubOrder', backref='parent_order', cascade="all, delete-orphan")

class SubOrder(db.Model):
    __tablename__ = 'sub_orders'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    parent_order_id = db.Column(db.String(36), db.ForeignKey('parent_orders.id', ondelete='CASCADE'), nullable=False)
    florist_id = db.Column(db.String(36), db.ForeignKey('florist_profiles.id'), nullable=False)
    sub_total = db.Column(db.Numeric(12, 2), nullable=False)
    delivery_fee = db.Column(db.Numeric(12, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(12, 2), default=0.00, nullable=False)
    platform_commission = db.Column(db.Numeric(12, 2), nullable=False)
    florist_net_earnings = db.Column(db.Numeric(12, 2), nullable=False)
    
    # Fulfillment: 'received', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'refund_requested', 'refund_approved', 'cancelled'
    fulfillment_status = db.Column(db.String(50), default='received', nullable=False)
    
    recipient_name = db.Column(db.String(150), nullable=False)
    recipient_phone = db.Column(db.String(20), nullable=False)
    delivery_address = db.Column(db.Text, nullable=False)
    delivery_latitude = db.Column(db.Numeric(9, 6), nullable=False)
    delivery_longitude = db.Column(db.Numeric(9, 6), nullable=False)
    delivery_date = db.Column(db.Date, nullable=False)
    delivery_slot = db.Column(db.String(100), nullable=True)
    gift_card_message = db.Column(db.Text, nullable=True)
    delivery_instructions = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    florist = db.relationship('FloristProfile', backref=db.backref('sub_orders', lazy=True))
    items = db.relationship('OrderItem', backref='sub_order', cascade="all, delete-orphan")
    timeline_events = db.relationship('OrderTimelineEvent', backref='sub_order', cascade="all, delete-orphan")

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sub_order_id = db.Column(db.String(36), db.ForeignKey('sub_orders.id', ondelete='CASCADE'), nullable=False)
    variant_id = db.Column(db.String(36), db.ForeignKey('product_variants.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    unit_price = db.Column(db.Numeric(12, 2), nullable=False)

    variant = db.relationship('ProductVariant', backref='order_items')

class OrderTimelineEvent(db.Model):
    __tablename__ = 'order_timeline_events'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sub_order_id = db.Column(db.String(36), db.ForeignKey('sub_orders.id', ondelete='CASCADE'), nullable=False)
    event_status = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    notified_customer = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class LipaNaMpesaTransaction(db.Model):
    __tablename__ = 'lipa_na_mpesa_transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    parent_order_id = db.Column(db.String(36), db.ForeignKey('parent_orders.id'), unique=True, nullable=False)
    merchant_request_id = db.Column(db.String(150), unique=True, nullable=False)
    checkout_request_id = db.Column(db.String(150), unique=True, nullable=False)
    mpesa_receipt_number = db.Column(db.String(100), unique=True, nullable=True)
    phone_number = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    transaction_status = db.Column(db.String(50), default='initiated', nullable=False)  # 'initiated', 'success', 'failed', 'cancelled'
    callback_payload = db.Column(db.Text, nullable=True)  # JSON Stringified
    error_description = db.Column(db.Text, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class FloristWallet(db.Model):
    __tablename__ = 'florist_wallets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    florist_id = db.Column(db.String(36), db.ForeignKey('florist_profiles.id', ondelete='CASCADE'), unique=True, nullable=False)
    available_balance = db.Column(db.Numeric(12, 2), default=0.00, nullable=False)
    pending_balance = db.Column(db.Numeric(12, 2), default=0.00, nullable=False)
    withdrawn_to_date = db.Column(db.Numeric(12, 2), default=0.00, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    florist = db.relationship('FloristProfile', backref=db.backref('wallet', uselist=False, cascade="all, delete-orphan"))

class WalletLedger(db.Model):
    __tablename__ = 'wallet_ledger'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id = db.Column(db.String(36), db.ForeignKey('florist_wallets.id', ondelete='RESTRICT'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    entry_type = db.Column(db.String(50), nullable=False)  # 'credit_earnings', 'debit_withdrawal', 'commission_deduction', 'refund_chargeback'
    sub_order_id = db.Column(db.String(36), db.ForeignKey('sub_orders.id', ondelete='SET NULL'), nullable=True)
    withdrawal_request_id = db.Column(db.String(36), db.ForeignKey('withdrawal_requests.id', ondelete='SET NULL'), nullable=True)
    description = db.Column(db.Text, nullable=False)
    balance_snapshot = db.Column(db.Numeric(12, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    wallet = db.relationship('FloristWallet', backref=db.backref('ledger', cascade="all, delete-orphan"))

class WithdrawalRequest(db.Model):
    __tablename__ = 'withdrawal_requests'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    florist_id = db.Column(db.String(36), db.ForeignKey('florist_profiles.id', ondelete='RESTRICT'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    payout_channel = db.Column(db.String(50), default='mpesa', nullable=False)  # 'mpesa', 'bank'
    status = db.Column(db.String(50), default='pending', nullable=False)  # 'pending', 'processing', 'completed', 'rejected'
    admin_notes = db.Column(db.Text, nullable=True)
    payout_reference = db.Column(db.String(150), unique=True, nullable=True)
    processed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    florist = db.relationship('FloristProfile', backref=db.backref('withdrawal_requests', lazy=True))

class ProductReview(db.Model):
    __tablename__ = 'product_reviews'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sub_order_id = db.Column(db.String(36), db.ForeignKey('sub_orders.id', ondelete='RESTRICT'), nullable=False)
    customer_id = db.Column(db.String(36), db.ForeignKey('customer_profiles.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    review_text = db.Column(db.Text, nullable=True)
    review_images = db.Column(db.Text, default='[]', nullable=False)  # JSON-serialized array
    moderation_status = db.Column(db.String(50), default='approved', nullable=False)  # 'approved', 'flagged'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    product = db.relationship('Product', backref='reviews')
    customer = db.relationship('CustomerProfile', backref='reviews')

class FloristReview(db.Model):
    __tablename__ = 'florist_reviews'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sub_order_id = db.Column(db.String(36), db.ForeignKey('sub_orders.id', ondelete='RESTRICT'), unique=True, nullable=False)
    customer_id = db.Column(db.String(36), db.ForeignKey('customer_profiles.id', ondelete='CASCADE'), nullable=False)
    florist_id = db.Column(db.String(36), db.ForeignKey('florist_profiles.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    review_text = db.Column(db.Text, nullable=True)
    moderation_status = db.Column(db.String(50), default='approved', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    florist = db.relationship('FloristProfile', backref='reviews')
    customer = db.relationship('CustomerProfile', backref='florist_reviews')

class Conversation(db.Model):
    __tablename__ = 'conversations'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sub_order_id = db.Column(db.String(36), db.ForeignKey('sub_orders.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    sub_order = db.relationship('SubOrder', backref='conversations')
    participants = db.relationship('ConversationParticipant', backref='conversation', cascade="all, delete-orphan")
    messages = db.relationship('ChatMessage', backref='conversation', cascade="all, delete-orphan")

class ConversationParticipant(db.Model):
    __tablename__ = 'conversation_participants'
    
    conversation_id = db.Column(db.String(36), db.ForeignKey('conversations.id', ondelete='CASCADE'), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)

    user = db.relationship('User', backref='conversations_participated')

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = db.Column(db.String(36), db.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False)
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False)
    message_body = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    sender = db.relationship('User', backref='sent_messages')
    attachments = db.relationship('ChatAttachment', backref='message', cascade="all, delete-orphan")

class ChatAttachment(db.Model):
    __tablename__ = 'chat_attachments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = db.Column(db.String(36), db.ForeignKey('chat_messages.id', ondelete='CASCADE'), nullable=False)
    file_url = db.Column(db.String(512), nullable=False)
    file_type = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class Coupon(db.Model):
    __tablename__ = 'coupons'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = db.Column(db.String(50), unique=True, nullable=False)
    scope = db.Column(db.String(50), default='global', nullable=False)  # 'global' or 'florist_specific'
    florist_id = db.Column(db.String(36), db.ForeignKey('florist_profiles.id', ondelete='CASCADE'), nullable=True)
    discount_type = db.Column(db.String(50), nullable=False)  # 'percentage' or 'fixed_amount'
    discount_value = db.Column(db.Numeric(12, 2), nullable=False)
    max_discount_amount = db.Column(db.Numeric(12, 2), nullable=True)
    minimum_purchase = db.Column(db.Numeric(12, 2), default=0.00, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    usage_limit_total = db.Column(db.Integer, nullable=True)
    usage_limit_per_user = db.Column(db.Integer, default=1, nullable=False)
    used_count = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    florist = db.relationship('FloristProfile', backref='coupons')

class AIGenerationLog(db.Model):
    __tablename__ = 'ai_generation_logs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    prompt_type = db.Column(db.String(100), nullable=False)  # e.g., 'gift_recommender', 'seo_desc_generator'
    input_payload = db.Column(db.Text, nullable=False)  # JSON string
    generated_response = db.Column(db.Text, nullable=False)
    token_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
