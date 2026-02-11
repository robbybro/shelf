export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRResult {
  text: string;
  confidence: number; // 0-1
  boundingBox: BoundingBox;
  blockIndex: number;
  lineIndex: number;
  elementIndex: number;
}

export interface ProcessedTextSegment {
  text: string;
  confidence: number;
  highlightColor: 'red' | 'yellow' | 'none';
  startIndex: number;
  endIndex: number;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface ConfidenceThresholds {
  low: number;    // Default: 0.5 (< 50%)
  medium: number; // Default: 0.8 (50-80%)
}
