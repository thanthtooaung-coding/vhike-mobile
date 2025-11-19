# Setup Guide for M-Hike Hybrid

## Quick Start

1. **Install Dependencies**
   ```bash
   cd M-Hike-Hybrid
   npm install
   ```

2. **Start the App**
   ```bash
   npm start
   ```

3. **Run on Device/Emulator**
   - Scan QR code with Expo Go app (for testing)
   - Or run `npm run android` / `npm run ios`

## Project Structure

This app uses **React Navigation** (not Expo Router). The `app/` folder from the Expo Router template is not used.

### Key Files
- `App.tsx` - Main app component with navigation
- `index.js` - Entry point
- `src/` - All source code
  - `context/` - Global state management
  - `database/` - SQLite database layer
  - `navigation/` - React Navigation setup
  - `screens/` - All screen components
  - `services/` - External API services
  - `types/` - TypeScript definitions

## Features Implemented

✅ **Hike Management**
- List all hikes
- Add/Edit/Delete hikes
- View hike details
- Hike confirmation screen

✅ **Observations**
- Add observations to hikes
- Edit/Delete observations
- Photo upload (GitHub integration)
- View observation details

✅ **Search & Filter**
- Search by name, location, date, length range
- Reset filters

✅ **Maps**
- Location picker
- Current location detection
- Reverse geocoding

✅ **Database**
- SQLite local storage
- Full CRUD operations
- Search functionality

## Configuration

### Google Maps API Key

Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_API_KEY"
      }
    }
  }
}
```

### GitHub Integration

Configure in `src/context/AppContext.tsx`:
```typescript
const token = 'YOUR_GITHUB_TOKEN';
const owner = 'YOUR_GITHUB_USERNAME';
const repo = 'YOUR_REPOSITORY_NAME';
const folder = 'photos';
```

## Troubleshooting

### If you see Expo Router errors
- This app uses React Navigation, not Expo Router
- The `app/` folder is not used
- Make sure `main` in `package.json` points to `index.js`

### Database Issues
- Clear app data: Settings > Apps > Expo Go > Clear Data
- Or uninstall and reinstall Expo Go

### Maps Not Showing
- Verify Google Maps API key is configured
- Check billing is enabled on Google Cloud project

## Next Steps

1. Configure Google Maps API key
2. Set up GitHub integration (optional)
3. Test all features
4. Customize UI/UX as needed

