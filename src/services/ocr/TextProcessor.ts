import { OCRResult, ProcessedTextSegment } from '../../types';
import { Config } from '../../constants/config';

export class TextProcessor {
  /**
   * Merges nearby text blocks into coherent lines
   */
  static mergeTextBlocks(results: OCRResult[]): OCRResult[] {
    if (results.length === 0) return [];

    // Sort by vertical position first, then horizontal
    const sorted = [...results].sort((a, b) => {
      const yDiff = a.boundingBox.y - b.boundingBox.y;
      if (Math.abs(yDiff) < 10) {
        // Same line, sort by x
        return a.boundingBox.x - b.boundingBox.x;
      }
      return yDiff;
    });

    const merged: OCRResult[] = [];
    let currentLine: OCRResult | null = null;

    for (const result of sorted) {
      if (!currentLine) {
        currentLine = { ...result };
        continue;
      }

      const yDiff = Math.abs(result.boundingBox.y - currentLine.boundingBox.y);
      const isSameLine = yDiff < 15;

      if (isSameLine) {
        // Merge into current line
        currentLine.text += ' ' + result.text;
        currentLine.confidence = (currentLine.confidence + result.confidence) / 2;
        currentLine.boundingBox.width =
          result.boundingBox.x + result.boundingBox.width - currentLine.boundingBox.x;
      } else {
        // New line
        merged.push(currentLine);
        currentLine = { ...result };
      }
    }

    if (currentLine) {
      merged.push(currentLine);
    }

    return merged;
  }

  /**
   * Cleans common OCR artifacts
   */
  static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')                    // Normalize whitespace
      .replace(/[•·]/g, '-')                    // Normalize bullet points
      .replace(/(\d)\s*\.\s*(?=\w)/g, '$1. ')  // Fix numbered lists
      .replace(/['']/g, "'")                    // Normalize apostrophes
      .replace(/[""]/g, '"')                    // Normalize quotes
      .trim();
  }

  /**
   * Creates text segments with confidence highlighting metadata
   */
  static createTextSegments(results: OCRResult[]): ProcessedTextSegment[] {
    const segments: ProcessedTextSegment[] = [];
    let currentIndex = 0;

    for (const result of results) {
      const cleanedText = this.cleanText(result.text);
      const highlightColor = this.getHighlightColor(result.confidence);

      segments.push({
        text: cleanedText,
        confidence: result.confidence,
        highlightColor,
        startIndex: currentIndex,
        endIndex: currentIndex + cleanedText.length,
      });

      currentIndex += cleanedText.length + 1; // +1 for space
    }

    return segments;
  }

  /**
   * Determines highlight color based on confidence threshold
   */
  static getHighlightColor(confidence: number): 'red' | 'yellow' | 'none' {
    const { low, medium } = Config.confidenceThresholds;

    if (confidence < low) return 'red';
    if (confidence < medium) return 'yellow';
    return 'none';
  }

  /**
   * Calculates average confidence for a group of OCR results
   */
  static calculateAverageConfidence(results: OCRResult[]): number {
    if (results.length === 0) return 0;

    const sum = results.reduce((acc, result) => acc + result.confidence, 0);
    return sum / results.length;
  }

  /**
   * Combines all text from OCR results into a single string
   */
  static combineText(results: OCRResult[]): string {
    return results
      .map(r => this.cleanText(r.text))
      .join(' ');
  }
}
