#!/bin/bash

# ============================================
# QUICK SETUP untuk Google App Engine Deploy
# ============================================

echo "🚀 Starting Google App Engine Setup..."

# Step 1: Build production
echo "📦 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

# Step 2: Login ke Google Cloud
echo "🔐 Logging into Google Cloud..."
gcloud auth login

# Step 3: Set project
echo "📍 Setting project..."
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
gcloud config set project $PROJECT_ID

# Step 4: Check configuration
echo "✅ Current configuration:"
gcloud config list

# Step 5: Deploy to App Engine
echo "🚀 Deploying to App Engine..."
gcloud app deploy app.yaml --no-promote

# Step 6: View deployment status
echo "📊 Checking deployment status..."
gcloud app versions list

# Step 7: Get app URL
echo "🌐 Getting your app URL..."
APP_URL=$(gcloud app describe --format='value(defaultHostname)')
echo "✅ Your app is deployed at: https://$APP_URL"

# Step 8: View initial logs
echo "📋 Initial deployment logs:"
gcloud app logs read -n 20

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo "App URL: https://$APP_URL"
echo ""
echo "Next steps:"
echo "1. Visit your app URL to verify it works"
echo "2. Check Admin Dashboard for Backup status"
echo "3. Verify Google Drive backups are working"
echo ""
echo "Stream logs: gcloud app logs read -f"
echo "View versions: gcloud app versions list"
echo ""
