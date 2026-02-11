# EAS Build Quick Reference

This is your quick reference for all EAS commands needed to build and deploy the Shelf app.

## Initial Setup (One-Time)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Link project to EAS (if not already done)
eas init

# Configure builds (already configured)
eas build:configure
```

## iOS Simulator Development

### Local Build (Recommended - Faster)

```bash
# Build for iOS simulator locally
eas build --profile development --platform ios --local

# This creates a .tar.gz file
# Extract it:
tar -xvzf <filename>.tar.gz

# Install in simulator:
xcrun simctl install booted Shelf.app

# Start dev server:
npx expo start --dev-client

# Press 'i' to open in iOS simulator
```

### Cloud Build (Alternative)

```bash
# Build on EAS servers
eas build --profile development --platform ios

# Download the .app from EAS dashboard
# Drag and drop into iOS Simulator
# Then run: npx expo start --dev-client
```

## Android Phone Deployment

### Build APK for Direct Installation

```bash
# Build APK (can install directly on any Android device)
eas build --profile preview --platform android

# EAS will provide a download URL
# Open URL on your Android phone and install
# Or download and install via ADB:
adb install <filename>.apk
```

### Build AAB for Play Store (Future)

```bash
# When ready for Play Store
eas build --profile production --platform android
```

## Over-The-Air Updates

After you have the custom development build installed:

```bash
# Push JS-only updates (no native code changes)
eas update --branch preview --message "Updated recipe parser"

# For development build:
eas update --branch development --message "Bug fixes"

# Check published updates:
eas update:list
```

## Continuous Integration to Android

### Setup Automatic Updates

1. **Initial Build**: Build and install the preview APK once:

   ```bash
   eas build --profile preview --platform android
   ```

2. **Make Changes**: Edit your TypeScript/JavaScript code

3. **Push Updates**: Deploy updates without rebuilding:

   ```bash
   eas update --branch preview --message "Added new feature"
   ```

4. **Auto-Update**: Your Android phone will auto-download the update when you reopen the app

### Automated Builds on Git Push (Optional)

Create `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: expo/expo-github-action@v7
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform android --non-interactive
```

## Build Profiles Explained

### Development Profile (`development`)

- **Purpose**: Local development and testing
- **iOS**: Builds for simulator
- **Android**: Debug APK
- **Features**: Hot reload, dev tools, debug mode

### Preview Profile (`preview`)

- **Purpose**: Internal testing
- **iOS**: Can run on real devices (requires provisioning)
- **Android**: APK for direct installation
- **Features**: Optimized but not production

### Production Profile (`production`)

- **Purpose**: App store releases
- **iOS**: Optimized for App Store
- **Android**: AAB for Play Store
- **Features**: Fully optimized, signed

## Troubleshooting

### Build Failed

```bash
# Check build status
eas build:list

# View build logs
eas build:view <build-id>

# Clear and rebuild
npm install
eas build --profile preview --platform android --clear-cache
```

### Update Not Applying

```bash
# Check update status
eas update:list

# Force a new update
eas update --branch preview --message "Force update"

# View update details
eas update:view <update-id>
```

### Check EAS Status

```bash
# Verify you're logged in
eas whoami

# Check project configuration
eas config

# View all builds
eas build:list

# View all updates
eas update:list
```

## Common Workflows

### Daily Development (iOS Simulator)

```bash
# One-time setup:
eas build --profile development --platform ios --local
# Install Shelf.app in simulator

# Every day:
npx expo start --dev-client
# Press 'i' for iOS simulator
# Edit code and hot reload
```

### Testing on Android Phone

```bash
# First time:
eas build --profile preview --platform android
# Install APK on phone

# After changes:
eas update --branch preview --message "Bug fixes"
# Phone auto-downloads update
```

### Releasing New Version

```bash
# Update version in app.config.js
# Commit changes

# Build for production
eas build --profile production --platform android
eas build --profile production --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## EAS Dashboard

Access web dashboard: https://expo.dev/accounts/[your-username]/projects/shelf

- View all builds
- Download APKs
- Monitor updates
- Check analytics
- Manage credentials

## Cost & Limits

**Free Tier:**

- Build minutes: Limited (check https://expo.dev/pricing)
- Updates: Unlimited
- Bandwidth: Generous limits

**Paid Plans:**

- More build minutes
- Priority build queue
- Dedicated support

## Next Steps

1. ✅ Install EAS CLI and login
2. ✅ Build development client for iOS simulator
3. ✅ Test the app on simulator
4. Build preview APK for Android phone
5. Set up OTA updates workflow
6. (Optional) Configure GitHub Actions for CI

## Support

- EAS Docs: https://docs.expo.dev/build/introduction/
- EAS Updates: https://docs.expo.dev/eas-update/introduction/
- Expo Forums: https://forums.expo.dev/

## Robby's workflow

- `npx expo prebuild --platform android --clean`
- `eas build --profile development --platform android --local`
- `adb -s 48061FDAS004WJ install  build-1770845278745.apk`
- `npx expo start`
