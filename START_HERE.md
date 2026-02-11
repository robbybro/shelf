# 🚀 START HERE - Get Your App Running in 10 Minutes

## ✅ The App is Complete and Ready to Build!

Follow these simple steps to see your cookbook scanner in action.

## Step 1: Install EAS CLI (2 minutes)

```bash
npm install -g eas-cli
eas login
```

If you don't have an Expo account, create one at https://expo.dev (it's free!)

## Step 2: Choose Your Platform

### Option A: iOS Simulator (Fastest - Recommended for First Test)

```bash
# Build for iOS Simulator locally
eas build --profile development --platform ios --local
```

⏱️ **Time**: 5-10 minutes for first build

After build completes:

```bash
# Extract the build (replace filename with actual build file)
tar -xvzf <filename>.tar.gz

# Start iOS Simulator (via Xcode or command line)
open -a Simulator

# Install the app
xcrun simctl install booted Shelf.app

# Start the development server
npx expo start --dev-client

# Press 'i' to open in iOS simulator
```

### Option B: Android Phone (Best for Testing Camera)

```bash
# Build APK
eas build --profile preview --platform android
```

⏱️ **Time**: 10-15 minutes (cloud build)

After build completes:
1. EAS will provide a download URL
2. Open URL on your Android phone
3. Download and install APK
4. Grant camera permissions when prompted
5. Start using the app!

## Step 3: Test the App (2 minutes)

Once the app opens:

1. **Tap "New Scan"**
2. **Enter name**: "Test Cookbook"
3. **Scanner opens** in landscape mode
4. **See mock OCR results** on the right with red/yellow highlighting
5. **Tap "Next Page"** to save and increment
6. **Tap "Stop"** when done
7. **Tap your scan** on home screen
8. **Tap "Export as Markdown"** to share

## What You'll See

### Home Screen
- Empty state with "New Scan" button
- After creating scans, they'll appear in a list

### Scanner Screen
- **Left side (40%)**: Camera view
  - Will show camera permission request first time
  - iOS Simulator shows limited camera
- **Right side (60%)**: Markdown preview
  - Mock OCR text with confidence highlighting:
    - **Red background** = Low confidence (< 50%)
    - **Yellow background** = Medium confidence (50-80%)
    - **No highlight** = High confidence (> 80%)
  - Confidence meter at top
  - Legend at bottom

### Scan Detail
- Stats: pages, recipes, average confidence
- List of all pages
- Export button

## Troubleshooting

### "eas: command not found"

```bash
npm install -g eas-cli
```

### "Build failed"

```bash
# Clear and retry
eas build --clear-cache --profile development --platform ios
```

### "Can't install on simulator"

Make sure simulator is running first:

```bash
open -a Simulator
# Then retry install
xcrun simctl install booted Shelf.app
```

### "Camera permission not showing"

- iOS Simulator has limited camera support
- Test on real Android device for full camera functionality

## Next Steps

Once you've tested the app:

1. **Read** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - See everything that's been built
2. **Explore** the code in `src/` - All components are documented
3. **Customize** confidence thresholds in `src/constants/config.ts`
4. **Add real OCR** by following instructions in `src/hooks/useOCR.ts`
5. **Deploy to device** with EAS Build

## Quick Command Reference

```bash
# Build for iOS Simulator
eas build --profile development --platform ios --local

# Build for Android Phone
eas build --profile preview --platform android

# Start dev server
npx expo start --dev-client

# Push update to Android (after initial install)
eas update --branch preview --message "Bug fixes"

# Check build status
eas build:list
```

## Files to Explore

- [`README.md`](README.md) - Project overview
- [`BUILD_GUIDE.md`](BUILD_GUIDE.md) - Detailed build instructions
- [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) - What's been built
- [`EAS_COMMANDS.md`](EAS_COMMANDS.md) - EAS command reference
- [`SETUP.md`](SETUP.md) - Development setup guide

## Your First Build Command

Ready? Run this:

```bash
eas build --profile development --platform ios --local
```

Then grab a coffee ☕ while it builds (5-10 minutes)!

---

**Questions?** Check the guides above or visit https://docs.expo.dev

**Let's build!** 🚀
