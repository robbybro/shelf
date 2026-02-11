import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { Scan, ScanListItem } from '../types';
import { Config } from '../constants/config';

const storage = new MMKV();

interface ScansStore {
  scans: Scan[];
  isLoading: boolean;

  // Actions
  loadScans: () => void;
  addScan: (scan: Scan) => void;
  updateScan: (id: string, updates: Partial<Scan>) => void;
  deleteScan: (id: string) => void;
  getScan: (id: string) => Scan | undefined;
  getScanList: () => ScanListItem[];
}

export const useScansStore = create<ScansStore>((set, get) => ({
  scans: [],
  isLoading: false,

  loadScans: () => {
    try {
      const scansJson = storage.getString(Config.storageKeys.scans);
      if (scansJson) {
        const scans = JSON.parse(scansJson) as Scan[];
        set({ scans });
      }
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  },

  addScan: (scan: Scan) => {
    set((state) => {
      const newScans = [...state.scans, scan];
      storage.set(Config.storageKeys.scans, JSON.stringify(newScans));
      return { scans: newScans };
    });
  },

  updateScan: (id: string, updates: Partial<Scan>) => {
    set((state) => {
      const newScans = state.scans.map((scan) =>
        scan.id === id ? { ...scan, ...updates, updatedAt: Date.now() } : scan
      );
      storage.set(Config.storageKeys.scans, JSON.stringify(newScans));
      return { scans: newScans };
    });
  },

  deleteScan: (id: string) => {
    set((state) => {
      const newScans = state.scans.filter((scan) => scan.id !== id);
      storage.set(Config.storageKeys.scans, JSON.stringify(newScans));
      return { scans: newScans };
    });
  },

  getScan: (id: string) => {
    return get().scans.find((scan) => scan.id === id);
  },

  getScanList: () => {
    return get().scans.map((scan) => ({
      id: scan.id,
      name: scan.name,
      status: scan.status,
      totalPages: scan.totalPages,
      updatedAt: scan.updatedAt,
    }));
  },
}));
