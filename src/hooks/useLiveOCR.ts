import { useState, useRef, useCallback } from 'react';
import { OCRResult } from '../types';
import { ImageOCR } from '../services/ocr/ImageOCR';
import { PageDetector } from '../services/ocr/PageDetector';
import { TextProcessor } from '../services/ocr/TextProcessor';

interface UseLiveOCROptions {
  onPageTurn?: (pageNumber: number) => void;
  processingInterval?: number; // ms between processing frames
}

export function useLiveOCR(options: UseLiveOCROptions = {}) {
  const { onPageTurn, processingInterval = 2000 } = options;

  const [currentResults, setCurrentResults] = useState<OCRResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedPageNumber, setDetectedPageNumber] = useState<number | null>(null);

  const previousResults = useRef<OCRResult[]>([]);
  const lastProcessTime = useRef<number>(0);
  const currentPageNumber = useRef<number>(1);

  /**
   * Processes a camera frame for OCR
   * Throttled to avoid overwhelming the system
   */
  const processFrame = useCallback(async (imagePath: string) => {
    const now = Date.now();

    // Throttle processing
    if (now - lastProcessTime.current < processingInterval) {
      return;
    }

    // Skip if already processing
    if (isProcessing) {
      return;
    }

    lastProcessTime.current = now;
    setIsProcessing(true);

    try {
      console.log('[useLiveOCR] Processing frame...');

      // Run OCR on the frame
      const ocrResults = await ImageOCR.processImage(imagePath);

      if (ocrResults.length === 0) {
        setIsProcessing(false);
        return;
      }

      // Filter out noise
      const meaningfulResults = PageDetector.filterMeaningfulText(ocrResults);

      console.log('[useLiveOCR] Found', meaningfulResults.length, 'text blocks');

      // Detect page number
      const pageNum = PageDetector.detectPageNumber(meaningfulResults);
      if (pageNum !== null) {
        console.log('[useLiveOCR] Detected page number:', pageNum);
        setDetectedPageNumber(pageNum);
        currentPageNumber.current = pageNum;
      }

      // Check for page turn
      if (previousResults.current.length > 0) {
        const isPageTurn = PageDetector.isPageTurn(
          meaningfulResults,
          previousResults.current
        );

        if (isPageTurn) {
          console.log('[useLiveOCR] Page turn detected!');

          // Increment page if no page number was detected
          if (pageNum === null) {
            currentPageNumber.current++;
          }

          // Notify parent component
          if (onPageTurn) {
            onPageTurn(currentPageNumber.current);
          }
        }
      }

      // Update state
      previousResults.current = meaningfulResults;
      setCurrentResults(meaningfulResults);

    } catch (error) {
      console.error('[useLiveOCR] Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [processingInterval, isProcessing, onPageTurn]);

  /**
   * Resets the OCR state for a new scan
   */
  const reset = useCallback(() => {
    setCurrentResults([]);
    setDetectedPageNumber(null);
    previousResults.current = [];
    currentPageNumber.current = 1;
  }, []);

  /**
   * Gets the current page number (detected or sequential)
   */
  const getCurrentPageNumber = useCallback(() => {
    return detectedPageNumber || currentPageNumber.current;
  }, [detectedPageNumber]);

  return {
    currentResults,
    isProcessing,
    detectedPageNumber,
    processFrame,
    reset,
    getCurrentPageNumber,
  };
}
