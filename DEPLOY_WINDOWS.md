# 🪟 DEPLOY KE GOOGLE APP ENGINE - WINDOWS GUIDE

## ⏱️ Waktu: ~15 menit

---

## STEP 1: Download & Install Google Cloud SDK (5 menit)

### ⬇️ Download:
1. Buka link ini: https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
2. File akan di-download: `GoogleCloudSDKInstaller.exe`

### ⚙️ Install:
1. **Double-click** file `GoogleCloudSDKInstaller.exe`
2. Klik "Next" → "I Agree" → "Next"
3. Pilih lokasi install (default OK) → "Install"
4. Tunggu selesai (1-2 menit)
5. Klik "Finish"

### ✅ Test di Command Prompt:
1. Buka **Command Prompt** (Tekan `Win + R` → ketik `cmd` → Enter)
2. Copy-paste:
```
gcloud --version
```
3. Harusnya print versi Google Cloud SDK

---

## STEP 2: Login (2 menit)

Di Command Prompt, copy-paste:
```
gcloud auth login
```

✅ Browser akan buka otomatis  
✅ Pilih email Google Anda  
✅ Klik "Allow"  
✅ Tutup browser

---

## STEP 3: Create Project Google Cloud (3 menit)

### 🌐 Buka:
https://console.cloud.google.com

### ➕ Buat Project:
1. Klik "Select a Project" (atas kiri)
2. Klik tombol "NEW PROJECT" (biru)
3. **Project name:** `pos-billiard-app`
4. Klik "CREATE"
5. Tunggu 1-2 menit

### 📋 Copy Project ID:
Setelah selesai, lihat di console:
- Title akan jadi: `pos-billiard-app-XXXXX - Google Cloud Console`
- Atau klik "Select a Project" → akan lihat: `pos-billiard-app-XXXXX`

**COPY ANGKA ITU!** (contoh: `pos-billiard-app-123456`)

---

## STEP 4: Set Project di Command Prompt (1 menit)

Copy-paste:
```
gcloud config set project pos-billiard-app-XXXXX
```

⚠️ **Ganti `pos-billiard-app-XXXXX` dengan PROJECT ID dari STEP 3!**

**Contoh:**
```
gcloud config set project pos-billiard-app-789012
```

**Verify:**
```
gcloud config list
```

Harusnya lihat project ID Anda di output.

---

## STEP 5: Build Aplikasi (2 menit)

Pastikan Anda sudah di folder project Replit!

Copy-paste:
```
npm run build
```

Tunggu 1-2 menit sampai selesai.

---

## STEP 6: DEPLOY! (2 menit)

Copy-paste di Command Prompt:
```
gcloud app deploy app.yaml --no-promote
```

Akan muncul pertanyaan:
```
Do you want to continue (Y/n)?
```

**Ketik:** `Y` dan tekan **ENTER**

Tunggu 2-3 menit...

Saat selesai, akan lihat:
```
Deployed service [default] to https://pos-billiard-app-XXXXX.appspot.com
```

---

## STEP 7: Get Your App URL (1 menit)

Copy-paste:
```
gcloud app describe
```

Cari di output:
```
default_hostname: pos-billiard-app-XXXXX.appspot.com
```

**URL lengkap:**
```
https://pos-billiard-app-XXXXX.appspot.com
```

✅ **COPY & SHARE URL INI KE TEAM!**

---

## ✅ TEST APLIKASI

1. Buka di browser: `https://pos-billiard-app-XXXXX.appspot.com`
2. Login: `kasir1` / `kasir123`
3. Coba transaksi
4. Tutup browser, buka lagi → data cache masih ada!

---

## 🔧 JIKA ADA ERROR

### ❌ "gcloud: The term 'gcloud' is not recognized"

**Solusi:**
1. Tutup Command Prompt
2. Buka Command Prompt **baru** (Win + R → cmd → Enter)
3. Coba lagi

Jika masih error:
1. Buka Control Panel → System and Security → System
2. Klik "Advanced system settings"
3. Klik "Environment Variables"
4. Klik "Path" → "Edit"
5. Klik "New" → paste: `C:\Program Files\Google\Cloud SDK\bin`
6. Klik OK → OK
7. Restart Command Prompt

### ❌ "Build failed"

```
npm run build
```

Error apa muncul? Kirim ke saya!

### ❌ "DATABASE_URL not found"

Normal dulu. Setelah deploy selesai, kita setup di App Engine console.

---

## 📊 SETELAH DEPLOY

### ✅ Cek Backup di Google Drive:
1. https://drive.google.com
2. Cari file:
   - `pos-backup-2025-11-28.json` (jam 2 pagi)
   - `pos-code-backup-2025-11-28.tar.gz` (jam 3 pagi)

### ✅ View Logs Real-time:
```
gcloud app logs read -f
```

Tekan `Ctrl + C` untuk stop.

---

## 💾 UPDATE APLIKASI (Next Time)

Jika ada code update:
```
npm run build
gcloud app deploy app.yaml --no-promote
```

Selesai!

---

**✅ Sip! Aplikasi Anda sudah live!**

Butuh bantuan? Screenshot error Anda!
