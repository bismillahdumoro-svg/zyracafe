# POS Application - Billiard Rental Management System

## Overview
Modern POS system with automatic billiard rental tracking, timer management, and extension/renewal products that extend active billiard rentals in real-time.

## Key Features (Nov 28, 2025)

### Billiard Rental System
- ✅ Automatic timer creation upon MEJA 1-7 purchase
- ✅ Real-time countdown (HH:MM:SS format) with localStorage persistence
- ✅ Tab "Sewa Billiard" displays all meja 1-7 in ordered grid
- ✅ Active rentals show countdown, available meja show green badge
- ✅ Meja cannot be double-booked (blocked from cart when active rental exists)

### Extension/Renewal Products (EXT001-EXT007)
- ✅ **Only visible in "Perpanjangan" category** - hidden from "Semua" view
- ✅ **Always orderable** - no "sedang disewa" restriction (purpose: extend active rentals)
- ✅ Mapping: EXT001→MEJA 1, EXT002→MEJA 2, ..., EXT007→MEJA 7
- ✅ **Auto-extend on checkout**: Upon successful payment, adds hours to matching billiard timer
- ✅ Updates remainingSeconds + hoursRented in real-time

### Category Management
- ✅ Tambah/Hapus kategori dari admin panel
- ✅ Filter products by category (with special Perpanjangan handling)
- ✅ Product visibility rules enforced at both Cashier & Admin levels

## Testing Extension Feature
```
1. Login: kasir1 / kasir123
2. Buka halaman Produk → Pilih kategori "Perpanjangan"
3. Hanya EXT001-EXT007 tampil (no MEJA products)
4. Click "Tambah" pada EXT005 (untuk extend MEJA 5)
5. Bayar → Timer MEJA 5 otomatis +1 jam
```

## Product Categories
- **Semua**: All products except EXT (Perpanjangan)
- **Makanan, Minuman, Snack, Rokok, Lainnya**: Regular products
- **Perpanjangan**: ONLY EXT001-EXT007 extension products

## Credentials
- Kasir: kasir1 / kasir123 or kasir2 / kasir123
- Admin: admin / admin123

## System Architecture

### Frontend
- React + TypeScript + Vite
- State: TanStack Query + localStorage (billiard timers)
- Special product visibility rules per category
- Real-time timer countdown with extension support

### Backend
- Express.js + TypeScript
- Session-based auth, role-based authorization
- API endpoints for billiard rentals and categories

### Database
- PostgreSQL (Neon) via Drizzle ORM
- Tables: Users, Products, Categories, Shifts, Transactions, Billiard_rentals, etc.
