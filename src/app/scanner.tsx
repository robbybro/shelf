import { View, Text, StyleSheet, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useRef, useCallback } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useActiveScanStore } from '../store/activeScanStore';
import { CameraView, CameraViewRef } from '../components/camera/CameraView';
import { CameraControls } from '../components/camera/CameraControls';
import { MarkdownPreview } from '../components/markdown/MarkdownPreview';
import { useLiveOCR } from '../hooks/useLiveOCR';
import { RecipeParser } from '../services/ocr/RecipeParser';
import { TextProcessor } from '../services/ocr/TextProcessor';
import { MarkdownExporter } from '../services/storage/MarkdownExporter';
import { Colors, Layout } from '../constants';

export default function ScannerScreen() {
  const { width, height } = useWindowDimensions();
  const {
    activeScan,
    currentPage,
    pauseScan,
    stopScan,
    processOCRResult,
    addPage,
    getCurrentPageNumber,
  } = useActiveScanStore();

  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isScanning, setIsScanning] = useState(true);
  const cameraRef = useRef<CameraViewRef>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle page turns
  const handlePageTurn = useCallback((pageNumber: number) => {
    console.log('[Scanner] Page turn detected, moving to page:', pageNumber);

    // Save current page if it has content
    if (currentPage && currentPage.ocrResults.length > 0) {
      // Parse recipe from OCR results
      const recipe = RecipeParser.parseRecipe(currentPage.ocrResults, currentPage.id);
      if (recipe) {
        currentPage.recipes.push(recipe);
      }

      // Save the page
      addPage(currentPage);
    }
  }, [currentPage, addPage]);

  // Live OCR hook
  const {
    currentResults,
    isProcessing,
    detectedPageNumber,
    processFrame,
    reset: resetOCR,
    getCurrentPageNumber: getLivePageNumber,
  } = useLiveOCR({
    onPageTurn: handlePageTurn,
    processingInterval: 2000, // Process every 2 seconds
  });

  // Force portrait orientation
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Update current page with live OCR results
  useEffect(() => {
    if (currentResults.length > 0) {
      const rawText = currentResults.map(r => r.text).join(' ');
      const processedText = TextProcessor.combineText(currentResults);
      processOCRResult(currentResults, rawText, processedText);
    }
  }, [currentResults, processOCRResult]);

  // Continuous scanning: automatically capture and process frames
  useEffect(() => {
    if (!isScanning) {
      return;
    }

    const captureAndProcess = async () => {
      try {
        if (!cameraRef.current) {
          console.log('[Scanner] Camera ref not ready, skipping capture');
          return;
        }

        // Take a photo
        const photoPath = await cameraRef.current.takePhoto();
        if (photoPath) {
          // Process with OCR
          await processFrame(`file://${photoPath}`);
        }
      } catch (error) {
        console.error('[Scanner] Auto-capture error:', error);
      }
    };

    // Wait a bit before starting to ensure camera is ready
    const startDelay = setTimeout(() => {
      // Start interval-based capturing
      scanIntervalRef.current = setInterval(captureAndProcess, 2000);
    }, 1000); // 1 second delay before first capture

    // Cleanup
    return () => {
      clearTimeout(startDelay);
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isScanning, processFrame]);

  const handleStop = () => {
    Alert.alert(
      'Stop Scanning',
      'Do you want to export the scan as markdown?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Without Export',
          onPress: () => {
            pauseScan(); // Use pauseScan so it can be resumed
            router.back();
          },
        },
        {
          text: 'Stop & Export',
          onPress: async () => {
            try {
              if (!activeScan) {
                Alert.alert('Error', 'No active scan to export');
                return;
              }

              console.log('[Scanner] Exporting scan:', activeScan.name);

              const filePath = await MarkdownExporter.exportScan(activeScan);

              // Share the exported file
              await MarkdownExporter.shareMarkdown(filePath);

              pauseScan(); // Use pauseScan so it can be resumed
              Alert.alert('Success', 'Scan exported and saved!', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('[Scanner] Export error:', error);
              Alert.alert('Export Failed', (error as Error).message);
            }
          },
        },
      ]
    );
  };

  const handlePauseScanning = () => {
    setIsScanning(!isScanning);
  };

  const handleSavePage = () => {
    if (!currentPage || !currentResults || currentResults.length === 0) {
      Alert.alert('No data', 'No text detected on current page');
      return;
    }

    console.log('[Scanner] Manually saving page');

    // Parse recipe from OCR results
    const recipe = RecipeParser.parseRecipe(currentResults, currentPage.id);
    if (recipe) {
      currentPage.recipes.push(recipe);
    }

    // Save current page
    addPage(currentPage);
    resetOCR();

    Alert.alert('Success', 'Page saved! Turn to next page to continue scanning');
  };

  if (!activeScan) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No active scan</Text>
      </SafeAreaView>
    );
  }

  const ocrResults = currentPage?.ocrResults || currentResults || [];
  const recipes = currentPage?.recipes || [];
  const rawText = currentPage?.rawText || '';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Controls */}
        <View style={styles.header}>
        <TouchableOpacity onPress={handlePauseScanning} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>{isScanning ? 'Pause' : 'Resume'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{activeScan.name}</Text>
          <Text style={styles.headerSubtitle}>
            Page {detectedPageNumber || getLivePageNumber()}
            {isProcessing && ' • Scanning...'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleStop} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>

      {/* Vertical split layout */}
      <View style={styles.splitContainer}>
        {/* Top - Camera view (preserves aspect ratio) */}
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} isActive={isCameraActive} />
        </View>

        {/* Bottom - Markdown preview + Controls */}
        <View style={styles.previewContainer}>
          <View style={styles.previewContent}>
            <MarkdownPreview
              ocrResults={ocrResults}
              recipes={recipes}
              rawText={rawText}
            />
          </View>

          {/* Controls at bottom */}
          <SafeAreaView edges={['bottom']}>
            <CameraControls
              onNextPage={handleSavePage}
              isProcessing={isProcessing}
            />
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.backgroundSecondary,
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
    flexDirection: 'column',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    flexDirection: 'column',
  },
  previewContent: {
    flex: 1,
  },
  errorText: {
    fontSize: Layout.fontSizeL,
    color: Colors.error,
    textAlign: 'center',
  },
});
