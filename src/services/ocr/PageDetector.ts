import { OCRResult } from '../../types';

export class PageDetector {
  /**
   * Detects page number from OCR results
   * Looks for common patterns: "Page 5", "P. 5", "5" in corners, etc.
   */
  static detectPageNumber(ocrResults: OCRResult[]): number | null {
    for (const result of ocrResults) {
      const text = result.text.trim();

      // Pattern 1: "Page 5" or "PAGE 5"
      const pagePattern = /page\s+(\d+)/i;
      const pageMatch = text.match(pagePattern);
      if (pageMatch) {
        return parseInt(pageMatch[1], 10);
      }

      // Pattern 2: "P. 5" or "p. 5"
      const pPattern = /p\.\s*(\d+)/i;
      const pMatch = text.match(pPattern);
      if (pMatch) {
        return parseInt(pMatch[1], 10);
      }

      // Pattern 3: Standalone number in corners (likely page number)
      // Check if text is just a number and confidence is high
      const numberPattern = /^(\d+)$/;
      const numberMatch = text.match(numberPattern);
      if (numberMatch && result.confidence > 0.7) {
        const num = parseInt(numberMatch[1], 10);
        // Only consider reasonable page numbers (1-999)
        if (num >= 1 && num <= 999) {
          // Check if it's in a corner (top or bottom 20% of image)
          const isInCorner = this.isInCorner(result);
          if (isInCorner) {
            return num;
          }
        }
      }
    }

    return null;
  }

  /**
   * Checks if OCR result is in a corner (likely page number location)
   */
  private static isInCorner(result: OCRResult): boolean {
    const { boundingBox } = result;
    const relativeY = boundingBox.y;

    // Consider top 20% or bottom 20% as corners
    // Note: This is a simplified check - in production you'd normalize by image height
    return relativeY < 0.2 || relativeY > 0.8;
  }

  /**
   * Calculates text similarity between two sets of OCR results
   * Returns a value between 0 (completely different) and 1 (identical)
   */
  static calculateTextSimilarity(
    current: OCRResult[],
    previous: OCRResult[]
  ): number {
    if (current.length === 0 && previous.length === 0) return 1;
    if (current.length === 0 || previous.length === 0) return 0;

    const currentText = current.map(r => r.text).join(' ').toLowerCase();
    const previousText = previous.map(r => r.text).join(' ').toLowerCase();

    // Simple Levenshtein distance based similarity
    const distance = this.levenshteinDistance(currentText, previousText);
    const maxLength = Math.max(currentText.length, previousText.length);

    if (maxLength === 0) return 1;

    return 1 - (distance / maxLength);
  }

  /**
   * Detects if a page turn has occurred
   * Returns true if the content has changed significantly
   */
  static isPageTurn(
    current: OCRResult[],
    previous: OCRResult[],
    threshold: number = 0.3 // If similarity < 30%, it's a new page
  ): boolean {
    const similarity = this.calculateTextSimilarity(current, previous);
    console.log('[PageDetector] Text similarity:', (similarity * 100).toFixed(1) + '%');

    return similarity < threshold;
  }

  /**
   * Calculates Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Extracts meaningful text blocks (filters out noise)
   */
  static filterMeaningfulText(ocrResults: OCRResult[]): OCRResult[] {
    return ocrResults.filter(result => {
      // Filter out very short text (< 2 chars) with low confidence
      if (result.text.length < 2 && result.confidence < 0.5) {
        return false;
      }

      // Filter out very low confidence results
      if (result.confidence < 0.3) {
        return false;
      }

      return true;
    });
  }
}
