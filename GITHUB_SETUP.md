# Push ke GitHub & Setup

## Langkah 1: Buat Repo di GitHub
1. Go to github.com - Login
2. Klik **"+"** (top right) → **"New repository"**
3. Nama repo: `pos-system` (atau nama apapun)
4. Visibility: **Public** (biar bisa di-download siapa saja)
5. Click **"Create repository"**
6. Jangan setup README, .gitignore (nanti overwrite)

## Langkah 2: Push dari Replit

### Opsi A: Pakai Replit UI (PALING MUDAH)
1. Di Replit, klik **"Version Control"** (left sidebar)
2. Klik **"Connect to GitHub"**
3. Login GitHub jika diminta
4. Select repo yang baru dibuat
5. Klik **"Push to GitHub"**
6. Done! Code sudah di GitHub

### Opsi B: Command Line
```bash
# Setup git di Replit
git config --global user.email "email@example.com"
git config --global user.name "Your Name"

# Tambah remote
git remote add origin https://github.com/USERNAME/pos-system.git

# Push code
git add .
git commit -m "Initial commit - POS System"
git branch -M main
git push -u origin main
```

### Opsi C: Download ZIP & Upload Manual
1. Download dari Replit: Menu → "Download as ZIP"
2. Extract di komputer
3. Buka PowerShell / Terminal di folder itu
4. Run command dari Opsi B

## Langkah 3: Verifikasi di GitHub
1. Reload page github.com/username/pos-system
2. Lihat file sudah ada?
3. Jika iya = **Sukses!** ✅

## Langkah 4: Setup untuk Digunakan

### Kalau Mau Pakai Sebagai Extension
1. Download dari GitHub: **"Code"** → **"Download ZIP"**
2. Follow `EXTENSION_SETUP.md`

### Kalau Mau Deploy ke Server
Lihat pilihan di bawah...

---

## DEPLOYMENT OPTIONS

### ✅ Opsi 1: Railway (RECOMMENDED - Full Stack)
1. Go to railway.app
2. Login dengan GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select `pos-system` repo
5. Railway auto-detect Node.js
6. Set environment variables (database, NODE_ENV)
7. Auto-deploy di setiap push ke GitHub!
8. Cost: ~$5/bulan (gratis 5 dolar first)

### ✅ Opsi 2: Render
1. Go to render.com
2. Connect GitHub
3. Create "New Web Service"
4. Select pos-system
5. Set build & start commands
6. Deploy!
7. Free tier ada tapi limited (auto-sleep)

### ✅ Opsi 3: Vercel (Frontend only - Tidak cocok untuk app ini)
- Vercel hanya untuk static/frontend
- App ini butuh backend (Express)
- Tidak recommended

### ✅ Opsi 4: Keep di Replit (Easiest - Tapi Bayar)
- Sudah jalan di Replit
- Publish langsung dari sini (upgrade plan)

---

## Tips

### .gitignore - Jangan push secrets!
```
node_modules/
.env
.env.local
dist/
```

### Environment Variables di GitHub
- **JANGAN commit .env files!**
- Set di Railway/Render dashboard
- Atau buat .env.example untuk template

### Update Code Workflow
```bash
# Local changes
git add .
git commit -m "Fix bug/Add feature"
git push origin main

# Railway/Render auto-deploy!
```

---

## Troubleshooting

### "Permission denied" saat push
- Check git remote: `git remote -v`
- Buat Personal Access Token di GitHub
- Use: `https://USERNAME:TOKEN@github.com/username/pos-system.git`

### File size terlalu besar
- Remove `node_modules`: `git rm -r node_modules`
- Add ke .gitignore
- Commit: `git commit -m "Remove node_modules"`

### Push stuck
- Force: `git push -f origin main` (hati-hati!)
- Atau delete remote & push baru

---

## Next Steps

1. **Push ke GitHub** - 5 menit
2. **Choose deployment** - Railway / Render / Replit
3. **Deploy** - 2-3 menit
4. **Share link** - Aplikasi live!

Ready? 🚀
