/** @fileoverview Shared utilities for handling timeouts and abort signals. */

/**
 * Creates an abort signal that fires after `ms`, optionally composing
 * with a parent signal. Falls back to manual timeout for runtimes that
 * lack AbortSignal.timeout / AbortSignal.any.
 *
 * @param ms The timeout duration in milliseconds.
 * @param parentSignal An optional parent AbortSignal to compose with.
 * @returns A new AbortSignal that aborts on timeout or parent abort.
 */
export function createTimeoutSignal(ms: number, parentSignal?: AbortSignal | null): AbortSignal {
  if (ms <= 0) return parentSignal || new AbortController().signal;

  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
    const timeoutSignal = AbortSignal.timeout(ms);
    if (parentSignal && typeof AbortSignal !== "undefined" && AbortSignal.any) {
      return AbortSignal.any([parentSignal, timeoutSignal]);
    }
    return timeoutSignal;
  }

  // Fallback for older runtimes
  const controller = new AbortController();
  let onAbort: (() => void) | undefined;
  
  const id = setTimeout(() => {
    if (onAbort && parentSignal) {
      parentSignal.removeEventListener("abort", onAbort);
    }
    controller.abort();
  }, ms);

  if (parentSignal) {
    onAbort = () => {
      clearTimeout(id);
      controller.abort();
    };
    parentSignal.addEventListener("abort", onAbort, { once: true });
    if (parentSignal.aborted) {
      onAbort();
    }
  }

  return controller.signal;
}

/**
 * Pauses execution for a given duration, optionally respecting an abort signal.
 * @param ms The number of milliseconds to sleep.
 * @param signal An optional abort signal to cancel the sleep early.
 * @returns A promise that resolves after the delay or rejects if aborted.
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Request aborted", "AbortError"));
      return;
    }
    let onAbort: (() => void) | undefined;
    const id = setTimeout(() => {
      if (onAbort && signal) {
        signal.removeEventListener("abort", onAbort);
      }
      resolve();
    }, ms);
    if (signal) {
      onAbort = () => {
        clearTimeout(id);
        reject(new DOMException("Request aborted", "AbortError"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}
