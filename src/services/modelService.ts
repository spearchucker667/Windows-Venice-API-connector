import { veniceFetch } from "./veniceClient";
import { flattenModels } from "../state/appReducer";
import { isValidModelListResponse } from "../utils/veniceValidation";

const CACHE_KEY = "venice-forge-models-cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface ModelsCache {
  grouped: any;
  fetchedAt: number;
}

function readCache(): ModelsCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(grouped: any): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ grouped, fetchedAt: Date.now() }));
  } catch {
    // localStorage may be full or unavailable.
  }
}

export async function refreshModels(dispatch: any, force = false): Promise<void> {
  const cached = readCache();

  // Serve cached data immediately (even if stale) to reduce perceived latency.
  if (cached) {
    dispatch({ type: "SET_MODELS", models: cached.grouped, fallback: false });
    const isStale = Date.now() - cached.fetchedAt > CACHE_TTL_MS;
    if (!force && !isStale) {
      return; // Fresh — no background refresh needed.
    }
    // Stale or forced: fall through to background refresh while cached UI is already shown.
  }

  try {
    const { data } = await veniceFetch("/models?type=all", {
      method: "GET",
      dispatch,
      retry: true,
      dedupe: true,
    });
    if (!isValidModelListResponse(data)) {
      throw new Error("Unexpected /models response shape.");
    }
    const grouped = flattenModels(data);
    writeCache(grouped);
    dispatch({ type: "SET_MODELS", models: grouped, fallback: false });
  } catch (err: any) {
    // If we already served cached data, swallow the error silently.
    if (!cached) {
      dispatch({
        type: "SET_MODELS",
        models: undefined,
        fallback: true,
        error:
          err.message ||
          "Model discovery failed; using non-exhaustive static fallbacks.",
      });
    }
  }
}
