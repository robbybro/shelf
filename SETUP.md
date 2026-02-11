# Shelf - Cookbook Scanner App Setup Guide

Welcome to Shelf! This guide will help you set up the development environment and build the app.

## Project Status

✅ **Completed:**
- ✅ Expo project initialized with TypeScript
- ✅ Core dependencies installed
- ✅ Project structure created
- ✅ TypeScript type definitions
- ✅ Zustand state management stores
- ✅ OCR processing services (RecipeParser, TextProcessor)
- ✅ Storage services (ScanStorage, MarkdownExporter)
- ✅ Basic app screens (Home, Scanner, Scan Detail)
- ✅ EAS Build configuration

🚧 **To be implemented:**
- 🚧 Camera integration (react-native-vision-camera)
- 🚧 OCR hooks and frame processing
- 🚧 Camera UI components
- 🚧 Markdown preview with confidence highlighting
- 🚧 Asset images (icon, splash screen)

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli eas-cli`
- Xcode (for iOS development)
- Android Studio (for Android development)
- EAS account (create at https://expo.dev)

## Installation

### 1. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### 2. Create Placeholder Assets

The app needs some basic image assets. Create simple placeholders:

```bash
# Create a simple placeholder icon (you can use any image editor)
# Or use expo prebuild to generate defaults:
npx expo prebuild --clean
```

Alternatively, copy any 1024x1024 PNG images to:
- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash.png` (1284x2778 or similar)
- `assets/favicon.png` (48x48)

### 3. Run in Development Mode

**Important:** This app uses custom native modules (vision-camera, ML Kit) that require a custom development build. You **cannot** use `expo start` or Expo Go directly.

## EAS Build Setup

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to EAS

```bash
eas login
```

Create an account at https://expo.dev if you don't have one.

### Step 3: Configure EAS Project

```bash
# Initialize EAS project
eas build:configure

# Link to your Expo account
eas init
```

### Step 4: Build for iOS Simulator (Local Build)

For faster iteration during development, build locally:

```bash
# Build for iOS simulator
eas build --profile development --platform ios --local
```

This will create a `.tar.gz` file. Extract it and install the `.app` file:

```bash
# Extract the build
tar -xvzf <build-file>.tar.gz

# Install in simulator
xcrun simctl install booted Shelf.app
```

**Or use EAS cloud build:**

```bash
eas build --profile development --platform ios
```

Download the build from the EAS website and drag the `.app` to your simulator.

### Step 5: Run the Development Client

Once installed, start the dev server:

```bash
npx expo start --dev-client
```

Press `i` to open in iOS simulator.

### Step 6: Build for Android Device

To test on your Android phone:

```bash
# Build APK for internal distribution
eas build --profile preview --platform android
```

This will create an APK you can download and install directly on your Android phone.

**Download the APK:**
1. EAS will provide a download URL
2. Open URL on your Android device
3. Install the APK (you may need to allow "Install from unknown sources")

### Step 7: Set Up Over-The-Air Updates

After installing the custom build, you can push updates without rebuilding:

```bash
# Make code changes (no native changes)
# Then push an OTA update:
eas update --branch preview --message "Updated recipe parser"
```

Your app will automatically download the update.

## Development Workflow

### Testing on iOS Simulator

1. Build development client (once): `eas build --profile development --platform ios`
2. Install the app on simulator
3. Start dev server: `npx expo start --dev-client`
4. Make changes and hot reload

### Testing on Android Device

1. Build APK (once): `eas build --profile preview --platform android`
2. Install APK on device
3. For updates, use: `eas update --branch preview`

### Local Development Tips

- Use iOS Simulator for quick testing
- For OCR testing on simulator, use static images from photo library
- Test camera functionality on real Android device
- Use EAS Updates for quick iterations on device

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Home (scan list)
│   ├── scanner.tsx         # Split-screen scanner
│   └── scan/[id].tsx       # Scan details
├── components/             # React components (to be added)
├── hooks/                  # Custom hooks (to be added)
├── services/
│   ├── ocr/                # OCR processing
│   │   ├── RecipeParser.ts
│   │   └── TextProcessor.ts
│   └── storage/            # File storage
│       ├── ScanStorage.ts
│       └── MarkdownExporter.ts
├── store/                  # Zustand state
│   ├── scansStore.ts
│   ├── activeScanStore.ts
│   └── settingsStore.ts
├── types/                  # TypeScript definitions
├── utils/                  # Utility functions
└── constants/              # App constants
```

## Next Steps to Complete the App

### 1. Implement Camera Components

Create components in `src/components/camera/`:

- `CameraView.tsx` - Wraps react-native-vision-camera
- `CameraControls.tsx` - Start/stop/capture buttons
- `OCROverlay.tsx` - Visual feedback for detected text

### 2. Implement OCR Hook

Create `src/hooks/useOCR.ts`:

- Set up frame processor with `@react-native-ml-kit/text-recognition`
- Process frames and convert to `OCRResult[]`
- Handle confidence scores

### 3. Implement Markdown Preview

Create components in `src/components/markdown/`:

- `MarkdownPreview.tsx` - Display processed text
- `ConfidenceHighlight.tsx` - Color-coded text highlighting

### 4. Integrate Camera into Scanner Screen

Update `src/app/scanner.tsx` to:

- Use CameraView component
- Process OCR results in real-time
- Display markdown preview with highlighting
- Handle page capture and navigation

### 5. Add Camera Permissions

The app config already includes camera permissions, but you'll need to handle runtime permissions in the camera component.

## Troubleshooting

### Build Fails

- Ensure you're logged into EAS: `eas whoami`
- Check that all dependencies are compatible
- Try `npm install` again

### Camera Not Working on Simulator

- iOS Simulator has limited camera support
- Use static images for testing
- Test camera on real device

### OTA Updates Not Applying

- Ensure you're using the same branch: `--branch preview`
- Updates only work for JS changes, not native code
- Close and reopen the app to fetch updates

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [React Native Vision Camera](https://react-native-vision-camera.com/)
- [ML Kit Text Recognition](https://developers.google.com/ml-kit/vision/text-recognition)

## Support

If you encounter issues:

1. Check the EAS build logs
2. Review the Expo documentation
3. Check react-native-vision-camera GitHub issues
4. Verify all dependencies are installed correctly

Happy scanning! 📚📱
