# Game Tracker - Complete Deployment Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- A GitHub account with the code pushed
- A Vercel account (free at vercel.com)
- A RAWG API key (free at rawg.io/api)

---

## Step 1: Get Your RAWG API Key (2 minutes)

1. Go to https://rawg.io/api
2. Click "Sign Up" or sign in
3. Go to your profile settings
4. Copy your API key (you'll use this in step 4)

---

## Step 2: Push Code to GitHub

1. Create a new GitHub repository
2. Push this project to your repository:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit: Game Tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/game-tracker.git
   git push -u origin main
   \`\`\`

---

## Step 3: Connect to Vercel

1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Select "Import Git Repository"
4. Paste your GitHub repository URL and import it
5. Vercel will auto-detect this is a Next.js project ✓

---

## Step 4: Add Environment Variables

1. In Vercel project settings, go to "Environment Variables"
2. Add this variable:
   - **Name**: `RAWG_API_KEY`
   - **Value**: Paste your RAWG API key from Step 1
3. Click "Save"

---

## Step 5: Add Vercel KV (Storage)

### Option A: Using Vercel KV (Recommended - Free tier available)

1. In your Vercel project, go to the "Storage" tab
2. Click "Create Database" → Select "KV"
3. Choose a region and create the database
4. The environment variables will be auto-added! ✓

### Option B: Skip KV (Temporary Storage)
- The app will work with in-memory storage only
- Data will be lost if your application restarts
- Not recommended for production

---

## Step 6: Deploy

1. After adding the environment variables and KV integration:
2. Click "Deploy" in Vercel
3. Wait for the build to complete (usually 1-2 minutes)
4. Your app will be live at your-project-name.vercel.app ✓

---

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] Homepage loads (shows "Your Game Library")
- [ ] Search page works (type a game name)
- [ ] Can add games from search results
- [ ] Added games appear in library
- [ ] Click on a game shows details
- [ ] No console errors (check browser dev tools)

---

## 🔧 Local Development (Optional)

If you want to test locally before deploying:

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Create .env.local file
cp .env.local.example .env.local

# 3. Add your RAWG API key to .env.local
# (KV won't work locally without setup, but search will)

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
\`\`\`

---

## 📊 Project Architecture

\`\`\`
API Flow:
┌─────────────────────────────────────────────┐
│  Frontend (Next.js Pages)                   │
├─────────────────────────────────────────────┤
│  /api/search      → RAWG API (game search)  │
│  /api/addGame     → Vercel KV (save game)   │
│  /api/listGames   → Vercel KV (get games)   │
└─────────────────────────────────────────────┘
\`\`\`

---

## 🐛 Troubleshooting

### "Games not saving"
- Check: Is Vercel KV integrated? (Storage tab in Vercel)
- Check: Are `KV_REST_API_URL` and `KV_REST_API_TOKEN` in environment variables?

### "Search not working"
- Check: Is `RAWG_API_KEY` in environment variables?
- Check: Did you use your actual RAWG API key (not placeholder)?

### "Build failing"
- Check: Look at the build logs in Vercel
- Try redeploying: Go to Deployments → Click latest → Redeploy

### "Blank page after deployment"
- Wait 30 seconds (deployment might still be optimizing)
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

---

## 📈 Next Steps (Optional Enhancements)

- Add user authentication (Supabase or Vercel Auth)
- Add game reviews/ratings
- Add favorites feature
- Add tags/categories
- Add export to CSV

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **RAWG API Docs**: https://api.rawg.io/docs/
- **Next.js Docs**: https://nextjs.org/docs

Happy gaming! 🎮
