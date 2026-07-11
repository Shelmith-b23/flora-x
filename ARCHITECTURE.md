# Flora_X: Enterprise Multi-Vendor Flower Marketplace (Kenya)
## Comprehensive Software Architecture Document
**Version:** 1.0.0  
**Author:** Lead Software Architect & PM  

---

## 1. Overall System Architecture

Flora_X utilizes a modern, decoupled **Full-Stack Service-Oriented Architecture** designed to scale horizontally. The system comprises a rich, highly polished **React Client Single-Page Application (SPA)** that interacts with a secure, high-performance **Python Flask REST API**. Data is persisted in a relational **PostgreSQL** database, supplemented by **Redis** for session management and distributed caching.

Below is the high-level representation of the architecture:

```
+--------------------------------------------------------------------------+
|                                CLIENT LAYER                              |
|   +------------------------------------------------------------------+   |
|   |                  React SPA (Vite, Tailwind, Motion)              |   |
|   +------------------------------------------------------------------+   |
+------------------------------------+-------------------------------------+
                                     |
                                     | HTTPS (REST API / JSON / JWT)
                                     v
+------------------------------------+-------------------------------------+
|                              GATEWAY & SECURITY                          |
|   +------------------------------------------------------------------+   |
|   |         Cloudflare Edge (WAF, SSL, Rate Limiting, CDN)           |   |
|   +----------------------------------+-------------------------------+   |
|                                      |
|                                      v
|   +------------------------------------------------------------------+   |
|   |          Nginx Reverse Proxy / Gunicorn Load Balancer            |   |
|   +----------------------------------+-------------------------------+   |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+------------------------------------+-------------------------------------+
|                              APPLICATION LAYER                           |
|   +------------------------------------------------------------------+   |
|   |                      Python Flask REST API                       |   |
|   |  [Auth Blueprint] [Marketplace Blueprint] [Checkout Blueprint]   |   |
|   |  [Florist Blueprint] [Admin Blueprint]    [AI Core Blueprint]    |   |
|   +--------+-------------------------+-------------------------+-----+   |
+------------|-------------------------|-------------------------|---------+
             |                         |                         |
             v                         v                         v
+------------+-----------+ +-----------+-----------+ +-----------+---------+
|      DATA LAYER        | |     CACHING LAYER     | |    EXTERNAL SERVICES    |
| +--------------------+ | | +-------------------+ | | +---------------------+ |
| |  PostgreSQL DB     | | | | Redis (Cache/Session| | | | Safaricom Daraja  | |
| |  (Durable Storage) | | | | & Queue Broker)   | | | | Google Maps API     | |
| +--------------------+ | | +-------------------+ | | | Gemini API (AI)     | |
|                        | |                       | | | Google Login (OAuth)| |
| +--------------------+ | | +-------------------+ | | | SMS/Email Gateways  | |
| | AWS S3 Bucket      | | | | Celery Task Worker| | | +---------------------+ |
| | (Product/Store Img)| | | | (Async payouts/SEO)| | |                         |
| +--------------------+ | | +-------------------+ | |                         |
+------------------------+ +-----------------------+ +-------------------------+
```

### Key Architectural Characteristics
* **State Isolation:** The React frontend handles all view logic, client-side routing, and local interactive states.
* **Stateless API:** The Flask backend is completely stateless, relying on cryptographic JWTs for session validation. This allows backend instances to scale horizontally behind a load balancer without session-sync bottlenecks.
* **Async Job Offloading:** Heavy tasks (e.g., sending verification emails, processing Daraja Safaricom payment callbacks, compiling monthly florist payouts, generating AI SEO tags) are offloaded to Celery workers backed by a Redis broker.

---

## 2. User Journey Diagrams

### 2.1. Public Visitor Journey
```
[Land on Homepage] ---> [Browse Products / Categories] ---> [Filter by Florist or Occasion]
        |
        +---> [View Florist Profiles / Reviews]
        |
        +---> [Read Blog / FAQs]
        |
        +---> [Initiate 'Become a Florist' Application] ---> [Fill Store Form] ---> [Submit for Review]
```

### 2.2. Customer Journey
```
[Register/Login (Email/Google)] ---> [Browse & Add Items (Multi-Vendor Cart)] ---> [Proceed to Checkout]
                                                                                        |
[Input Recipient & Address (Google Maps API)] <-----------------------------------------+
        |
        v
[Choose Delivery Options & Dates per Vendor] ---> [Confirm & Select M-Pesa Payment]
                                                                |
[Receive M-Pesa PIN Prompt (Daraja STK Push)] <-----------------+
        |
        +---> [Payment Success] ---> [Order Split into Florist Sub-Orders] ---> [Track Order State]
        |                                                                               |
        |                                                                               v
        |                                                                   [Receive Order Delivery]
        |                                                                               |
        |                                                                               v
        +---> [Payment Fail] ---> [Retry STK Push/Choose Another Card]      [Write Reviews & Earn Points]
```

### 2.3. Florist Journey
```
[Submit Application] ---> [Admin Approves] ---> [Access Store Dashboard] ---> [Set Up M-Pesa Payouts]
                                                                                      |
[Fulfill Orders: Prep -> Ready -> Shipped] <--- [Receive Sub-Order Notifications] <--- [Upload Products & Stock]
        |
        v
[Track Wallet Balance (Commission Autodeducted)] ---> [Request Monthly Withdrawal] ---> [Funds Disbursed]
```

### 2.4. Admin & Super Admin Journeys
```
[Admin Login] ---> [Review Florist Applications] ---> [Approve/Reject + Set Individual Commission Cap]
        |
        +---> [Manage Disputes, Process Approved Refunds, Manage CMS, Blogs & FAQs]
        |
        +---> [Generate Market Analytics, Download Audit/Financial Logs]
        |
[Super Admin] ---> [Manage Admins & Assign Permissions] ---> [Configure Global Commission & Gateways]
```

---

## 3. Application Modules

The system is logically partitioned into discrete functional modules:

### 3.1. Identity & Access Management (IAM)
Responsible for user registration, authentication, authorization, token issuance, and account lifecycle. It supports standard email/password authentication (using Argon2id hashing) and third-party Social Login (Google OAuth 2.0).

### 3.2. Product & Catalog Management
Coordinates product listing, categories, inventory levels, pricing, visual media uploads (via pre-signed S3 links), and seller-specific pricing models. Includes the **AI Product Engine** which auto-generates titles, SEO-optimized descriptions, and metadata tags using the Gemini API.

### 3.3. Marketplace Search & Navigation
Provides fast indexing and retrieval of florists and items based on geographical proximity, occasion, price range, ratings, and stock status. Uses geographic indexing to match buyers with local florists within viable delivery ranges.

### 3.4. Cart & Smart Checkout Engine
Handles multi-vendor cart compilation, dynamic delivery fee calculations based on distance (using Google Matrix Routing), voucher/coupon code validation, and checkout orchestration. When a checkout contains items from multiple florists, it calculates individual sub-totals, distributes delivery requirements, and combines them into a single consolidated customer payment.

### 3.5. Safaricom Daraja (M-Pesa) Integration Gateway
Processes mobile money payments in Kenya. It triggers Daraja STK Push (LIPA NA M-PESA Online), handles asynchronous C2B/STK callbacks via secure Webhook receivers, validates transaction IDs, processes payouts, and updates ledger tables.

### 3.6. Order Fulfillment & Logistics Pipeline
Splits the consolidated parent order into distinct florist-specific sub-orders. Each sub-order transitions through state steps (*Pending*, *Received*, *Preparing*, *Ready for Pickup*, *Out for Delivery*, *Delivered*) with real-time email, SMS, and in-app notifications.

### 3.7. Florist Wallet & Ledger Engine
A double-entry accounting engine tracking every florist's financial ledger. It captures gross item sales, automatically deducts the platform's 20% commission (or vendor-specific rate), updates the florist's available wallet balance, and manages monthly bank/M-Pesa withdrawals.

### 3.8. Customer Reviews & Trust Center
Calculates rating metrics for products, florists, and delivery experiences. Only permits verified buyers to leave reviews, preventing fraudulent rating manipulation.

### 3.9. Platform CMS & Engagement Center
Allows admins and marketing managers to write SEO-friendly blogs, update FAQs, manage career listings, edit Terms of Service, and send system-wide notifications.

---

## 4. Feature Hierarchy

```
Flora_X Marketplace Platform
├── Public & Marketing Module
│   ├── Home (Hero Banners, Seasonal Curator, Featured Florists, Dynamic Deals)
│   ├── Shop Catalog (Filters: Price, Rating, Location, Occasion, Flower Type)
│   ├── Florist Directory (Map view, Proximity filter, Florist Spotlights)
│   ├── Reviews Board (Global metrics, Featured success stories)
│   ├── CMS Content (About, Blogs, FAQs, Careers, Privacy Policy, Terms)
│   └── "Become a Florist" Onboarding portal
├── Customer Workspace
│   ├── Account Profile & Secure Password Reset
│   ├── Social Login Linkage (Google Integration)
│   ├── Interactive Order History & Consolidated Invoices
│   ├── Active Order Delivery Tracking Map
│   ├── Saved Wishlist & Registry
│   ├── Address Book Manager (Google Maps Address Autocomplete integration)
│   ├── Message Threading (In-app real-time messaging with individual Florists)
│   ├── Loyalty & Reward Points Ledger (Convertible to Checkout Discounts)
│   └── Verified Review Editor (Stars, Photos, text feedback)
├── Florist Portal
│   ├── Storefront Profile Setup (Logo, Cover, Banner, Location, Delivery Hours)
│   ├── Product Catalog & Variant Manager
│   ├── Stock & Inventory Alerts Dashboard
│   ├── Order Routing Center (Approve orders, Update status timeline)
│   ├── Coupon & Promo code Campaign Manager
│   ├── Ledger & Payout Panel (Earnings tracker, Monthly withdrawal triggers)
│   ├── Customer Message Hub
│   └── Analytics Core (Sales trends, Popular items, Average processing time)
└── Administration Workspace (Admin & Super Admin)
    ├── General Oversight Center (Metrics, Pending Approvals, Active disputes)
    ├── User & Store Moderation Dashboard
    ├── Global Transaction Ledger & Automated Financial Audits
    ├── Withdrawal Approval Pipeline & Bulk Paybill Disbursements
    ├── Dispute Resolution & Secure Customer Refunds
    ├── AI Recommendation Orchestrator & SEO Optimizer
    ├── CMS Editor (Blog posting, FAQ manager, Global alert bars)
    └── Security & System Logs (Audit trails, Failed logins, Gateway configs)
```

---

## 5. High-Level Database Entities

```
  +---------------+               +-----------------+               +---------------+
  |     users     | 1           * |    addresses    | *           1 |    florists   |
  | (PK) id       +---------------+ (PK) id         +---------------+ (PK) id       |
  |  email, hash  |               |  lat, lng, desc |               |  name, payout |
  +-------+-------+               +-----------------+               +-------+-------+
          | 1                                                               | 1
          |                                                                 |
          | *                                                               | *
  +-------v-------+               +-----------------+               +-------v-------+
  |    orders     | 1           * |   sub_orders    | *           1 |   products    |
  | (PK) id       +---------------+ (PK) id         +---------------+ (PK) id       |
  |  payment_ref  |               |  florist_id     |               |  title, price |
  +-------+-------+               +--------+--------+               +-------+-------+
          | 1                              | 1                              | 1
          |                                |                                |
          | *                              | *                              | *
  +-------v-------+                        |                        +-------v-------+
  |  transactions |                        +------------------------>  order_items  |
  | (PK) id       |                                                 | (PK) id       |
  |  mpesa_code   |                                                 |  qty, price   |
  +---------------+                                                 +---------------+
```

### 5.1. Table Schemas (PostgreSQL DDL Draft)

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('visitor', 'customer', 'florist', 'admin', 'super_admin');
CREATE TYPE order_status AS ENUM ('pending_payment', 'successful', 'received', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'refund_requested', 'refund_approved', 'cancelled');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role user_role DEFAULT 'customer' NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    google_id VARCHAR(255) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    reward_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Florist Stores Table
CREATE TABLE florists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(512),
    banner_url VARCHAR(512),
    mpesa_till_number VARCHAR(50) NOT NULL,
    mpesa_paybill_number VARCHAR(50),
    mpesa_account_number VARCHAR(100),
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    address_text VARCHAR(512),
    commission_rate DECIMAL(5,2) DEFAULT 20.00,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    florist_id UUID REFERENCES florists(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    inventory_quantity INT DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(100),
    tags VARCHAR(50)[],
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Parent Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    coupon_code VARCHAR(50),
    points_redeemed INT DEFAULT 0,
    points_earned INT DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Florist Sub-Orders Table
CREATE TABLE sub_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    florist_id UUID REFERENCES florists(id),
    sub_total DECIMAL(12,2) NOT NULL,
    delivery_fee DECIMAL(12,2) DEFAULT 0.00,
    platform_commission DECIMAL(12,2) NOT NULL,
    florist_earnings DECIMAL(12,2) NOT NULL,
    status order_status DEFAULT 'pending_payment' NOT NULL,
    delivery_address JSONB NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_order_id UUID REFERENCES sub_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions & M-Pesa Ledger Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    merchant_request_id VARCHAR(255) UNIQUE,
    checkout_request_id VARCHAR(255) UNIQUE,
    mpesa_receipt_number VARCHAR(100) UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed'
    callback_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Florist Wallet Ledger Table
CREATE TABLE wallet_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    florist_id UUID REFERENCES florists(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL, -- Positive for earnings, negative for withdrawals
    type VARCHAR(50) NOT NULL, -- 'sale', 'withdrawal', 'refund_deduction'
    reference_id UUID, -- References sub_orders or withdrawals
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Recommended Folder Structure

A production-ready code distribution splitting concerns clearly:

```
flora_x_workspace/
├── .env.example
├── README.md
├── ARCHITECTURE.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── dist/                          # Compiled build targets
├── public/                        # Static public client files (favicon, metadata)
├── backend/                       # Python Flask API Core
│   ├── app.py                     # Entry Point
│   ├── config.py                  # Environment Configuration
│   ├── requirements.txt           # Python Package Dependencies
│   ├── celery_worker.py           # Task queue worker runner
│   ├── database.py                # PostgreSQL Engine setup
│   ├── models/                    # SQLAlchemy Schema declarations
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── florist.py
│   │   ├── product.py
│   │   └── order.py
│   ├── blueprints/                # API Route modules
│   │   ├── auth.py
│   │   ├── florist.py
│   │   ├── customer.py
│   │   ├── orders.py
│   │   └── ai_engine.py
│   ├── services/                  # Business Logic orchestration
│   │   ├── mpesa_daraja.py        # Safaricom Integration
│   │   ├── gemini_service.py      # Gemini AI Client
│   │   ├── maps_service.py        # Map Routing
│   │   └── email_sms.py           # Communications Sender
│   └── tests/                     # Backend Unit Tests
└── src/                           # React Client-Side Frontend
    ├── main.tsx                   # Mounting script
    ├── App.tsx                    # Main App Shell (Router, Providers)
    ├── index.css                  # Tailwinds Styling
    ├── types.ts                   # Unified TypeScript definitions
    ├── lib/                       # Third-party instance drivers
    │   ├── api_client.ts          # Axios base client
    │   └── utils.ts               # Shared helper operations
    ├── hooks/                     # Custom global hooks
    │   ├── useAuth.ts
    │   └── useCart.ts
    ├── components/                # Modular UX blocks
    │   ├── common/                # Visual components (Buttons, Inputs, Modals)
    │   ├── layout/                # Shell boundaries (Header, Footers, Navbars)
    │   └── shared/                # Cross-context components (ProductCard, StarRating)
    ├── pages/                     # Full-screen Route targets
    │   ├── public/                # Marketing/Browse views (Home, Shop, About, Blog)
    │   ├── customer/              # Customer dashboard screens
    │   ├── florist/               # Vendor dashboard screens
    │   └── admin/                 # Management views
    └── context/                   # React Context Stores
        ├── AuthContext.tsx
        └── CartContext.tsx
```

---

## 7. Frontend Architecture

The Flora_X frontend is built as a single-page application focused on speed, modularity, and high-quality UI/UX.

### 7.1. Technology Rationale
* **Vite Build Engine:** Provides fast builds and optimized production assets.
* **Tailwind CSS v4:** Ensures lightweight styles with design tokens that are easy to maintain.
* **Motion (Framer Motion):** Standardized library for layout transitions, micro-interactions, and visual feedback (e.g., cart indicators, layout shifts).
* **React Context + Custom Hooks:** Lightweight state orchestration (for Cart, Auth, and Local Settings) to avoid unnecessary global state overhead.

### 7.2. Global State & Caching Strategy
* **Persisted Context:** User auth state and cart data are stored in React Context and synced with `localStorage`.
* **API Data Cache:** The system uses cached fetch wrappers to prevent redundant API queries when navigating between screens (e.g., caching product details and blog pages).

### 7.3. UI & Visual Language Guidelines
* **Color Palette:** Warm off-whites (`#FAF9F6`), deep slate/charcoal (`#1A202C`), and earthy accents (forest green and muted rose) to create an elegant, premium, and sustainable aesthetic.
* **Typography:** Clean sans-serif headings (e.g., Space Grotesk or Inter) paired with monospaced accents (e.g., JetBrains Mono) for prices, dates, and order codes to keep information highly legible.
* **Negative Space:** Designed with generous padding (e.g., `py-16 md:py-24`) to emphasize product imagery and avoid visual clutter.

---

## 8. Backend Architecture

The Flora_X backend is built using a structured **Python Flask MVC** pattern, using blueprints for clean routing and modularity.

```
+---------------------------------------------------------------+
|                      FLASK API BACKEND                        |
|                                                               |
|  +---------------------------------------------------------+  |
|  |                   Entry (app.py)                        |  |
|  +--------------------------+------------------------------+  |
|                             | Router                          |
|                             v                                 |
|  +---------------------------------------------------------+  |
|  |                Blueprints (Controllers)                  |  |
|  |  - Auth       - Florist      - Customer     - Checkout  |  |
|  +--------------------------+------------------------------+  |
|                             | Service Invocation              |
|                             v                                 |
|  +---------------------------------------------------------+  |
|  |                 Services (Domain Logic)                 |  |
|  |  - M-Pesa Gateway            - Google Maps Platform     |  |
|  |  - Gemini AI Engine          - Communications Engine    |  |
|  +--------------------------+------------------------------+  |
|                             | DB Access                       |
|                             v                                 |
|  +---------------------------------------------------------+  |
|  |                   SQLAlchemy Models                     |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

### 8.1. Data Validation Layer
The API uses strict data validation (using libraries like `pydantic` or `marshmallow`) to validate incoming JSON payloads before they reach the database layer. This ensures that:
* All strings are sanitized to prevent cross-site scripting (XSS).
* Query parameters are safely structured to prevent SQL injection.
* Floating point errors are avoided in pricing calculations by storing money values as decimals (`Numeric(12,2)`) in both the database and application code.

### 8.2. Ledger Integrity Core
Any financial transactions (such as commission deductions or florist earnings) are processed inside isolated PostgreSQL database transactions with **serializable isolation**. This prevents race conditions and ensures that financial ledgers remain accurate even during periods of high traffic.

---

## 9. API Architecture

The Flask backend exposes a unified, versioned RESTful JSON API (`/api/v1/*`).

### 9.1. Key REST Endpoints

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Public | Registers a new user. |
| **POST** | `/api/v1/auth/login` | Public | Authenticates credentials and returns a JWT. |
| **GET** | `/api/v1/products` | Public | Lists products with paging, filtering, and search options. |
| **GET** | `/api/v1/products/<uuid>` | Public | Retrieves detailed information for a single product. |
| **POST** | `/api/v1/checkout/create` | Customer | Places a parent order and splits it into florist sub-orders. |
| **POST** | `/api/v1/checkout/pay` | Customer | Triggers a Safaricom M-Pesa Daraja STK Push payment prompt. |
| **POST** | `/api/v1/checkout/mpesa-callback` | Public | Processes async payment confirmations from Safaricom. |
| **GET** | `/api/v1/florist/dashboard` | Florist | Returns orders, wallet ledger, and metrics for a florist. |
| **PATCH** | `/api/v1/florist/orders/<uuid>` | Florist | Updates a sub-order's fulfillment state. |
| **POST** | `/api/v1/ai/suggest` | Customer | Generates gift recommendations using the Gemini API. |

### 9.2. API Payloads Example

#### Consolidated Multi-Vendor Checkout Creation Request:
```http
POST /api/v1/checkout/create HTTP/1.1
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "items": [
    {
      "product_id": "76e3d2a0-410c-4fa2-938b-d72b11bf9801",
      "quantity": 2
    },
    {
      "product_id": "3bb62c11-9a2d-45a8-bcfd-01127e28af99",
      "quantity": 1
    }
  ],
  "coupon_code": "FLOWERPOWER",
  "points_to_redeem": 100,
  "delivery_address": {
    "recipient_name": "Jane Doe",
    "phone": "+254712345678",
    "street": "12 Tree Lane, Nairobi",
    "latitude": -1.2921,
    "longitude": 36.8219,
    "instructions": "Leave at the main reception."
  },
  "delivery_date": "2026-07-15"
}
```

#### API JSON Response:
```json
{
  "success": true,
  "message": "Consolidated order created successfully.",
  "data": {
    "parent_order_id": "99f4d1e2-cb92-4cc7-b31c-829d91ee0a22",
    "total_amount": 7800.00,
    "points_earned": 78,
    "sub_orders": [
      {
        "sub_order_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "florist_name": "Nairobi Blooms",
        "items_total": 4500.00,
        "delivery_fee": 300.00
      },
      {
        "sub_order_id": "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
        "florist_name": "Rift Valley Roses",
        "items_total": 3000.00,
        "delivery_fee": 0.00
      }
    ]
  }
}
```

---

## 10. Security Architecture

The Flora_X platform uses a multi-layered security model to protect user data, transaction integrity, and financial flows.

```
       [ Client Request ]
               │
               ▼
┌──────────────────────────────┐
│  Cloudflare Web App Firewall │ <--- Blocks SQLi, XSS, DDoS, and bad bots
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  JSON Web Token Validation   │ <--- Decodes JWTs and checks role permissions
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Safaricom Daraja Auth Gateway│ <--- Validates API keys and secure callbacks
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Serializable SQL Transactions│ <--- Enforces data isolation and ledger accuracy
└──────────────────────────────┘
```

### 10.1. Authentication & API Security
* **JWT Expiry & Refresh Tokens:** Access tokens expire after 15 minutes, while refresh tokens are stored in secure, `HttpOnly`, `SameSite=Strict` cookies. This setup protects the system from Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
* **Role-Based Access Control (RBAC):** Backend endpoints verify roles before processing requests, preventing unauthorized access (e.g., ensuring standard customers cannot access administrative endpoints).

### 10.2. Payment Security (Safaricom Daraja)
* **IP Whitelisting & Webhook Validation:** Only official IP addresses from Safaricom can call the M-Pesa transaction callback endpoint.
* **Signature Verification:** Callbacks are validated using secure headers and checksums to prevent attackers from sending fake payment confirmations.

---

## 11. Scalability Recommendations

As Flora_X grows, the following design principles ensure the platform scales smoothly:

### 11.1. High-Performance Database Setup
* **Read/Write Splitting:** A master database instance processes all writes (such as checkouts and ledger updates), while read-only replicas handle search queries and catalog browsing to reduce overall database load.
* **Database Indexing:** Composite database indexes are set on frequently queried columns (such as `product(category, price)`) and coordinates to speed up local florist searches.

### 11.2. Intelligent Caching
* **Redis Cache Layer:** Frequently read pages (such as store profiles, customer reviews, and category structures) are cached in Redis with dynamic expiration timers to minimize direct database queries.
* **Distributed Task Offloading:** Heavy asynchronous tasks (such as payment processing and sending emails) are managed by Celery workers to keep the main web application responsive.

---

## 12. Third-Party Integrations

Flora_X connects with several external services to provide a seamless marketplace experience:

```
                  ┌──────────────────────┐
                  │ Flora_X REST Backend │
                  └──────────┬───────────┘
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│Safaricom Daraja │ │Google Maps API  │ │Gemini AI API    │
│- STK Push       │ │- Place Autocomplete│ - AI SEO Tags  │
│- Payouts (B2C)  │ │- Matrix Routing │ │- Recommendations│
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 12.1. Safaricom Daraja API (M-Pesa)
* **STK Push (Lipa na M-Pesa Online):** Prompts customers to enter their M-Pesa PIN on their phones to authorize transactions immediately at checkout.
* **B2C Disbursal:** Automatically routes approved florist earnings to their M-Pesa registered phone numbers, deducting the platform's 20% commission first.

### 12.2. Google Maps Platform
* **Places Autocomplete:** Helps customers enter delivery addresses quickly and accurately at checkout.
* **Distance Matrix API:** Dynamically calculates delivery fees based on the actual driving distance between the customer and the selected florist.

### 12.3. Google GenAI (Gemini API)
* **AI Gift Suggestions:** Evaluates recipient details and selected occasions to suggest the perfect floral arrangement.
* **Automated Cataloging:** Helps florists write SEO-optimized titles, product descriptions, and metadata tags automatically.

---

## 13. Deployment Architecture

Flora_X runs on a modern cloud setup that is fully containerized for high availability and easy deployment.

```
                  [ Web Traffic ]
                         │
                         ▼
             ┌────────────────────────┐
             │ Cloudflare Edge DNS/SSL│
             └───────────┬────────────┘
                         │
                         ▼
             ┌────────────────────────┐
             │  Dockerized React SPA  │
             └───────────┬────────────┘
                         │
                         ▼
            ┌──────────────────────────┐
            │ Nginx / Gunicorn Gateway │
            └────────────┬─────────────┘
                         │
                         ▼
            ┌──────────────────────────┐
            │   Flask REST Instances   │
            └──────┬────────────┬──────┘
                   │            │
         ┌─────────┘            └─────────┐
         ▼                                ▼
┌─────────────────┐              ┌─────────────────┐
│ Managed Postgres│              │  Redis Server   │
│  (Cloud SQL)    │              │  (Cache/Queue)  │
└─────────────────┘              └─────────────────┘
```

### 13.1. Infrastructure Setup
* **Containerized Services:** Both the frontend React app and backend Flask API are containerized using Docker, allowing them to scale dynamically based on current user traffic.
* **CI/CD Pipeline:** Code changes undergo automated linting, unit testing, and vulnerability scanning before being built into Docker images and deployed automatically.

---

## 14. Suggested Project Roadmap

A structured 4-phase timeline to launch and grow the Flora_X marketplace:

### Phase 1: MVP Core (Weeks 1 - 6)
* Set up database schemas, register/login systems, and user profiles.
* Implement the multi-vendor shopping cart and the checkout flow.
* Integrate M-Pesa STK push payments and secure payment callback handling.
* Launch the core buyer catalog and florist onboarding portal.

### Phase 2: Operations & Logistics (Weeks 7 - 10)
* Build the Google Maps integration for distance-based delivery fees.
* Build the florist store management panels and order status tracking flows.
* Launch the double-entry wallet ledger and automated monthly florist payout flows.
* Add support for verified reviews and customer wishlists.

### Phase 3: AI & Optimization (Weeks 11 - 14)
* Integrate the Gemini API to suggest gift items and auto-generate product descriptions.
* Build the administrative dashboard for managing users, florists, and platform disputes.
* Implement Redis caching to improve search and page loading speeds.
* Add Google OAuth social login and verify email/SMS notification setups.

### Phase 4: Scaling & Launch (Weeks 15+)
* Set up a production-ready CI/CD pipeline and configure Cloudflare WAF protections.
* Run security audits, penetration testing, and optimize database queries.
* Launch the platform in Kenya with a marketing campaign focused on local florists.
