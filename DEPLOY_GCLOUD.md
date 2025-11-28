# Deploy ke Google App Engine

## Prerequisites
```bash
# 1. Install Google Cloud CLI
# macOS: brew install google-cloud-sdk
# Linux/Windows: https://cloud.google.com/sdk/docs/install

# 2. Login ke Google Cloud
gcloud auth login

# 3. Set project
gcloud config set project YOUR-PROJECT-ID

# 4. Verify gcloud
gcloud --version
```

## Step 1: Build Aplikasi
```bash
npm run build
```

Ini akan create `dist/index.cjs` untuk production.

## Step 2: Set Environment Variables di App Engine

**Option A: Via Console** (recommended for secrets)
```bash
gcloud app deploy --no-promote
# Then edit app.yaml to add:
env_variables:
  DATABASE_URL: "your-neon-db-url"
  REPLIT_CONNECTORS_HOSTNAME: "your-hostname"
```

**Option B: Via .env.yaml** (insecure - avoid!)
Create `.env.yaml` (don't commit to git):
```yaml
env_variables:
  DATABASE_URL: "postgresql://..."
```

## Step 3: Deploy ke App Engine
```bash
# First time deployment
gcloud app deploy app.yaml

# Subsequent deployments
gcloud app deploy app.yaml --no-promote
# Then:
gcloud app traffic-split --split-by=ip
```

## Step 4: Verify Deployment
```bash
# View logs
gcloud app logs read -n 50

# Stream logs
gcloud app logs read -f

# Get your app URL
gcloud app describe
# URL will be: https://PROJECT-ID.appspot.com
```

## Important Settings

### Database Connection
- Ensure `DATABASE_URL` environment variable is set
- If using Neon: allow App Engine IP in firewall settings
- Connection pooling: use `connect-pg-simple` (already in package.json)

### Storage & Backups
- Google Drive backups will STILL work ✅
- Code backup to Drive continues automatically
- Database backup to Drive continues automatically

### Scaling
Default config:
- Min instances: 0 (sleeps when idle)
- Max instances: 2 (scales up on demand)
- Free tier: 28 instance hours/day

To change scaling:
```yaml
automatic_scaling:
  min_instances: 1  # Always running
  max_instances: 5  # Scale up to 5
```

## Troubleshooting

**Error: DATABASE_URL not found**
```bash
# Set via gcloud
gcloud app create
gcloud config set gae/promote_by_default false
gcloud deploy  # Then set env vars in Console
```

**Error: Connection timeout to database**
- Check Neon firewall allows App Engine region
- Verify DATABASE_URL is correct format

**Error: Google Drive backup fails**
- Set REPLIT_CONNECTORS_HOSTNAME env var
- Or remove Google Drive integration for App Engine version

## Cost Estimation

| Item | Free Tier |
|------|-----------|
| Compute | 28 instance-hours/day |
| Outbound traffic | 1 GB/day |
| Cost after | ~$0.05-0.15/day if exceeds |

## Rollback Previous Version
```bash
# View all versions
gcloud app versions list

# Route 100% to previous version
gcloud app traffic-split --split-by=ip VERSION-ID
```

## Database Migrations

If schema changes after deployment:
```bash
# Run migrations in App Engine shell
gcloud app shell
npm run db:push

# Or via cloud run (temporary)
gcloud run jobs create migrate-db \
  --image=gcr.io/cloud-builders/npm \
  --command npm \
  --args run,db:push
```

---

**✅ App is now on Google App Engine!**
- Auto-scales when needed
- Sleeps when idle (free tier friendly)
- All backups continue to Google Drive
- Accessible 24/7 globally
