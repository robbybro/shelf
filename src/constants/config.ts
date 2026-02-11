export const Config = {
  // OCR processing
  frameProcessingThrottle: 2, // Process every Nth frame

  // Confidence thresholds
  confidenceThresholds: {
    low: 0.5,    // < 50%
    medium: 0.8, // 50-80%
  },

  // Storage keys
  storageKeys: {
    scans: 'scans',
    activeScan: 'activeScan',
    settings: 'settings',
  },

  // File paths
  scansDirectory: 'scans',
  exportsDirectory: 'exports',
  imagesDirectory: 'images',
};
