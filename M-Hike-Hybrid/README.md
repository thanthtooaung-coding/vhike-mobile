# M-Hike Hybrid - React Native TypeScript App

A React Native hybrid application built with TypeScript and Expo, replicating all features from the Kotlin Android app. This is a hiking app that allows users to track hikes, add observations, search hikes, and manage their hiking data.

## Features

- **Hike Management**
  - List all hikes
  - Add/Edit hikes with comprehensive details
  - Delete hikes
  - View hike details

- **Observations**
  - Add observations linked to hikes
  - Edit and delete observations
  - Add photos to observations (with GitHub integration)
  - View observation details

- **Search & Filter**
  - Search hikes by name, location, date, and length range
  - Filter results dynamically

- **Maps**
  - Pick location on map
  - Get current location
  - Geocoding support

- **Data Persistence**
  - SQLite database for local storage
  - All data stored locally on device

## Prerequisites

- Node.js >= 18
- npm or yarn
- Expo CLI (or use npx)

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the App

### Start Expo Development Server
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

### Run on Web
```bash
npm run web
```

## Project Structure

```
M-Hike-Hybrid/
├── src/
│   ├── context/          # App context and state management
│   ├── database/         # SQLite database layer
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   ├── services/         # External services (GitHub)
│   └── types/            # TypeScript type definitions
├── App.tsx               # Main app component
├── index.js              # Entry point
└── package.json          # Dependencies
```

## Key Technologies

- **Expo SDK 54** - React Native framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **Expo SQLite** - Local database
- **React Native Maps** - Map integration
- **Expo Image Picker** - Photo selection
- **Expo Location** - Location services
- **Octokit** - GitHub API integration

## Configuration

### Google Maps API Key

For maps functionality, configure in `app.json`:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_API_KEY_HERE"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_API_KEY_HERE"
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

## Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## License

See LICENSE file for details.
