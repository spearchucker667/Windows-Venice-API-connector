import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isValidModelListResponse,
  isValidImageResponse,
  isValidChatResponse,
  isValidSearchResponse,
} from "./veniceValidation";

describe("veniceValidation", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("isValidModelListResponse", () => {
    it("accepts a payload with a data array", () => {
      expect(isValidModelListResponse({ data: [{ id: "model-1" }] })).toBe(true);
    });

    it("accepts an empty data array", () => {
      expect(isValidModelListResponse({ data: [] })).toBe(true);
    });

    it("accepts a bare array (alternate Venice shape)", () => {
      expect(isValidModelListResponse([{ id: "model-1" }])).toBe(true);
    });

    it("rejects null", () => {
      expect(isValidModelListResponse(null)).toBe(false);
    });

    it("rejects an object with no data array", () => {
      expect(isValidModelListResponse({ models: [] })).toBe(false);
    });

    it("rejects a plain string", () => {
      expect(isValidModelListResponse("not-an-object")).toBe(false);
    });
  });

  describe("isValidImageResponse", () => {
    it("accepts payload with images array", () => {
      expect(isValidImageResponse({ images: ["data:image/png;base64,abc"] })).toBe(true);
    });

    it("accepts payload with data array", () => {
      expect(isValidImageResponse({ data: [{ b64_json: "abc" }] })).toBe(true);
    });

    it("accepts payload with image string", () => {
      expect(isValidImageResponse({ image: "data:image/png;base64,abc" })).toBe(true);
    });

    it("accepts payload with b64_json string", () => {
      expect(isValidImageResponse({ b64_json: "abc" })).toBe(true);
    });

    it("accepts payload with url string", () => {
      expect(isValidImageResponse({ url: "https://example.com/img.png" })).toBe(true);
    });

    it("accepts payload with dataUrl (web binary PNG response)", () => {
      expect(isValidImageResponse({ dataUrl: "data:image/png;base64,abc" })).toBe(true);
    });

    it("accepts payload with dataBase64 (Electron binary PNG response)", () => {
      expect(isValidImageResponse({ dataBase64: "iVBORw0KGgo=" })).toBe(true);
    });

    it("rejects null", () => {
      expect(isValidImageResponse(null)).toBe(false);
    });

    it("rejects an empty object", () => {
      expect(isValidImageResponse({})).toBe(false);
    });

    it("rejects empty images array", () => {
      expect(isValidImageResponse({ images: [] })).toBe(false);
    });
  });

  describe("isValidChatResponse", () => {
    it("accepts a payload with non-empty choices", () => {
      expect(
        isValidChatResponse({ choices: [{ message: { content: "Hello" } }] })
      ).toBe(true);
    });

    it("rejects null", () => {
      expect(isValidChatResponse(null)).toBe(false);
    });

    it("rejects missing choices", () => {
      expect(isValidChatResponse({ id: "chatcmpl-1" })).toBe(false);
    });

    it("rejects empty choices array", () => {
      expect(isValidChatResponse({ choices: [] })).toBe(false);
    });
  });

  describe("isValidSearchResponse", () => {
    it("accepts payload with results array", () => {
      expect(isValidSearchResponse({ results: [{ title: "Test" }] })).toBe(true);
    });

    it("accepts payload with data array", () => {
      expect(isValidSearchResponse({ data: [] })).toBe(true);
    });

    it("accepts payload with items array", () => {
      expect(isValidSearchResponse({ items: [] })).toBe(true);
    });

    it("accepts a bare array", () => {
      expect(isValidSearchResponse([])).toBe(true);
    });

    it("rejects null", () => {
      expect(isValidSearchResponse(null)).toBe(false);
    });

    it("rejects an object with no recognised results field", () => {
      expect(isValidSearchResponse({ query: "test" })).toBe(false);
    });
  });
});
