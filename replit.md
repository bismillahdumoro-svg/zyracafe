# POS Application

## Overview

A modern Point of Sale (POS) system built with React, Express, and PostgreSQL. The application provides comprehensive cashier and administrative functionality for retail operations, including transaction processing, inventory management, shift tracking, sales reporting, automatic billiard rental timer management with booking validation, and extension/renewal products that extend active billiard rentals.

## Recent Changes (Nov 28, 2025)

### Billiard Rental Extension System (NEW - Nov 28, 2025)
- ✅ **Extension Products (EXT001-EXT007)**: Special products for extending active billiard rentals
  - Located only in "Perpanjangan" category
  - Always orderable (no "sedang disewa" restriction)
  - EXT001 extends MEJA 1, EXT002 extends MEJA 2, etc.
  - Upon successful checkout, automatically adds hours to matching billiard rental timer
  - Updates remainingSeconds in real-time

### Billiard Rental Management System - Complete
- ✅ **Fixed billiard product detection**: Changed from "BLR" SKU prefix to "MEJA" text in product name
- ✅ **Implemented automatic rental tracking**: Upon checkout, billiard table rentals auto-create with timers
- ✅ **Fixed timer countdown**: Real-time countdown persists across shifts using localStorage
- ✅ **Fixed "Pas" (Exact Payment) button**: Auto-fills payment amount with cart total
- ✅ **Organized billiard display**: Tab "Sewa Billiard" shows meja 1-7 in consistent grid layout
- ✅ **Added rental validation**: Meja in rental cannot be added (except EXT products for extension)
- ✅ **Fixed product sorting**: Halaman Produk displays meja 1-7 first

### Category Management
- ✅ **Added "Tambah Kategori" button** in Manajemen Produk admin panel
- ✅ **Daftar Kategori section**: Shows all categories with delete button
- ✅ **Category filtering**: Works in both Cashier and Admin views

### Product Visibility Rules
- ✅ **Perpanjangan Products (EXT001-EXT007)**: Only visible when "Perpanjangan" category is selected
- ✅ **Always Orderable**: EXT products can be ordered even when corresponding meja is "sedang disewa"
- ✅ **Auto-Extension**: Upon checkout with EXT product, timer automatically extends by 1 hour per unit

### Feature Workflow Example:
1. Kasir sewa MEJA 1 (3 jam) → timer starts countdown
2. Kasir order EXT001 (Perpanjangan MEJA 1) + 1 jam → bayar
3. Upon successful checkout → MEJA 1 timer automatically adds 1 hour (3 hours + 1 hour = 4 hours remaining)

### Cashier Credentials
- User: kasir1, Password: kasir123
- User: kasir2, Password: kasir123
- Admin: admin, Password: admin123

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**State Management**:
- TanStack Query (React Query) for server state management
- Local React state for UI interactions
- localStorage for billiard rental timers (with extension support)

**Product Filtering**:
- Category-based filtering with special visibility rules
- EXT products (Perpanjangan) hidden from "Semua" view
- Billiard products (MEJA) sorted numerically at top
- Search functionality across product names and SKUs

**Billiard Extension Logic**:
- EXT001-7 detect corresponding MEJA number (EXT001 → MEJA 1)
- On checkout with EXT product, find matching active rental
- Add hours to remainingSeconds (1 hour = 3600 seconds)
- Update hoursRented field to reflect total duration
- Persist changes to localStorage

### Backend Architecture

**API Design**:
- RESTful endpoints organized by resource type
- Session-based authentication
- Role-based authorization (admin/cashier)
- Billiard rental endpoints: POST/GET /api/billiard-rentals
- Category endpoints: POST/DELETE /api/categories

### Database Architecture

**Schema Design**:
- Users, Products, Categories, Shifts, Transactions
- Transaction Items, Stock Adjustments, Expenses, Loans
- Billiard_rentals: Tracks table rentals with start time, duration, price, status

## External Dependencies

### Core Runtime Dependencies

**Database**:
- @neondatabase/serverless: Neon PostgreSQL client
- drizzle-orm: TypeScript ORM
- drizzle-zod: Schema validation

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

**Utilities**:
- date-fns: Date formatting
- zod: Schema validation
