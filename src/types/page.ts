import { OCRResult } from './ocr';
import { Recipe } from './recipe';

export interface Page {
  id: string;
  scanId: string;
  pageNumber: number;
  imagePath?: string; // Optional: store captured image
  rawText: string;
  processedText: string;
  ocrResults: OCRResult[];
  recipes: Recipe[];
  timestamp: number;
  averageConfidence: number;
}
