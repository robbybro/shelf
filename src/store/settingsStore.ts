import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { ConfidenceThresholds } from '../types';
import { Config } from '../constants/config';

const storage = new MMKV();

interface SettingsStore {
  confidenceThresholds: ConfidenceThresholds;
  autoSaveEnabled: boolean;
  exportFormat: 'markdown' | 'json';

  // Actions
  setConfidenceThresholds: (thresholds: ConfidenceThresholds) => void;
  setAutoSave: (enabled: boolean) => void;
  setExportFormat: (format: 'markdown' | 'json') => void;
  loadSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  confidenceThresholds: Config.confidenceThresholds,
  autoSaveEnabled: true,
  exportFormat: 'markdown',

  setConfidenceThresholds: (thresholds: ConfidenceThresholds) => {
    set({ confidenceThresholds: thresholds });
    const settings = storage.getString(Config.storageKeys.settings);
    const parsed = settings ? JSON.parse(settings) : {};
    storage.set(Config.storageKeys.settings, JSON.stringify({ ...parsed, confidenceThresholds: thresholds }));
  },

  setAutoSave: (enabled: boolean) => {
    set({ autoSaveEnabled: enabled });
    const settings = storage.getString(Config.storageKeys.settings);
    const parsed = settings ? JSON.parse(settings) : {};
    storage.set(Config.storageKeys.settings, JSON.stringify({ ...parsed, autoSaveEnabled: enabled }));
  },

  setExportFormat: (format: 'markdown' | 'json') => {
    set({ exportFormat: format });
    const settings = storage.getString(Config.storageKeys.settings);
    const parsed = settings ? JSON.parse(settings) : {};
    storage.set(Config.storageKeys.settings, JSON.stringify({ ...parsed, exportFormat: format }));
  },

  loadSettings: () => {
    try {
      const settingsJson = storage.getString(Config.storageKeys.settings);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        set({
          confidenceThresholds: settings.confidenceThresholds || Config.confidenceThresholds,
          autoSaveEnabled: settings.autoSaveEnabled !== undefined ? settings.autoSaveEnabled : true,
          exportFormat: settings.exportFormat || 'markdown',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },
}));
