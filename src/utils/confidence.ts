import { Colors } from '../constants';
import { Config } from '../constants/config';

/**
 * Gets the highlight color for a given confidence score
 */
export function getConfidenceColor(confidence: number): string {
  const { low, medium } = Config.confidenceThresholds;

  if (confidence < low) {
    return Colors.confidenceLow; // Red
  } else if (confidence < medium) {
    return Colors.confidenceMedium; // Yellow
  } else {
    return Colors.confidenceHigh; // Transparent
  }
}

/**
 * Gets a text color based on confidence for readability
 */
export function getConfidenceTextColor(confidence: number): string {
  const { low } = Config.confidenceThresholds;

  if (confidence < low) {
    return Colors.error;
  } else {
    return Colors.text;
  }
}

/**
 * Gets a human-readable confidence level
 */
export function getConfidenceLevel(confidence: number): 'low' | 'medium' | 'high' {
  const { low, medium } = Config.confidenceThresholds;

  if (confidence < low) return 'low';
  if (confidence < medium) return 'medium';
  return 'high';
}

/**
 * Formats confidence as a percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(0)}%`;
}
