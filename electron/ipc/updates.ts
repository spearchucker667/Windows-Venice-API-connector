import { BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { logError, logInfo } from "../services/logger";

// Do not auto-download; give user the choice via the UI.
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

/** Broadcasts an IPC event to all open renderer windows. */
function broadcast(channel: string, payload?: unknown) {
  const windows = BrowserWindow.getAllWindows();
  for (const win of windows) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload);
    }
  }
}

/** Registers IPC handlers and autoUpdater event listeners. */
export function registerUpdateHandlers(): void {
  // IPC Handlers
  ipcMain.handle("app:checkForUpdates", async () => {
    try {
      logInfo("Checking for updates manually");
      const result = await autoUpdater.checkForUpdates();
      return { ok: true, version: result?.updateInfo?.version };
    } catch (err) {
      logError("Check for updates failed", String(err));
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle("app:downloadUpdate", async () => {
    try {
      logInfo("Triggering update download");
      await autoUpdater.downloadUpdate();
      return { ok: true };
    } catch (err) {
      logError("Download update failed", String(err));
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle("app:installUpdate", () => {
    logInfo("Installing update and restarting");
    autoUpdater.quitAndInstall();
    return { ok: true };
  });

  // autoUpdater Events -> IPC Broadcasts
  autoUpdater.on("checking-for-update", () => {
    broadcast("updates:checking");
  });

  autoUpdater.on("update-available", (info) => {
    broadcast("updates:available", info);
  });

  autoUpdater.on("update-not-available", () => {
    broadcast("updates:not-available");
  });

  autoUpdater.on("download-progress", (progressObj) => {
    broadcast("updates:progress", progressObj);
  });

  autoUpdater.on("update-downloaded", () => {
    broadcast("updates:downloaded");
  });

  autoUpdater.on("error", (err) => {
    const msg = err instanceof Error ? err.message : String(err);
    logError("AutoUpdater error", msg);
    broadcast("updates:error", msg);
  });
}
