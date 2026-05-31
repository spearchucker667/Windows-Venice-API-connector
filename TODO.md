# Venice Forge — Repository TODO

> Refreshed: 2026-06-01
> Scope: source, tests, docs, workflows, agent instructions, and repository hygiene
> Baseline checks this pass: `npm run typecheck`, `npm run lint:eslint`, `npm run verify:safety-guard`, `npm audit --omit=dev`, `npm test`, `npm run build`

## Audit Summary

| Category | Count |
|----------|-------|
| Critical bugs (fixed this pass) | 5 |
| High-priority bugs (fixed this pass) | 8 |
| Medium-priority open bugs | 11 |
| Low/accessibility/UX open items | 9 |
| Documentation/config tasks | 5 |
| Security hardening tasks | 6 |
| Missing tests / coverage gaps | 14 |

---

## Critical Bugs — Fixed in This Pass

- [x] **[CRIT-001] XSS via innerHTML in fatal error handler** — `src/main.tsx:26`
  - `rootEl.innerHTML` was used with an interpolated error stack/message, creating a DOM XSS vector if an attacker could influence the thrown error.
  - **Fix:** Replaced `innerHTML` with safe `document.createElement` / `textContent` construction.

- [x] **[CRIT-002] SSRF bypasses in Generic HTTP provider** — `src/research/providers/genericHttpScrapeProvider.ts:39`
  - `isSafeUrl` did not block decimal IPv4 (`2130706433`), short-form IPv4 (`127.1`), hex-dotted IPv4 (`0x7f.0.0.1`), or full IPv6 loopback (`0:0:0:0:0:0:0:1`).
  - **Fix:** Added explicit rejection for `/^\d+$/`, `/^0x[0-9a-f]+(\.[0-9a-f]+){0,3}$/i`, and `0:0:0:0:0:0:0:1`/`::` hostnames.

- [x] **[CRIT-003] RangeError crash in safety guard from split surrogate pairs** — `src/shared/safety/childExploitationGuard.ts:298`
  - `normalizeBase` sliced at `MAX_SCAN_CHARS` without checking for a trailing high surrogate, causing `String.prototype.normalize("NFKC")` to throw `RangeError`.
  - **Fix:** Added surrogate-boundary guard that strips trailing lone surrogates before `normalize()`.

- [x] **[CRIT-004] Safety guard bypass for native FormData in web mode** — `src/shared/safety/promptPayloadExtractor.ts:170`
  - `extractPromptLikeFields` handled serialized FormData (`_isSerializedFormData`) but not real browser `FormData` instances, causing text fields in FormData bodies to bypass the guard entirely.
  - **Fix:** Added `instanceof FormData` branch that iterates `formData.entries()` and extracts string values.

- [x] **[CRIT-005] Arbitrary file read within home directory via `app:readLocalFile`** — `electron/ipc/handlers.ts:321`
  - The IPC handler allowed reading any file under `app.getPath("home")`, including SSH keys, shell history, and encrypted `secure-prefs.json`.
  - **Fix:** Restricted reads to `Downloads` and `Documents` directories only.

---

## High-Priority Bugs — Fixed in This Pass

- [x] **[HIGH-001] Unhandled rejection in SettingsModule update install** — `src/modules/SettingsModule.tsx:116`
  - `installUpdate()` was async but passed directly to `onClick` without try/catch.
  - **Fix:** Wrapped `desktopUpdates.installUpdate()` in try/catch with user-facing status update on failure.

- [x] **[HIGH-002] Unhandled rejection in DiagnosticsModule open logs** — `src/modules/DiagnosticsModule.tsx:72`
  - `openLogs()` was async without error handling.
  - **Fix:** Added try/catch that dispatches an error toast on failure.

- [x] **[HIGH-003] ConfirmModal delete conversation lacks async error boundary** — `src/modules/ChatModule.tsx:1412`
  - `onConfirm={() => handleDeleteConversation(deleteTarget)}` could produce an unhandled rejection.
  - **Fix:** Wrapped in async try/catch with `setError` and `setDeleteTarget(null)` in both success and error paths.

- [x] **[HIGH-004] Log injection via unescaped newlines** — `electron/services/logger.ts:119`
  - Renderer console messages containing `\n` could inject forged log lines into the main-process log file.
  - **Fix:** Sanitize `\r` and `\n` to `\\n` before writing to the log file.

- [x] **[HIGH-005] Production static path bug + potential info disclosure** — `server.ts:384`
  - `distPath = path.join(getModuleDir(), "dist")` resolved to `dist/dist/`, which does not exist, causing the production server to crash. If corrected, it would also serve `server.cjs` and `server.cjs.map`.
  - **Fix:** Changed `distPath` to `getModuleDir()` directly.

- [x] **[HIGH-006] Broken test: SearchScrapeModule invalid response shape** — `src/modules/SearchScrapeModule.test.tsx:65`
  - Test mocked `veniceFetch` to resolve, bypassing the validator entirely, so `role="alert"` was never rendered.
  - **Fix:** Changed mock to `mockRejectedValueOnce` with the validation error message.

- [x] **[HIGH-007] Broken test: verify-dist CJS top-level return** — `scripts/verify-dist.cjs:35`
  - Top-level `return` inside `if (require.main !== module)` is a syntax error when Vitest imports the CJS file as ESM.
  - **Fix:** Refactored to `if (...) { module.exports = ...; } else { ... }` pattern.

- [x] **[HIGH-008] TOCTOU symlink swap in `app:readLocalFile`** — `electron/ipc/handlers.ts:330`
  - `fs.realpath` was called to resolve the path, then `fs.stat` and `fs.readFile` were separate syscalls using that path string. A symlink or file swap between `stat` and `readFile` could bypass the "regular file" check.
  - **Fix:** Opens the file with `fs.open()` first, then `fstat()`s and reads via the same file descriptor, ensuring both operations target the same inode.

---

## Medium-Priority Open Bugs

- [x] **[MED-001] Toast fires before persistence confirmed** — `src/modules/ChatModule.tsx:414`
  - `clear()` dispatches a success toast before awaiting `saveConversation`. If persistence throws, the user sees success but data is not saved.
  - **Fix:** Wrapped persistence in try/catch; toast only on success, error toast on failure.

- [x] **[MED-002] `handleNewChat` lacks error handling** — `src/modules/ChatModule.tsx:427`
  - `saveConversation` is awaited without try/catch. A persistence failure leaves the user with no feedback.
  - **Fix:** Wrapped in try/catch with error toast dispatch on failure.

- [x] **[MED-003] `handleSwitchConversation` lacks error handling** — `src/modules/ChatModule.tsx:444`
  - `persistMessages` can throw without catch.
  - **Fix:** Added try/catch around `persistMessages` and surfaced the error via toast.

- [x] **[MED-004] `handleImportMessages` lacks error handling** — `src/modules/ChatModule.tsx:572`
  - If `persistMessages` throws, modal state is never reset, leaving the UI stuck.
  - **Fix:** Wrapped persistence in try/catch and moved state reset to `finally`.

- [x] **[MED-005] Silent failure for memory loading** — `src/modules/ChatModule.tsx:239`
  - `selectMemoriesForInjection` errors are swallowed with an empty catch. If IndexedDB is corrupted, memory injection breaks silently.
  - **Fix:** Added warning toast: "Memory injection unavailable. Continuing without it."

- [x] **[MED-006] Dead ternary logic in Markdown rendering** — `src/modules/ChatModule.tsx:1055`
  - `<Markdown text={m.content || (loading && idx === messages.length - 1 ? "" : "")} />` always evaluates to `""` on the right side of `||`.
  - **Fix:** Simplified to `<Markdown text={m.content || ""} />`.

- [x] **[MED-007] Duplicate array filtering in JSX** — `src/modules/ChatModule.tsx:1344`
  - `conversations.filter((c) => c.id !== activeId)` is computed twice.
  - **Fix:** Computed `const otherConversations = conversations.filter(c => c.id !== activeId);` once via IIFE.

- [x] **[MED-008] Stale effect dependency in ImageActionModal** — `src/modules/ImageModule.tsx:44`
  - `useEffect` dependency is `!!image` (boolean). If the modal is open and `image` changes from one object to another (both truthy), the effect does not re-run.
  - **Fix:** Changed dependency to `image` itself.

- [ ] **[MED-009] Chat cancel skips rollback** — `src/modules/ChatModule.tsx:318–430`
  - `cancel()` increments `runIdRef` before calling `abort()`. This causes the running stream handler to see a mismatched run-id and exit without restoring `prompt`/`attachments` or removing the orphaned assistant placeholder.
  - **Suggested fix:** Call `abort()` first and let the stream's own run-id guard restore state, or snapshot prompt/attachments before the request and restore them in `cancel()`.

- [ ] **[MED-010] `saveConversation()` `.ok` not checked in callers** — `src/modules/ChatModule.tsx:193,215`, `src/modules/SettingsModule.tsx:345`
  - All callers await `saveConversation()` but ignore the `{ ok, error }` result. A failed disk write is silently treated as success.
  - **Suggested fix:** Check `.ok` and surface the error via toast (or existing `setError` state).

- [ ] **[MED-011] Memory import duplicates entries on re-import** — `src/services/memoryService.ts:35–42`, `src/modules/SettingsModule.tsx:350`
  - Imported `ai_memory` records are passed to `saveMemory()`, which always generates a new random ID. Re-importing the same export creates duplicate memory entries.
  - **Suggested fix:** Add a `upsertMemory(record)` helper that uses the original `id` and `createdAt` from the import, falling back to `saveMemory()` only for records without a valid ID.

---

## Low-Priority / Quality / Performance

- [x] **[LOW-001] Unnecessary re-computation of `lastAssistant`** — `src/modules/ChatModule.tsx:661`
  - `lastAssistant` is recalculated on every render by reversing and searching the `messages` array.
  - **Fix:** Memoized with `React.useMemo`.

- [x] **[LOW-002] Misleading AbortError check** — `src/modules/ImageModule.tsx:188`
  - `error.message !== "AbortError"` is redundant; only `error.name === "AbortError"` is reliable for `DOMException`.
  - **Fix:** Removed the message check.

- [x] **[LOW-003] Unsafe type cast in `upscaleCurrent`** — `src/modules/ImageModule.tsx:259`
  - Fallback object in the `||` chain is cast with `as GalleryImage` even though it may be missing optional fields.
  - **Fix:** Built a properly typed fallback object and removed the `as GalleryImage` cast.

- [ ] **[LOW-004] Side effect inside reducer** — `src/state/appReducer.ts:182`
  - The reducer pushes toast messages directly into `draft.toasts`. Reducers should be pure.
  - **Suggested fix:** Move the auto-switch toast logic into the `refreshModels` service or into a middleware/effect.

- [ ] **[LOW-005] CSS injection via custom theme import** — `src/theme/applyTheme.ts` + `ThemeMaker.tsx`
  - `isValidTheme` does not validate that token values are hex colors. A malicious import could set a token to `url(https://evil.com)` or other CSS.
  - **Suggested fix:** Validate each token against a hex-color regex before applying, or sanitize CSS custom properties.

- [ ] **[LOW-006] Feature discrepancy in web mode export/import** — `src/modules/SettingsModule.tsx:648`
  - Export/Import buttons are hidden when `!isElectron()`, but the underlying functions work in web mode.
  - **Suggested fix:** Either enable the buttons in web mode or add an explicit guard inside the functions.

- [ ] **[LOW-007] SSRF DNS rebinding in Generic HTTP provider** — `src/research/providers/genericHttpScrapeProvider.ts:7`
  - SSRF defense is hostname-string-only (no DNS resolution). A rebinding attack or helper domain (e.g. `evil.com` resolving to `127.0.0.1`) can bypass the blocklist.
  - **Suggested fix:** If this provider is enabled, resolve A/AAAA records and reject private/reserved results before connecting, or keep this provider disabled-by-default and backend-only.

- [ ] **[LOW-008] `readWithLimit` oversized body not cancelled** — `src/research/providers/genericHttpScrapeProvider.ts:208`
  - When the byte limit is hit the reader loop exits, but the response body stream keeps downloading in the background.
  - **Fix:** Call `response.body?.cancel()` after releasing the reader lock when the limit is hit. *(Partially addressed — cancel is now called, but body may still buffer one chunk beyond the limit.)*

- [ ] **[LOW-009] Atomic-write temp file not cleaned up on failure** — `electron/services/secureStore.ts:55`, `electron/services/chatStorage.ts:214`
  - On write errors the `.tmp` file is left on disk; `secureStore.ts` could leave an API-key material file if fallback plaintext mode is active.
  - **Fix:** `unlink` the temp file in the `catch`/error path. *(chatStorage already fixed; secureStore.ts fixed in this pass.)*

---

## Security Hardening

- [x] **[SEC-001] Renderer console log flooding (DoS)** — `electron/main.ts:140`
  - The `console-message` event forwards all renderer logs to the main-process log file with no length cap.
  - **Fix:** Truncate messages to 10,000 characters before passing to `logInfo`/`logError`.

- [x] **[SEC-002] `activeRequests` leak on duplicate `signalId`** — `electron/services/veniceClient.ts:298`
  - `performVeniceRequest` unconditionally overwrites `activeRequests.set(request.signalId, ...)`. If a malicious renderer reuses a `signalId`, the previous request becomes unabortable and leaks.
  - **Fix:** Abort previous request before overwriting if `activeRequests.has(request.signalId)`.

- [x] **[SEC-003] `beforeunload` may not fire for stream cleanup** — `electron/preload.ts:45`
  - Modern browsers and some Electron scenarios suppress or delay `beforeunload`.
  - **Fix:** Added `pagehide` event listener as a secondary abort signal.

- [x] **[SEC-004] Low-entropy backup suffix for corrupt chat files** — `electron/services/chatStorage.ts:68`
  - Backup suffix uses `Math.random().toString(36).slice(2, 8)` (only 6 base-36 characters).
  - **Fix:** Replaced with `crypto.randomUUID()`.

- [ ] **[SEC-005] Production CSP `script-src` uses `unsafe-inline`** — `electron/main.ts:28`
  - `rendererCsp()` uses `'unsafe-inline'` for `script-src` in production to accommodate an inline theme bootstrap script.
  - **Suggested fix:** Compute the SHA-256 hash of the inline bootstrap script at build time and inject `script-src 'self' 'sha256-<hash>'`, removing `'unsafe-inline'`.

- [ ] **[SEC-006] Express CSP may break inline scripts** — `server.ts:131`
  - The Express CSP sets `script-src 'self'` with no `'unsafe-inline'` or hash. If the production web build contains the same inline bootstrap script used in Electron, it will be blocked.
  - **Suggested fix:** Align the Express CSP with the Electron CSP, or serve the bootstrap script as an external `.js` file.

---

## Missing Tests / Coverage Gaps

### Tier 1 — Security-Critical, Must Test

- [x] Add tests for `electron/ipc/handlers.ts` — 451 safety block, `app:readLocalFile` restrictions, API key validation.
- [x] Add tests for `electron/utils/urlSecurity.ts` — private IP blocking and HTTPS enforcement (extended existing tests in `main.test.ts`).
- [x] Add tests for `electron/utils/navigation.ts` — path containment for local file access (already covered in `main.test.ts`).
- [x] Add tests for `src/shared/validation.ts` — endpoint/method allowlist (`validation.test.ts` created).

### Tier 2 — Core Functionality, Should Test

- [x] Add tests for `src/modules/BatchModule.tsx` — rendering, validation, fallback model blocking.
- [x] Add tests for `src/modules/ModelsModule.tsx` — rendering, error display, model selects.
- [x] Add FormData coverage to `src/shared/safety/promptPayloadExtractor.test.ts` for the bypass scenario fixed in CRIT-004.
- [x] Add tests for `src/services/veniceClient.ts` edge cases: `computeRateLimitWait` with HTTP-date format `Retry-After` header.

### Tier 3 — UI / Component / Hook Tests

- [x] Add component tests for `ErrorBoundary.tsx` and `ToastHost.tsx`.
- [x] Add tests for `useFocusTrap.ts` — focus cycling, Escape handling.
- [x] Add tests for `useNetworkStatus.ts` — online/offline dispatch.
- [x] Add tests for `useThemeLifecycle.ts` — theme application, localStorage persistence.
- [x] Add tests for `useSettingsPersistence.ts` — debounced save, error toast.
- [x] Add tests for `scripts/verify-safety-guard.cjs` — the safety verification script itself should be tested.

### Tier 4 — Electron Environment Correctness

- [x] Add `// @vitest-environment node` to all Electron test files for semantic correctness.

---

## Documentation Gaps

- [x] Fixed stale `--max-warnings=96` references across `docs/FAQ.md`, `docs/ABOUT.md`, `docs/DEVELOPMENT/troubleshooting.md`, `docs/AGENTS/*.md`.
- [x] Fixed `npm audit` inconsistency between `SECURITY.md`/`AGENTS.md` and CI (`--audit-level=moderate`).
- [x] Fixed broken `[todo.md]` link in `docs/HQE_AUDIT_REPORT.md`.
- [x] Added memory and vision/attachment FAQ entries.
- [x] Updated `docs/RELEASE/release.md` smoke-test checklist with memory/attachment items.
- [x] Updated `docs/REPOSITORY_TREE.md` with missing script files.
- [ ] Document Linux packaging status or remove the Linux target if unsupported.
- [ ] Document `build/icon.png` as a required Linux packaging resource if Linux target remains.
- [ ] Keep `docs/REPOSITORY_TREE.md` updated after file renames/additions.
- [ ] Add a short maintainer note explaining ignored generated audit handoff files under `docs/AGENTS/`.
- [ ] Update release docs whenever signing, artifact naming, or verification commands change.
- [ ] Update security docs whenever allowed Venice endpoints or safety boundaries change.

---

## Refactoring / Tech Debt

- [x] Fixed `matchesPatterns` shared regex `lastIndex` mutation risk — now clones regexes before testing.
- [x] Fixed `escapeXml` incomplete single-quote escaping — added `&apos;`.
- [x] Fixed O(n²) deduplication in `socialDiscovery.ts:313` — replaced with `Set`.
- [x] Fixed `trimContent` off-by-13 in `researchRunner.ts:110` — slices to `maxChars - suffix.length`.
- [x] Fixed `ResearchBudgetExceededError` misuse for non-budget errors — now uses generic `Error`.
- [x] Fixed renderer `logger.ts` never detecting production — now uses `import.meta.env.MODE` fallback.
- [x] Fixed `React` namespace used without import — `src/types/app.ts:111` now uses `import("react").Dispatch`.
- [x] Removed dead `ModelGroups` interface — `src/types/venice.ts:24`.
- [ ] Consider extracting chat send orchestration into a testable service.
- [ ] Consider a small persistence schema module for settings, conversations, gallery images, and imports.
- [ ] Unify `ImageDraft` / `GalleryImage` dimension types — `src/types/app.ts` vs `src/types/storage.ts`.
- [ ] Deepen `customTheme` validation in `validateAppSettings` — `src/shared/configSchema.ts:100`.

---

## Feature Completeness Checklist

- [ ] Chat: cancellation, retry diagnostics, memory injection, attachment handling, and conversation persistence are documented and covered.
- [ ] Image generation: batch generation, upscale, watermark fallback, and gallery save flows are documented and covered.
- [ ] Research: Venice, Jina, Generic HTTP, synthesis, and profile discovery flows are documented and covered.
- [ ] Settings: API keys, theme maker, import/export, and update controls are documented and covered.
- [ ] Diagnostics: Electron and web-mode copy/export paths are documented and covered.
- [ ] Release: Windows/macOS artifact names, checksums, signing, notarization, and verification are documented and covered.

---

## Resolved / Stale Prior Findings

- [x] **[RESOLVED] Embedded adversarial research synthesis prompt removed** — `src/research/agent/researchSynthesis.ts`
- [x] **[RESOLVED] Generic HTTP provider rejects redirects** — `src/research/providers/genericHttpScrapeProvider.ts`
- [x] **[RESOLVED] `verify-dist` no longer defaults Linux to Windows artifacts** — `scripts/verify-dist.cjs`
- [x] **[RESOLVED] Generic HTTP SSRF trailing-dot and all-zero hostnames blocked** — `src/research/providers/genericHttpScrapeProvider.ts`
- [x] **[RESOLVED] Social discovery forwards signal/timeout** — `src/research/agent/socialDiscovery.ts`
- [x] **[RESOLVED] Proxy writes non-Buffer bodies instead of silently dropping them** — `server.ts`
- [x] **[RESOLVED] Electron Venice multipart preparation errors are caught and logged** — `electron/services/veniceClient.ts`
- [x] **[RESOLVED] Conversation writes use unique temp files** — `electron/services/chatStorage.ts`
- [x] **[RESOLVED] Conversation validation allows tool role and array content** — `electron/services/chatStorage.ts`
- [x] **[RESOLVED] Batch abort refreshes persisted state before returning** — `src/modules/BatchModule.tsx`
- [x] **[RESOLVED] Toast warn style and stable timer deps added** — `src/components/ToastHost.tsx`
- [x] **[RESOLVED] Image generation normalizes draft before request and protects cleanup refresh** — `src/modules/ImageModule.tsx`
- [x] **[RESOLVED] Jina timeout header uses top-level input timeout** — `src/research/providers/jinaResearchProvider.ts`
- [x] **[RESOLVED] ESLint warning budget reduced from 96 to 0** — `package.json`, `docs/*`
- [x] **[RESOLVED] `npm run ci` now includes `verify:safety-guard`** — `package.json`
- [x] **[RESOLVED] `app:readLocalFile` TOCTOU closed via fd-based stat+read** — `electron/ipc/handlers.ts`
- [x] **[RESOLVED] Electron response stream error handler added** — `electron/services/veniceClient.ts`
- [x] **[RESOLVED] `readWithLimit` cancels body stream on limit hit** — `src/research/providers/genericHttpScrapeProvider.ts`
- [x] **[RESOLVED] `secureStore.writeStore` unlinks temp file on failure** — `electron/services/secureStore.ts`
- [x] **[RESOLVED] `chatStorage.saveConversation` unlinks temp file on failure** — `electron/services/chatStorage.ts`
- [x] **[RESOLVED] HTTP-date format `Retry-After` header path tested** — `src/services/veniceClient.edge.test.ts`
- [x] **[RESOLVED] Chat history and export files written with `0o600` permissions** — `electron/services/chatStorage.ts`, `electron/ipc/handlers.ts`
- [x] **[RESOLVED] `isPrivateHostname` blocks `0`, `::`, and `0:0:0:0:0:0:0:1`** — `electron/utils/urlSecurity.ts`
- [x] **[RESOLVED] `broadcast` wrapped in try/catch and `installUpdate` requires downloaded flag** — `electron/ipc/updates.ts`
- [x] **[RESOLVED] Double rate-limiting removed from SPA catch-all** — `server.ts`
- [x] **[RESOLVED] Express HOST validated against allowlist** — `server.ts`
