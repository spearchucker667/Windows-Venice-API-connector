import { useEffect, useRef } from "react";
import StorageService from "../services/storageService";
import { warn } from "../shared/logger";
import type { AppState, AppDispatch } from "../types/app";

/**
 * Debounces settings changes and persists them to IndexedDB.
 * Only activates once both the database and initial hydration are ready.
 */
export function useSettingsPersistence(
  settings: AppState["settings"],
  dbReady: boolean,
  settingsHydrated: boolean,
  dispatch: AppDispatch
): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!dbReady || !settingsHydrated) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      StorageService.saveItem("settings", {
        id: "app-settings",
        value: settings,
        timestamp: Date.now(),
      }).catch((err) => {
        warn("Settings save failed", err);
        dispatch({
          type: "ADD_TOAST",
          toast: {
            id: crypto.randomUUID(),
            message: "Failed to save settings to local storage.",
            type: "error",
            duration: 5000,
          },
        });
      });
    }, 500);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [dbReady, settingsHydrated, settings, dispatch]);
}
