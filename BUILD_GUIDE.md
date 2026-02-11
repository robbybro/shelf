# Quick Build Guide - Shelf App

## ✅ App is Ready to Build!

All code is complete. Here's how to build and test it.

## Option 1: Test on iOS Simulator (Fastest)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Step 2: Build Development Client

```bash
# Local build (recommended - faster)
eas build --profile development --platform ios --local

# Wait for build to complete (~5-10 minutes)
# It will create a .tar.gz file
```

### Step 3: Install on Simulator

```bash
# Extract the build
tar -xvzf <your-build-file>.tar.gz

# Install in simulator (make sure simulator is running)
xcrun simctl install booted Shelf.app

# Start the dev server
npx expo start --dev-client

# Press 'i' to open in iOS simulator
```

## Option 2: Test on Android Phone (Recommended for Camera)

### Step 1: Build APK

```bash
eas login
eas build --profile preview --platform android
```

### Step 2: Install on Phone

1. EAS will provide a download URL after build completes
2. Open the URL on your Android phone
3. Download and install the APK
4. Grant camera permissions when prompted

### Step 3: Push Updates

After initial install, you can push OTA updates:

```bash
# Make code changes
eas update --branch preview --message "Bug fixes"

# App will auto-download update next time you open it
```

## What Works Now

✅ **Working Features:**
- Home screen with scan list
- Create new scans
- Scanner screen with split-screen layout
- Camera view (will show camera permission request)
- Mock OCR results for testing
- Markdown preview with confidence highlighting (red/yellow)
- Pause/resume scans
- Export to markdown
- Scan detail screen with stats

🚧 **Needs ML Kit Integration for Production:**
- Real OCR is currently mocked with sample data
- To add real OCR, follow instructions in `src/hooks/useOCR.ts`

## Testing the App

### Test Flow:

1. **Open app** → See home screen
2. **Tap "New Scan"** → Enter cookbook name
3. **Scanner opens** → See split screen
   - Left: Camera view (or permission request)
   - Right: Markdown preview with confidence colors
4. **Mock OCR runs** → See sample text with red/yellow highlighting
5. **Tap "Next Page"** → Saves current page, increments counter
6. **Tap "Stop"** → Returns to home
7. **Tap the scan** → See scan details
8. **Tap "Export"** → Share markdown file

## Troubleshooting

### Build Fails

```bash
# Clear cache and retry
npm install
eas build --clear-cache --profile development --platform ios
```

### Camera Permission Issues

- Make sure to grant camera permission when prompted
- On iOS simulator, camera is limited (use static images)
- Test on real Android device for full camera functionality

### App Crashes on Startup

- Check that you're using the dev client, not Expo Go
- Verify all dependencies are installed: `npm install`
- Check EAS build logs for errors

## Quick Reference Commands

```bash
# Build for iOS Simulator
eas build --profile development --platform ios --local

# Build for Android Phone
eas build --profile preview --platform android

# Start dev server
npx expo start --dev-client

# Push OTA update
eas update --branch preview --message "Update message"

# View builds
eas build:list

# View updates
eas update:list
```

## Next Steps After Building

1. **Test the flow**: Create a scan, capture pages, export markdown
2. **Add real OCR**: Follow instructions in `src/hooks/useOCR.ts` to integrate ML Kit
3. **Customize**: Adjust confidence thresholds in `src/constants/config.ts`
4. **Add assets**: Replace placeholder icons with real ones
5. **Deploy**: Use EAS to distribute to testers or app stores

Ready to build? Run:

```bash
eas build --profile development --platform ios --local
```

Good luck! 🚀
