# Deploy ke Vercel - Panduan Lengkap

## ⚠️ PENTING: Batasan Vercel
Vercel lebih cocok untuk **frontend-only**. Aplikasi ini punya **backend Express** yang tidak ideal di Vercel karena:
- Vercel support serverless functions (jalankan ~15 detik)
- Express server butuh persistent connection
- Cost bisa lebih mahal

**Pilihan Terbaik:**
1. **Railway** - $5/bulan, support full-stack ✅ RECOMMENDED
2. **Vercel** - $0-20/bulan, lebih kompleks ⚠️
3. **Replit** - Upgrade plan 🟢

---

## Kalau Tetap Mau Vercel, Ikuti Ini:

### STEP 1: Push ke GitHub (5 menit)
```bash
git config --global user.email "email@example.com"
git config --global user.name "Your Name"
git remote add origin https://github.com/USERNAME/pos-system.git
git add .
git commit -m "Ready for Vercel"
git branch -M main
git push -u origin main
```

### STEP 2: Setup Vercel (3 menit)
1. Go to **vercel.com** → Login dengan GitHub
2. Click **"Add New..."** → **"Project"**
3. Select `pos-system` repository
4. Vercel auto-detect project type
5. Click **"Deploy"**
6. Wait ~5 menit
7. Get domain: `pos-system.vercel.app`

### STEP 3: Setup Database URL (2 menit)
1. Di Vercel dashboard → Settings → Environment Variables
2. Add variable:
   - **Name:** `DATABASE_URL`
   - **Value:** (copy dari Replit settings - DATABASE_URL)
3. Redeploy: Click "Deployments" → "Redeploy"

### STEP 4: Test
- Open `pos-system.vercel.app`
- Login dengan: admin / admin
- Check apakah bisa load data

---

## Kalau Ada Masalah:

### Error: "Cannot find module"
```bash
npm install
npm run build
git add package-lock.json
git commit -m "Add package-lock"
git push
```

### Error: "Database not connected"
- Check DATABASE_URL di Vercel settings
- Verify Neon database accessible dari Vercel IP
- Neon settings → Network Access → Allow all (temporary)

### Slow performance
- Normal untuk first load (cold start)
- Vercel cache responses
- Upgrade Vercel plan untuk instant response

### Build fails
- Check build logs di Vercel dashboard
- Common: Node version mismatch
- Solusi: Tentukan Node version di vercel.json (lihat di bawah)

---

## vercel.json Configuration (OPTIONAL)
Buat file `vercel.json` di root project:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "server/index.ts": {
      "runtime": "nodejs18.x",
      "memory": 1024
    }
  }
}
```

Push file ini ke GitHub sebelum deploy.

---

## Monitoring & Logs

### View logs
1. Vercel dashboard → Deployments
2. Click deployment → Functions
3. View real-time logs

### Check performance
- Vercel Analytics tab
- Monitor response times
- Check error rates

### Rollback
- Deployments tab
- Click previous deployment
- Promote to production

---

## Cost Estimate

| Feature | Cost |
|---------|------|
| Hobby Plan | FREE |
| Serverless invocations | Included (1M/month) |
| Database (Neon) | ~$9/month |
| **Total** | ~$9/month |

---

## Troubleshooting Checklist

- [ ] GitHub connected?
- [ ] DATABASE_URL set in Vercel?
- [ ] Database accessible from Vercel IP?
- [ ] Build succeeds locally: `npm run build`?
- [ ] .env file not committed?
- [ ] Node version compatible?

---

## Alternative: Switch to Railway (RECOMMENDED)

Railway much better untuk app ini. Langkah:

1. Go to railway.app
2. Connect GitHub
3. Create New Project → Deploy from GitHub
4. Select pos-system
5. Railway auto-detect → Deploy!
6. Done - full-stack support!

Cost: ~$5/bulan (free $5 credit first)

---

## Need Help?

Check Vercel docs: https://vercel.com/docs
Check Railway docs: https://docs.railway.app

---

**Recommend:** Gunakan Railway untuk full-stack app seperti ini. Lebih mudah & lebih reliable.
