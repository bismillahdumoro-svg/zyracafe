# 🚂 Deploy ke Railway (MUDAH!)

**Railway adalah pilihan terbaik untuk POS app Anda:**
- ✅ Auto-deploy dari GitHub (tinggal push code)
- ✅ Database PostgreSQL included
- ✅ Free tier: $5/month credit (cukup untuk POS)
- ✅ Uptime 24/7
- ✅ Setup 10 menit!

---

## STEP 1: Push Code ke GitHub (5 menit)

### A. Jika belum ada GitHub account:
1. Buka https://github.com
2. Klik "Sign up"
3. Isi email, password, username
4. Verify email

### B. Create New Repository di GitHub:
1. Login ke https://github.com
2. Klik **"+"** (kanan atas)
3. Pilih **"New repository"**
4. Isi:
   - **Repository name:** `pos-billiard-app`
   - **Description:** POS Billiard Rental System
   - **Visibility:** Public
5. **Jangan** select "Add .gitignore" atau "Add LICENSE"
6. Klik **"Create repository"**

### C. Push Code Dari Replit ke GitHub:

**Di Replit, buka Command Prompt/Terminal:**

```bash
# Setup Git (jika belum)
git config --global user.name "Nama Anda"
git config --global user.email "email@gmail.com"

# Navigate ke folder project
cd /home/runner/POS-Billiard-App  # atau nama folder Anda

# Initialize git (jika belum ada .git)
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit - POS app"

# Add GitHub remote
git remote add origin https://github.com/USERNAME/pos-billiard-app.git
# Ganti USERNAME dengan GitHub username Anda!

# Push ke GitHub
git branch -M main
git push -u origin main
```

**Saat diminta GitHub credentials:**
- Username: GitHub username Anda
- Password: Gunakan Personal Access Token (bukan password!)

**Cara buat Personal Access Token:**
1. Buka https://github.com/settings/tokens
2. Klik **"Generate new token"** → **"Generate new token (classic)"**
3. **Token name:** `railway-deployment`
4. **Select scopes:** Check `repo` dan `admin:repo_hook`
5. Klik **"Generate token"**
6. **Copy token** (jangan close halaman!)
7. Paste token sebagai "password" saat git push

---

## STEP 2: Setup Railway Account (2 menit)

### A. Buat Account Railway:
1. Buka https://railway.app
2. Klik **"Login"** → **"GitHub"**
3. Authorize Railway untuk GitHub
4. Done! Dashboard Railway opened

---

## STEP 3: Deploy ke Railway (3 menit)

### A. Create New Project:
1. Di Railway dashboard, klik **"Create New Project"**
2. Pilih **"Deploy from GitHub"**
3. Select repository: **`pos-billiard-app`**
4. **Confirm deploy** dari `main` branch
5. Railway akan mulai build (tunggu 2-3 menit)

### B. Setup Environment Variables:
1. Di Railway, di project Anda, pilih **"Service"** → `pos-billiard-app`
2. Klik tab **"Variables"**
3. Add variables:

```
NODE_ENV=production
PORT=8080
DATABASE_URL=<Railway akan auto-generate ini>
GOOGLE_DRIVE_API_KEY=<Dari Replit secret>
SESSION_SECRET=pos-billiard-secret-key
```

### C. Setup PostgreSQL Database:
1. Di Railway dashboard project, klik **"+"** (Add service)
2. Pilih **"Add Postgres"**
3. Railway akan auto-setup database
4. Copy `DATABASE_URL` dari Postgres service
5. Paste ke `pos-billiard-app` service variable

### D. Redeploy:
1. Klik **"Service"** → `pos-billiard-app`
2. Klik **"Deployments"**
3. Klik **"Redeploy"** untuk apply environment variables

---

## STEP 4: Test App (2 menit)

### A. Get Public URL:
1. Di Railway, klik `pos-billiard-app` service
2. Lihat tab **"Settings"**
3. Cari **"Domains"**
4. Domain otomatis: `pos-billiard-app-production.up.railway.app`

### B. Test di Browser:
```
https://pos-billiard-app-production.up.railway.app
```

✅ Kasir panel should load!
✅ Login dengan: kasir1 / kasir123

---

## ⚠️ PENTING: Google Drive Backup

Railway tidak punya persistent storage untuk backup files. **Solusi:**

### Option A: Backup langsung ke Google Drive (RECOMMENDED)
Sudah configured di `server/backup.ts` dan `server/code-backup.ts`
- Database backup: Daily 2 AM
- Code backup: Daily 3 AM
- Auto-upload ke Google Drive

**Pastikan environment variable ada:**
```
GOOGLE_DRIVE_API_KEY=<Railway secret>
```

### Option B: Manual Backup
1. Di Railway, export database dump
2. Download JSON backup dari admin panel
3. Upload manually ke Google Drive

---

## 📋 TROUBLESHOOTING

### Build Failed
```
Check Railway logs:
1. Railway dashboard → "Deployments"
2. Click latest deployment
3. View "Build logs"
4. Look for error message
```

### App crashes
```
Check runtime logs:
1. Railway dashboard → "Service"
2. Click "Logs"
3. Look for error
```

### Database connection error
```
1. Make sure Postgres service running
2. Check DATABASE_URL variable set correctly
3. Redeploy service
```

---

## ✅ DONE!

App Anda sekarang running 24/7 di Railway!

**Next steps:**
1. Share URL dengan team
2. Test offline-first PWA
3. Install app di phone: "Add to Home Screen"
4. Cek Google Drive backups (admin panel)
5. Monitor logs di Railway dashboard

---

**Tips:**
- Railway free tier: $5/month credit cukup untuk POS + database
- Upgrade plan jika traffic meningkat
- Monitor usage di "Billing" tab
- Auto-redeploy saat push ke GitHub

