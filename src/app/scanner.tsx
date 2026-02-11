import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useActiveScanStore } from '../store/activeScanStore';
import { CameraView } from '../components/camera/CameraView';
import { CameraControls } from '../components/camera/CameraControls';
import { MarkdownPreview } from '../components/markdown/MarkdownPreview';
import { useOCR } from '../hooks/useOCR';
import { RecipeParser } from '../services/ocr/RecipeParser';
import { TextProcessor } from '../services/ocr/TextProcessor';
import { Colors, Layout } from '../constants';

const { width } = Dimensions.get('window');

export default function ScannerScreen() {
  const {
    activeScan,
    currentPage,
    isScanning,
    pauseScan,
    stopScan,
    processOCRResult,
    addPage,
    getCurrentPageNumber,
  } = useActiveScanStore();

  const { isProcessing, lastResult, reset: resetOCR } = useOCR();
  const [isCameraActive, setIsCameraActive] = useState(true);

  // Force landscape orientation
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Process OCR results when they come in
  useEffect(() => {
    if (lastResult && lastResult.length > 0) {
      const rawText = lastResult.map(r => r.text).join(' ');
      const processedText = TextProcessor.combineText(lastResult);
      processOCRResult(lastResult, rawText, processedText);
    }
  }, [lastResult]);

  const handlePause = () => {
    pauseScan();
    Alert.alert('Scan Paused', `Resume from page ${getCurrentPageNumber()}`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleStop = () => {
    Alert.alert(
      'Stop Scanning',
      'Are you sure you want to stop and save this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop & Save',
          onPress: () => {
            stopScan();
            router.back();
          },
        },
      ]
    );
  };

  const handleCapture = () => {
    // In a real implementation, this would capture the camera frame
    // For now, we'll use the last OCR result
    if (!currentPage || !lastResult) {
      Alert.alert('No data', 'Point camera at a cookbook page first');
      return;
    }

    Alert.alert('Page Captured', 'OCR text has been saved');
  };

  const handleNextPage = () => {
    if (!currentPage || !lastResult || lastResult.length === 0) {
      Alert.alert('No data', 'Capture the current page first');
      return;
    }

    // Parse recipe from OCR results
    const recipe = RecipeParser.parseRecipe(lastResult, currentPage.id);
    if (recipe) {
      currentPage.recipes.push(recipe);
    }

    // Save current page and move to next
    addPage(currentPage);
    resetOCR();

    Alert.alert('Success', 'Page saved! Ready for next page');
  };

  if (!activeScan) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No active scan</Text>
      </SafeAreaView>
    );
  }

  const ocrResults = currentPage?.ocrResults || lastResult || [];
  const recipes = currentPage?.recipes || [];
  const rawText = currentPage?.rawText || '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Controls */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePause} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Pause</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{activeScan.name}</Text>
          <Text style={styles.headerSubtitle}>Page {getCurrentPageNumber()}</Text>
        </View>
        <TouchableOpacity onPress={handleStop} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      {/* Split-screen layout */}
      <View style={styles.splitContainer}>
        {/* Left side - Camera view */}
        <View style={[styles.cameraContainer, { width: width * Layout.cameraWidthRatio }]}>
          <CameraView isActive={isCameraActive} />
        </View>

        {/* Right side - Markdown preview */}
        <View style={[styles.previewContainer, { width: width * Layout.previewWidthRatio }]}>
          <MarkdownPreview
            ocrResults={ocrResults}
            recipes={recipes}
            rawText={rawText}
          />
        </View>
      </View>

      {/* Bottom controls */}
      <CameraControls
        onCapture={handleCapture}
        onNextPage={handleNextPage}
        isProcessing={isProcessing}
        currentPage={getCurrentPageNumber()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacingL,
    paddingVertical: Layout.spacingM,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Layout.fontSizeL,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Layout.fontSizeS,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerButton: {
    paddingHorizontal: Layout.spacingM,
    paddingVertical: Layout.spacingS,
  },
  headerButtonText: {
    fontSize: Layout.fontSizeM,
    color: Colors.primary,
    fontWeight: '600',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  cameraContainer: {
    backgroundColor: '#000',
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
  },
  errorText: {
    fontSize: Layout.fontSizeL,
    color: Colors.error,
    textAlign: 'center',
  },
});
