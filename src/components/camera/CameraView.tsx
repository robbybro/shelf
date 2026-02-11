import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useCamera } from '../../hooks/useCamera';
import { Colors } from '../../constants';
import { useRef, forwardRef, useImperativeHandle } from 'react';

interface CameraViewProps {
  onFrameCapture?: (imageUri: string) => void;
  isActive: boolean;
}

export interface CameraViewRef {
  takePhoto: () => Promise<string | null>;
}

export const CameraView = forwardRef<CameraViewRef, CameraViewProps>(
  ({ onFrameCapture, isActive }, ref) => {
    const { device, hasPermission, requestPermission, isReady } = useCamera();
    const cameraRef = useRef<Camera>(null);

    console.log('[CameraView] Rendering - hasPermission:', hasPermission, 'device:', device?.id, 'isReady:', isReady);

    // Expose takePhoto method to parent
    useImperativeHandle(ref, () => ({
      takePhoto: async () => {
        if (!cameraRef.current || !device) {
          console.log('[CameraView] Cannot take photo - no camera ref or device');
          return null;
        }

        try {
          console.log('[CameraView] Taking photo...');
          const photo = await cameraRef.current.takePhoto({
            qualityPrioritization: 'balanced',
            flash: 'off',
          });
          console.log('[CameraView] Photo captured:', photo.path);
          return photo.path;
        } catch (error) {
          console.error('[CameraView] Failed to take photo:', error);
          return null;
        }
      },
    }));

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <Text style={styles.permissionSubtext}>
            This app needs camera access to scan cookbook pages
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => {
              console.log('[CameraView] Permission button pressed');
              requestPermission();
            }}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device || !isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading camera...</Text>
        <Text style={styles.debugText}>
          Device: {device ? 'found' : 'not found'} | Permission: {hasPermission ? 'granted' : 'not granted'}
        </Text>
      </View>
    );
  }

    return (
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={isActive}
          photo={true}
        />

        {/* OCR detection overlay could go here */}
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    aspectRatio: 3 / 4, // Standard camera aspect ratio for portrait
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
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 14,
  },
  debugText: {
    color: '#AAA',
    marginTop: 8,
    fontSize: 12,
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
