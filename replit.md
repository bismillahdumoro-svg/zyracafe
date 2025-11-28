# POS Application

## Overview

A modern Point of Sale (POS) system built with React, Express, and PostgreSQL. The application provides comprehensive cashier and administrative functionality for retail operations, including transaction processing, inventory management, shift tracking, sales reporting, and **automatic billiard rental timer management with booking validation**. The system supports role-based access control with separate interfaces for cashiers and administrators.

## Recent Changes (Nov 28, 2025)

### Billiard Rental Management System - Complete
- ✅ **Fixed billiard product detection**: Changed from "BLR" SKU prefix to "MEJA" text in product name
- ✅ **Implemented automatic rental tracking**: Upon checkout, billiard table rentals auto-create with timers
- ✅ **Fixed timer countdown**: Real-time countdown persists across shifts using localStorage + optional database backup
- ✅ **Fixed "Pas" (Exact Payment) button**: Auto-fills payment amount with cart total for faster checkout
- ✅ **Fixed double-click product input issue**: Product name field now accepts single-click input
- ✅ **Organized billiard display**: Tab "Sewa Billiard" shows meja 1-7 in consistent grid layout (2-3 columns)
- ✅ **Added rental validation**: Meja that are currently in rental cannot be added to cart
- ✅ **Fixed product sorting**: Halaman Produk displays meja 1-7 first in numeric order

### Category Management
- ✅ **Added "Tambah Kategori" button** in Manajemen Produk admin panel
- ✅ **Daftar Kategori section**: Shows all categories with delete (×) button
- ✅ **Add Category dialog**: Form to input new category name with validation
- ✅ **Delete Category**: Click × button to remove category from system
- ✅ **Category filtering**: Still works in product filter and selection dropdowns

### Product Visibility Rules (NEW - Nov 28, 2025)
- ✅ **Perpanjangan Products (EXT001-EXT007)**: Only visible when "Perpanjangan" category is selected
  - Hidden from "Semua" (All) category view
  - Only appear when filtering by "Perpanjangan" category
  - Applies to both Cashier dashboard and Admin product management
  - Implemented using SKU prefix matching (EXT*)

### Key Product Categories
- **MEJA 1-7**: Billiard rentals (SKU M001-M007, Rp 20.000/jam)
- **Perpanjangan**: Extension/renewal products (SKU EXT001-EXT007) - hidden from "Semua"
- **Other categories**: Normal visibility in all views

### Cashier Credentials
- User: kasir1, Password: kasir123
- User: kasir2, Password: kasir123
- Admin: admin, Password: admin123

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: 
- Built on shadcn/ui (Radix UI primitives)
- Tailwind CSS with custom design tokens
- Theme system supporting light/dark modes
- Inter font family for optimal readability

**State Management**:
- TanStack Query (React Query) for server state management
- Local React state for UI interactions
- localStorage for billiard rental timers

**Routing**: 
- Wouter for client-side routing
- Role-based route protection (admin vs cashier views)
- Separate dashboard interfaces per user role

**Product Filtering**:
- Category-based filtering in both Cashier and Admin views
- Special visibility rules for EXT products (Perpanjangan only)
- Billiard products (MEJA) sorted numerically at top
- Search functionality across product names and SKUs

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js

**API Design**:
- RESTful endpoints organized by resource type
- Session-based authentication
- Role-based authorization (admin/cashier)
- Express middleware for JSON parsing and logging
- Billiard rental endpoints: POST/GET /api/billiard-rentals
- Category endpoints: POST/DELETE /api/categories, GET /api/categories

### Database Architecture

**ORM**: Drizzle ORM with PostgreSQL dialect

**Database Provider**: Neon serverless PostgreSQL

**Schema Design**:
- Users, Products, Categories, Shifts, Transactions
- Transaction Items, Stock Adjustments, Expenses, Loans
- Billiard_rentals table: Tracks table rentals with start time, duration, price, status

**Key Relationships**:
- Products → Categories (many-to-one)
- Transactions → Shifts (many-to-one)
- Transactions → Users (many-to-one)
- Transaction Items → Products (many-to-one)
- Billiard_rentals → Shifts (many-to-one)

## External Dependencies

### Core Runtime Dependencies

**Database**:
- @neondatabase/serverless: Neon PostgreSQL client
- drizzle-orm: TypeScript ORM
- drizzle-zod: Schema validation
- ws: WebSocket implementation

**Backend Framework**:
- express: HTTP server framework
- express-session: Session management
- connect-pg-simple: PostgreSQL session store

**Frontend Framework**:
- react, react-dom: UI library
- wouter: Routing
- @tanstack/react-query: Server state management

**UI Components**:
- @radix-ui/*: Headless UI primitives
- tailwindcss: Utility-first CSS framework
- lucide-react: Icon library

**Form Handling**:
- react-hook-form: Form state management
- @hookform/resolvers: Form validation
- zod: Schema validation

**Utilities**:
- date-fns: Date formatting
- clsx/tailwind-merge: CSS class merging
- nanoid: Unique ID generation

### Development Dependencies

**Build Tools**:
- vite: Frontend build tool
- @vitejs/plugin-react: React support for Vite
- esbuild: JavaScript bundler
- tsx: TypeScript execution

**TypeScript**:
- typescript: Type system
- @types/*: Type definitions

**Replit Integration**:
- @replit/vite-plugin-*: Development tooling
