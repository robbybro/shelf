import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Layout } from '../../constants';

interface CameraControlsProps {
  onCapture: () => void;
  onNextPage: () => void;
  isProcessing: boolean;
  currentPage: number;
}

export function CameraControls({
  onCapture,
  onNextPage,
  isProcessing,
  currentPage,
}: CameraControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pageIndicator}>
        <Text style={styles.pageText}>Page {currentPage}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={onCapture}
          disabled={isProcessing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, isProcessing && styles.nextButtonDisabled]}
        onPress={onNextPage}
        disabled={isProcessing}
      >
        <Text style={styles.nextButtonText}>Next Page →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacingL,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pageIndicator: {
    alignItems: 'center',
    marginBottom: Layout.spacingM,
  },
  pageText: {
    fontSize: Layout.fontSizeL,
    fontWeight: '600',
    color: Colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacingM,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
  },
  nextButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Layout.spacingM,
    paddingHorizontal: Layout.spacingXl,
    borderRadius: Layout.borderRadiusM,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: Layout.fontSizeL,
    fontWeight: '600',
  },
});
