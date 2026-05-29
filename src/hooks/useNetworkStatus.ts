import { useEffect } from "react";
import type { AppDispatch } from "../types/app";

/**
 * Listens for browser online/offline events and dispatches
 * SET_ONLINE actions to keep the app state in sync.
 */
export function useNetworkStatus(dispatch: AppDispatch): void {
  useEffect(() => {
    const goOnline = () => dispatch({ type: "SET_ONLINE", online: true });
    const goOffline = () => dispatch({ type: "SET_ONLINE", online: false });
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [dispatch]);
}
