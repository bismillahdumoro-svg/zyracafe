# Setup POS System sebagai Chrome Extension

## Download & Setup (5 Menit)

### Langkah 1: Siapkan Folder
1. Download/ekstrak semua file ke folder: `POS-Extension`
2. Struktur folder harus:
```
POS-Extension/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── app.html (build output dari React)
├── app.js (build output dari React)
├── favicon.png
└── (file static lainnya)
```

### Langkah 2: Build React App
```bash
# Di folder project React Anda
npm run build

# Copy dist/public/* ke POS-Extension/ folder
# Rename index.html menjadi app.html
```

### Langkah 3: Load di Chrome
1. Buka Chrome browser
2. Ketik di address bar: `chrome://extensions/`
3. Aktifkan **"Developer mode"** (toggle di kanan atas)
4. Klik **"Load unpacked"**
5. Pilih folder `POS-Extension/`
6. Selesai! Extension sudah terinstall

### Langkah 4: Pakai Aplikasi
1. Klik icon extension di toolbar Chrome (puzzle piece icon)
2. Popup akan muncul dengan aplikasi POS
3. Login dengan:
   - Username: `admin` / Password: `admin`
   - Atau: `kasir1` / Password: `kasir1`
4. Semua data tersimpan **offline** di Chrome storage

## Fitur Offline
- ✅ Semua data tersimpan local
- ✅ Tidak butuh internet
- ✅ Data persistent (tidak hilang meski close Chrome)
- ✅ Bisa pakai di mana saja

## Troubleshooting

### Extension tidak appear di toolbar
- Reload extension: `chrome://extensions/` → Click reload
- Pastikan manifest.json valid

### Data tidak muncul
- Buka Chrome DevTools: F12
- Lihat Console apakah ada error
- Check Application → Local Storage

### Reset data
- Chrome Settings → Privacy → Clear browsing data
- Pilih "Cookies and other site data"
- Remove extension dan reload

## Notes
- Bukan production ready - untuk development/testing
- Untuk production, perlu signing & publish ke Chrome Web Store
- Database local punya limit ~5-10MB per extension

---

**Butuh bantuan?** Check console (F12) untuk error details.
