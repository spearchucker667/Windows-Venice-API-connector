// Code Owner: fayeblade (@spearchucker667)
// Electron vs. web mode abstraction — never call window.veniceForge directly from modules.
import "../types/desktop";
import type { VeniceForgeDiagnostics, VeniceForgeRequest, VeniceForgeResponse } from "../types/desktop";
import StorageService from "./storageService";
import { veniceFetch } from "./veniceClient";

export function isElectron(): boolean {
  return typeof window !== "undefined" && window.veniceForge?.isDesktop === true;
}

export async function initDesktopBridge(): Promise<void> {
  if (!isElectron()) return;
  await window.veniceForge!.app.getDiagnostics();
}

function createSignalId(): string {
  return crypto.randomUUID();
}

function attachAbort(signalId: string, signal?: AbortSignal): (() => void) | undefined {
  if (!signal) return undefined;
  const abort = () => {
    window.veniceForge?.venice.abort(signalId).catch(() => {});
  };
  if (signal.aborted) abort();
  signal.addEventListener("abort", abort, { once: true });
  return () => signal.removeEventListener("abort", abort);
}

export const desktopVenice = {
  async request(input: VeniceForgeRequest, signal?: AbortSignal): Promise<VeniceForgeResponse> {
    if (!isElectron()) throw new Error("Venice desktop transport is only available in desktop mode.");
    const signalId = input.signalId || createSignalId();
    const cleanup = attachAbort(signalId, signal);
    try {
      return await window.veniceForge!.venice.request({ ...input, signalId });
    } finally {
      cleanup?.();
    }
  },

  async streamChat(
    input: VeniceForgeRequest,
    onDelta: (delta: string) => void,
    signal?: AbortSignal
  ): Promise<VeniceForgeResponse> {
    if (!isElectron()) throw new Error("Venice desktop transport is only available in desktop mode.");
    const signalId = input.signalId || createSignalId();
    const cleanup = attachAbort(signalId, signal);
    try {
      return await window.veniceForge!.venice.streamChat({ ...input, signalId }, onDelta);
    } finally {
      cleanup?.();
    }
  },
};

export const desktopApiKey = {
  async isConfigured(): Promise<boolean> {
    if (isElectron()) return window.veniceForge!.apiKey.isConfigured();
    const items = await StorageService.getItems("settings");
    return items.some((item) => item.id === "venice-api-key" && !!item.value);
  },
  async set(key: string): Promise<{ ok: boolean }> {
    if (isElectron()) return window.veniceForge!.apiKey.set(key);
    await StorageService.saveItem("settings", {
      id: "venice-api-key",
      value: key,
      timestamp: Date.now(),
    });
    return { ok: true };
  },
  async delete(): Promise<{ ok: boolean }> {
    if (isElectron()) return window.veniceForge!.apiKey.delete();
    await StorageService.deleteItem("settings", "venice-api-key");
    return { ok: true };
  },
  async test(): Promise<{ ok: boolean; status?: number; message: string }> {
    if (isElectron()) return window.veniceForge!.apiKey.test();
    try {
      const { response } = await veniceFetch("/models", { retry: false });
      return { ok: response.ok, status: response.status, message: response.statusText };
    } catch (err: any) {
      return { ok: false, status: err.status, message: err.message };
    }
  },
};

export const desktopApp = {
  getVersion(): Promise<string> {
    if (!isElectron()) return Promise.resolve("web");
    return window.veniceForge!.app.getVersion();
  },
  getDataPath(): Promise<string> {
    if (!isElectron()) return Promise.resolve("IndexedDB (browser)");
    return window.veniceForge!.app.getDataPath();
  },
  isEncryptionAvailable(): Promise<boolean> {
    if (!isElectron()) return Promise.resolve(false);
    return window.veniceForge!.app.isEncryptionAvailable();
  },
  getDiagnostics(): Promise<VeniceForgeDiagnostics> {
    if (!isElectron()) {
      return Promise.resolve({
        isDesktop: false,
        appVersion: "web",
        userDataPath: "IndexedDB (browser)",
        storageMode: "web",
        secureStorageAvailable: false,
        apiKeyConfigured: false,
        transport: "web-proxy",
      });
    }
    return window.veniceForge!.app.getDiagnostics();
  },
  openLogsFolder(): Promise<{ ok: boolean; path: string }> {
    if (!isElectron()) return Promise.resolve({ ok: false, path: "" });
    return window.veniceForge!.app.openLogsFolder();
  },
};

export const desktopFiles = {
  async exportJson(data: unknown, defaultPath = "venice-forge-export.json"): Promise<boolean> {
    const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    if (!isElectron()) {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = defaultPath;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }
    const result = await window.veniceForge!.files.saveJsonFile(json, defaultPath);
    return result.ok;
  },

  async importJsonString(): Promise<string | null> {
    if (!isElectron()) return null;
    const result = await window.veniceForge!.files.loadJsonFile();
    if (result.canceled || !result.data) return null;
    return result.data;
  },
};
