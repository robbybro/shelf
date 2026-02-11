import TextRecognition from '@react-native-ml-kit/text-recognition';
import { OCRResult } from '../../types';

export class ImageOCR {
  /**
   * Process an image and extract text using ML Kit
   */
  static async processImage(imagePath: string): Promise<OCRResult[]> {
    try {
      console.log('[ImageOCR] Processing image:', imagePath);

      const result = await TextRecognition.recognize(imagePath);

      console.log('[ImageOCR] ML Kit result:', {
        textBlocks: result.blocks?.length || 0,
        fullText: result.text?.substring(0, 100) + '...',
      });

      if (!result.blocks || result.blocks.length === 0) {
        console.log('[ImageOCR] No text blocks found');
        return [];
      }

      // Convert ML Kit result to our OCRResult format
      const ocrResults: OCRResult[] = result.blocks.map((block) => ({
        text: block.text,
        confidence: block.confidence || 0.5, // ML Kit doesn't always provide confidence
        boundingBox: {
          x: block.frame.x,
          y: block.frame.y,
          width: block.frame.width,
          height: block.frame.height,
        },
      }));

      console.log('[ImageOCR] Processed', ocrResults.length, 'text blocks');

      return ocrResults;
    } catch (error) {
      console.error('[ImageOCR] Failed to process image:', error);
      throw error;
    }
  }

  /**
   * Extract just the raw text from an image
   */
  static async extractText(imagePath: string): Promise<string> {
    try {
      const result = await TextRecognition.recognize(imagePath);
      return result.text || '';
    } catch (error) {
      console.error('[ImageOCR] Failed to extract text:', error);
      return '';
    }
  }
}
