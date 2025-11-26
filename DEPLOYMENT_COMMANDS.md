# 📋 GameTracker Deployment - Copy & Paste Commands

## 1️⃣ AFTER Creating GitHub Repository

Copy and paste this entire block into PowerShell:

```powershell
cd f:\GameTracker
git remote add origin https://github.com/YOUR_USERNAME/GameTracker.git
git branch -M main
git push -u origin main
```

⚠️ **Replace `YOUR_USERNAME` with your actual GitHub username**

Example:
```powershell
git remote add origin https://github.com/johnsmith/GameTracker.git
```

## 2️⃣ Verify Push Succeeded

```powershell
git log --oneline -1
git remote -v
```

You should see something like:
```
Initial commit: Complete GameTracker with all 4 phases
origin  https://github.com/YOUR_USERNAME/GameTracker.git (fetch)
origin  https://github.com/YOUR_USERNAME/GameTracker.git (push)
```

## 3️⃣ Environment Variable Setup

When Vercel asks for environment variables, use:

| Variable | Value |
|----------|-------|
| `RAWG_API_KEY` | Get from https://rawg.io/api (sign up, show API key) |

## ✅ Vercel Deployment Checklist

- [ ] Created GitHub account at https://github.com
- [ ] Created GameTracker repository on GitHub
- [ ] Ran `git push` successfully
- [ ] Signed up for Vercel at https://vercel.com/signup
- [ ] Connected Vercel to GitHub (OAuth)
- [ ] Imported GameTracker repository
- [ ] Clicked Deploy
- [ ] Added RAWG_API_KEY environment variable
- [ ] Deployment completed (green checkmark)
- [ ] Tested live URL - all features working
- [ ] Shared link with team!

## 🔗 Important Links

| Link | Purpose |
|------|---------|
| https://github.com/new | Create new repository |
| https://github.com/settings/tokens | Personal access tokens |
| https://vercel.com/signup | Sign up for Vercel |
| https://rawg.io/api | Get RAWG API key |
| YOUR_VERCEL_URL | Your live app (given after deploy) |

## 📞 Vercel URLs You'll See

After deployment:
- **Build URL:** Shows logs of build process
- **Live URL:** Your production app (like `gametracker-abc123.vercel.app`)
- **Domain settings:** Add custom domain here

## 🚨 If Something Goes Wrong

### Build failed?
```powershell
# Check logs in Vercel dashboard
# Or redeploy manually:
git push origin main
```

### Wrong environment variables?
1. Go to Vercel project → Settings → Environment Variables
2. Update variable
3. Click "Redeploy"

### Need to update code?
```powershell
cd f:\GameTracker
# Make your changes
git add .
git commit -m "Your change description"
git push origin main
# Vercel auto-deploys!
```

## 📊 Deployment Time Breakdown

| Step | Time | Notes |
|------|------|-------|
| Create GitHub repo | 2 min | One-time setup |
| Push to GitHub | 1 min | Local to GitHub |
| Sign up Vercel | 3 min | With GitHub OAuth |
| Import & Deploy | 2 min | Vercel auto-build |
| Add env variables | 1 min | Redeploy starts |
| Build completes | 2-3 min | Fast with Turbopack |
| **Total** | **~15 min** | First time only! |

## 🎯 First Time Only

After initial setup, future deployments are instant:
```powershell
# Make changes locally
git add .
git commit -m "Bug fix"
git push origin main
# ✅ Live in 30 seconds!
```

---

**You're ready! Follow the steps above and your GameTracker will be live! 🚀**
