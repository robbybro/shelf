import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Scan, Page, OCRResult } from '../types';
import { useScansStore } from './scansStore';

interface ActiveScanStore {
  activeScan: Scan | null;
  currentPage: Page | null;
  isScanning: boolean;
  isPaused: boolean;

  // Actions
  startScan: (name: string) => void;
  pauseScan: () => void;
  resumeScan: (scanId: string) => void;
  stopScan: () => void;

  processOCRResult: (results: OCRResult[], rawText: string, processedText: string) => void;
  addPage: (page: Page) => void;
  updateCurrentPage: (updates: Partial<Page>) => void;
  nextPage: () => void;

  // Getters
  getCurrentPageNumber: () => number;
  getAverageConfidence: () => number;
}

export const useActiveScanStore = create<ActiveScanStore>((set, get) => ({
  activeScan: null,
  currentPage: null,
  isScanning: false,
  isPaused: false,

  startScan: (name: string) => {
    const newScan: Scan = {
      id: uuidv4(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      currentPage: 1,
      totalPages: 0,
      pages: [],
      metadata: {},
    };

    useScansStore.getState().addScan(newScan);

    set({
      activeScan: newScan,
      isScanning: true,
      isPaused: false,
    });
  },

  pauseScan: () => {
    const { activeScan } = get();
    if (!activeScan) return;

    const updatedScan = { ...activeScan, status: 'paused' as const };
    useScansStore.getState().updateScan(activeScan.id, updatedScan);

    set({
      activeScan: updatedScan,
      isPaused: true,
      isScanning: false,
    });
  },

  resumeScan: (scanId: string) => {
    const scan = useScansStore.getState().getScan(scanId);
    if (!scan) return;

    const updatedScan = { ...scan, status: 'active' as const };
    useScansStore.getState().updateScan(scanId, updatedScan);

    set({
      activeScan: updatedScan,
      isScanning: true,
      isPaused: false,
    });
  },

  stopScan: () => {
    const { activeScan } = get();
    if (!activeScan) return;

    const updatedScan = { ...activeScan, status: 'completed' as const };
    useScansStore.getState().updateScan(activeScan.id, updatedScan);

    set({
      activeScan: null,
      currentPage: null,
      isScanning: false,
      isPaused: false,
    });
  },

  processOCRResult: (results: OCRResult[], rawText: string, processedText: string) => {
    const { activeScan, currentPage } = get();
    if (!activeScan) return;

    const avgConfidence = results.length > 0
      ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      : 0;

    const updatedPage: Page = currentPage ? {
      ...currentPage,
      rawText,
      processedText,
      ocrResults: results,
      averageConfidence: avgConfidence,
    } : {
      id: uuidv4(),
      scanId: activeScan.id,
      pageNumber: activeScan.currentPage,
      rawText,
      processedText,
      ocrResults: results,
      recipes: [],
      timestamp: Date.now(),
      averageConfidence: avgConfidence,
    };

    set({ currentPage: updatedPage });
  },

  addPage: (page: Page) => {
    const { activeScan } = get();
    if (!activeScan) return;

    const updatedPages = [...activeScan.pages, page];
    const updatedScan = {
      ...activeScan,
      pages: updatedPages,
      totalPages: updatedPages.length,
      currentPage: activeScan.currentPage + 1,
    };

    useScansStore.getState().updateScan(activeScan.id, updatedScan);
    set({ activeScan: updatedScan, currentPage: null });
  },

  updateCurrentPage: (updates: Partial<Page>) => {
    set((state) => ({
      currentPage: state.currentPage ? { ...state.currentPage, ...updates } : null,
    }));
  },

  nextPage: () => {
    const { activeScan, currentPage } = get();
    if (!activeScan || !currentPage) return;

    // Save current page
    get().addPage(currentPage);
  },

  getCurrentPageNumber: () => {
    return get().activeScan?.currentPage || 1;
  },

  getAverageConfidence: () => {
    return get().currentPage?.averageConfidence || 0;
  },
}));
