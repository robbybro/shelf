module.exports = {
  expo: {
    name: 'Shelf',
    slug: 'shelf',
    version: '1.0.0',
    orientation: 'default',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    extra: {
      eas: {
        projectId: 'f31d3257-10a1-4bd5-8b99-f8c10aade29b',
      },
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shelf.app',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          'Shelf needs camera access to scan cookbook pages and extract recipes.',
        UIRequiresFullScreen: false,
        UILaunchStoryboardName: 'SplashScreen',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: ['CAMERA'],
      package: 'com.shelf.app',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'react-native-vision-camera',
        {
          cameraPermissionText:
            'Shelf needs camera access to scan cookbook pages.',
          enableMicrophonePermission: false,
        },
      ],
      'expo-screen-orientation',
    ],
    experiments: {
      typedRoutes: true,
    },
    scheme: 'shelf',
  },
};
