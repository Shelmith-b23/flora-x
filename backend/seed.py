import os
import uuid
from datetime import datetime
from app import create_app
from database import db
from models.user import Role, User, CustomerProfile
from models.florist import FloristProfile, BusinessHour
from models.marketplace import Category, Product, ProductVariant, FloristWallet

def seed_database():
    app = create_app()
    with app.app_context():
        print("Starting database seed...")
        
        # 1. Create standard roles
        roles = [
            ("customer", "Standard purchasing customer"),
            ("florist", "Partner florist store vendor"),
            ("admin", "System content manager & auditor"),
            ("super_admin", "Full platform controller")
        ]
        for role_id, desc in roles:
            if not db.session.get(Role, role_id):
                r = Role(id=role_id, description=desc)
                db.session.add(r)
        db.session.commit()
        print("Roles seeded.")

        # 2. Seed default Admin
        admin_email = "admin@florax.co.ke"
        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            admin = User(
                id="admin-uuid",
                email=admin_email,
                role_id="admin",
                is_verified=True
            )
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()
            print("Admin user seeded.")

        # 3. Seed default Florist 1
        f1_email = "florist1@florax.co.ke"
        f1_user = User.query.filter_by(email=f1_email).first()
        if not f1_user:
            f1_user = User(
                id="florist-user-1",
                email=f1_email,
                role_id="florist",
                is_verified=True
            )
            f1_user.set_password("florist123")
            db.session.add(f1_user)
            db.session.commit()
            
            # Profile
            fp1 = FloristProfile(
                id="florist-1",
                user_id=f1_user.id,
                store_name="Molo Highlands Florist",
                slug="molo-highlands",
                description="Stunning, volcanic highlands roses and custom visual bouquets delivered daily in Nairobi.",
                legal_business_name="Molo Highlands Flowers Limited",
                business_registration_number="PVT-88931",
                mpesa_till_number="883311",
                address_text="Rhapta Road, Westlands, Nairobi",
                latitude=-1.2682,
                longitude=36.8041,
                logo_url="https://images.unsplash.com/photo-1596436889106-be35e843f974?w=150&auto=format&fit=crop&q=60",
                banner_url="https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800&auto=format&fit=crop&q=60",
                delivery_radius_km=20,
                minimum_order_amount=1500,
                verification_status="approved",
                rating_avg=4.8,
                rating_count=124
            )
            db.session.add(fp1)
            
            # Wallet
            wallet1 = FloristWallet(
                florist_id="florist-1",
                available_balance=18400.00,
                pending_balance=3500.00,
                withdrawn_to_date=5000.00
            )
            db.session.add(wallet1)
            db.session.commit()
            print("Florist 1 seeded.")

        # 4. Seed default Florist 2
        f2_email = "florist2@florax.co.ke"
        f2_user = User.query.filter_by(email=f2_email).first()
        if not f2_user:
            f2_user = User(
                id="florist-user-2",
                email=f2_email,
                role_id="florist",
                is_verified=True
            )
            f2_user.set_password("florist123")
            db.session.add(f2_user)
            db.session.commit()
            
            # Profile
            fp2 = FloristProfile(
                id="florist-2",
                user_id=f2_user.id,
                store_name="Lake Naivasha Blooms",
                slug="naivasha-blooms",
                description="Fresh farm-direct spray carnations, lilies, and customized luxury boxes.",
                legal_business_name="Naivasha Blooms Kenya Limited",
                business_registration_number="PVT-22345",
                mpesa_till_number="445522",
                address_text="Moi South Lake Rd, Naivasha",
                latitude=-0.7178,
                longitude=36.4319,
                logo_url="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=150&auto=format&fit=crop&q=60",
                banner_url="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=60",
                delivery_radius_km=15,
                minimum_order_amount=1000,
                verification_status="approved",
                rating_avg=4.6,
                rating_count=88
            )
            db.session.add(fp2)
            
            # Wallet
            wallet2 = FloristWallet(
                florist_id="florist-2",
                available_balance=12000.00,
                pending_balance=0.00,
                withdrawn_to_date=2000.00
            )
            db.session.add(wallet2)
            db.session.commit()
            print("Florist 2 seeded.")

        # 5. Seed default Customer
        c1_email = "customer1@florax.co.ke"
        c1_user = User.query.filter_by(email=c1_email).first()
        if not c1_user:
            c1_user = User(
                id="customer-user-1",
                email=c1_email,
                role_id="customer",
                is_verified=True
            )
            c1_user.set_password("customer123")
            db.session.add(c1_user)
            db.session.commit()
            
            # Profile
            cp1 = CustomerProfile(
                id="customer-1",
                user_id=c1_user.id,
                first_name="Jane",
                last_name="Doe",
                phone_number="+254712345678",
                reward_points_balance=350
            )
            db.session.add(cp1)
            db.session.commit()
            print("Customer Jane Doe seeded.")

        # 6. Seed categories
        categories = [
            ("cat-roses", "Roses", "roses", "category"),
            ("cat-lilies", "Lilies", "lilies", "category"),
            ("cat-orchids", "Orchids", "orchids", "category"),
            ("cat-mixed", "Mixed Bouquets", "mixed-bouquets", "category")
        ]
        for cat_id, name, slug, cat_type in categories:
            if not db.session.get(Category, cat_id):
                c = Category(
                    id=cat_id,
                    name=name,
                    slug=slug,
                    type=cat_type,
                    description=f"Fresh handpicked {name} of premium quality."
                )
                db.session.add(c)
        db.session.commit()
        print("Categories seeded.")

        # 7. Seed products
        products_to_seed = [
            {
                "id": "p1",
                "florist_id": "florist-1",
                "title": "Imperial Safari Rose Bouquet",
                "slug": "imperial-safari-rose-bouquet",
                "description": "A striking collection of deep red Naivasha safari roses, hand-tied with elegant eucalyptus foliage and wrapped in premium textured paper.",
                "primary_image_url": "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&auto=format&fit=crop&q=80",
                "category_id": "cat-roses",
                "variants": [
                    {"sku": "VAR-P1-STD", "title": "Standard (12 stems)", "price": 4800.00, "compare_at_price": 5500.00, "inventory_qty": 20},
                    {"sku": "VAR-P1-DLX", "title": "Deluxe (24 stems)", "price": 7500.00, "compare_at_price": 9000.00, "inventory_qty": 15}
                ]
            },
            {
                "id": "p2",
                "florist_id": "florist-1",
                "title": "Nairobi Golden Sunrise",
                "slug": "nairobi-golden-sunrise",
                "description": "A vibrant, mood-boosting arrangement of premium yellow calla lilies, orange roses, and hypericum berries.",
                "primary_image_url": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop&q=80",
                "category_id": "cat-lilies",
                "variants": [
                    {"sku": "VAR-P2-STD", "title": "Standard Arrangement", "price": 3600.00, "compare_at_price": 4200.00, "inventory_qty": 10}
                ]
            },
            {
                "id": "p3",
                "florist_id": "florist-2",
                "title": "Naivasha Blush Blossom",
                "slug": "naivasha-blush-blossom",
                "description": "Delicate pastel pink spray carnations and baby's breath arranged in a premium gift box.",
                "primary_image_url": "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&auto=format&fit=crop&q=80",
                "category_id": "cat-mixed",
                "variants": [
                    {"sku": "VAR-P3-STD", "title": "Standard Box", "price": 4000.00, "compare_at_price": 4500.00, "inventory_qty": 12}
                ]
            }
        ]

        for p_info in products_to_seed:
            if not db.session.get(Product, p_info["id"]):
                p = Product(
                    id=p_info["id"],
                    florist_id=p_info["florist_id"],
                    title=p_info["title"],
                    slug=p_info["slug"],
                    description=p_info["description"],
                    primary_image_url=p_info["primary_image_url"],
                    category_id=p_info["category_id"],
                    is_active=True
                )
                db.session.add(p)
                db.session.flush() # get product id context
                
                # Add variants
                for v_info in p_info["variants"]:
                    v = ProductVariant(
                        product_id=p.id,
                        sku=v_info["sku"],
                        title=v_info["title"],
                        price=v_info["price"],
                        compare_at_price=v_info["compare_at_price"],
                        inventory_qty=v_info["inventory_qty"]
                    )
                    db.session.add(v)
        
        db.session.commit()
        print("Products and variants seeded successfully.")
        print("Database seed completed perfectly!")

if __name__ == "__main__":
    seed_database()
