/** @fileoverview Type definitions for the Electron preload bridge API. */

/** Manages the Venice API key in secure OS-level storage. */
export interface VeniceForgeApiKey {
  isConfigured(): Promise<boolean>;
  set(key: string): Promise<{ ok: boolean }>;
  delete(): Promise<{ ok: boolean }>;
  test(): Promise<{ ok: boolean; status?: number; message: string }>;
}

/** Describes a single request sent through the Electron IPC bridge. */
export interface VeniceForgeRequest {
  endpoint: string;
  method: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
  signalId?: string;
}

/** Describes the response returned from the Electron IPC bridge. */
export interface VeniceForgeResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  contentType: string;
}

/** Provides methods for calling the Venice API via the main process. */
export interface VeniceForgeVenice {
  request(input: VeniceForgeRequest): Promise<VeniceForgeResponse>;
  streamChat(input: VeniceForgeRequest, onDelta: (delta: string) => void): Promise<VeniceForgeResponse>;
  abort(signalId: string): Promise<{ ok: boolean }>;
}

/** Diagnostic metadata about the desktop application environment. */
export interface VeniceForgeDiagnostics {
  isDesktop: boolean;
  appVersion: string;
  electronVersion?: string;
  chromeVersion?: string;
  nodeVersion?: string;
  userDataPath: string;
  logsPath?: string;
  storageMode: "encrypted" | "unavailable" | "plaintext-fallback" | "web";
  secureStorageAvailable: boolean;
  securePrefsCorrupted?: boolean;
  securePrefsError?: string | null;
  apiKeyConfigured: boolean;
  transport: "direct-ipc" | "web-proxy";
  lastApiError?: string;
}

/** Exposes application-level helpers available through the preload bridge. */
export interface VeniceForgeApp {
  getVersion(): Promise<string>;
  getDataPath(): Promise<string>;
  isEncryptionAvailable(): Promise<boolean>;
  getDiagnostics(): Promise<VeniceForgeDiagnostics>;
  openLogsFolder(): Promise<{ ok: boolean; path: string }>;
}

/** Exposes file dialog helpers for importing and exporting JSON data. */
export interface VeniceForgeFiles {
  saveJsonFile(data: string, defaultPath?: string): Promise<{ ok: boolean; canceled: boolean }>;
  loadJsonFile(): Promise<{ canceled: boolean; data?: string }>;
}

/** Root interface for the Venice Forge preload bridge exposed on the window object. */
export interface VeniceForge {
  readonly isDesktop: true;
  venice: VeniceForgeVenice;
  apiKey: VeniceForgeApiKey;
  app: VeniceForgeApp;
  files: VeniceForgeFiles;
}

declare global {
  /** Augments the global Window interface with the optional Venice Forge API. */
  interface Window {
    veniceForge?: VeniceForge;
  }
}
