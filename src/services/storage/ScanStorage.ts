import * as FileSystem from 'expo-file-system';
import { Scan, Page } from '../../types';
import { Config } from '../../constants/config';

export class ScanStorage {
  /**
   * Gets the scans directory path
   */
  static getScansDirectory(): string {
    return `${FileSystem.documentDirectory}${Config.scansDirectory}/`;
  }

  /**
   * Gets the directory path for a specific scan
   */
  static getScanDirectory(scanId: string): string {
    return `${this.getScansDirectory()}${scanId}/`;
  }

  /**
   * Gets the pages directory for a scan
   */
  static getPagesDirectory(scanId: string): string {
    return `${this.getScanDirectory(scanId)}pages/`;
  }

  /**
   * Gets the images directory for a scan
   */
  static getImagesDirectory(scanId: string): string {
    return `${this.getScanDirectory(scanId)}${Config.imagesDirectory}/`;
  }

  /**
   * Saves a page to the file system
   */
  static async savePage(page: Page): Promise<void> {
    const pagesDir = this.getPagesDirectory(page.scanId);

    // Create directories if they don't exist
    const dirInfo = await FileSystem.getInfoAsync(pagesDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(pagesDir, { intermediates: true });
    }

    // Write page data
    const filePath = `${pagesDir}${page.id}.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(page, null, 2));
  }

  /**
   * Loads a page from the file system
   */
  static async loadPage(scanId: string, pageId: string): Promise<Page | null> {
    const filePath = `${this.getPagesDirectory(scanId)}${pageId}.json`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (!fileInfo.exists) {
      return null;
    }

    const content = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(content) as Page;
  }

  /**
   * Saves an image for a page
   */
  static async saveImage(scanId: string, pageId: string, imageUri: string): Promise<string> {
    const imagesDir = this.getImagesDirectory(scanId);

    // Create directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }

    // Copy image to storage
    const fileName = `${pageId}.jpg`;
    const destPath = `${imagesDir}${fileName}`;
    await FileSystem.copyAsync({ from: imageUri, to: destPath });

    return destPath;
  }

  /**
   * Deletes all data for a scan
   */
  static async deleteScan(scanId: string): Promise<void> {
    const scanDir = this.getScanDirectory(scanId);
    const dirInfo = await FileSystem.getInfoAsync(scanDir);

    if (dirInfo.exists) {
      await FileSystem.deleteAsync(scanDir, { idempotent: true });
    }
  }

  /**
   * Gets all pages for a scan
   */
  static async loadAllPages(scanId: string): Promise<Page[]> {
    const pagesDir = this.getPagesDirectory(scanId);
    const dirInfo = await FileSystem.getInfoAsync(pagesDir);

    if (!dirInfo.exists) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(pagesDir);
    const pages: Page[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await FileSystem.readAsStringAsync(`${pagesDir}${file}`);
        pages.push(JSON.parse(content) as Page);
      }
    }

    // Sort by page number
    return pages.sort((a, b) => a.pageNumber - b.pageNumber);
  }
}
