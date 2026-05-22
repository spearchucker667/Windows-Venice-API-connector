// Code Owner: fayeblade (@spearchucker667)
/** @fileoverview Shared endpoint allowlist consumed by both Electron IPC and the web proxy. */

/** Venice API endpoints permitted by the IPC and proxy validators. */
export const ALLOWED_VENICE_ENDPOINTS = [
  "/models",
  "/chat/completions",
  "/image/generate",
  "/image/upscale",
  "/augment/search",
  "/augment/scrape",
  "/augment/text-parser",
] as const;

/** HTTP methods permitted for Venice API requests. */
export const ALLOWED_VENICE_METHODS = ["GET", "POST"] as const;

/** Union type of allowed Venice API endpoint paths. */
export type VeniceIpcEndpoint = (typeof ALLOWED_VENICE_ENDPOINTS)[number];

/** Union type of allowed Venice API HTTP methods. */
export type VeniceIpcMethod = (typeof ALLOWED_VENICE_METHODS)[number];
