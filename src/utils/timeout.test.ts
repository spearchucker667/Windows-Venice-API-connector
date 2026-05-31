import { describe, it, expect, vi } from "vitest";
import { sleep, createTimeoutSignal } from "./timeout";

describe("timeout utils", () => {
  describe("sleep", () => {
    it("resolves after the given time", async () => {
      vi.useFakeTimers();
      const p = sleep(100);
      vi.advanceTimersByTime(100);
      await expect(p).resolves.toBeUndefined();
      vi.useRealTimers();
    });

    it("rejects immediately if signal is already aborted", async () => {
      const controller = new AbortController();
      controller.abort();
      await expect(sleep(100, controller.signal)).rejects.toThrow("Request aborted");
    });

    it("rejects if signal aborts during sleep", async () => {
      vi.useFakeTimers();
      const controller = new AbortController();
      const p = sleep(100, controller.signal);
      controller.abort();
      await expect(p).rejects.toThrow("Request aborted");
      vi.useRealTimers();
    });
  });

  describe("createTimeoutSignal", () => {
    it("aborts after the given ms", async () => {
      const signal = createTimeoutSignal(10);
      expect(signal.aborted).toBe(false);
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(signal.aborted).toBe(true);
    });

    it("aborts when parent signal aborts", () => {
      const parent = new AbortController();
      const signal = createTimeoutSignal(100, parent.signal);
      expect(signal.aborted).toBe(false);
      parent.abort();
      expect(signal.aborted).toBe(true);
    });
  });
});
