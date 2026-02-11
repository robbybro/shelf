import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useScansStore } from '../store/scansStore';
import { useSettingsStore } from '../store/settingsStore';

export default function RootLayout() {
  const loadScans = useScansStore((state) => state.loadScans);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    // Load persisted data on app start
    loadScans();
    loadSettings();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Shelf',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="scanner"
          options={{
            title: 'Scan Cookbook',
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="scan/[id]"
          options={{
            title: 'Scan Details',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
