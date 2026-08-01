import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import Config
from database import db, init_db
from models.user import Role, User, CustomerProfile, CustomerAddress, UserSession, PasswordReset, AuditLog
from models.florist import FloristProfile, BusinessHour
from models.marketplace import (
    Category, Product, ProductVariant, ParentOrder, SubOrder, OrderItem,
    OrderTimelineEvent, LipaNaMpesaTransaction, FloristWallet, WalletLedger,
    WithdrawalRequest, ProductReview, FloristReview, Conversation,
    ConversationParticipant, ChatMessage, ChatAttachment, Coupon, AIGenerationLog
)

# Blueprints
from blueprints.auth import auth_bp
from blueprints.customer import customer_bp
from blueprints.florist import florist_bp
from blueprints.admin import admin_bp
from blueprints.checkout import checkout_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 1. CORS Setup
    # Allows credentials (cookies) to be sent across origins for secure iframe context.
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000", 
        "http://localhost:3001",
        os.getenv("APP_URL", "")
    ])
    
    # 2. Database Setup
    init_db(app)
    Migrate(app, db)
    
    # 3. JWT Manager Setup
    jwt = JWTManager(app)
    
    # Register error handlers for JWT tokens
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Access token has expired", "code": "token_expired"}), 401
        
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token signature", "code": "token_invalid"}), 401
        
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authorization header or cookie missing", "code": "token_missing"}), 401

    # 4. Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(florist_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(checkout_bp)
    
    @app.route('/healthz', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "Flora_X Flask Engine"}), 200

    # 5. Initialize seed values for Roles
    with app.app_context():
        # Schema is fully managed by Flask-Migrate migrations
        # db.create_all()
        # Seed standard roles if not present
        try:
            roles = [
                ("customer", "Standard purchasing customer"),
                ("florist", "Partner florist store vendor"),
                ("admin", "System content manager & auditor"),
                ("super_admin", "Full platform controller")
            ]
            for role_id, desc in roles:
                if not Role.query.get(role_id):
                    r = Role(id=role_id, description=desc)
                    db.session.add(r)
            db.session.commit()
        except Exception:
            db.session.rollback()
            # This is expected during initial migration setup before tables exist
            pass

    return app

if __name__ == '__main__':
    app = create_app()
    # Runs on port 5000 inside the container, proxied by Vite on port 3000
    app.run(host='0.0.0.0', port=5000, debug=True)
