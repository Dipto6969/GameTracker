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

## 📚 Full Documentation:

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
