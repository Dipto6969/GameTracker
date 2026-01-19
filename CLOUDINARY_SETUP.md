# 📸 Cloudinary Setup Guide for GameTracker Screenshots

## What is Cloudinary?

Cloudinary is a **free cloud storage service** for images that:
- ✅ Stores your screenshots permanently (no expiration)
- ✅ Works from any device (phone, PC, laptop)
- ✅ Automatically optimizes images for fast loading
- ✅ Provides **25GB free storage** (thousands of screenshots)
- ✅ **No payment method required** for free tier

---

## Step-by-Step Setup (5 minutes)

### 1️⃣ Create Free Cloudinary Account

1. Go to: https://cloudinary.com/users/register_free
2. Fill in:
   - **Email**: Your email address
   - **Password**: Create a password
   - **Cloud name**: Choose a unique name (e.g., `gametracker-yourname`)
   - Click **"Sign Up"**
3. Verify your email (check inbox/spam)
4. Log in to your Cloudinary dashboard

---

### 2️⃣ Get Your Cloud Name

1. After logging in, you'll see your **Dashboard**
2. Look for **"Cloud name"** near the top
3. **Copy this name** (e.g., `dxyz12345`)
4. Keep this tab open - you'll need it in step 4

---

### 3️⃣ Create Upload Preset

An upload preset allows your app to upload images securely without exposing your API secret.

1. In Cloudinary dashboard, click **"Settings"** (⚙️ gear icon in top right)
2. Click **"Upload"** tab in the left sidebar
3. Scroll down to **"Upload presets"** section
4. Click **"Add upload preset"** button
5. Configure the preset:
   - **Preset name**: `gametracker_uploads` (you can choose any name)
   - **Signing mode**: Select **"Unsigned"** ⚠️ **IMPORTANT!**
   - **Folder**: Leave blank or type `gametracker` (optional organization)
   - Leave other settings as default
6. Click **"Save"**
7. **Copy the preset name** you just created

---

### 4️⃣ Add to Your Project

Now we'll add your Cloudinary credentials to GameTracker:

1. **Open your project folder** in VS Code (where you already are!)
2. **Create a `.env.local` file** in the root folder (if it doesn't exist)
3. Add these two lines (replace with YOUR values from steps 2 & 3):

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=gametracker_uploads
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxyz12345
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=gametracker_uploads
```

4. **Save the file** (Ctrl+S / Cmd+S)

---

### 5️⃣ Restart Your Development Server

**Important:** Environment variables are only loaded when the server starts.

1. **Stop your dev server** (if running):
   - Press `Ctrl+C` in the terminal where `pnpm dev` is running
2. **Start it again**:
   ```bash
   pnpm dev
   ```

---

### 6️⃣ Test It Out! 🎉

1. Open your app in the browser: http://localhost:3000
2. Click on any game in your library
3. Go to the **"📸 Screenshots"** tab
4. Click **"Upload"** button
5. Select a screenshot from your device
6. Watch it upload! ☁️

---

## ✅ Verification

If everything is working, you should see:
- ✅ Upload progress percentage
- ✅ Screenshot appears in the gallery
- ✅ Screenshot persists when you refresh the page
- ✅ Screenshot loads from any device

---

## 🚨 Troubleshooting

### Error: "Cloudinary configuration missing"
**Problem:** Environment variables not set or not loaded
**Solution:**
1. Check `.env.local` file exists in project root (same folder as `package.json`)
2. Verify variable names are EXACTLY: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
3. Restart dev server (`Ctrl+C`, then `pnpm dev`)

### Error: "Upload failed"
**Problem:** Upload preset is not "Unsigned"
**Solution:**
1. Go to Cloudinary Settings → Upload → Upload presets
2. Click your preset
3. Change **"Signing mode"** to **"Unsigned"**
4. Save

### Screenshots don't show up
**Problem:** Images uploaded but not saved to database
**Solution:**
1. Check browser console (F12) for errors
2. Verify you're logged into the game detail page
3. Make sure you clicked "Upload" after selecting files

### "413 Request Entity Too Large" error
**Problem:** Image file is too big
**Solution:**
- Max file size is **10MB per image**
- Try compressing your screenshot before uploading
- Or use a smaller resolution screenshot

---

## 🎓 How It Works

### When you upload a screenshot:
1. **Your browser** sends the image directly to Cloudinary (not your server)
2. **Cloudinary** stores it and returns a URL (e.g., `https://res.cloudinary.com/...`)
3. **Your app** saves that URL to your database (Vercel KV)
4. **When viewing**, images load from Cloudinary's fast CDN

### Data locations:
- **Screenshots (images)**: Stored on Cloudinary
- **Screenshot URLs**: Stored in Vercel KV database (or `.games.json` locally)
- **Game data**: Same as before (Vercel KV / `.games.json`)

---

## 🔒 Security Notes

- ✅ **Unsigned uploads are safe** for this use case (personal app)
- ⚠️ Anyone with your preset name could upload to your Cloudinary (but they'd need to know it)
- 🛡️ For production apps with public users, you'd use signed uploads with backend authentication

---

## 📊 Managing Your Storage

### View uploaded screenshots:
1. Go to Cloudinary dashboard
2. Click **"Media Library"**
3. You'll see all your game screenshots organized by game ID

### Delete screenshots:
- **Option 1:** Use the trash button in GameTracker (recommended)
- **Option 2:** Manually delete in Cloudinary Media Library

### Check storage usage:
- Dashboard shows usage (e.g., "2.3 GB / 25 GB used")
- Free tier: **25GB** (about 5,000-10,000 screenshots)

---

## 🚀 Deploy to Production (Vercel)

When you deploy to Vercel:

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add the same two variables:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = `your-cloud-name`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` = `gametracker_uploads`
4. Redeploy your app

Screenshots will work on production! 🎉

---

## 💡 Tips

- **Organize by folders**: In Cloudinary settings, you can auto-organize uploads by game
- **Auto-optimize**: Cloudinary automatically compresses images for faster loading
- **Mobile uploads**: Screenshots work great from phones/tablets too
- **Backup**: Export JSON includes screenshot URLs, so you can always restore

---

## ❓ Questions?

- **Cloudinary docs**: https://cloudinary.com/documentation
- **Upload presets guide**: https://cloudinary.com/documentation/upload_presets

---

## 🎮 What's Next?

Now that screenshots are working:
1. ✅ Upload screenshots of your favorite gaming moments
2. ✅ Use the **Export** feature to share your library
3. ✅ All screenshots are backed up in the cloud forever!

Happy gaming! 🎮✨
