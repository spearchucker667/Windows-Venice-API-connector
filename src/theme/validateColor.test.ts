/** @fileoverview Unit tests for theme color validation. */

import { describe, it, expect } from "vitest";
import { isValidColorValue } from "./validateColor";

describe("isValidColorValue", () => {
  it("accepts hex colors", () => {
    expect(isValidColorValue("#fff")).toBe(true);
    expect(isValidColorValue("#ffffff")).toBe(true);
    expect(isValidColorValue("#FFFFFF")).toBe(true);
    expect(isValidColorValue("#ff00ff")).toBe(true);
    expect(isValidColorValue("#ffffffff")).toBe(true);
  });

  it("accepts rgb and rgba", () => {
    expect(isValidColorValue("rgb(0,0,0)")).toBe(true);
    expect(isValidColorValue("rgba(0, 0, 0, 0.5)")).toBe(true);
    expect(isValidColorValue("rgba(255,255,255,1)")).toBe(true);
    expect(isValidColorValue("rgba(47,129,247,0.25)")).toBe(true);
  });

  it("accepts hsl and hsla", () => {
    expect(isValidColorValue("hsl(0,0%,0%)")).toBe(true);
    expect(isValidColorValue("hsla(120, 50%, 50%, 0.5)")).toBe(true);
    expect(isValidColorValue("hsl(200deg 50% 50%)")).toBe(true);
  });

  it("accepts safe keywords", () => {
    expect(isValidColorValue("transparent")).toBe(true);
    expect(isValidColorValue("currentColor")).toBe(true);
    expect(isValidColorValue("CURRENTCOLOR")).toBe(true);
  });

  it("rejects dangerous CSS patterns", () => {
    expect(isValidColorValue('url("https://evil.com")')).toBe(false);
    expect(isValidColorValue("expression(alert(1))")).toBe(false);
    expect(isValidColorValue("javascript:alert(1)")).toBe(false);
    expect(isValidColorValue('@import "evil.css"')).toBe(false);
  });

  it("rejects invalid or suspicious values", () => {
    expect(isValidColorValue("")).toBe(false);
    expect(isValidColorValue("red")).toBe(false);
    expect(isValidColorValue("blue")).toBe(false);
    expect(isValidColorValue("calc(100%)")).toBe(false);
    expect(isValidColorValue("var(--evil)")).toBe(false);
    expect(isValidColorValue("#gggggg")).toBe(false);
    expect(isValidColorValue("#ff")).toBe(false);
    expect(isValidColorValue("rgb()")).toBe(false);
  });

  it("rejects overly long strings", () => {
    expect(isValidColorValue("#" + "f".repeat(200))).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(isValidColorValue(null as unknown as string)).toBe(false);
    expect(isValidColorValue(123 as unknown as string)).toBe(false);
  });
});
