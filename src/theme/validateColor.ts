/** @fileoverview Validates that a CSS color value is safe and well-formed. */

/**
 * Dangerous CSS patterns that must be rejected to prevent injection via
 * theme token values (e.g. malicious `url(...)`, `expression(...)`, etc.).
 */
const DANGEROUS_PATTERNS = /url\(|expression\(|javascript:|@import/i;

/**
 * Allowed CSS color formats:
 * - Hex: #rgb, #rgba, #rrggbb, #rrggbbaa
 * - RGB/RGBA: rgb(...), rgba(...)
 * - HSL/HSLA: hsl(...), hsla(...)
 * - Safe keywords: transparent, currentColor
 */
const SAFE_COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgba?\(\s*[-+\d\s.,%/]+\s*\)|hsla?\(\s*[-+\d\s.,deg%/]+\s*\)|transparent|currentColor)$/i;

/**
 * Returns true if the string is a safe, recognized CSS color value.
 * Rejects values containing dangerous CSS functions or at-rules.
 */
export function isValidColorValue(value: string): boolean {
  if (typeof value !== "string") return false;
  if (value.length > 128) return false;
  if (DANGEROUS_PATTERNS.test(value)) return false;
  return SAFE_COLOR_RE.test(value);
}
