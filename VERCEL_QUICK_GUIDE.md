# Deploy ke Vercel - Panduan Praktis 5 Menit

## STEP 1: Push Code ke GitHub

**Di Replit Terminal:**
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
git remote add origin https://github.com/USERNAME/pos-system.git
git add .
git commit -m "First commit"
git branch -M main
git push -u origin main
```

⚠️ Ganti `USERNAME` dengan username GitHub Anda!

**Verify:**
- Buka github.com/USERNAME/pos-system
- Lihat file sudah ada? = ✅ SUKSES

---

## STEP 2: Setup Vercel Project

1. Go to **vercel.com** → Sign in dengan GitHub
2. Klik **"Add New..."** → **"Project"**
3. Pilih **`pos-system`** repo
4. Click **"Import"**
5. Vercel auto-detect (leave default)
6. Click **"Deploy"** (biru button)
7. **WAIT** ~5 menit (lihat progress bar)
8. Done! Get domain like: `pos-system-abc123.vercel.app`

---

## STEP 3: Set Database URL

**Di Vercel Dashboard:**

1. Go to project settings: **Settings** (tab)
2. Left sidebar: **"Environment Variables"**
3. **Add New Variable:**
   - **Name:** `DATABASE_URL`
   - **Value:** Paste dari Replit settings (copy DATABASE_URL value)
   - Click **"Add"**
4. Click **"Deployments"**
5. Klik **3 dots** (...)  → **"Redeploy"** on latest deployment
6. **WAIT** ~3 menit

---

## STEP 4: Test Aplikasi

**Open:** `pos-system-abc123.vercel.app`

Login dengan:
- Username: `admin`
- Password: `admin`

Coba:
- ✅ Login
- ✅ Lihat dashboard
- ✅ Buat transaksi
- ✅ Logout

**Jika error:**
- Lihat logs: Deployments → Click deployment → "Functions"
- Check: DATABASE_URL di settings?

---

## Kalau Deploy Gagal?

### Error: "Build failed"
**Solution:**
```bash
# Di Replit terminal
npm run build
# Check error message
```

### Error: "Cannot connect to database"
**Solution:**
1. Check DATABASE_URL di Vercel settings
2. Copy exact value dari Replit
3. Redeploy

### Error: "Timeout"
**Solution:**
- Normal untuk first deploy (cold start)
- Try refresh page
- Wait 10 menit

---

## Setelah Live di Vercel

### Kalau ada bugs, cara fix:

1. **Fix code di Replit**
2. **Push ke GitHub:**
   ```bash
   git add .
   git commit -m "Fix: description"
   git push origin main
   ```
3. **Vercel auto-redeploy** dalam 2 menit
4. Done!

### Monitor performance:
- Vercel Dashboard → Analytics tab
- Check response time & errors

---

## FAQ

**Q: Berapa cost Vercel?**
A: Hobby plan FREE (unlimited free tier). Database (Neon) ~$9/bulan.

**Q: Gimana kalau mau ganti domain?**
A: Vercel Settings → Domains → Add custom domain

**Q: Bisa offline di Vercel?**
A: Tidak. Vercel = cloud hosted. Untuk offline, pakai Chrome Extension.

**Q: Mau switch ke platform lain?**
A: Sama steps - cukup change hosting platform, code tetap sama.

---

## Ready?

1. Open Replit Terminal
2. Copy commands dari STEP 1
3. Paste & run
4. Follow STEP 2-4
5. DONE! 🎉

Questions? Check `VERCEL_SETUP.md` untuk detail lengkap.
