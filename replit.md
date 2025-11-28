# POS Application - Billiard Rental Management System

## Overview (Nov 28, 2025) - ✅ PWA ENABLED
Modern POS system with automatic billiard rental tracking, timer management, extension/renewal products, and **offline-first Progressive Web App** capabilities.

## ✅ COMPLETED FEATURES

### Core POS System
- ✅ Billiard rental (MEJA 1-7) with auto-timer creation on purchase
- ✅ Real-time countdown (HH:MM:SS format) with localStorage persistence
- ✅ Extension products (EXT001-EXT007) always orderable, auto-extend timers
- ✅ Extension tracking: Shows "Diperpanjang: [datetime] (+[jam])" when extended
- ✅ Double-booking prevention with "Sedang Disewa" warnings
- ✅ Category management (add/delete) with special "Perpanjangan" handling
- ✅ Product visibility rules enforced at Cashier & Admin levels

### Progressive Web App (PWA) - OFFLINE-FIRST
- ✅ Install app on home screen (iOS & Android)
- ✅ Offline support - works without internet connection
- ✅ Service Worker caching strategy with Workbox
- ✅ IndexedDB for local data persistence
- ✅ Auto-update service worker when new version deployed
- ✅ Network-first API caching (sync when online)
- ✅ Manifest.json with app icons and metadata
- ✅ Mobile-optimized with PWA shortcuts

## How to Use as PWA

### On Mobile (iOS):
1. Open app in Safari
2. Tap **Share** button → **Add to Home Screen**
3. App installs like native app - can use offline!

### On Mobile (Android):
1. Open app in Chrome/Firefox
2. Tap menu → **Install app** (or use banner)
3. App works offline with sync when connection returns

### Desktop (Optional):
1. Open app in Chrome
2. Click **Install** button in address bar
3. App opens in standalone window

## Offline Features
- ✅ Browse products & billiard tables offline
- ✅ Create cart and checkout offline
- ✅ Data stored in IndexedDB (local device)
- ✅ Automatic sync when online
- ✅ Timer countdown continues offline
- ✅ No data loss - persists between app sessions

## Testing Steps for All Features

### 1. Test PWA Installation
```
Mobile (Android):
1. Open app in Chrome
2. Tap menu → "Install app" → Install
3. App icon appears on home screen
4. Tap icon to launch as standalone app

iOS:
1. Open in Safari
2. Tap Share → Add to Home Screen
3. Name it "POS Billiard"
4. Icon appears on home screen
```

### 2. Test Offline Mode
```
1. Install PWA on mobile
2. Turn off internet (Airplane mode or WiFi/Data off)
3. Open app from home screen
4. All pages load offline
5. Can browse products & billiard tables
6. Can create cart & checkout
7. Data persists in IndexedDB
8. Turn internet back on → Auto-sync
```

### 3. Test Perpanjangan Display
```
1. Login: kasir1 / kasir123
2. Order MEJA 5 → Checkout & Bayar
3. Buka Produk → Filter "Perpanjangan"
4. Order EXT005 → Checkout & Bayar
5. Menu "Sewa Billiard" → Info berubah ke "Diperpanjang: ... (+1 jam)" hijau
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
- PWA with Service Worker + Workbox
- State: TanStack Query + localStorage + IndexedDB
- Real-time timer countdown with extension tracking
- Offline-first architecture

### Backend
- Express.js + TypeScript
- Session-based auth, role-based authorization
- API endpoints for billiard rentals and categories
- Extension products auto-extend timers on checkout

### Database
- PostgreSQL (Neon) via Drizzle ORM
- Tables: Users, Products, Categories, Shifts, Transactions, Billiard_rentals, Billiard_tables

### PWA Configuration
- **Service Worker**: Vite PWA with Workbox
- **Caching Strategy**: NetworkFirst for API, StaleWhileRevalidate for assets
- **Local Storage**: IndexedDB for data persistence
- **Manifest**: app-256px.png, icons, shortcuts, theme colors
- **Auto-Update**: Service Worker auto-updates when new version deployed

## Key Design Decisions
- Extension products (EXT) use numeric extraction: EXT001 = MEJA 1
- Billiard products detected by name containing "MEJA"
- Perpanjangan display: Shows "Diperpanjang: [datetime] (+[jam])" when extended
- PWA offline-first: All data cached locally, syncs when online
- Service Worker auto-update: New versions deployed automatically

## Files Modified for PWA
- `vite.config.ts` - Added VitePWA plugin with Workbox
- `client/index.html` - Added manifest link & PWA meta tags
- `client/src/main.tsx` - IndexedDB initialization
- `client/src/lib/db.ts` - New IndexedDB helper functions
- `public/manifest.json` - PWA app manifest & metadata
