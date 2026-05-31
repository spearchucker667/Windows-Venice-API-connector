import { describe, it, expect } from "vitest";
import { validateAppSettings } from "./configSchema";

describe("validateAppSettings", () => {
  it("drops unrecognized keys and ignores primitives", () => {
    expect(validateAppSettings(null)).toEqual({});
    expect(validateAppSettings("foo")).toEqual({});
    expect(validateAppSettings(["array"])).toEqual({});
    expect(validateAppSettings({ defaultSystemPrompt: "test", foo: "bar" }))
      .toEqual({ defaultSystemPrompt: "test" });
  });

  it("preserves valid boolean fields", () => {
    expect(validateAppSettings({ includeVeniceSystemPrompt: true, webScraping: false }))
      .toEqual({ includeVeniceSystemPrompt: true, webScraping: false });
    
    // drops invalid types
    expect(validateAppSettings({ includeVeniceSystemPrompt: "true", webScraping: 1 }))
      .toEqual({});
  });

  it("preserves valid string and array fields", () => {
    expect(validateAppSettings({ 
      webSearch: "auto", 
      theme: "dark",
      customModels: ["m1", "m2", 123]
    })).toEqual({
      webSearch: "auto",
      theme: "dark",
      customModels: ["m1", "m2"]
    });
  });

  it("handles empty objects", () => {
    expect(validateAppSettings({})).toEqual({});
  });
});
