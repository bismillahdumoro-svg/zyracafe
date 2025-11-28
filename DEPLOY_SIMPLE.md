# Deploy ke Google App Engine - SIMPLE GUIDE

## ⏱️ Waktu: ~15 menit

---

## STEP 1: Install Google Cloud CLI (5 menit)

**Pilih sistem operasi Anda:**

### 🍎 macOS
```bash
brew install google-cloud-sdk
```

### 🐧 Linux (Ubuntu/Debian)
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 🪟 Windows
1. Download: https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
2. Double-click file → next → next → install
3. Restart command prompt

**Verify installed:**
```bash
gcloud --version
```

---

## STEP 2: Login ke Google Account (2 menit)

Jalankan command ini:
```bash
gcloud auth login
```

✅ Browser akan open, pilih Google account Anda  
✅ Klik "Allow"  
✅ Tutup browser kembali ke terminal

---

## STEP 3: Create Google Cloud Project (3 menit)

### 🌐 Buka console Google Cloud:
https://console.cloud.google.com/

### ➕ Buat project baru:
1. Klik "Select a Project" (atas)
2. Klik tombol "NEW PROJECT"
3. Name: `pos-billiard-app`
4. Klik "CREATE"
5. Tunggu selesai (1-2 menit)

### 📋 Copy Project ID:
- Lihat di Console, ada format: `pos-billiard-app-XXXXX`
- **COPY PROJECT ID INI**

---

## STEP 4: Set Project di Terminal (1 menit)

Jalankan:
```bash
gcloud config set project pos-billiard-app-XXXXX
```

⚠️ Ganti `pos-billiard-app-XXXXX` dengan PROJECT ID Anda dari STEP 3!

Verify:
```bash
gcloud config list
```

Harusnya muncul project ID Anda.

---

## STEP 5: Build Aplikasi (2 menit)

```bash
npm run build
```

✅ Tunggu sampai selesai (~1-2 menit)  
✅ Akan create folder `dist/`  
✅ Tidak perlu ada error

---

## STEP 6: Deploy! (2 menit)

Copy-paste command:
```bash
gcloud app deploy app.yaml --no-promote
```

✅ Akan minta confirm "Do you want to continue? (Y/n)?" → Type `Y` + Enter  
✅ Tunggu deploy selesai (2-3 menit)  
✅ Terakhir akan muncul URL aplikasi Anda!

---

## STEP 7: Get Your App URL (1 menit)

Jalankan:
```bash
gcloud app describe
```

Cari di output: `default_hostname: pos-billiard-app-XXXXX.appspot.com`

**URL lengkap Anda:**
```
https://pos-billiard-app-XXXXX.appspot.com
```

✅ **COPY & SHARE URL INI KE TEAM!**

---

## ✅ DONE!

Aplikasi Anda sudah live di Google Cloud! 

### Test:
1. Buka URL di browser
2. Login dengan: `kasir1` / `kasir123`
3. Coba buat transaksi
4. Coba offline (tutup browser)
5. Buka lagi → masih ada cached data!

### Check Backup:
1. Pergi ke https://drive.google.com
2. Cari file `pos-backup-YYYY-MM-DD.json` (jam 2 pagi)
3. Cari file `pos-code-backup-YYYY-MM-DD.tar.gz` (jam 3 pagi)

---

## ⚠️ Jika Ada Error:

### Error: "DATABASE_URL not found"
**Solusi:**
1. Buka https://console.cloud.google.com
2. Klik project Anda
3. Klik "App Engine" → "Services"
4. Klik service → klik edit
5. Scroll ke "Runtime settings"
6. Tambah environment variable:
   - Name: `DATABASE_URL`
   - Value: (tanya ke Riki tentang Neon DB URL)
7. Klik "Deploy"

### Error: "Build failed"
```bash
# Clean & rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Error: "Permission denied"
```bash
gcloud auth login
# Pilih account lagi
```

---

## 📊 View Logs:

Jalankan terus menerus untuk lihat error live:
```bash
gcloud app logs read -f
```

Tekan `Ctrl+C` untuk stop.

---

## ✨ TIPS:

- ✅ Backup otomatis tetap jalan
- ✅ Keep-alive tetap active
- ✅ Offline mode tetap work
- ✅ Gratis: 28 jam/hari
- ⚠️ Jangan share code credentials
- 🔄 Untuk update, ulangi STEP 5-6

---

**Saya siap bantu jika ada error!**
