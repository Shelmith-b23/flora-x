# Flora_X: Enterprise UI/UX Specification & Design System
**Version:** 1.0.0  
**Author:** Creative Director & Principal UI/UX Architect  
**Associated Documents:** `ARCHITECTURE.md` (System), `DATABASE_DESIGN.md` (Database), `API_SPECIFICATION.md` (API)  

---

## 1. Brand Guidelines & Philosophy

Flora_X is Kenya’s premium multi-vendor floral and gift marketplace. It bridges the organic, tactile elegance of local floriculture with state-of-the-art digital transactional simplicity. The visual language is inspired by premium editorial design: clean layout structures, generous negative space, sophisticated typography, and high-fidelity lifestyle photography.

```
       [ REFINED EDITORIAL AESTHETIC ]
                      │
     ┌────────────────┴────────────────┐
     ▼                                 ▼
[ ORGANIC & WARM ]              [ PRECISE & EFFORTLESS ]
- Earthy Sage & Muted Rose      - JetBrains Mono details
- Soft, off-white canvases      - Seamless Google Maps cards
- Smooth, micro-animations      - Clean, fast STK Push checkout
```

### 1.1. Core Brand Attributes & Emotional Impact
* **Aesthetic Editorial Elegance:** The user interface feels like a high-end coffee-table magazine. Generous margins, clean borders, and clear typographic hierarchy let the vibrant colors of Kenya's flowers take center stage.
* **Warmth & Emotional Resonance:** Gifting flowers is an emotional event. The interface supports this with soft surface colors, smooth transitions, and dedicated sections for personalized card messages and AI-powered recommendations.
* **Technical Precision & Trust:** To ensure customers feel confident shopping from multiple florists at once, we use clear layouts, transparent delivery fee breakdowns, interactive Google Maps elements, and JetBrains Mono fonts for order details and prices.

---

## 2. Design System Tokens

Design tokens are the visual foundations of our marketplace. They translate our brand attributes directly into structured variables that keep the React frontend and mobile apps consistent.

### 2.1. Color Tokens (Flora_X "Keepsake Garden" Palette)

We use a high-contrast Light Theme as our primary design system. Dark Mode styles are balanced with deep charcoals to maintain readability and elegance.

#### Light Mode Palette
```
+-------------------------------------------------------------+
|  CANVAS (Off-White)       #FAF9F6                           |
+-------------------------------------------------------------+
|  SURFACE (Pure White)     #FFFFFF                           |
+-------------------------------------------------------------+
|  TEXT PRIMARY (Charcoal)  #1A202C                           |
+-------------------------------------------------------------+
|  PRIMARY ACCENT (Sage)    #2D5A27                           |
+-------------------------------------------------------------+
|  SECONDARY (Muted Rose)   #C88A8A                           |
+-------------------------------------------------------------+
```

```json
{
  "color": {
    "light": {
      "background": {
        "canvas": "#FAF9F6",
        "surface": "#FFFFFF",
        "surface_muted": "#F3F4F6"
      },
      "text": {
        "primary": "#1A202C",
        "secondary": "#4A5568",
        "muted": "#718096"
      },
      "brand": {
        "primary": "#2D5A27",
        "primary_hover": "#1E3D1A",
        "secondary": "#C88A8A",
        "secondary_hover": "#B07373",
        "accent": "#E6D5C3"
      },
      "utility": {
        "success": "#1B4D3E",
        "warning": "#C07B2D",
        "danger": "#9B2C2C",
        "info": "#2B6CB0",
        "border": "#E2E8F0"
      }
    },
    "dark": {
      "background": {
        "canvas": "#121418",
        "surface": "#1A1D24",
        "surface_muted": "#242933"
      },
      "text": {
        "primary": "#F7FAFC",
        "secondary": "#E2E8F0",
        "muted": "#A0AEC0"
      },
      "brand": {
        "primary": "#489C3F",
        "primary_hover": "#5CBA52",
        "secondary": "#E29E9E",
        "secondary_hover": "#F0B5B5",
        "accent": "#4A3E3D"
      },
      "utility": {
        "success": "#2D8A6B",
        "warning": "#DD9A46",
        "danger": "#E53E3E",
        "info": "#4299E1",
        "border": "#2D3748"
      }
    }
  }
}
```

### 2.2. Typography Tokens
We use **Space Grotesk** for display headers to give the brand a modern edge, **Inter** for legible body text, and **JetBrains Mono** for pricing, dates, and status codes.

```json
{
  "font_family": {
    "display": "\"Space Grotesk\", sans-serif",
    "body": "\"Inter\", sans-serif",
    "mono": "\"JetBrains Mono\", monospace"
  },
  "font_size": {
    "xs": "0.75rem (12px)",
    "sm": "0.875rem (14px)",
    "base": "1rem (16px)",
    "lg": "1.125rem (18px)",
    "xl": "1.25rem (20px)",
    "xxl": "1.5rem (24px)",
    "display_lg": "3.5rem (56px)",
    "display_xl": "4.5rem (72px)"
  },
  "font_weight": {
    "regular": "400",
    "medium": "500",
    "semibold": "600",
    "bold": "700"
  },
  "line_height": {
    "none": "1",
    "tight": "1.2",
    "snug": "1.375",
    "normal": "1.5",
    "relaxed": "1.625"
  }
}
```

### 2.3. Spacing System (8-Point Grid)
Layout elements align to a strict 8-point vertical grid.
* **`spacing-4`** (4px): Small padding inside inputs or badges.
* **`spacing-8`** (8px): Distance between labels and inputs.
* **`spacing-12`** (12px): Padding inside cards.
* **`spacing-16`** (16px): Padding inside buttons, elements, and standard cards.
* **`spacing-24`** (24px): Standard page margins and layout column gaps.
* **`spacing-32`** (32px): Padding inside sections.
* **`spacing-48`** (48px): Large distance between sections.
* **`spacing-64`** (64px): Padding for hero sections.
* **`spacing-96`** (96px): Desktop banner margins.

### 2.4. Border Radius & Elevation Tokens
* **`radius-none`** (0px): Sharp buttons and layouts.
* **`radius-sm`** (4px): Checkboxes, small badges, and tags.
* **`radius-md`** (8px): Input fields and small buttons.
* **`radius-lg`** (12px): Standard product cards and storefront boxes.
* **`radius-xl`** (24px): Large banners, modals, and checkout cards.
* **`radius-full`** (999px): Avatar capsules and pills.
* **Elevation Shadows:** We avoid heavy shadows to keep a clean, editorial aesthetic.
  * **`shadow-none`:** Styled with a clean 1px border.
  * **`shadow-subtle`:** `0 2px 8px rgba(0, 0, 0, 0.04)`.
  * **`shadow-modal`:** `0 12px 32px rgba(0, 0, 0, 0.08)`.

---

## 3. Responsive Layout Strategy

The platform scales smoothly across different screen sizes, with a mobile-first approach to navigation and checkout flows.

```
       [ MOBILE ]                 [ TABLET ]                [ DESKTOP ]
   +----------------+         +----------------+         +----------------+
   |   Header/Cart  |         |  Header / Cart |         | Header/Nav/Cart|
   |  [Single Col]  |         |  [Double Col]  |         | [Triple Grid]  |
   | - Bottom Draw  |         | - Grid Layout  |         | - Sidebars     |
   | - 44px Buttons |         | - Sidebars     |         | - Big Banners  |
   +----------------+         +----------------+         +----------------+
```

### 3.1. Grid Configurations
* **Mobile (up to 639px):** Single column. Margin: `16px`. Base touch target: `44px`.
* **Tablet (640px - 1023px):** Two columns. Margin: `24px`. Column gap: `16px`.
* **Desktop (1024px - 1439px):** Three or four columns. Margin: `48px`. Container max-width: `1280px`.
* **Ultra-wide (1440px+):** Centered layout with a maximum container width of `1440px` to keep content from stretching.

---

## 4. Reusable UI Components

---

### Component 4.1: Inputs & Selection Controls

```
+--------------------------------------------+
|  Label Name                                |
|  +--------------------------------------+  |
|  |  Placeholder Text                    |  |
|  +--------------------------------------+  |
|  * Assistive info helper text               |
+--------------------------------------------+
```

#### 1. Input Fields & Textareas
* **Resting State:** `#FFFFFF` background, solid 1px border `#E2E8F0`, Inter Regular text.
* **Focus State:** 1px border colored with our brand primary `#2D5A27` and a soft outline shadow.
* **Error State:** Border changed to `#9B2C2C` with helpful error messages displayed below the input.

#### 2. Premium Checkout Date & Delivery Slot Picker
* **Visual Presentation:** A weekly calendar view of available delivery dates, highlighting same-day options.
* **Interactive Behavior:** Clicking a date reveals available delivery slots (e.g., Morning or Afternoon) as selectable radio cards.

---

### Component 4.2: Visual Layout Cards

```
+--------------------------------------+
|  +--------------------------------+  |
|  |                                |  |
|  |       [ Product Image ]        |  |
|  |                                |  |
|  +--------------------------------+  |
|  Flower Title             KES 3,500  |
|  * Nairobi Blooms          [★ 4.9]   |
+--------------------------------------+
```

#### 1. Product Cards
* **Layout:** A clean, borderless container with a `#FFFFFF` background and a soft drop shadow on hover.
* **Content:** Lifestyle image, product title, florist name, rating badge, price (in JetBrains Mono), and a quick-add button.

#### 2. Verified Florist Directory Cards
* **Layout:** A horizontal card that highlights the florist's store name, rating metrics, active delivery range, and a map icon.
* **Content:** Store logo, store banner, available delivery radius, and tags for featured flowers.

---

### Component 4.3: Financial Controls

```
+--------------------------------------+
|  Florist Available Balance           |
|  KES 42,000.00                       |
|  [ Request Payout Button ]           |
+--------------------------------------+
```

#### 1. Wallet Earnings Card
* **Layout:** A structured, high-contrast container showing the florist's available, pending, and total withdrawn balances.
* **Fulfillment States:** Shows visual warning icons if withdrawals are currently locked or pending administrative review.

#### 2. Multi-Vendor Subtotal Summary Cards
* **Layout:** Displayed in the checkout sidebar to show customers a clear breakdown of items and delivery fees from each florist.

---

## 5. Public Marketing Website Pages

A highly polished shopping experience that highlights local florists and beautiful flower arrangements.

---

### Page 5.1: The Curated Homepage

```
+-----------------------------------------------------------+
| [Brand Logo]      Catalog   Florists   Occasions     [Cart] |
+-----------------------------------------------------------+
|                                                           |
|             IMPERIAL FLORALS FOR KENYA                    |
|             Beautiful arrangements, hand-crafted.         |
|             [ Browse Curations Button ]                   |
|                                                           |
+-----------------------------------------------------------+
|  Vibrant Categories  |  Featured Florists  |  Best Sellers |
+-----------------------------------------------------------+
```

#### 1. Global Navigation Header
* **Layout:** Fixed header with a clean `#FAF9F6` background. Includes links to key categories, a location-based search bar, and the shopping cart icon.
* **Frictionless Search:** Users can input their delivery location to immediately filter and show available local florists.

#### 2. Editorial Hero Section
* **Layout:** A spacious layout pairing bold, modern headlines with elegant lifestyle photography of Kenya's fields and flower designs.
* **Call to Action (CTA):** A primary button `#2D5A27` that guides users directly to seasonal flower collections.

#### 3. Featured Florists Carousel
* **Layout:** Highlights local, verified florists on a map view, complete with their ratings, delivery ranges, and unique flower collections.

---

### Page 5.2: Product Details (PDP)

```
+-----------------------------------------------------------+
|  [ Image 1 ]  |  Red Rose Cascade              KES 3,500  |
|  [ Image 2 ]  |  By Nairobi Blooms             [★ 4.9]    |
|  [ Image 3 ]  |  ---------------------------------------- |
|               |  Size Variant Options:                    |
|               |  ( ) Standard   ( ) Deluxe   ( ) Grandee  |
|               |  ---------------------------------------- |
|               |  [ Add to Cart Button ]                   |
+-----------------------------------------------------------+
```

#### 1. Split Image Grid (Left)
* **Layout:** A large primary product image on the left, paired with a small vertical tray of secondary detail photos (e.g., foliage, packaging details).

#### 2. Purchasing Control Board (Right)
* **Layout:** Highlights the product title, rating overview, florist details, size selection, and the primary Add to Cart button.
* **Variant Selector:** Interactive radio options showing pricing differences for Standard, Deluxe, and Grandee bouquets clearly in JetBrains Mono.

---

## 6. Portals & Dashboards

---

### Portal 6.1: Customer Portal

```
+-----------------------------------------------------------+
|  [Sidebar]  |  Welcome, Clara                             |
|  Dashboard  |  Active Orders:                             |
|  Orders     |  Order #1024 - Preparing...                 |
|  Wishlist   |  ------------------------------------------ |
|  Addresses  |  Reward Balance: 150 Points                 |
+-----------------------------------------------------------+
```

#### 1. Dashboard Overview
* **Layout:** A clean, split layout featuring a left navigation rail and a main dashboard content area on the right.
* **Content:** Quick links to active orders, reward point balances, saved addresses, and tailored gift suggestions.

#### 2. Address Book
* **Layout:** A grid showing saved delivery addresses with labels (e.g., "Home", "Office") and coordinates, managed via an autocomplete input field.

---

### Portal 6.2: Verified Florist Portal

```
+-----------------------------------------------------------+
|  [Sidebar]  |  Store Dashboard: Nairobi Blooms            |
|  Products   |  Active Orders: 8 Pending                   |
|  Orders     |  ------------------------------------------ |
|  Inventory  |  Earnings: KES 42,000.00 [Withdraw]        |
+-----------------------------------------------------------+
```

#### 1. Dashboard Overview
* **Layout:** Displays critical business metrics (such as active orders, current earnings, low-stock alerts, and store ratings) in a clean dashboard view.

#### 2. Order Fulfillment center
* **Layout:** An order management queue showing sub-orders, requested delivery dates, customer details, and a button to update fulfillment states.

---

### Portal 6.3: Administration Dashboard

```
+-----------------------------------------------------------+
|  [Sidebar]  |  System Overview: 1,240 Users               |
|  Approvals  |  Pending Florists: 3 Applications           |
|  Financials |  ------------------------------------------ |
|  CMS        |  Platform Net Revenue: KES 420,000.00       |
+-----------------------------------------------------------+
```

#### 1. Marketplace Approvals Portal
* **Layout:** Displays pending florist applications with uploaded documents, till details, and approval controls.

#### 2. Financial Management Board
* **Layout:** Track system-wide sales, platform commission earnings, and manage pending florist withdrawal requests.

---

## 7. Motion & Interaction Design

Micro-animations are designed to guide user attention and make the marketplace feel responsive and elegant.

```
       [ HOVER STATE ]              [ SUCCESS TRANSITION ]
  +-----------------------+        +-----------------------+
  |  Product Card Elevate |        |   Cart Badge Bounce   |
  |  - scale: 1.01        |        |   - scale: [1, 1.3, 1]|
  |  - duration: 0.2s     |        |   - duration: 0.3s    |
  +-----------------------+        +-----------------------+
```

### 7.1. Global Animation Guidelines
* **Duration & Easing:**
  * Fast micro-interactions (e.g., hover states, button clicks): `0.2s` using `ease-out`.
  * Page-level transitions and modal slide-ins: `0.35s` using `cubic-bezier(0.16, 1, 0.3, 1)` for smooth movement.

### 7.2. Core Animation Behaviors
* **Hover State:** Standard product cards elevate slightly (`scale: 1.01`) and increase drop shadow opacity on hover.
* **Add to Cart Interaction:** Adding an item to the cart triggers a subtle scale animation (`scale: [1, 1.2, 1]`) on the cart header badge.
* **Order Status Timeline:** Fulfillment status cards use staggered fade-ins to present updates clearly.

---

## 8. Accessibility (WCAG AA Guidelines)

Flora_X is designed to be accessible, matching WCAG 2.1 AA requirements to ensure everyone can navigate the marketplace easily.

### 8.1. Color Contrast Requirements
* **Text Contrast:** Body text maintains a contrast ratio of at least `4.5:1` against standard background surfaces.
* **Interactive Elements:** Buttons, focus outlines, and input borders maintain a minimum contrast ratio of `3:1` against backgrounds.

### 8.2. Assistive Technology Integration
* **Semantic Elements:** Forms, inputs, and custom visual cards use clear labels and ARIA attributes (e.g., `aria-invalid`, `aria-expanded`).
* **Keyboard Navigation:** Every interactive element can be reached using the keyboard, with a visible, high-contrast focus outline around selected items.

---

## 9. Future Mobile Considerations

As we transition the web application into a native mobile experience, the design system is structured to scale smoothly to iOS and Android:

* **Reusable Design Tokens:** Typography, spacing, and colors are defined in neutral formats (such as JSON) to easily translate to React Native or Tailwind configurations.
* **Touch Targets:** Interactive targets maintain a minimum size of `44x44px` on mobile screens to prevent misclicks.
* **Native Inputs:** Custom web date and location pickers map directly to native mobile UI components for a familiar user experience.
