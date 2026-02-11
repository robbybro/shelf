import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { useCamera } from '../../hooks/useCamera';
import { Colors } from '../../constants';

interface CameraViewProps {
  onFrameCapture?: (imageUri: string) => void;
  isActive: boolean;
}

export function CameraView({ onFrameCapture, isActive }: CameraViewProps) {
  const { device, hasPermission, requestPermission, isReady } = useCamera();

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <Text style={styles.permissionSubtext}>
            Tap to grant camera access
          </Text>
        </View>
      </View>
    );
  }

  if (!device || !isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        photo={true}
        // Enable frame processor when ML Kit is integrated
        // frameProcessor={frameProcessor}
      />

      {/* OCR detection overlay could go here */}
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    padding: 32,
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
});
