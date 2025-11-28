# POS Application - Billiard Rental Management System

## Overview (Nov 28, 2025)
Modern POS system with automatic billiard rental tracking, timer management, and extension/renewal products that extend active billiard rentals in real-time.

## ✅ Completed Features

### Billiard Rental System
- ✅ Automatic timer creation upon MEJA 1-7 purchase completion
- ✅ Real-time countdown (HH:MM:SS format) with localStorage persistence
- ✅ Tab "Sewa Billiard" displays all active rentals in ordered grid
- ✅ Active rentals show countdown timer, available meja show green badge
- ✅ Meja cannot be double-booked - "Sedang Disewa" warning blocks cart

### Extension/Renewal Products (EXT001-EXT007)
- ✅ **Only visible in "Perpanjangan" category** - hidden from "Semua" view to avoid confusion
- ✅ **Always orderable** - no "sedang disewa" restriction (purpose: extend active rentals)
- ✅ Mapping: EXT001→MEJA 1, EXT002→MEJA 2, ..., EXT007→MEJA 7
- ✅ **Auto-extend on checkout**: Upon successful payment, adds hours to matching billiard timer
- ✅ **Extension tracking**: Menu "Sewa Billiard" shows "Diperpanjang: [datetime] (+[jam] jam)" instead of start time for extended rentals
- ✅ Updates remainingSeconds + hoursRented in real-time

### Category Management
- ✅ Add/Delete categories from admin panel with API integration
- ✅ Filter products by category with special "Perpanjangan" category handling
- ✅ Product visibility rules enforced at both Cashier & Admin levels

## Testing Steps for All Features

### 1. Test Perpanjangan Display
```
1. Login: kasir1 / kasir123
2. Go to "Manajemen Billiard" (Admin/Billiard tab)
3. Verify "Sewa Billiard Aktif" table shows:
   - Initial rental: Mulai: 29 Nov 2025, 02:10 (start time)
   - After extension: Diperpanjang: 29 Nov 2025, 02:15 (+1 jam) (green text, extension info)
```

### 2. Test Extension Products (EXT)
```
1. Login: kasir1 / kasir123
2. Buka halaman Produk → Pilih kategori "Perpanjangan"
3. Verify: Hanya EXT001-EXT007 tampil (no MEJA 1-7)
4. Click "Tambah" EXT005 → Bisa ditambah ke cart (walau MEJA 5 sedang disewa)
5. Bayar → MEJA 5 timer otomatis +1 jam extend
6. Back to Billiard menu → Lihat info "Diperpanjang" muncul di column
```

### 3. Test Billiard Rental Flow
```
1. Add EXT products (EXT001-EXT007) dengan stock > 0
2. Login kasir, add MEJA 1 to cart
3. Checkout & bayar
4. Sisa Waktu countdown dimulai
5. Order EXT001 (perpanjangan MEJA 1)
6. Checkout & bayar
7. Sisa Waktu MEJA 1 naik +1 jam
```

## Product Categories
- **Semua**: All products except EXT (Perpanjangan) - mixed products
- **Makanan, Minuman, Snack, Rokok, Lainnya**: Regular products 
- **Perpanjangan**: **ONLY** EXT001-EXT007 extension products

## Credentials
- Kasir: kasir1 / kasir123 or kasir2 / kasir123
- Admin: admin / admin123

## System Architecture

### Frontend
- React + TypeScript + Vite
- State: TanStack Query + localStorage (billiard timers)
- Special product visibility rules per category
- Real-time timer countdown with extension tracking

### Backend
- Express.js + TypeScript
- Session-based auth, role-based authorization
- API endpoints for billiard rentals and categories
- Extension products auto-extend timers on checkout

### Database
- PostgreSQL (Neon) via Drizzle ORM
- Tables: Users, Products, Categories, Shifts, Transactions, Billiard_rentals, Billiard_tables

## Key Design Decisions
- Extension products (EXT) use numeric extraction: EXT001 = MEJA 1, etc.
- Billiard products detected by name containing "MEJA"
- Perpanjangan display: Shows "Diperpanjang: [datetime] (+[jam])" when extension happens
- Extension count tracked per rental for transparency
