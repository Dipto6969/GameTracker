# 🚀 Quick Start Guide

## ⚡ To Use Screenshots Feature:

### 1. Setup Cloudinary (5 minutes):
```bash
# 1. Sign up at: https://cloudinary.com/users/register_free
# 2. Copy your cloud name from dashboard
# 3. Create upload preset (Settings → Upload → Add preset)
#    - Set "Signing mode" to "Unsigned"
# 4. Edit .env.local file with your values:
```

Edit `.env.local`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-actual-preset-name
```

### 2. Restart Server:
```bash
# Stop server (Ctrl+C), then:
pnpm dev
```

### 3. Test It:
- Open any game
- Click "📸 Screenshots" tab
- Upload images!

---

## 🎯 To Use Export Feature:

**No setup needed!** Just click:
- **"Export Library"** button on homepage
- Filter and export your games
- Download JSON or Print to PDF

---

## � To Use Gaming News Feature:

### 1. Get NewsAPI Key (2 minutes):
```bash
# 1. Sign up at: https://newsapi.org/register
# 2. Copy your API key from the dashboard
# 3. Add to .env.local:
```

Edit `.env.local`:
```env
NEWS_API_KEY=your-newsapi-key-here
```

### 2. Restart Server:
```bash
# Stop server (Ctrl+C), then:
pnpm dev
```

### 3. That's it!
Click **"NEWS"** in the navigation bar to access the Gaming News page with:
- Latest gaming headlines from top sources
- **Advanced Filters:**
  - 🔍 Keyword search (e.g., "Elden Ring", "GTA 6")
  - 📅 Date range (Last 24h, 7 days, 30 days, All)
  - 🎮 Category (Releases, Updates, Esports, Industry, Reviews)
  - 🖥️ Platform (PC, PlayStation, Xbox, Nintendo, Mobile)
  - 📊 Sort by (Newest, Oldest, Most Relevant)
- Load more pagination
- Cached for 1 hour (to save API calls)

**Note:** Free tier = 100 requests/day. We cache aggressively to stay well under this limit.

---

## �📚 Full Documentation:

- **`CLOUDINARY_SETUP.md`** - Complete Cloudinary setup guide
- **`IMPLEMENTATION_GUIDE.md`** - Features overview & testing

---

## ❓ Common Issues:

### "Cloudinary configuration missing"
→ Edit `.env.local` and restart server

### Screenshots don't appear
→ Check upload preset is "Unsigned" in Cloudinary settings

### Export page 404
→ Refresh browser (Next.js needs to rebuild)

---

That's it! 🎉
