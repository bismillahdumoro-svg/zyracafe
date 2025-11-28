# 📱 VISUAL DEPLOY GUIDE - Ikuti Gambar-Gambar Ini

## Asumsi: Anda pakai macOS atau Linux

---

## 📌 STEP 1: Install Google Cloud CLI

**Buka Terminal / Command Prompt**

Kopi-paste command ini:
```bash
brew install google-cloud-sdk
```

**Tunggu sampai selesai** (akan print "==> Pouring google-cloud-sdk...").

Verify:
```bash
gcloud --version
```

**Output yang benar:**
```
Google Cloud SDK 477.0.0
```

---

## 📌 STEP 2: Login Ke Google

Copy-paste:
```bash
gcloud auth login
```

**Browser akan buka otomatis.**

**Apa yang akan terjadi:**
1. Lihat halaman login Google
2. Pilih email Anda (yang punya Google account)
3. Klik "Allow"
4. Akan lihat "You are now authenticated with the Google Cloud CLI!"
5. Tutup browser

---

## 📌 STEP 3: Bikin Project Google Cloud

**Buka halaman ini:**
```
https://console.cloud.google.com
```

**Lihat kiri atas, ada tombol "Select a Project":**
```
┌─────────────────────┐
│ ☁️ Select a Project │
└─────────────────────┘
```

**Klik → Akan keluar modal popup**

**Di popup, klik tombol biru "NEW PROJECT"**

**Isi form:**
- Project name: `pos-billiard-app` (kopi-paste PERSIS)
- Klik "CREATE"

**Tunggu 1-2 menit...**

---

## 📌 STEP 4: Copy Project ID

**Setelah selesai, lihat title di tab browser:**
```
pos-billiard-app-XXXXX - Google Cloud Console
```

**Atau di halaman, klik "Select a Project" → akan lihat:**
```
pos-billiard-app-XXXXX
```

**COPY angka-angka itu! Contoh: `pos-billiard-app-123456`**

---

## 📌 STEP 5: Atur Project di Terminal

**Copy-paste command ini:**
```bash
gcloud config set project pos-billiard-app-XXXXX
```

⚠️ **Ganti `pos-billiard-app-XXXXX` dengan project ID Anda!**

**Contoh benar:**
```bash
gcloud config set project pos-billiard-app-123456
```

**Test:**
```bash
gcloud config list
```

**Lihat output, pastikan ada:**
```
[core]
project = pos-billiard-app-123456
```

---

## 📌 STEP 6: Build Aplikasi (PENTING!)

**Pergi ke folder Replit project:**
```bash
cd /tmp/replit-project  # Atau folder mana pun project Anda
```

**Kopi-paste:**
```bash
npm run build
```

**Tunggu 1-2 menit...**

**Output akhir yang benar:**
```
✅ Build complete!
```

---

## 📌 STEP 7: DEPLOY!!!

**Copy-paste:**
```bash
gcloud app deploy app.yaml --no-promote
```

**Terminal akan print:**
```
Services to deploy:

descriptor:      [/path/to/app.yaml]
target project:  [pos-billiard-app-123456]
target service:  [default]
target version:  [20240101t120000]

Beginning deployment of service [default]...
```

**Di bawah, akan ada pertanyaan:**
```
Do you want to continue (Y/n)?
```

**Ketik: `Y` dan tekan ENTER**

**Tunggu 2-3 menit...** (akan print banyak text)

**Selesai ketika muncul:**
```
Deployed service [default] to https://pos-billiard-app-XXXXX.appspot.com
```

---

## 📌 STEP 8: Dapat URL

**Copy-paste:**
```bash
gcloud app describe
```

**Cari di output:**
```
default_hostname: pos-billiard-app-XXXXX.appspot.com
```

**URL lengkap Anda:**
```
https://pos-billiard-app-XXXXX.appspot.com
```

✅ **SHARE URL INI KE TEAM!**

---

## ✅ TEST APLIKASI

**Buka di browser:**
```
https://pos-billiard-app-XXXXX.appspot.com
```

**Harus ada login page**

**Login dengan:**
- Username: `kasir1`
- Password: `kasir123`

**Jika berhasil, Anda akan lihat dashboard kasir!**

---

## 🔧 JIKA ADA MASALAH

### ❌ Error: "DATABASE_URL not found"

**Tidak apa-apa dulu, lanjut ke STEP berikutnya**

### ❌ Terminal tidak recognize `gcloud`

**Restart Terminal:**
1. Tutup terminal
2. Buka terminal baru
3. Coba lagi

### ❌ Build error

```bash
npm run build
```

Lihat error, minta screenshot ke developer.

### ❌ Deploy error

```bash
gcloud app logs read -f
```

Lihat 20 baris terakhir error.

---

## 📊 SETELAH DEPLOY SELESAI

### ✅ Database & Code Backup:
1. Buka Google Drive: https://drive.google.com
2. Cari folder `POS Backups` (auto-created)
3. Lihat:
   - `pos-backup-YYYY-MM-DD.json` (data)
   - `pos-code-backup-YYYY-MM-DD.tar.gz` (code)

### ✅ Offline Mode Test:
1. Login ke aplikasi
2. Close browser
3. Open kembali → masih ada data!

### ✅ View Logs (Real-time):
```bash
gcloud app logs read -f
```

---

## 💡 TIPS

✅ Update aplikasi? Ulangi STEP 6-7  
✅ Gratis: 28 jam per hari  
✅ Backup otomatis jalan terus  
✅ Share URL dengan team = done!

---

**Kalau masih ada yang tidak jelas, screenshot di step mana Anda stuck, saya bantu!**
