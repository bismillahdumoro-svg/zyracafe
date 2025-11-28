# POS Application

## Overview

A modern Point of Sale (POS) system built with React, Express, and PostgreSQL. The application provides comprehensive cashier and administrative functionality for retail operations, including transaction processing, inventory management, shift tracking, sales reporting, and **automatic billiard rental timer management**. The system supports role-based access control with separate interfaces for cashiers and administrators, with features for product management, stock adjustments, shift management, and detailed sales analytics.

## Recent Changes (Nov 28, 2025)

### Billiard Rental Management System
- ✅ **Fixed billiard product detection**: Changed from "BLR" SKU prefix to "MEJA" text in product name (actual SKUs are M001-M007)
- ✅ **Implemented automatic rental tracking**: Upon checkout, billiard table rentals auto-create with timers
- ✅ **Fixed timer countdown**: Real-time countdown persists across shifts using localStorage + optional database backup
- ✅ **Fixed "Pas" (Exact Payment) button**: Auto-fills payment amount with cart total for faster checkout
- ✅ **Fixed double-click product input issue**: Product name field now accepts single-click input
- ✅ **Organized billiard display**: Tab "Sewa Billiard" shows meja 1-7 in consistent grid layout (2-3 columns)
  - Grid always displays meja 1-7 in order (1,2,3 | 4,5,6 | 7)
  - Available meja show green badge, active rentals show blue with countdown timer
  - Countdown displays HH:MM:SS format
  - Close button removes rental from active list
- ✅ **Fixed product sorting**: Halaman Produk now displays meja 1-7 first in numeric order, followed by other products

### Key Billiard Product Naming
- Products named "MEJA 1", "MEJA 2", ..., "MEJA 7" are auto-detected as billiard rentals
- SKUs: M001, M002, M003, M004, M005, M006, M007
- Price: Rp 20.000 per jam
- Upon purchase, rental records created with start time and countdown timer

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
- Built on shadcn/ui (Radix UI primitives) following Material Design principles adapted for productivity
- Uses Tailwind CSS with custom design tokens for consistent spacing (2, 4, 6, 8 units)
- Theme system supporting light/dark modes via context provider
- Inter font family for optimal readability across all sizes

**State Management**:
- TanStack Query (React Query) for server state management and caching
- Local React state for UI interactions and form handling
- Custom query client with credential-based API requests
- localStorage for billiard rental timers (persists across browser/shift changes)

**Routing**: 
- Wouter for client-side routing
- Role-based route protection (admin vs cashier views)
- Separate dashboard interfaces per user role

**Layout Pattern**:
- Admin: Sidebar navigation with 3-4 column grid layouts for data density
- Cashier: Two-column split interface (products 60% | cart 40%) optimized for transaction speed
- Responsive grid systems using Tailwind's responsive prefixes
- Billiard tab: 2-3 column grid for consistent meja 1-7 ordering

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js

**API Design**:
- RESTful endpoints organized by resource type
- Session-based authentication without external auth providers
- Simple role-based authorization (admin/cashier) via middleware
- Express middleware for JSON parsing and request logging
- Billiard rental endpoints: POST /api/billiard-rentals, GET /api/billiard-rentals

**Development Tools**:
- Vite integration for HMR and dev server
- Custom logging middleware for request/response tracking
- Runtime error overlay in development (Replit plugins)

### Database Architecture

**ORM**: Drizzle ORM with PostgreSQL dialect

**Database Provider**: Neon serverless PostgreSQL with WebSocket support

**Schema Design**:
- Users table with role enum (admin, cashier)
- Products with category relationships and stock tracking
- Shifts for cashier session management (active/closed status)
- Transactions with line items for detailed sales tracking
- Stock adjustments for inventory change logging
- Expenses and loans for financial tracking per shift
- **Billiard_rentals table**: Tracks table rentals with start time, duration, price, and status

**Key Relationships**:
- Products → Categories (many-to-one)
- Transactions → Shifts (many-to-one)
- Transactions → Users (cashier, many-to-one)
- Transaction Items → Products (many-to-one)
- Stock Adjustments → Products (many-to-one)
- Billiard_rentals → Shifts (many-to-one)

**Data Patterns**:
- UUID primary keys generated via PostgreSQL
- Timestamp tracking for shifts and transactions
- Enums for status fields (shift status, payment method, user role)
- Integer storage for currency (avoiding floating point)

### Authentication & Authorization

**Authentication**: Username/password with session tracking

**Authorization Model**:
- Two roles: admin and cashier
- Route-level protection based on user role
- Session state stored in request object
- No external identity providers

### Build & Deployment

**Build Process**:
- Custom build script using esbuild for server bundling
- Vite for optimized client production builds
- Selective dependency bundling to reduce syscalls (allowlist pattern)
- Separate client and server build outputs

**Production Configuration**:
- Static file serving from compiled dist directory
- SPA fallback routing for client-side routes
- Environment-based configuration (NODE_ENV)

## External Dependencies

### Core Runtime Dependencies

**Database**:
- @neondatabase/serverless: Neon PostgreSQL client with WebSocket support
- drizzle-orm: TypeScript ORM for type-safe database queries
- drizzle-zod: Schema validation integration
- ws: WebSocket implementation for Neon connection

**Backend Framework**:
- express: HTTP server framework
- express-session: Session management middleware
- connect-pg-simple: PostgreSQL session store

**Frontend Framework**:
- react: UI library
- react-dom: DOM rendering
- wouter: Lightweight routing
- @tanstack/react-query: Server state management

**UI Components**:
- @radix-ui/*: Headless UI primitives (20+ components)
- tailwindcss: Utility-first CSS framework
- class-variance-authority: Component variant management
- lucide-react: Icon library

**Form Handling**:
- react-hook-form: Form state management
- @hookform/resolvers: Form validation
- zod: Schema validation

**Utilities**:
- date-fns: Date formatting and manipulation
- clsx/tailwind-merge: CSS class merging
- nanoid: Unique ID generation

### Development Dependencies

**Build Tools**:
- vite: Frontend build tool and dev server
- @vitejs/plugin-react: React support for Vite
- esbuild: JavaScript bundler for server code
- tsx: TypeScript execution for scripts

**TypeScript**:
- typescript: Type system
- @types/*: Type definitions for dependencies

**Replit Integration**:
- @replit/vite-plugin-*: Development tooling plugins

### Third-Party Services

**Database Hosting**: Neon Serverless PostgreSQL (required DATABASE_URL environment variable)

**Font Delivery**: Google Fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
