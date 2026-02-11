import { useCallback, useRef, useState } from 'react';
import { runOnJS } from 'react-native-reanimated';
import type { Frame } from 'react-native-vision-camera';
import { OCRResult } from '../types';

// Note: This is a placeholder for the ML Kit integration
// You'll need to implement the actual frame processor plugin
// See: https://react-native-vision-camera.com/docs/guides/frame-processors-plugins-overview

interface OCRHookResult {
  isProcessing: boolean;
  lastResult: OCRResult[] | null;
  processFrame: (frame: Frame) => void;
  reset: () => void;
}

export function useOCR(): OCRHookResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<OCRResult[] | null>(null);
  const frameCount = useRef(0);

  const handleOCRResult = useCallback((results: OCRResult[]) => {
    setLastResult(results);
    setIsProcessing(false);
  }, []);

  const processFrame = useCallback((frame: Frame) => {
    'worklet';

    // Throttle: only process every 3rd frame for performance
    frameCount.current++;
    if (frameCount.current % 3 !== 0) {
      return;
    }

    runOnJS(setIsProcessing)(true);

    // TODO: Replace with actual ML Kit text recognition
    // For now, this is a placeholder that would be replaced with:
    // const textBlocks = scanText(frame);

    // Simulate OCR result for development
    const mockResults: OCRResult[] = [
      {
        text: 'Recipe Title',
        confidence: 0.95,
        boundingBox: { x: 10, y: 10, width: 200, height: 30 },
        blockIndex: 0,
        lineIndex: 0,
        elementIndex: 0,
      },
      {
        text: 'Ingredients:',
        confidence: 0.92,
        boundingBox: { x: 10, y: 50, width: 150, height: 25 },
        blockIndex: 1,
        lineIndex: 0,
        elementIndex: 0,
      },
      {
        text: '2 cups flour',
        confidence: 0.88,
        boundingBox: { x: 10, y: 80, width: 120, height: 20 },
        blockIndex: 2,
        lineIndex: 0,
        elementIndex: 0,
      },
      {
        text: '1 tsp salt',
        confidence: 0.45, // Low confidence - will be red
        boundingBox: { x: 10, y: 105, width: 100, height: 20 },
        blockIndex: 3,
        lineIndex: 0,
        elementIndex: 0,
      },
      {
        text: '3 eggs',
        confidence: 0.65, // Medium confidence - will be yellow
        boundingBox: { x: 10, y: 130, width: 80, height: 20 },
        blockIndex: 4,
        lineIndex: 0,
        elementIndex: 0,
      },
    ];

    runOnJS(handleOCRResult)(mockResults);
  }, [handleOCRResult]);

  const reset = useCallback(() => {
    setLastResult(null);
    setIsProcessing(false);
    frameCount.current = 0;
  }, []);

  return {
    isProcessing,
    lastResult,
    processFrame,
    reset,
  };
}

/*
 * IMPLEMENTATION NOTE:
 *
 * To add real OCR, you'll need to:
 *
 * 1. Install the ML Kit plugin:
 *    npm install react-native-vision-camera-text-recognition
 *
 * 2. Add to babel.config.js:
 *    plugins: [
 *      'react-native-reanimated/plugin',
 *    ]
 *
 * 3. Update app.config.js plugins array with text recognition
 *
 * 4. Replace the processFrame function above with:
 *
 *    const processFrame = useFrameProcessor((frame) => {
 *      'worklet';
 *
 *      frameCount.current++;
 *      if (frameCount.current % 3 !== 0) return;
 *
 *      runOnJS(setIsProcessing)(true);
 *
 *      // Use the actual OCR plugin
 *      const result = scanText(frame);
 *
 *      // Convert to OCRResult format
 *      const ocrResults: OCRResult[] = result.blocks.flatMap((block, blockIdx) =>
 *        block.lines.flatMap((line, lineIdx) =>
 *          line.elements.map((element, elemIdx) => ({
 *            text: element.text,
 *            confidence: element.confidence || 0,
 *            boundingBox: {
 *              x: element.frame.x,
 *              y: element.frame.y,
 *              width: element.frame.width,
 *              height: element.frame.height,
 *            },
 *            blockIndex: blockIdx,
 *            lineIndex: lineIdx,
 *            elementIndex: elemIdx,
 *          }))
 *        )
 *      );
 *
 *      runOnJS(handleOCRResult)(ocrResults);
 *    }, [handleOCRResult]);
 */
