# Flora_X: Enterprise REST API Specification
**Version:** 1.0.0-OAS3  
**Base Path:** `/api/v1`  
**Author:** Principal API Architect  
**Associated Documents:** `ARCHITECTURE.md` (System), `DATABASE_DESIGN.md` (Database)  

---

## 1. API Design Principles

The Flora_X REST API serves as the official decoupled contract between our React Single-Page Application (SPA) and our Python Flask microservices layer. It is built upon the following industry standards:

### 1.1. Core Architectural Guidelines
* **REST Constraints:** Stateless server operations, uniform interfaces, resource-oriented endpoint structures using lowercase plural nouns (`/products`, `/orders`, `/carts`).
* **Format & Content Type:** All requests containing bodies must send a `Content-Type: application/json` header. All response bodies are formatted strictly in JSON.
* **HTTP Methods Representation:**
  * `GET`: Safe, idempotent retrieval of resource representations.
  * `POST`: Unsafe, non-idempotent creation of new resources or triggers.
  * `PUT`: Idempotent replacement of an entire resource.
  * `PATCH`: Idempotent partial modification of a resource.
  * `DELETE`: Idempotent removal/soft-deletion of a resource.
* **Idempotency Headers:** Unsafe write operations (such as checkout creations, wallet withdrawals, or M-Pesa push triggers) accept an `Idempotency-Key` UUID header to prevent duplicate execution during network retries.

### 1.2. Protocol Security
* **Transport Encryption:** Strict enforcement of TLSv1.3. Any request sent over unencrypted HTTP receives a `301 Moved Permanently` redirect to HTTPS.
* **CORS Policy:** Strict origin constraints. Wildcard headers (`Access-Control-Allow-Origin: *`) are forbidden on authenticated routes.

---

## 2. Global Error Standards

To establish a uniform parsing framework for client applications, all API errors follow a RFC 7807-compliant JSON structure.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request body contains invalid or missing fields.",
    "details": [
      {
        "field": "recipient_phone",
        "issue": "Must be formatted as a valid E.164 phone number starting with +254."
      }
    ],
    "timestamp": "2026-07-11T14:45:00Z",
    "request_id": "req-9a3c8e41-bb8e-4a6f"
  }
}
```

### Standard HTTP Status Mapping:

| HTTP Status | Error Code | Operational Rationale |
| :--- | :--- | :--- |
| **400 Bad Request** | `MALFORMED_REQUEST` | Syntax error in request body or un-parseable JSON payload. |
| **401 Unauthorized** | `INVALID_CREDENTIALS` / `TOKEN_EXPIRED` | Missing, malformed, or expired JWT signature in headers. |
| **403 Forbidden** | `INSUFFICIENT_PERMISSIONS` | Authenticated user lacks the necessary RBAC roles to access the resource. |
| **404 Not Found** | `RESOURCE_NOT_FOUND` | No resource exists at the requested path or requested ID. |
| **409 Conflict** | `DUPLICATE_RECORD` | Resource unique constraints violated (e.g., matching active email). |
| **422 Unprocessable** | `VALIDATION_FAILED` | Syntactically correct JSON payload violates semantic business validation rules. |
| **429 Too Many Requests**| `RATE_LIMIT_EXCEEDED` | Request rate limit for IP/User Token exceeded. |
| **500 Internal Error** | `SERVER_ERROR` | An unhandled exception occurred in the backend service. |
| **503 Service Unavailable**| `GATEWAY_TIMEOUT` | Downstream network endpoints (e.g., Safaricom, Maps API) are timed out. |

---

## 3. Authentication & Authorization Matrix

Flora_X uses stateless JSON Web Token (JWT) credentials containing roles for RBAC.

```
+------------------+                   +------------------+                   +--------------------+
|   React Client   |                   |    Flask IAM     |                   |  PostgreSQL Database |
+--------+---------+                   +--------+---------+                   +---------+----------+
         |                                      |                                       |
         | 1. POST /auth/login                  |                                       |
         +------------------------------------->+                                       |
         |                                      | 2. Validate hash / credentials        |
         |                                      +-------------------------------------->|
         |                                      |                                       |
         | 3. Issue short-lived JWT Access +    |                                       |
         |    secure HttpOnly Refresh Token     |                                       |
         |<-------------------------------------+                                       |
         |                                      |                                       |
         | 4. Fetch /customer/profile           |                                       |
         |    (with Authorization: Bearer JWT)  |                                       |
         +------------------------------------->+                                       |
         |                                      | 5. Validate signature & RBAC claims   |
         |                                      +-------------------------------------->|
```

### 3.1. Auth Headers & Expirations
* **Access Token:** Transmitted in the request headers: `Authorization: Bearer <JWT_ACCESS_TOKEN>`. Expires in **15 minutes**.
* **Refresh Token:** Transmitted to the client inside a secure, encrypted cookie (`HttpOnly`, `Secure`, `SameSite=Strict`, `/api/v1/auth/refresh`). Expires in **7 days**. Used exclusively to query `/auth/refresh` to obtain a fresh access token.

### 3.2. Authorization Matrix (RBAC Roles)

| API Path | Public (Visitor) | Customer | Florist | Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `/api/v1/marketplace/*` | ✔ | ✔ | ✔ | ✔ | ✔ |
| `/api/v1/cart/*` | ✔ | ✔ | ✔ | ✔ | ✔ |
| `/api/v1/customer/*` | ❌ | ✔ | ❌ | ✔ | ✔ |
| `/api/v1/florist/*` | ❌ | ❌ | ✔ | ✔ | ✔ |
| `/api/v1/admin/*` | ❌ | ❌ | ❌ | ✔ | ✔ |
| `/api/v1/super-admin/*` | ❌ | ❌ | ❌ | ❌ | ✔ |

---

## 4. Query, Search, Pagination & Filtering Standards

All bulk endpoints (`GET /products`, `/orders`, `/blogs`) enforce structured query formats for reliable performance.

### 4.1. Standard Pagination (Offset-based)
* **Query Parameters:** `page` (default: `1`), `limit` (default: `20`, maximum: `100`).
* **Metadata Structure:** Returned in pagination wrapper.
```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "limit": 20,
    "total_records": 142,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### 4.2. Cursor Pagination (Recommended for Messaging / Chats)
* To prevent missing or duplicated items during active chat scrolling, messaging history utilizes Cursor Pagination.
* **Query Parameters:** `starting_after` (UUID), `limit` (default: `50`).

### 4.3. Standard Sorting & Multi-Parameter Filtering
* **Sorting Parameter:** `sort_by` formatted as `{field}:{direction}`. E.g., `sort_by=price:asc`, `sort_by=created_at:desc`.
* **Standard Filters:**
  * Range Filter: `price_min=1000&price_max=5000`
  * Matching Arrays: `categories=roses,orchids`
  * Geolocation Proximity: `lat=-1.2921&lng=36.8219&radius_km=15`

---

## 5. Unified Endpoint Catalog

---

### Group 5.1: Authentication APIs

Endpoints managing registration, credentials, token lifecycles, and passwords.

#### `POST /auth/register`
Registers a new customer profile.
* **Auth Requirement:** None (Public)
* **Request Body:**
```json
{
  "email": "customer@gmail.com",
  "password": "StrongPassword123!",
  "first_name": "Clara",
  "last_name": "Wangui",
  "phone_number": "+254712345678"
}
```
* **Validation Rules:**
  * `email` must be a valid, lowercase email address.
  * `password` must be at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.
  * `phone_number` must match the Kenyan E.164 pattern: `^\+254(7|1)\d{8}$`.
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully. Verification email sent.",
  "data": {
    "user_id": "0190a23c-bb12-70fc-9f8e-d72b11bf9801",
    "email": "customer@gmail.com",
    "is_verified": false
  }
}
```

#### `POST /auth/login`
Authenticates a user and returns an access token.
* **Auth Requirement:** None (Public)
* **Request Body:**
```json
{
  "email": "customer@gmail.com",
  "password": "StrongPassword123!"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 900,
    "user": {
      "id": "0190a23c-bb12-70fc-9f8e-d72b11bf9801",
      "email": "customer@gmail.com",
      "role": "customer",
      "first_name": "Clara",
      "last_name": "Wangui"
    }
  }
}
```
*Set Cookie Header:* `Set-Cookie: refresh_token=refresh_token_value; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh`

#### `POST /auth/refresh`
Refreshes an expired access token using the HttpOnly refresh cookie.
* **Auth Requirement:** Valid Refresh Cookie
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "new_access_token_jwt_here",
    "expires_in": 900
  }
}
```

#### `POST /auth/google`
Authenticates or registers a user using Google OAuth 2.0.
* **Auth Requirement:** None (Public)
* **Request Body:**
```json
{
  "id_token": "google_oauth_id_token_credential_here"
}
```
* **Success Response (200 OK):** Identical to `/auth/login` containing the JWT access token and refresh cookies.

#### `POST /auth/forgot-password`
Generates a secure password reset token.
* **Auth Requirement:** None (Public)
* **Request Body:**
```json
{
  "email": "customer@gmail.com"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "If the account exists, a password reset link has been dispatched to your email."
}
```

#### `POST /auth/reset-password`
Resets a user's password using a reset token.
* **Auth Requirement:** None (Public)
* **Request Body:**
```json
{
  "token": "reset_token_from_email_here",
  "new_password": "NewStrongPassword456!"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now log in."
}
```

#### `POST /auth/verify-email`
Verifies a user's email address using a verification token.
* **Auth Requirement:** None (Public)
* **Request Body:**
```json
{
  "token": "verification_token_here"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Your email address has been successfully verified."
}
```

#### `POST /auth/logout`
Revokes the current session and clears the refresh cookie.
* **Auth Requirement:** None (Public / Cookie Cleared)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### Group 5.2: Customer APIs

Provides access to customer profiles, saved addresses, wishlists, and loyalty points.

#### `GET /customer/profile`
Retrieves details for the authenticated customer.
* **Auth Requirement:** Access Token (Customer)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile_id": "0190a23d-c12e-72bc-8ef1-a129d91ee0a2",
    "email": "customer@gmail.com",
    "first_name": "Clara",
    "last_name": "Wangui",
    "phone_number": "+254712345678",
    "reward_points_balance": 150,
    "avatar_url": "https://storage.florax.co.ke/avatars/clara.jpg"
  }
}
```

#### `PATCH /customer/profile`
Updates profile metadata.
* **Auth Requirement:** Access Token (Customer)
* **Request Body:**
```json
{
  "first_name": "Clara",
  "last_name": "Wangui-Njoroge",
  "phone_number": "+254712345678"
}
```

#### `GET /customer/addresses`
Lists saved delivery addresses.
* **Auth Requirement:** Access Token (Customer)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "0190a23e-0012-798c-bfd3-c98d91ea0a44",
      "label": "Nairobi Office",
      "street_address": "8th Floor, Delta Towers, Westlands",
      "city": "Nairobi",
      "latitude": -1.2643,
      "longitude": 36.8021,
      "delivery_instructions": "Leave at reception",
      "is_default": true
    }
  ]
}
```

#### `POST /customer/addresses`
Saves a new delivery address.
* **Auth Requirement:** Access Token (Customer)
* **Request Body:**
```json
{
  "label": "Home",
  "street_address": "15 Maple Lane, Karen",
  "city": "Nairobi",
  "latitude": -1.3204,
  "longitude": 36.7265,
  "delivery_instructions": "Call before gate arrival",
  "is_default": false
}
```

#### `GET /customer/wishlist`
Lists items saved to the customer's wishlist.
* **Auth Requirement:** Access Token (Customer)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "wishlist_item_id": "0190a23f-e1a2-7bc0-a29d-91ee0a22a30b",
      "product": {
        "id": "0190a23c-ee88-75c0-bfd1-01127e28af99",
        "title": "Red Rose Cascade",
        "price": 3500.00,
        "primary_image_url": "https://storage.florax.co.ke/products/roses_red.jpg"
      }
    }
  ]
}
```

#### `POST /customer/wishlist`
Adds a product to the wishlist.
* **Auth Requirement:** Access Token (Customer)
* **Request Body:**
```json
{
  "product_id": "0190a23c-ee88-75c0-bfd1-01127e28af99"
}
```

#### `DELETE /customer/wishlist/<wishlist_item_id>`
Removes an item from the wishlist.
* **Auth Requirement:** Access Token (Customer)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from wishlist."
}
```

---

### Group 5.3: Florist APIs

Allows florists to manage their store profiles, product listings, coupons, and earnings ledger.

#### `POST /florist/register`
Saves business information and requests florist onboarding verification.
* **Auth Requirement:** Access Token (Registered User role)
* **Request Body:**
```json
{
  "store_name": "Nairobi Blooms Ltd",
  "legal_business_name": "Nairobi Blooms Registered Co",
  "business_registration_number": "PVT-9X7L2M5",
  "mpesa_till_number": "5423190",
  "latitude": -1.2825,
  "longitude": 36.8224,
  "address_text": "Kenyatta Avenue, CBD, Nairobi",
  "delivery_radius_km": 15.00
}
```
* **Success Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Florist application submitted successfully. Current status is pending review.",
  "data": {
    "florist_id": "0190a240-a192-7cb0-891c-1e2f3a4b5c6d",
    "verification_status": "pending_review"
  }
}
```

#### `GET /florist/dashboard`
Returns sales metrics, active orders, and low-stock alerts for the florist's dashboard.
* **Auth Requirement:** Access Token (Florist)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "earnings": {
      "available_balance": 42000.00,
      "pending_balance": 12000.00,
      "withdrawn_to_date": 150000.00
    },
    "metrics": {
      "pending_fulfillment_orders": 8,
      "total_active_listings": 24,
      "average_shop_rating": 4.82
    },
    "critical_stock_alerts": [
      {
        "sku": "NB-RED-ROSE-STD",
        "title": "Red Rose Cascade (Standard)",
        "remaining_qty": 2
      }
    ]
  }
}
```

#### `PATCH /florist/profile`
Updates a florist's store settings and coordinates.
* **Auth Requirement:** Access Token (Florist)
* **Request Body:**
```json
{
  "store_name": "Nairobi Blooms Ltd",
  "description": "Nairobi's premium florist crafting natural designs.",
  "delivery_radius_km": 20.00,
  "minimum_order_amount": 1500.00
}
```

#### `POST /florist/media`
Generates AWS S3 pre-signed URLs for uploading logos, banners, or product images safely from the frontend.
* **Auth Requirement:** Access Token (Florist)
* **Request Body:**
```json
{
  "file_name": "store_logo.png",
  "content_type": "image/png"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "upload_url": "https://florax-bucket.s3.amazonaws.com/logos/store_logo.png?AWSAccessKeyId=AKIA...",
    "public_url": "https://storage.florax.co.ke/logos/store_logo.png"
  }
}
```

---

### Group 5.4: Marketplace & Discovery APIs

Handles public listings, browsing, search, recommendations, and homepage content.

#### `GET /marketplace/home`
Returns homepage content, including seasonal banner campaigns and active deals.
* **Auth Requirement:** None (Public)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "seasonal_banner": {
      "title": "Celebrate Mother's Day with Elegant Arrangements",
      "image_url": "https://storage.florax.co.ke/banners/mothers_day.jpg"
    },
    "featured_categories": [
      { "id": "cat-1", "name": "Roses", "slug": "roses" }
    ],
    "featured_florists": [
      { "id": "florist-1", "store_name": "Nairobi Blooms", "rating_avg": 4.9 }
    ]
  }
}
```

#### `GET /marketplace/search`
Searches across categories, tags, florists, and price points using location metrics.
* **Auth Requirement:** None (Public)
* **Query Parameters:**
  * `query`: Keyword string (e.g., `'roses'`).
  * `lat` / `lng`: Buyer coordinates for delivery.
  * `radius_km`: Filters florists within delivery range (default: `15.00`).
  * `price_min` / `price_max`: Price range boundaries.
  * `sort_by`: E.g., `price:asc`, `rating:desc`.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "0190a23c-ee88-75c0-bfd1-01127e28af99",
      "title": "Sunset Tulip Medley",
      "price": 2800.00,
      "primary_image_url": "https://storage.florax.co.ke/products/tulips.jpg",
      "florist": {
        "id": "0190a240-a192-7cb0-891c-1e2f3a4b5c6d",
        "store_name": "Nairobi Blooms",
        "distance_km": 4.2
      }
    }
  ],
  "meta": {
    "total_records": 1
  }
}
```

---

### Group 5.5: Product Catalog APIs

Provides administration and browsing capabilities for products and size variants.

#### `GET /products/<product_id>`
Retrieves comprehensive details, available sizes, and customer reviews for a single product.
* **Auth Requirement:** None (Public)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "0190a23c-ee88-75c0-bfd1-01127e28af99",
    "title": "Red Rose Cascade",
    "description": "A stunning arrangement of hand-selected red roses.",
    "primary_image_url": "https://storage.florax.co.ke/products/roses_red.jpg",
    "florist": {
      "id": "0190a240-a192-7cb0-891c-1e2f3a4b5c6d",
      "store_name": "Nairobi Blooms"
    },
    "variants": [
      {
        "id": "0190a23e-11bc-7212-bfcd-c9829e0019aa",
        "sku": "NB-R-ROSE-STD",
        "title": "Standard (12 Roses)",
        "price": 3500.00,
        "inventory_qty": 14
      },
      {
        "id": "0190a23e-11bc-7212-bfcd-c9829e0019bb",
        "sku": "NB-R-ROSE-DLX",
        "title": "Deluxe (24 Roses)",
        "price": 6000.00,
        "inventory_qty": 8
      }
    ]
  }
}
```

#### `POST /products`
Creates a product listing along with its size variants.
* **Auth Requirement:** Access Token (Florist)
* **Request Body:**
```json
{
  "title": "White Lily Elegance",
  "description": "Pure white lilies paired with green foliage.",
  "category_id": "0190a23e-1bc1-79ac-9e9d-e1e2f3a4b5c6",
  "primary_image_url": "https://storage.florax.co.ke/products/lilies_white.jpg",
  "variants": [
    {
      "title": "Standard",
      "sku": "NB-W-LILY-STD",
      "price": 2900.00,
      "inventory_qty": 20
    }
  ]
}
```

---

### Group 5.6: Shopping Cart APIs

Manages active shopping sessions, coupon codes, and dynamic delivery fee estimates.

#### `GET /carts`
Retrieves items, quantities, and current subtotal values for the active cart.
* **Auth Requirement:** None (Retrieves via session identifier or user profile)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cart_id": "0190a245-001c-79ab-b19c-129d91ee011a",
    "items": [
      {
        "cart_item_id": "0190a245-0a1b-7ab2-b2ac-11910a229a2c",
        "variant": {
          "id": "0190a23e-11bc-7212-bfcd-c9829e0019aa",
          "title": "Standard (12 Roses)",
          "price": 3500.00,
          "florist_name": "Nairobi Blooms"
        },
        "quantity": 1
      }
    ],
    "cart_subtotal": 3500.00
  }
}
```

#### `POST /carts/items`
Adds a product variant to the cart.
* **Auth Requirement:** None
* **Request Body:**
```json
{
  "variant_id": "0190a23e-11bc-7212-bfcd-c9829e0019aa",
  "quantity": 1
}
```

#### `POST /carts/estimate-delivery`
Dynamically calculates distance-based delivery fees from each florist to the recipient's coordinates.
* **Auth Requirement:** None
* **Request Body:**
```json
{
  "latitude": -1.2643,
  "longitude": 36.8021
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "estimated_total_delivery": 350.00,
    "breakdown": [
      {
        "florist_id": "0190a240-a192-7cb0-891c-1e2f3a4b5c6d",
        "florist_name": "Nairobi Blooms",
        "distance_km": 8.4,
        "delivery_fee": 350.00
      }
    ]
  }
}
```

---

### Group 5.7: Checkout, Ordering & Payments

Coordinates checkout sessions, splits orders across florists, and handles M-Pesa STK prompts.

#### `POST /checkout/create-session`
Initializes a checkout session to lock items and confirm pricing details.
* **Auth Requirement:** Access Token (Customer)
* **Request Body:**
```json
{
  "cart_id": "0190a245-001c-79ab-b19c-129d91ee011a",
  "recipient_name": "Jane Doe",
  "recipient_phone": "+254712345678",
  "delivery_address": "8th Floor, Delta Towers, Westlands",
  "delivery_latitude": -1.2643,
  "delivery_longitude": 36.8021,
  "delivery_date": "2026-07-15",
  "coupon_code": "FLOWERPOWER"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "parent_order_id": "0190a24b-bb92-7ab0-a12c-918d9e001aa3",
    "grand_total": 3850.00,
    "breakdown": {
      "items_subtotal": 3500.00,
      "discount_amount": 0.00,
      "delivery_fees_total": 350.00,
      "tax_total": 560.00
    }
  }
}
```

#### `POST /checkout/pay-mpesa`
Triggers a Safaricom Daraja STK Push prompt to the user's phone.
* **Auth Requirement:** Access Token (Customer)
* **Request Body:**
```json
{
  "parent_order_id": "0190a24b-bb92-7ab0-a12c-918d9e001aa3",
  "mpesa_phone": "+254712345678"
}
```
* **Success Response (202 Accepted):**
```json
{
  "success": true,
  "message": "STK Push prompt initialized. Check your phone to enter your PIN.",
  "data": {
    "merchant_request_id": "9087-123445-1",
    "checkout_request_id": "ws_CO_110720261300"
  }
}
```

#### `GET /checkout/verify/<parent_order_id>`
Checks the checkout session's payment and receipt status.
* **Auth Requirement:** Access Token (Customer)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "parent_order_id": "0190a24b-bb92-7ab0-a12c-918d9e001aa3",
    "payment_status": "paid",
    "mpesa_receipt_number": "SGB981X02A"
  }
}
```

---

### Group 5.8: Order Tracking & Lifecycles

Provides access to sub-orders, logistics schedules, and fulfillment timelines.

#### `GET /orders/<parent_order_id>`
Returns details for a consolidated parent order along with its vendor sub-orders.
* **Auth Requirement:** Access Token (Customer / Admin)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "parent_order_id": "0190a24b-bb92-7ab0-a12c-918d9e001aa3",
    "grand_total": 3850.00,
    "payment_status": "paid",
    "created_at": "2026-07-11T13:00:00Z",
    "sub_orders": [
      {
        "sub_order_id": "0190a24c-11ac-7bc0-a9e9-112dfab98001",
        "florist_name": "Nairobi Blooms",
        "fulfillment_status": "preparing",
        "delivery_date": "2026-07-15",
        "sub_total": 3500.00,
        "delivery_fee": 350.00,
        "items": [
          {
            "product_title": "Red Rose Cascade",
            "variant_title": "Standard (12 Roses)",
            "quantity": 1,
            "unit_price": 3500.00
          }
        ]
      }
    ]
  }
}
```

#### `GET /orders/sub-order/<sub_order_id>/timeline`
Retrieves the real-time fulfillment timeline for a specific sub-order.
* **Auth Requirement:** Access Token (Customer / Florist)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "status": "received",
      "description": "Order received and confirmed by Nairobi Blooms.",
      "created_at": "2026-07-11T13:05:00Z"
    },
    {
      "status": "preparing",
      "description": "Your floral bouquet is being hand-crafted.",
      "created_at": "2026-07-11T14:12:00Z"
    }
  ]
}
```

#### `PATCH /florist/orders/sub-order/<sub_order_id>`
Updates a sub-order's fulfillment status (e.g., preparing, shipped, or delivered).
* **Auth Requirement:** Access Token (Florist)
* **Request Body:**
```json
{
  "fulfillment_status": "ready_for_pickup"
}
```

---

### Group 5.9: Messaging & Conversation APIs

Manages active chats, read status tracking, and file attachment handling.

#### `GET /messaging/conversations`
Lists the active messaging conversations for the authenticated user.
* **Auth Requirement:** Access Token (Customer / Florist)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "conversation_id": "0190a255-a1c1-7ab0-8e1c-1e2f3a4b5c6d",
      "recipient": {
        "id": "0190a240-a192-7cb0-891c-1e2f3a4b5c6d",
        "name": "Nairobi Blooms",
        "avatar_url": "https://storage.florax.co.ke/logos/nairobi_blooms.png"
      },
      "last_message": {
        "body": "Your arrangement is ready for delivery.",
        "created_at": "2026-07-11T14:40:00Z",
        "is_read": false
      }
    }
  ]
}
```

#### `GET /messaging/conversations/<conversation_id>/messages`
Retrieves chat history using Cursor Pagination to handle long message logs cleanly.
* **Auth Requirement:** Access Token (Customer / Florist)
* **Query Parameters:** `starting_after` (UUID), `limit` (default: `50`).
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "0190a256-00bc-7bc0-bfd3-c98d91ea0a44",
      "sender_id": "0190a240-a192-7cb0-891c-1e2f3a4b5c6d",
      "body": "Your arrangement is ready for delivery.",
      "created_at": "2026-07-11T14:40:00Z",
      "attachments": []
    }
  ]
}
```

---

### Group 5.10: CMS, FAQs & Public Content

Provides public access to FAQ boards, blog posts, policies, and system announcements.

#### `GET /cms/faqs`
Lists categorized and ordered FAQs for buyer and seller support.
* **Auth Requirement:** None (Public)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "faq-1",
      "category": "Delivery",
      "question": "Do you offer same-day delivery in Nairobi?",
      "answer": "Yes! Same-day delivery is available for orders placed before 1:00 PM."
    }
  ]
}
```

#### `GET /cms/blogs`
Lists published blog articles with search and category filtering.
* **Auth Requirement:** None (Public)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "blog-1",
      "title": "Choosing the Perfect Roses for Anniversaries",
      "slug": "choosing-perfect-roses-anniversaries",
      "category": "Flower Care",
      "published_at": "2026-07-10T08:00:00Z"
    }
  ]
}
```

---

### Group 5.11: AI Integration APIs

Provides tools for AI recommendations and automated catalog content.

#### `POST /ai/generate-description`
Generates an SEO-optimized product title and description based on raw flower properties.
* **Auth Requirement:** Access Token (Florist)
* **Request Body:**
```json
{
  "flower_type": "Orchid",
  "color_palette": "Deep Purple & Gold",
  "occasion": "Luxury Congratulatory Gift",
  "container": "Matte Black Ceramic Vase"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "generated_title": "Imperial Gold Orchid Cascade",
    "generated_description": "Exquisite deep purple orchids arranged in a matte black ceramic vase...",
    "seo_keywords": ["luxury orchids", "purple flower delivery", "premium corporate gifts"]
  }
}
```

#### `POST /ai/recommend-gift`
Analyzes recipient details, budget constraints, and the selected occasion to suggest the perfect floral arrangements.
* **Auth Requirement:** Access Token (Customer)
* **Request Body:**
```json
{
  "occasion": "Anniversary",
  "recipient_relationship": "Wife",
  "budget_kes": 5000,
  "style_preference": "Elegant & Romantic"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ai_rationale": "For romantic anniversaries under 5,000 KES, we recommend elegant rose bouquets.",
    "recommended_products": [
      {
        "id": "0190a23c-ee88-75c0-bfd1-01127e28af99",
        "title": "Red Rose Cascade",
        "price": 3500.00
      }
    ]
  }
}
```

---

### Group 5.12: System Administration & Audits

Provides secure endpoints for store verification, withdrawal processing, and audit trail reviews.

#### `PATCH /admin/florists/<florist_id>/verify`
Updates a florist's verification and onboarding review status.
* **Auth Requirement:** Access Token (Admin / Super Admin)
* **Request Body:**
```json
{
  "verification_status": "approved",
  "admin_notes": "All registration documents and M-Pesa business numbers verified."
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Florist status updated successfully."
}
```

#### `GET /admin/audits`
Retrieves system-wide administrative activity logs.
* **Auth Requirement:** Access Token (Admin / Super Admin)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "audit-uuid-1",
      "admin_email": "admin@florax.co.ke",
      "action": "approve_florist",
      "target_table": "florist_profiles",
      "created_at": "2026-07-11T15:00:00Z"
    }
  ]
}
```

---

## 6. Webhook Specifications

Webhooks allow external integrations to push notifications back to our API server securely.

### 6.1. Safaricom Daraja Lipa Na M-Pesa Callback
Safaricom calls this endpoint asynchronously when an STK push is completed or cancelled by the user.

* **Method:** `POST`
* **Route:** `/api/v1/checkout/mpesa-callback`
* **Security & Verification:**
  * Endpoint signature tokens and source IP verification.
  * Checks headers for a unique hashed signature matches.
* **Safaricom Callback Payload Example:**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "9087-123445-1",
      "CheckoutRequestID": "ws_CO_110720261300",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 3850.00 },
          { "Name": "MpesaReceiptNumber", "Value": "SGB981X02A" },
          { "Name": "TransactionDate", "Value": 20260711130058 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```
* **API Response Requirements:** The API must acknowledge receipt of the webhook with a `200 OK` status and a clear JSON confirmation within 2 seconds to prevent Safaricom from retrying the callback.
```json
{
  "ResponseCode": "0",
  "ResponseDesc": "Callback processed and database transaction records updated successfully."
}
```

---

## 7. Future-Ready Architecture Extensions

### 7.1. GraphQL Layer Integration (Path to Adoption)
To minimize multiple API requests for data-rich pages (such as the customer dashboard), we recommend implementing a **GraphQL query gateway** over the REST catalog. This can be achieved by:
* Deploying a unified **Apollo Router** or **Graphene-Python** gateway over `/api/v1` routes.
* Mapping database resources directly to custom GraphQL Type resolvers (such as resolving `sub_orders` directly inside parent `orders` queries).

---

## 8. API Security Best Practices

To protect the platform's API boundaries, the system uses strict security controls:

### 8.1. API Rate Limiting
To prevent abuse and brute-force attacks, the API applies IP and token-based rate limits:
* **Public Endpoints:** `100 requests / minute` per IP address.
* **Authentication Routes (`/auth/login`, `/auth/register`):** `5 requests / minute` per IP address.
* **Critical Write Operations (`/checkout/pay-mpesa`):** `10 requests / minute` per authenticated user session.

### 8.2. Input Validation & SQLi Mitigation
* **Marshmallow/Pydantic Serialization:** All incoming payloads are validated against strict JSON schemas before being processed by database queries.
* **Parameter Binding:** Every database query executes through parameterized interfaces (such as SQLAlchemy core query bindings) to completely block SQL injection vectors.

### 8.3. Cross-Site Scripting (XSS) Prevention
* **Markdown Sanitization:** Dynamic content entered by florists or administrators is strictly sanitized on both the client (using React components) and the server to prevent script injection vulnerabilities.
* **Secure Cookie Attributes:** Session refresh cookies are locked down with strict security flags (`HttpOnly; Secure; SameSite=Strict`) to prevent client-side script access.
