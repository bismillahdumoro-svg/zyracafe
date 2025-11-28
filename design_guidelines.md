# POS Application Design Guidelines

## Design Approach

**Selected System**: Material Design with productivity-focused adaptations
**Rationale**: POS systems require clear visual feedback, efficient workflows, and information-dense layouts. Material Design provides strong component structure and visual hierarchy ideal for data-heavy applications.

**Core Principles**:
- Speed and efficiency in transactions
- Clear role-based interface distinction (Admin vs Cashier)
- Information clarity over visual flair
- Minimal cognitive load during checkout

---

## Typography

**Font Family**: Inter (Google Fonts) for excellent readability at all sizes
- **Headlines**: 2xl-3xl, semibold (Dashboard titles, section headers)
- **Subheadings**: xl, medium (Card titles, table headers)
- **Body Text**: base, regular (Product descriptions, transaction details)
- **Data/Numbers**: lg-xl, medium (Prices, totals, stock quantities)
- **Labels**: sm, medium (Form labels, status badges)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, and 8** consistently
- Component padding: p-4 or p-6
- Section spacing: gap-4 or gap-6 between cards
- Form field spacing: space-y-4
- Button padding: px-6 py-2 or px-8 py-3

**Grid Structure**:
- Admin Dashboard: 3-4 column grid for stats cards (grid-cols-2 lg:grid-cols-4)
- Product catalog: 3-5 column grid (grid-cols-2 md:grid-cols-3 lg:grid-cols-5)
- Cashier interface: 2-column split (products 60% | cart 40%)
- Forms: Single column with max-w-2xl for data entry

---

## Component Library

### Navigation
**Admin Sidebar** (w-64, fixed):
- Dashboard, Products, Stock, Reports, Shifts, Users sections
- Active state with subtle background highlight
- Icons from Heroicons (outline style)

**Cashier Header** (simple, minimal):
- Current shift indicator, logout button
- Session timer display

### Core UI Elements

**Product Cards**:
- Image thumbnail (aspect-square, rounded-lg)
- Product name (font-medium)
- Price (text-lg, prominent)
- Stock indicator badge
- Quick add button (for cashier view)

**Shopping Cart Panel** (Cashier):
- Fixed right panel or bottom sheet on mobile
- Line items with quantity controls (+/-) 
- Subtotal, tax, total (progressively larger text)
- Payment input with numeric keypad
- Large "Complete Transaction" button (w-full, py-4)

**Data Tables**:
- Striped rows for readability (even:bg-gray-50)
- Sticky header
- Action buttons (icon-only) in last column
- Responsive: Card layout on mobile

**Form Inputs**:
- Labels above inputs
- Consistent height (h-10 or h-12)
- Clear focus states with ring-2
- Inline validation messages

**Status Badges**:
- Rounded-full px-3 py-1
- Different variants: In Stock (green), Low Stock (yellow), Out of Stock (red)
- Shift Active/Ended indicators

### Dashboards

**Admin Dashboard**:
- Stats cards in grid (Total Sales, Products, Low Stock, Active Shifts)
- Recent transactions table
- Quick actions panel (Add Product, Start Shift)

**Cashier Dashboard**:
- Large product browser with search
- Prominent shopping cart
- Category filter tabs
- Recently sold items

### Dialogs & Overlays
- Modal for transaction complete (shows receipt preview)
- Sheet/drawer for product details/edit
- Alert dialogs for shift start/end confirmation
- Toast notifications for stock updates

---

## Animations

**Minimal Use Only**:
- Cart item add: Simple slide-in
- Transaction complete: Success checkmark animation
- Page transitions: None (instant)

---

## Images

**Product Images**:
- Square aspect ratio (aspect-square)
- Placeholder for products without images (gray background with icon)
- Use object-cover for consistent sizing

**No Hero Images**: This is a business application, not a marketing site

---

## Key Layout Patterns

**Cashier Interface**: Split-screen design
- Left: Product grid with search and categories
- Right: Fixed cart panel with checkout

**Admin Interface**: Traditional dashboard
- Left sidebar navigation (always visible on desktop)
- Main content area with page-specific layouts
- Header with breadcrumbs and user menu

**Reports**: 
- Date range selector at top
- Summary cards
- Detailed table below
- Export options

**Stock Management**:
- Search and filter bar
- Bulk action toolbar
- Table view with inline edit capability
- Quick stock adjustment controls

---

This design prioritizes operational efficiency, clear information hierarchy, and role-appropriate interfaces for a professional POS environment.