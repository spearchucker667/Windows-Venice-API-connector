/** @fileoverview Type definitions for IndexedDB storage records. */

/** Describes a saved chat history record stored in IndexedDB. */
export interface ChatHistoryItem {
  id: string;
  prompt: string;
  response: string;
  model: string;
  timestamp: number;
}

/** Describes a saved image record stored in the local gallery. */
export interface GalleryImage {
  id: string;
  image: string;
  prompt: string;
  negative?: string;
  model: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  style?: string;
  cfg?: number | string;
  steps?: number | string;
  safeMode?: boolean;
  disableWatermark?: boolean;
  batchId?: string | null;
  batchIndex?: number | null;
  batchCount?: number | null;
  timestamp: number;
  upscaled?: boolean;
  parentId?: string | null;
}
