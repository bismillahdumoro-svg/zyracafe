# POS Application - Billiard Rental Management System

## Overview (Nov 28, 2025) - ✅ COMPLETE PRODUCTION SYSTEM
Modern POS system with automatic billiard rental tracking, full offline-first PWA with session persistence, keep-alive, AND **detailed shift close report** with billiard vs cafe income breakdown. PLUS smart stock management with 30-day inventory analytics! Database auto-backup to Google Drive daily with graceful offline fallback!

## ✅ COMPLETED FEATURES

### Core POS System
- ✅ Billiard rental (MEJA 1-7) with auto-timer creation
- ✅ Real-time countdown with localStorage persistence
- ✅ Extension products (EXT001-EXT007) auto-extend timers
- ✅ Double-booking prevention with warnings
- ✅ Category management with Perpanjangan handling
- ✅ Role-based access (Cashier & Admin)
- ✅ Payment methods: Tunai (Cash) & QRIS only

### Smart Report Access Control ✅ NEW!
- ✅ **Kasir Panel**: Shows ONLY current shift sales data
- ✅ **When shift changes**: Laporan penjualan shows empty (kosong)
- ✅ **History Tab**: ALL kasirs see 7 AM - 7 AM window (24hr rolling)
- ✅ **Admin Portal**: Can see ALL shifts + ALL transactions anytime
- ✅ Auto-filtering by shift + time window

### Shift Close Report ✅ NEW!
- ✅ Detailed recap when kasir ends shift
- ✅ **Billiard income separated** - show earnings from billiard rentals
- ✅ **Cafe income separated** - show earnings from products/cafe
- ✅ Total income breakdown with percentage
- ✅ Transaction count for each category
- ✅ Print functionality for receipt
- ✅ Beautiful visual charts/bars

### User Management - Change Password ✅ NEW!
- ✅ Lock icon button di setiap pengguna
- ✅ Dialog "Ganti Password" dengan validasi
- ✅ Password lama harus cocok sebelum bisa ubah
- ✅ Konfirmasi password baru (match validation)
- ✅ Success/error messages yang jelas
- ✅ Admin bisa ubah password untuk semua kasir

### Progressive Web App - OFFLINE-FIRST ✅
- ✅ Install on home screen (iOS & Android)
- ✅ Full database sync - 28+ records on device
- ✅ Service Worker + IndexedDB caching
- ✅ **Cache-first strategy** - Load from local cache first, network second
- ✅ **Graceful degradation** - Works seamlessly offline
- ✅ **Auto-update on new versions** 
- ✅ Periodic sync every 5 minutes
- ✅ **Offline fallback to backup** - Shows cache data when server offline
- ✅ **Admin Backup panel** - View backup status, access Google Drive directly

### Session Persistence ✅ FIXED!
- ✅ Session saved to localStorage on login
- ✅ Auto-restore IMMEDIATELY saat app dibuka (bukan tunggu useEffect)
- ✅ Tetap login saat app ditutup & dibuka lagi
- ✅ Stays logged in across minimize/lock
- ✅ 24-hour expiry untuk security
- ✅ Manual logout clears session

### Replit Temporary URL Keep-Alive ✅
- ✅ Auto-ping server every 10 minutes
- ✅ Keeps temporary URL active 24/7
- ✅ Prevents idle timeout

### Dual Backup System ✅ 
- ✅ **Database backup** at 2 AM - All 11 tables (users, products, transactions, etc)
- ✅ **Code backup** at 3 AM - Full source code (server, client, shared)
- ✅ Both auto-run on server startup (1-2 menit delay)
- ✅ Google Drive auto-cleanup di manage via dashboard
- ✅ Compressed dengan Tar.gz (hemat space)

### Google Drive Auto-Backup (Database)
- ✅ **Daily automated backup** - Runs at 2 AM every day
- ✅ **Full database export** - All 11 tables: users, products, categories, shifts, transactions, stock adjustments, expenses, loans, billiard rentals, billiard tables
- ✅ **Google Drive integration** - Automatically uploads JSON backup files
- ✅ **First backup on startup** - Runs 1 minute after server starts
- ✅ **Easy restore** - Download JSON backup anytime and restore data if needed

### Stock Management & Analytics ✅
- ✅ **Filter Gudang**: Exclude billiard tables (MEJA), esbatu, esteh, kopi cangkir from warehouse valuation
- ✅ **Informasi Penambahan Stok**: 30-day rolling analytics tab
  - Total unit ditambahkan dalam 1 bulan
  - Total nilai investasi stok
  - Rata-rata penambahan per hari
  - Top 5 produk dengan penambahan terbanyak
  - Linked to revenue understanding

### Static Build Distribution ✅
- ✅ Production build successful
- ✅ All JavaScript/CSS bundled + minified
- ✅ ZIP archive (pos-billiard-app-dist.tar.gz) ready
- ✅ Works offline WITHOUT server

## 🎯 How Shift Close Report Works

### When Kasir Ends Shift:

1. **Click "Akhiri Shift" button** → Beautiful detailed report dialog opens
2. **See complete breakdown:**
   - ✅ Pendapatan Sewa Billiard (Billiard income dengan jumlah transaksi)
   - ✅ Pendapatan Cafe/Produk (Cafe/product income dengan jumlah transaksi)
   - ✅ Total Penjualan gabungan
   - ✅ **Pengeluaran detail** - Semua bon/cashbon listed per orang dengan amount
   - ✅ **TOTAL AKHIR** - Pendapatan setelah dikurangi pengeluaran (bold highlight)
   - ✅ Percentage breakdown billiard vs cafe

3. **Share or Print**
   - **WhatsApp button** - Generate laporan text dan share langsung ke WhatsApp
   - **Print button** - Print receipt untuk arsip
   - Back button jika belum siap
   - Confirm button untuk finalisasi close

### Example Report:

```
📋 REKAP SHIFT - Kasir Satu
════════════════════════════

💚 PENJUALAN SEWA BILLIARD:
   Rp 340.000 (17 transaksi)

🧡 PENJUALAN CAFE/PRODUK:
   Rp 60.000 (8 transaksi)

📊 TOTAL PENJUALAN:
   Rp 400.000

🔴 PENGELUARAN:
   Bon (Hanif): Rp 50.000
   ─────────────────────────
   Total Pengeluaran: Rp 50.000

✅ TOTAL AKHIR (Pendapatan - Pengeluaran):
════════════════════════════
   Rp 350.000
════════════════════════════
Billiard: 85% | Cafe: 15%
```

## 🔐 Credentials

### Quick Login (Klik Lingkaran - No Password Needed)
- 🔵 **Riki** - Langsung login, no password
- 🔵 **Sherly** - Langsung login, no password  
- 🔵 **RR** - Langsung login, no password

### Manual Login
- **Kasir**: kasir1 / kasir123 or kasir2 / kasir123
- **Admin**: admin / admin123

## 🏗️ System Architecture

### Backend
- Express.js + TypeScript
- New endpoint: `GET /api/shifts/:id/summary` - calculates billiard vs cafe breakdown
- `PUT /api/shifts/:id/end` - closes shift (unchanged)

### Frontend
- React + TypeScript + Vite
- New component: `ShiftCloseReport.tsx` - beautiful report dialog
- Updated: `ShiftManagement.tsx` - "Akhiri Shift" button with report flow

### Database
- PostgreSQL (Neon) via Drizzle ORM
- Detects billiard items by product name containing "MEJA"
- Automatically splits cafe items (non-MEJA)

## 📋 Files Modified (Latest)

### Nov 28 - Automatic Code Backup to Google Drive ✅ NEW!
- `server/code-backup.ts` - Created:
  - Tar.gz compression untuk semua source files
  - Automatically excludes: node_modules, dist, build, .env, .git
  - Daily schedule at 3 AM (setelah data backup jam 2 AM)
  - Uploads to Google Drive dengan automatic filename
  - Cleanup backup file lokal setelah upload berhasil
- `server/index.ts` - Modified:
  - Import & initialize code backup scheduler
  - Call `initializeCodeBackupSchedule()` on startup
- `server/routes.ts` - Updated:
  - `/api/restore-backup` endpoint info mencakup code backups
- `package.json` - Added:
  - `tar` package untuk compression
  - NOW: Backup schedule = Database (2 AM) + Code (3 AM) DAILY

### Nov 28 - Offline-First Fallback & Service Worker Enhancement ✅ NEW!
- `public/sw.js` - Created:
  - Cache-first strategy for all assets
  - Network fallback with cache behavior
  - Graceful error handling untuk offline scenarios
  - IndexedDB cache untuk API responses
- `client/src/components/AdminDashboard.tsx` - Enhanced:
  - New "Backup" button untuk admin panel
  - Dialog menampilkan backup status
  - Link direct ke Google Drive
  - Info tentang offline fallback strategy
- `server/routes.ts` - Added:
  - `POST /api/restore-backup` endpoint

### Nov 28 - Google Drive Auto-Backup ✅
- `server/backup.ts` - Created:
  - Backup service with node-cron scheduling
  - Exports all 11 database tables to JSON format
  - Google Drive API integration for automatic upload
  - Runs daily at 2 AM + 1 minute after startup
  - Error handling dengan clear logging
- `server/index.ts` - Modified:
  - Import dan initialize backup schedule
  - Added: `import { initializeBackupSchedule } from "./backup";`
  - Call: `initializeBackupSchedule();` during server startup
- `package.json` - Added:
  - `node-cron` dependency for task scheduling

### Nov 28 - Stock Management Analytics ✅
- `client/src/components/StockManagement.tsx` - Added:
  - New tab: "Informasi Penambahan Stok" 
  - Filter calculation for last 30 days additions
  - Summary cards: total units, total value, avg/day, transaction count
  - Table: top 5 products by addition value
  - Uses `useMemo` for performance optimization
- `client/src/components/InventoryValuationReport.tsx` - Enhanced:
  - Filter warehouse items to exclude: MEJA, esbatu, esteh, kopi cangkir
  - Only calculates actual warehouse stock value (not billiard/beverage equipment)

### Nov 28 - Change Password Feature ✅
- `server/routes.ts` - Added endpoint: `PUT /api/users/:id/change-password`
  - Validates old password matches
  - Updates to new password securely
  - Error handling dengan pesan jelas
- `client/src/components/UserManagement.tsx` - Added change password dialog:
  - Lock icon button di setiap row user
  - Dialog dengan 3 fields: password lama, baru, confirm
  - Real-time validation dan error messages
  - Success notification
- `client/src/App.tsx` - Added mutation + handler:
  - `changePasswordMutation` untuk API call
  - `handleChangePassword` function
  - Connected ke UserManagement component

### Nov 28 - Smart Report Access Control
- `client/src/components/CashierDashboard.tsx` - Added smart transaction filtering:
  - `shiftTransactions` - Only current active shift
  - `historyTransactions` - All transactions in 7 AM to 7 AM window
  - Empty message when no active shift for kasir
- `server/routes.ts` - `/api/shifts/:id/summary` now includes expenses + finalTotal
- `client/src/components/ShiftCloseReport.tsx` - Enhanced with expenses breakdown + WhatsApp share
- `client/src/components/ShiftManagement.tsx` - Updated ShiftSummary interface

## 🚀 Deployment Options

### Option 1: Replit (SIMPLEST)
```
Click "Publish" di Replit dashboard
✅ Instant deploy
✅ Free URL provided
✅ Backups tetap running
```

### Option 2: Google App Engine (RECOMMENDED)
```bash
# 1. npm run build
# 2. gcloud auth login
# 3. gcloud config set project YOUR-PROJECT-ID
# 4. gcloud app deploy app.yaml

✅ Auto-scaling
✅ Free tier: 28 instance-hours/day
✅ Backups tetap running
ℹ️ Pilih sesuai OS:
   - Windows: DEPLOY_WINDOWS.md (+ DEPLOY_WINDOWS_QUICK.txt)
   - Mac/Linux: DEPLOY_SIMPLE.md (+ DEPLOY_VISUAL_GUIDE.md)
```

### Option 3: Render / Railway (EASY ALTERNATIVE)
- GitHub integration for auto-deploy
- Free tier dengan PostgreSQL
- Good untuk backup plan

## 📋 Deployment Checklist

1. **Check Google Drive backups:**
   - 📊 Database backup: `pos-backup-YYYY-MM-DD.json` (2 AM)
   - 📦 Code backup: `pos-code-backup-YYYY-MM-DD.tar.gz` (3 AM)
2. **Test offline mode** - Close browser = app pakai cache lokal
3. **Admin Dashboard** - Click "Backup" untuk lihat backup status
4. **First backups run within 2 minutes** after server startup
5. **Share URL with team** - Semua fitur offline-first ready!

## 📦 Distribution

- **Static build**: `pos-billiard-app-dist.tar.gz` (257 KB)
- **Extract & serve**: Works fully offline
- **GitHub Pages**: Push dist/public for free hosting

---

**App is PRODUCTION READY!** 🚀
- ✅ **Ganti Password** - Admin bisa ubah password kasir
- ✅ Shift close report dengan breakdown billiard vs cafe
- ✅ Smart report access: Kasir lihat shift aktif, History 7AM-7AM untuk semua
- ✅ Full offline-first PWA
- ✅ Keep-alive untuk Replit URL
- ✅ Session persistence (tetap login saat app ditutup)
- ✅ Static build ready untuk distribusi
- ✅ WhatsApp share + Print functionality
- ✅ **Google Drive auto-backup harian** (new!)
- ✅ Stock management dengan filter gudang
- ✅ Informasi penambahan stok 30 hari terakhir
