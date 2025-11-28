# Static Build Distribution - POS Billiard App

## 📦 What's Included

This is a **static offline-first PWA** that works without any server!

- ✅ All JavaScript/CSS bundled
- ✅ IndexedDB database (creates automatically on device)
- ✅ Service Worker for offline support
- ✅ 28+ records pre-synced on first load
- ✅ Session persistence (stay logged in across minimize/lock)
- ✅ Keep-alive background pings

## 🚀 How to Use

### Option 1: Extract & Open in Browser (No Server Needed!)

```bash
# Extract the archive
tar -xzf pos-billiard-app-dist.tar.gz

# Copy dist/public files to a folder
cp -r dist/public ~/pos-app
cd ~/pos-app

# Open in browser - works offline!
# Just double-click index.html or use a local server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Option 2: On iPhone/iPad (Recommended)

1. **Extract archive on computer**
2. **Upload to web server** (or GitHub Pages)
3. **On iPad, open URL in Safari**
4. **Tap Share → Add to Home Screen**
5. **App installs locally** - works offline! ✅

### Option 3: Simple HTTP Server

```bash
cd dist/public
python -m http.server 5000
# or
npx http-server
# Then visit: http://localhost:5000
```

## 📱 First Time Setup

When you open the app:

1. **IndexedDB auto-creates** → stores database locally ✅
2. **28+ records downloaded** → products, categories, billiard data
3. **Session can be saved** → localStorage keeps you logged in
4. **Works offline** → no internet needed! ✅

## 🔐 Login Credentials

- **Kasir**: kasir1 / kasir123
- **Admin**: admin / admin123

## 📊 Data Storage (Device Local)

All data stored on device:
- **Products** (MEJA 1-7, EXT001-EXT007, food items)
- **Categories** (Lainnya, Minuman, Makanan, Perpanjangan)
- **Billiard Rentals** (active timers)
- **User Sessions** (localStorage)
- **Transactions** (if created offline)

## ⚙️ Technical Details

### Service Worker
- Caches all static files
- Works offline
- Auto-updates when new version deployed

### IndexedDB (Browser Database)
- **12+ stores** for complete POS system
- **Syncs automatically** every 5 minutes
- **Changes queued** when offline
- **Persists indefinitely** until device cache cleared

### Offline-First
- Read from device first
- Fallback to server when online
- Auto-sync every 5 minutes
- Queue changes while offline

## 🎯 Real-World Scenario

```
1. Extract ZIP on computer
2. Upload to server (GitHub Pages, etc)
3. Open on iPad from home screen
4. Works 100% offline
5. Even if server dies, app keeps running!
6. All billiard timers continue counting
7. New transactions queued locally
8. Auto-sync when server back online
```

## 📝 File Structure

```
dist/public/
├── index.html          # Main app
├── service-worker.js   # Offline support
├── manifest.json       # PWA metadata
└── assets/
    ├── index-*.js      # App code
    └── index-*.css     # Styling
```

## 🔗 Important URLs

When serving locally:
- **App**: http://localhost:8000
- **API calls**: Direct to same origin (no CORS issues)
- **Database**: IndexedDB (automatic)

## 🚨 Troubleshooting

**App not loading offline?**
- Check Service Worker: DevTools → Application → Service Workers
- Clear cache: Settings → Clear browsing data

**Database not syncing?**
- Check IndexedDB: DevTools → Application → IndexedDB
- See console logs: DevTools → Console
- Look for `[Sync]` messages

**Session lost after minimize?**
- Session now persists in localStorage ✅
- Check localStorage: DevTools → Application → Local Storage

## 🎉 You're Ready!

App is production-ready for offline use. No server required after initial deployment!

For questions, check browser console logs (DevTools → Console) for diagnostic messages.
