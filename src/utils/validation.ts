/**
 * Validates a scan name
 */
export function validateScanName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' };
  }

  return { valid: true };
}

/**
 * Validates confidence score
 */
export function isValidConfidence(confidence: number): boolean {
  return confidence >= 0 && confidence <= 1;
}

/**
 * Sanitizes a filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}
