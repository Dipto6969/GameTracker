# YouTube API Setup for Video Fallback

The app now uses YouTube as a fallback when RAWG doesn't have game trailers.

## Quick Setup (2 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a Project** (if you don't have one)
   - Click "Select a Project" → "New Project"
   - Name it "GameTracker" → Create

3. **Enable YouTube Data API v3**
   - Search for "YouTube Data API v3" in the search bar
   - Click on it → Click "Enable"

4. **Create API Key**
   - Go to "Credentials" (left sidebar)
   - Click "Create Credentials" → "API Key"
   - Copy the API key

5. **Add to Your Project**
   - Open `.env.local` file (create if it doesn't exist)
   - Add this line:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```

6. **Restart Your Dev Server**
   ```bash
   npm run dev
   ```

## How It Works

- **First**: Tries to get video from RAWG API
- **Fallback**: If no RAWG video, searches YouTube for "{game name} official trailer"
- **Result**: Almost every game now has a video preview on hover!

## Free Tier Limits

- **10,000 quota units per day** (more than enough)
- Each search costs 100 units = **100 searches per day**
- Resets daily at midnight Pacific Time

## Without YouTube API

The app works fine without it - you'll just only see trailers for games that have them in RAWG (fewer games).
