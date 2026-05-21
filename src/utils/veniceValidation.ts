/**
 * Runtime validators for Venice API response shapes.
 *
 * These guards are intentionally non-throwing: they return a normalised result
 * (or null/empty) and emit a console warning so callers can decide whether to
 * surface an error to the user or fall back gracefully.
 */

export interface ModelListResponse {
  data: any[];
}

export interface ImageGenerateResponse {
  images?: string[];
  data?: any[];
}

export interface ChatCompletionsResponse {
  choices: Array<{
    message?: { content?: string };
    delta?: { content?: string };
    text?: string;
  }>;
}

/**
 * Validates that a /models response contains a usable model list.
 * Returns true if the payload looks valid.
 */
export function isValidModelListResponse(payload: unknown): payload is ModelListResponse {
  if (!payload || typeof payload !== "object") {
    console.warn("[veniceValidation] /models response is not an object", payload);
    return false;
  }
  const p = payload as Record<string, unknown>;
  if (!Array.isArray(p.data)) {
    // Some Venice API variants return a bare array; tolerate that too.
    if (Array.isArray(payload)) return true;
    console.warn("[veniceValidation] /models response missing .data array", payload);
    return false;
  }
  return true;
}

/**
 * Validates that a /image/generate or /image/upscale response contains image data.
 * Returns true if the payload has at least one recognisable image field.
 */
export function isValidImageResponse(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") {
    console.warn("[veniceValidation] Image response is not an object", payload);
    return false;
  }
  const p = payload as Record<string, unknown>;
  const hasImages =
    (Array.isArray(p.images) && p.images.length > 0) ||
    (Array.isArray(p.data) && p.data.length > 0) ||
    typeof p.image === "string" ||
    typeof p.b64_json === "string" ||
    typeof p.base64 === "string" ||
    typeof p.url === "string";
  if (!hasImages) {
    console.warn("[veniceValidation] Image response contains no recognisable image data", payload);
  }
  return hasImages;
}

/**
 * Validates that a non-streaming /chat/completions response has choices.
 * Returns true if the payload looks usable.
 */
export function isValidChatResponse(payload: unknown): payload is ChatCompletionsResponse {
  if (!payload || typeof payload !== "object") {
    console.warn("[veniceValidation] Chat response is not an object", payload);
    return false;
  }
  const p = payload as Record<string, unknown>;
  if (!Array.isArray(p.choices) || p.choices.length === 0) {
    console.warn("[veniceValidation] Chat response missing .choices array", payload);
    return false;
  }
  return true;
}

/**
 * Validates a /augment/search response contains a results array.
 */
export function isValidSearchResponse(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") {
    console.warn("[veniceValidation] Search response is not an object", payload);
    return false;
  }
  const p = payload as Record<string, unknown>;
  const hasResults =
    Array.isArray(p.results) ||
    Array.isArray(p.data) ||
    Array.isArray(p.items) ||
    Array.isArray(payload);
  if (!hasResults) {
    console.warn("[veniceValidation] Search response contains no recognisable results field", payload);
  }
  return hasResults;
}
