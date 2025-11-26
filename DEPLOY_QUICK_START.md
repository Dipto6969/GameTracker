# GameTracker Vercel Deployment - Quick Commands

## Quick Start (Copy & Paste)

### Step 1: Push to GitHub
```bash
cd f:\GameTracker

# Check git status
git status

# Stage all files
git add .

# Commit
git commit -m "Initial commit: GameTracker with all Phase 4 features"

# Push to GitHub (first time)
git branch -M main
git push -u origin main
```

### Step 2: Create Vercel Account
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Search for "GameTracker"
5. Select it and click "Import"
6. Click "Deploy" (use default settings)

### Step 4: Add Environment Variables
After deployment starts, while it's building:

1. Go to Vercel Dashboard → gametracker project
2. Click "Settings" → "Environment Variables"
3. Add these variables:

**For RAWG API:**
- Name: `RAWG_API_KEY`
- Value: Get from https://rawg.io/api (sign up and copy key)
- Select all environments
- Click "Save"

**For Vercel KV (Optional but recommended):**
1. Click "Storage" tab
2. Click "Create Database" → "Vercel KV"
3. Click "Create" (auto-adds env variables)

### Step 5: Redeploy
1. Go to "Deployments" tab
2. Click "Redeploy" on the latest build
3. Wait for build to complete (2-3 minutes)
4. Click "Visit" when ready ✅

---

## That's It! 🎉

Your app is now live at:
`https://gametracker-xxxxx.vercel.app`

---

## Future Deploys

Every time you make changes:
```bash
git add .
git commit -m "Your change description"
git push origin main
```

Vercel automatically deploys! 🚀

---

## Troubleshooting Commands

### Check if git remote is set
```bash
git remote -v
```

### If remote is not set
```bash
git remote add origin https://github.com/Dipto6969/GameTracker.git
```

### See commit history
```bash
git log --oneline
```

### Check environment variables exist locally
```bash
# On Windows PowerShell
echo $env:RAWG_API_KEY
```

### Test build locally before pushing
```bash
npm run build
```
