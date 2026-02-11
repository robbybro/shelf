import { Page } from './page';

export type ScanStatus = 'active' | 'paused' | 'completed';

export interface Scan {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  status: ScanStatus;
  currentPage: number;
  totalPages: number;
  pages: Page[];
  metadata: ScanMetadata;
}

export interface ScanMetadata {
  cookbookTitle?: string;
  author?: string;
  notes?: string;
}

export interface ScanListItem {
  id: string;
  name: string;
  status: ScanStatus;
  totalPages: number;
  updatedAt: number;
  thumbnailPath?: string;
}
