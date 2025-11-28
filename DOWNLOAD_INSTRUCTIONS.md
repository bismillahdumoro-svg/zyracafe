# Cara Download & Pakai Aplikasi POS Offline

## 3 Pilihan Download:

### ✅ Pilihan 1: Download ZIP (PALING MUDAH)
1. Di Replit, klik **"..." menu** → **"Download as ZIP"**
2. Extract file ke folder
3. Follow langkah di `EXTENSION_SETUP.md`

### ✅ Pilihan 2: Git Clone
```bash
# Terminal/CMD
git clone https://github.com/your-username/pos-system.git
cd pos-system
```

### ✅ Pilihan 3: Manual Copy
1. Copy semua file dari editor Replit
2. Paste ke folder lokal
3. Structure sama seperti di Replit

## Untuk Pakai Offline:

### Opsi A: Chrome Extension (REKOMENDASI)
- Follow `EXTENSION_SETUP.md`
- Paling mudah untuk offline
- Data tersimpan di Chrome

### Opsi B: Local Development
```bash
npm install
npm run dev
# Buka http://localhost:5000 di browser
# Pakai offline mode dengan Service Worker
```

### Opsi C: Deploy ke Railway (Ada Backend)
- Lebih kompleks tapi support server
- Follow Railway docs

## Quick Start
```bash
# 1. Extract ZIP / Clone repo
# 2. Buat folder POS-Extension/
# 3. Copy manifest.json, popup.html, popup.js, background.js
# 4. Run: npm run build
# 5. Copy dist/public/* ke POS-Extension/
# 6. chrome://extensions → Load unpacked
# 7. Done!
```

Login: admin / admin (atau kasir1 / kasir1)

---

Aplikasi siap offline! Bisa dibuka kapan saja tanpa internet. 🚀
