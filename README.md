# Shelf - Cookbook Scanner App

A React Native app for digitizing analog cookbooks using OCR (Optical Character Recognition). Point your phone at cookbook pages and instantly convert recipes to searchable markdown format.

## Features

🎥 **Split-Screen Scanning** - Camera view + real-time preview
📝 **Smart OCR** - On-device text recognition with ML Kit
🎨 **Confidence Highlighting** - Red/yellow/none based on OCR confidence
📄 **Markdown Export** - Export entire cookbooks as .md files
💾 **Scan Management** - Start, pause, resume scans
📊 **Recipe Parsing** - Auto-extract titles, ingredients, instructions

## Quick Start

### For Development

See [SETUP.md](./SETUP.md) for detailed instructions.

```bash
# Install dependencies (already done)
npm install

# IMPORTANT: Generate native projects first (required for local builds)
npx expo prebuild --platform ios --clean

# Build development client for iOS simulator
eas build --profile development --platform ios --local

# Start dev server
npx expo start --dev-client
```

**Note:** Local builds require running `npx expo prebuild` first to generate native iOS/Android projects and install CocoaPods/dependencies.

### For Android Testing

```bash
# Build APK for your Android phone
eas build --profile preview --platform android

# Install the downloaded APK on your device
```

## Tech Stack

- **Framework:** Expo 52 + React Native
- **Navigation:** Expo Router
- **Camera:** react-native-vision-camera
- **OCR:** @react-native-ml-kit/text-recognition
- **State:** Zustand
- **Storage:** react-native-mmkv + expo-file-system
- **Build:** EAS Build

## Project Status

✅ **Core Infrastructure Complete:**
- Project setup with TypeScript
- State management (Zustand stores)
- OCR processing services
- Storage & export services
- Basic UI screens
- EAS Build configuration

🚧 **Next Steps:**
- Implement camera integration
- Build OCR hooks
- Create markdown preview with highlighting
- Add asset images

## EAS Setup Instructions

### Prerequisites

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`

### Step 1: Development Build (iOS Simulator)

```bash
# Local build (faster)
eas build --profile development --platform ios --local
```

Extract and install:
```bash
tar -xvzf <build>.tar.gz
xcrun simctl install booted Shelf.app
npx expo start --dev-client
```

### Step 2: Preview Build (Android Phone)

```bash
# Build APK
eas build --profile preview --platform android
```

Download from EAS and install on your Android device.

### Step 3: Continuous Integration (OTA Updates)

After installing the custom build:

```bash
# Make code changes (JS only)
eas update --branch preview --message "Your update message"
```

Your device will auto-download the update.

## Architecture

```
src/
├── app/                 # Screens (Expo Router)
├── components/          # React components
├── hooks/               # Custom hooks
├── services/
│   ├── ocr/            # Recipe parsing, text processing
│   └── storage/        # File system operations
├── store/              # Zustand state stores
├── types/              # TypeScript definitions
├── utils/              # Helper functions
└── constants/          # App configuration
```

## How It Works

1. **Start Scan**: Create a named scan session
2. **Capture Pages**: Camera processes each page with ML Kit OCR
3. **Parse Recipes**: Extract titles, ingredients, instructions
4. **Preview**: See extracted text with confidence highlighting
5. **Export**: Generate markdown file with all recipes

## Confidence Highlighting

- **Red** (< 50%): Low confidence - review carefully
- **Yellow** (50-80%): Medium confidence - double-check
- **No highlight** (> 80%): High confidence

## License

MIT

## Learn More

- [Setup Guide](./SETUP.md)
- [Expo Documentation](https://docs.expo.dev/)
- [Vision Camera Docs](https://react-native-vision-camera.com/)
- [ML Kit Text Recognition](https://developers.google.com/ml-kit/vision/text-recognition)
