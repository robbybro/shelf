import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Layout } from '../../constants';

interface CameraControlsProps {
  onNextPage: () => void;
  isProcessing: boolean;
}

export function CameraControls({
  onNextPage,
  isProcessing,
}: CameraControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.nextButton, isProcessing && styles.nextButtonDisabled]}
        onPress={onNextPage}
        disabled={isProcessing}
      >
        <Text style={styles.nextButtonText}>Save Page & Continue →</Text>
      </TouchableOpacity>
      <Text style={styles.helperText}>
        Or just turn the page - it will auto-detect!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacingL,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Layout.spacingM,
    paddingHorizontal: Layout.spacingXl,
    borderRadius: Layout.borderRadiusM,
    alignItems: 'center',
    marginBottom: Layout.spacingS,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: Layout.fontSizeL,
    fontWeight: '600',
  },
  helperText: {
    fontSize: Layout.fontSizeS,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
