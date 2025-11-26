# GameTracker Deployment to Vercel - Complete Guide

## Prerequisites
- GitHub account (✅ You have this: https://github.com/Dipto6969/GameTracker)
- Vercel account (free tier available)
- Git installed on your computer
- Your local repository synced with GitHub

---

## Step 1: Prepare Your Local Repository

### 1.1 Initialize Git (if not already done)
```bash
cd f:\GameTracker
git init
```

### 1.2 Add remote origin
```bash
git remote add origin https://github.com/Dipto6969/GameTracker.git
```

### 1.3 Verify remote is set
```bash
git remote -v
```
You should see:
```
origin  https://github.com/Dipto6969/GameTracker.git (fetch)
origin  https://github.com/Dipto6969/GameTracker.git (push)
```

### 1.4 Stage all files
```bash
git add .
```

### 1.5 Create initial commit
```bash
git commit -m "Initial commit: GameTracker app with Phase 4 features"
```

### 1.6 Push to GitHub
```bash
git branch -M main
git push -u origin main
```

**Expected Output:**
```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX)
...
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## Step 2: Set Up Environment Variables

### 2.1 Create `.env.production` file in root
```bash
# f:\GameTracker\.env.production
```

### 2.2 Add required environment variables
```env
# RAWG API Key
RAWG_API_KEY=your_rawg_api_key_here

# Vercel KV Database (will set this in Vercel dashboard)
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_DATABASE_ID=
```

### 2.3 Get your RAWG API Key
1. Visit: https://rawg.io/api
2. Sign up for a free account
3. Copy your API key
4. Replace `your_rawg_api_key_here` with the actual key

### 2.4 DO NOT commit `.env.production`
```bash
# .env.production should already be in .gitignore
# Verify:
cat .gitignore | grep env
```

---

## Step 3: Create Vercel Account & Connect Repository

### 3.1 Sign up for Vercel
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### 3.2 Import your GitHub repository
1. On Vercel dashboard, click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Search for and select: `GameTracker`
4. Click "Import"

### 3.3 Configure project settings
**Framework Preset:** Should auto-detect as "Next.js" ✅

**Project Name:** `gametracker` (or your preferred name)

**Root Directory:** `./` (default)

Click "Deploy"

---

## Step 4: Add Environment Variables in Vercel

### 4.1 Go to Project Settings
1. In Vercel dashboard, go to your `gametracker` project
2. Click "Settings" tab
3. Click "Environment Variables" in left sidebar

### 4.2 Add RAWG API Key
1. Click "Add New"
   - **Name:** `RAWG_API_KEY`
   - **Value:** (paste your API key from Step 2.3)
   - **Environments:** Select all (Production, Preview, Development)
2. Click "Save"

### 4.3 Add KV Database Variables (Optional but Recommended)
For persistent game storage, use Vercel KV:

1. Click "Storage" tab
2. Click "Create Database" → "Vercel KV"
3. Choose region closest to you
4. Name it: `gametracker-kv`
5. Click "Create"

**The KV environment variables will be auto-added!** ✅

### 4.4 Verify All Variables
You should now have:
```
RAWG_API_KEY=xxxxxxxxxxxxx
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=xxxxxxxxxxxxx
KV_DATABASE_ID=xxxxxxxxxxxxx
```

---

## Step 5: Deploy

### 5.1 Trigger Deployment
After adding environment variables:
1. Go back to "Deployments" tab
2. Click "Redeploy" on the latest deployment
   OR
3. Push a new commit to GitHub (auto-triggers deployment)

### 5.2 Wait for Build
- Build takes ~2-3 minutes
- Watch the build logs for any errors

### 5.3 Check Build Status
✅ **Successful**: Green checkmark with "Ready"
❌ **Failed**: Red X, check logs for errors

---

## Step 6: Verify Deployment

### 6.1 Visit Your Live App
Click "Visit" button or go to the deployment URL:
- Format: `https://gametracker-xxxxx.vercel.app`

### 6.2 Test Core Features
- ✅ Load the app
- ✅ Search for a game
- ✅ Add a game to library
- ✅ View game details
- ✅ Check Trending Games modal
- ✅ Check Announcements modal
- ✅ Toggle dark mode
- ✅ Check if games persist (browser storage or KV)

---

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain
1. In Vercel dashboard, go to "Settings"
2. Click "Domains"
3. Click "Add Domain"
4. Enter your domain (e.g., `gametracker.com`)
5. Follow DNS configuration instructions

### 7.2 Point DNS
- Update your domain's DNS records at your registrar
- Usually takes 24-48 hours to propagate

---

## Troubleshooting

### Issue: Build Failed with "Missing Environment Variables"
**Solution:**
1. Go to Settings → Environment Variables
2. Verify `RAWG_API_KEY` is added
3. Redeploy by clicking "Redeploy"

### Issue: Build Failed - Module Not Found
**Solution:**
1. Check you committed `package.json` and `package-lock.yaml`
2. Verify all files pushed to GitHub
3. Run locally: `npm run build` to test

### Issue: Games Not Persisting
**Solution:**
1. If using KV database: Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
2. If using localStorage: Should work by default in browser
3. Clear browser cache and reload

### Issue: API Errors in Console
**Solution:**
1. Check RAWG API key is valid
2. Check rate limits: https://rawg.io/api (has rate limiting)
3. Check browser console (F12) for specific errors

### Issue: "Game not found" appears even for valid games
**Solution:**
1. RAWG API might be slow or rate-limited
2. Try searching for the game in search page first
3. Wait a moment and try again

---

## Continuous Deployment (Auto-Deploy on GitHub Push)

### Every time you:
```bash
git add .
git commit -m "Add new feature"
git push origin main
```

**Vercel automatically:**
1. Detects the push
2. Starts a new build
3. Deploys to production (if build succeeds)

---

## Monitoring & Logs

### View Deployment Logs
1. Vercel Dashboard → Deployments tab
2. Click on any deployment
3. View build logs or runtime logs

### View Production Errors
1. Click "Runtime Logs" on latest deployment
2. Refresh your app in browser to see real-time logs

---

## Performance Optimization

### Already Configured ✅
- Next.js 16 with Turbopack for fast builds
- Image optimization
- Code splitting
- CSS minification
- API caching (24-hour cache for popular games, upcoming games)

### Edge Functions
Vercel automatically uses Edge Functions for:
- `/api/search`
- `/api/listGames`
- `/api/addGame`
- etc.

---

## Security Notes

### Environment Variables
- Never commit `.env.local` or `.env.production`
- All secrets stored securely in Vercel
- Only your app can access them

### RAWG API Key
- Your API key is private
- Only used server-side (not exposed to client)
- Safe to share repo publicly

### KV Database
- Encrypted at rest
- Accessible only with valid tokens
- Tokens stored in Vercel (not in code)

---

## Summary Checklist

- [ ] Git repository initialized and pushed to GitHub
- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] RAWG_API_KEY added to environment variables
- [ ] KV Database created (optional but recommended)
- [ ] KV environment variables added
- [ ] Build completed successfully
- [ ] App deployed and accessible
- [ ] Tested core features on live app
- [ ] Custom domain configured (optional)

---

## Support Links

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **RAWG API:** https://rawg.io/api
- **Vercel KV:** https://vercel.com/docs/storage/vercel-kv

---

## Next Steps After Deployment

1. **Monitor Performance:** Check Vercel Analytics
2. **Track Errors:** Set up error monitoring (Sentry, LogRocket)
3. **User Feedback:** Add feedback form or Discord channel
4. **Future Features:** Plan Phase 5 enhancements
5. **Backup:** Regularly export user data

---

**Deployment Complete! 🚀**
Your GameTracker is now live on the internet! Share it with friends! 🎮
