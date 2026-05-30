# Bug Hunt — TODO

> Generated: 2026-05-29 • Scope: code + docs • Files scanned: 38 / 115

## Summary
| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 2 |
| Medium | 3 |
| Low / Cosmetic | 4 |
| Doc Defect | 1 |
| Missing Doc / Gap | 4 |

---

## Critical

No critical issues found.

---

## High

- [x] **[BUG-001] `extractFromSerializedFormData` always returns empty — safety scanner blind to FormData fields** `src/shared/safety/promptPayloadExtractor.ts:54`
  - **Type:** Logic / Security
  - **What:** `serializeFormData` (veniceClient.ts:353) produces entries as plain objects `{ name, value, ... }`.  
    `extractFromSerializedFormData` checks `if (!Array.isArray(entry) || entry.length < 2) continue;` — this is **always true** for objects, so every entry is skipped and the function always returns `[]`.
  - **Why it matters:** Any future endpoint that sends FormData with text fields (e.g. `/augment/text-parser` via multipart) would have those fields completely invisible to the child-exploitation safety guard. Currently low-immediate-impact because the only FormData endpoint (`/image/upscale`) maps to `ENDPOINT_FIELDS: []`, but the structural flaw silently defeats the extractor for the entire FormData path.
  - **Evidence:**
    ```ts
    // veniceClient.ts:353 — entries are objects, NOT arrays
    entries.push({ name, value: String(value) });
    // ...
    return { _isSerializedFormData: true, entries };

    // promptPayloadExtractor.ts:54 — array check always skips objects
    if (!Array.isArray(entry) || entry.length < 2) continue; // ← always true
    const [key, val] = entry; // ← never reached
    ```
  - **Fix:** Replace the array check with an object-property read:
    ```ts
    if (typeof entry !== "object" || entry === null || !("name" in entry)) continue;
    const key = (entry as { name: unknown }).name;
    const val = (entry as { value: unknown }).value;
    if (typeof key !== "string") continue;
    ```
  - **Confidence:** [VERIFIED]

- [x] **[BUG-002] `app:loadJsonFile` error path silently swallowed — user gets no feedback on file read failures** `electron/ipc/handlers.ts:245` / `src/services/desktopBridge.ts:226`
  - **Type:** Error Handling / UX
  - **What:** When `fs.readFile` or `fs.stat` throws (e.g. file too large, permissions denied), the handler returns `{ canceled: false, error: redactErrorMessage(err) }` — no `ok: false` field.  
    `desktopBridge.importJsonString()` checks `if (result.canceled || !result.data) return null;`. Since `result.data` is `undefined`, it returns `null`. `importData()` then does `if (!json) return;` — silently discarding the error. The user sees nothing happen.
  - **Why it matters:** Any file read failure (corrupt path, >MAX_JSON_FILE_BYTES, OS permission error) presents as "nothing happened" with no error toast or message. Debugging an import failure is impossible without devtools.
  - **Evidence:**
    ```ts
    // handlers.ts:245
    return { canceled: false, error: redactErrorMessage(err) }; // no ok:false, no data
    
    // desktopBridge.ts:226
    if (result.canceled || !result.data) return null; // null on error AND on cancel
    
    // SettingsModule.tsx (importData)
    const json = await desktopFiles.importJsonString();
    if (!json) return; // ← no error surfaced
    ```
  - **Fix:** Return `{ ok: false, canceled: false, error: redactErrorMessage(err) }` from the handler; update `desktopBridge.importJsonString()` to distinguish cancel from error, and surface the error through `dispatch` / toast in `importData`.
  - **Confidence:** [VERIFIED]

---

## Medium

- [x] **[BUG-003] `FUZZY_ALLOWLIST` contains "shota" — a term also in `CSAM_GENRE_LABELS`** `src/shared/safety/childExploitationGuard.ts:106,422`
  - **Type:** Logic / Security (defence-in-depth gap)
  - **What:** `"shota"` is in `CSAM_GENRE_LABELS` (line 106) and simultaneously in `FUZZY_ALLOWLIST` (line 422). The allowlist is checked at **P7 (fuzzy match)**; the `CSAM_GENRE_LABELS` exact check runs at **P0** before fuzzy — so no bypass currently exists. However, any refactoring that changes evaluation order, or a future code path that calls `fuzzyMatchesCritical` independently, could quietly exempt "shota" from fuzzy detection.
  - **Evidence:**
    ```ts
    const CSAM_GENRE_LABELS: readonly string[] = [
      "loli", "lolicon", "lolita", "shota", "shotacon",   // line 106
    ];
    const FUZZY_ALLOWLIST = new Set<string>([
      ...
      "shot", "shota", ...  // line 422 — CSAM term in the allowlist
    ]);
    if (FUZZY_ALLOWLIST.has(token)) continue;  // line 432
    ```
  - **Fix:** Remove `"shota"` (and any other CSAM terms) from `FUZZY_ALLOWLIST`. The allowlist is for common innocent words that fuzzy-match critical terms; CSAM terms do not belong in it. Add an invariant test asserting that `FUZZY_ALLOWLIST ∩ CSAM_GENRE_LABELS = ∅`.
  - **Confidence:** [VERIFIED]

- [x] **[BUG-004] `assessChildExploitationSafety` computes `assessSingleNormalizedText` on every field twice** `src/shared/safety/childExploitationGuard.ts`
  - **Type:** Performance / Redundancy
  - **What:** The blocking first pass (fields loop, ~line 798) calls `assessSingleNormalizedText(field, norms)` for each field and short-circuits on `block`. The warn third pass (fields loop, ~line 821) calls `assessSingleNormalizedText` again on the same fields for `WARN_THRESHOLD` detection. No results are cached between passes, so every field is normalized and scanned twice on every safe-context request.
  - **Why it matters:** For batch prompting with many concurrent requests, every assessment runs O(2 × fields) work. Safety assessment is on the hot path for every Venice API call.
  - **Fix:** Cache the `assessSingleNormalizedText` result per field in the first pass; reuse the cached result in the warn pass (or merge the logic into a single pass with separate accumulator flags for block vs warn).
  - **Confidence:** [VERIFIED — same `assessSingleNormalizedText` call signature in both passes]`

- [x] **[BUG-005] `simpleHash` truncates to 256 chars of leet-folded text — audit hashes unreliable for long prompts** `src/shared/safety/childExploitationGuard.ts` (simpleHash function)
  - **Type:** Logic / Audit Integrity
  - **What:** `simpleHash` reads only the first 256 chars and uses djb2 (non-cryptographic). Two distinct long prompts that share the same leet-folded 256-char prefix will produce identical `promptHash` values in the audit record. Since the hash is used for audit correlation, this creates phantom duplicates and makes audit trails for long prompts unreliable.
  - **Evidence:** The function is documented as "coarse" — but callers and audit consumers don't necessarily know that, and the 256-char truncation is not documented at the call site.
  - **Fix:** Increase truncation to at least 1024 chars; add an inline comment at every call site clarifying the coarse-hash guarantee. If audit fidelity is required, use a one-way digest (e.g. `crypto.subtle.digest`) on the full string.
  - **Confidence:** [VERIFIED]

---

## Low / Cosmetic

- [x] **[BUG-006] `FUZZY_ALLOWLIST` contains duplicate entries** `src/shared/safety/childExploitationGuard.ts:421`
  - **Type:** Code Quality
  - **What:** The `Set` constructor receives duplicate literals: `"lori"` (×2), `"lore"` (×2), `"lock"` (×2). `Set` silently deduplicates at runtime — no functional impact — but the source code contains stale copy-paste artifacts.
  - **Evidence:**
    ```ts
    const FUZZY_ALLOWLIST = new Set<string>([
      "lori", "lori", "lore", "lore", "loci", ...
      "logic", "login", "logo", "lost", "look", "lock", "lock",
    ]);
    ```
  - **Fix:** Remove the six duplicate literals.
  - **Confidence:** [VERIFIED]

- [x] **[BUG-007] `server.ts:67` uses `console.warn` for access logging instead of the structured logger** `server.ts:67`
  - **Type:** Code Quality / Logging Consistency
  - **What:** The development/test request logger at line 67 calls `console.warn(...)` directly. Every other non-test log call in the codebase uses `warn`/`error` from `./src/shared/logger`. This means access log output bypasses any future structured-logging middleware applied to the `warn`/`error` function.
  - **Evidence:**
    ```ts
    // server.ts:67
    console.warn(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    ```
  - **Fix:** Replace with `warn(...)` (imported at line 18) or remove the block entirely (it's dev-only).
  - **Confidence:** [VERIFIED]

- [x] **[BUG-008] `isTrustedExternalUrl` allows any `https:` URL including private-network addresses** `electron/main.ts`
  - **Type:** Security / Low (user-prompted)
  - **What:** `isTrustedExternalUrl` accepts any URL where `protocol === "https:"`. This includes `https://192.168.1.1/admin`, `https://10.0.0.0/`, `https://localhost/`. The user is prompted via `dialog.showMessageBox` before `shell.openExternal` is called, which mitigates direct exploitation. However, an attacker-controlled page that injects a link with a private-IP target can try to trick the user with a convincing display.
  - **Fix:** Additionally reject URLs whose hostname resolves to RFC 1918 ranges (127.x, 10.x, 192.168.x, 172.16–31.x) and `localhost`. A simple hostname check (no DNS involved) suffices.
  - **Confidence:** [VERIFIED — function defined in electron/main.ts, logic confirmed]

- [x] **[BUG-009] `diagnostics` store not encrypted; asymmetry undocumented** `src/services/storageService.ts:10`
  - **Type:** Low (intentional but undocumented)
  - **What:** `ENCRYPTED_STORES = ["chats", "settings", "images", "conversations"]` — the `diagnostics` store is deliberately excluded. Diagnostics contain sanitized API timing/response metadata (no raw prompts, no API keys), so the omission is defensible. However, no comment documents *why* diagnostics are unencrypted. A future developer adding sensitive content to diagnostics entries would not see a guard.
  - **Fix:** Add a one-line comment at `ENCRYPTED_STORES` explaining the intentional exclusion of `diagnostics`.
  - **Confidence:** [VERIFIED]

---

## Documentation Defects

- [x] **[DOC-001] `.github/copilot-instructions.md` describes 3 IndexedDB stores; codebase has 5** `.github/copilot-instructions.md:55,133,138`
  - **What:**
    - Line 55: *"IndexedDB … images, chats, settings. All three stores are encrypted at rest"* — there are actually **five** stores (`images`, `chats`, `settings`, `diagnostics`, `conversations`), and four of them are encrypted (all except `diagnostics`).
    - Line 133: Export format example `{ images, chats, settings }` — omits `conversations`.
    - Line 138: *"Only `images`, `chats`, and `settings` stores are allowed"* — `conversations` is also allowed and validated.
  - **Evidence:**
    ```ts
    // src/constants/venice.ts:74
    export const STORE_NAMES = ["images", "chats", "settings", "diagnostics", "conversations"];
    // src/services/storageService.ts:10
    const ENCRYPTED_STORES = ["chats", "settings", "images", "conversations"];
    // src/services/exportImport.ts:14
    const EXPORT_STORES = ["images", "chats", "settings", "conversations"] as const;
    ```
  - **Fix:** Update the three affected lines in `.github/copilot-instructions.md` to list all 5 stores, note which 4 are encrypted, and include `conversations` in export descriptions.

---

## Missing Documentation / Gaps

- [x] **[GAP-001] No regression test for `extractFromSerializedFormData` (BUG-001)** `src/shared/safety/promptPayloadExtractor.ts`
  - The FormData extraction path has zero test coverage. After fixing BUG-001, add a test that creates a mock serialized FormData body `{ _isSerializedFormData: true, entries: [{ name: "prompt", value: "..." }] }` and asserts extracted fields are non-empty.

- [~] **[GAP-002] No test for `loadJsonFile` error path (BUG-002)** `electron/ipc/handlers.ts:245`
  - There is no test asserting that a file-read error is surfaced to the user. After fixing BUG-002, add a test that stubs `fs.readFile` to reject and asserts the UI receives an error toast (or the bridge returns `{ ok: false, error }`).
  - **Status:** Handler and bridge code verified correct by inspection. No IPC handler test infrastructure exists in the repo (no `vi.mock("electron")` usage). Adding a test would require either refactoring handlers into exported functions or building new Electron mock infrastructure. Deferred until handler test harness is established.

- [x] **[GAP-003] `docs/DEVELOPMENT` and `docs/AGENTS` directories not scanned** *(scope limit)*
  - These directories were present in the repo root but not opened during this scan. They may contain stale build instructions, architecture diagrams, or agent-usage examples that contradict current code. Recommend reviewing for freshness.
  - **Status:** Scanned all 7 files (`building.md`, `macos.md`, `platform-support.md`, `troubleshooting.md`, `agents.md`, `agent-reinitialization.md`, `gemini.md`). No stale instructions found. All commands, paths, and security postures match current code. `docs/AGENTS/` is gitignored (as documented) and kept locally only.

- [x] **[GAP-004] `assessChildExploitationSafety` public API has no JSDoc** `src/shared/safety/childExploitationGuard.ts`
  - The exported function signature (`input`, `AssessmentResult`) is the primary integration point for all callers (server.ts, handlers.ts, ChatModule, ImageModule, BatchModule). It has no JSDoc block documenting inputs, return shape, or side effects (audit logging, `recordDecision` call). Add at minimum a function-level `/** ... */` comment.

---

## Quick Wins (effort: < 30 min • impact: High+)

- [x] **BUG-001** — 2-line fix in `extractFromSerializedFormData`: replace array check with object-property read. Closes the FormData scanner blind spot.
- [x] **BUG-002** — Add `ok: false` to error return in `handlers.ts`, thread the error message through `desktopBridge` to the import UI.
- [x] **BUG-006** — Delete 6 duplicate literals from `FUZZY_ALLOWLIST`.
- [x] **BUG-003** — Remove `"shota"` from `FUZZY_ALLOWLIST`; add invariant test `FUZZY_ALLOWLIST ∩ CSAM_GENRE_LABELS = ∅`.
- [x] **DOC-001** — Update 3 lines in `.github/copilot-instructions.md` to match actual store counts.

---

## Notes & Open Questions

**Files not scanned (scope cap — 38 of 115 source files opened):**
- `src/modules/BatchModule.tsx`, `SearchScrapeModule.tsx` — guard wiring (partially verified via grep)
- `src/App.tsx`, `src/state/appReducer.ts` (lines 80+)
- `src/services/redaction.ts`, `imageWorkflowService.ts`
- `src/types/app.ts`, `src/types/venice.ts`, `src/types/storage.ts`
- `electron/ipc/updates.ts` — auto-update security surface (not scanned)
- `electron/services/logger.ts`, `electron/services/chatStorage.ts`
- `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json`, `electron-builder.config.cjs`
- `package.json` (versions vs. known-vulnerable advisories — not checked)
- `docs/DEVELOPMENT/`, `docs/AGENTS/` directory contents
- `CHANGELOG.md`, `FAQ.md`, `SECURITY.md`, `CONTRIBUTING.md` — content not reviewed for accuracy

**Files referenced but not provided / not found:**
- `docs/REPOSITORY_TREE.md` — referenced in copilot-instructions but path does not exist in repo root; a `REPOSITORY_TREE.md` was found at root under `docs/` listing; confirmed absent.

**Open questions:**
- `electron/ipc/updates.ts`: auto-update download is in the main process (correct), but the renderer-exposed `downloadUpdate` / `installUpdate` surface was not audited for input validation. Recommend a targeted review.
- `package.json` dependency versions were not checked against current CVE advisories. Run `npm audit` and review high/critical advisories.
- Diagnostics store contents: confirm that diagnostics records never include raw prompt text before accepting that unencrypted storage is safe for that store.

---

## 2026-05-30 Safety Guard Audit & Fixes Completed
- **[H-001]** Express proxy middleware guard was wrapped in `try/catch` resolving a fail-open risk where guard exceptions could bypass enforcement.
- **[H-002]** Added documentation clarifying that only `POST` requests are validated; `GET` requests (e.g. `/models`) skip the guard.
- **[H-003]** Extensive transport-layer integration tests added (`server.test.ts`, `veniceClient.web.test.ts`, `veniceClient.desktop.test.ts`).
- **[H-004]** Implemented the `verify:safety-guard` script enforcing that all transport layers call the guard and do not leak prompts.
- **[M-001]** Added `server.ts` proxy comments explaining skipped `GET` logic.
- **[M-002]** Prompt payload extractor updated to include `"question"` in the fallback array.
- **[M-004]** Cross-sentence detection improved to properly break sentences on newline boundaries, preventing line-break evasion.
- **[M-005]** Extractor logic for `Buffer` in `server.ts` was fixed to dynamically pull field names based on the endpoint, successfully catching `negative_prompt` bypassing in image endpoints.
- **[M-006]** Clarified JSDoc requiring callers of `assessChildExploitationSafety` to run `recordDecision`.
- **[L-002]** Added test verifying that `FUZZY_ALLOWLIST` doesn't intersect with `CSAM_GENRE_LABELS`.

## Audit Remediation — 2026-05-30

### Release Blockers Fixed
- [x] **C-001** — Malformed serialized FormData no longer bypasses safety guard; falls back to generic object extraction.
- [x] **C-002** — Safety scanner now assesses both head and tail of oversized payloads to prevent truncation evasion.
- [x] **C-003** — Main-process streaming no longer crashes when renderer closes mid-stream (`safeSendToRenderer` helper).
- [x] **C-004** — Production server no longer crashes from static Vite import; vite is dynamically imported in dev-only branch.
- [x] **C-005** — `server.ts` no longer auto-starts on import; `startServer()` is invoked only from entrypoint.
- [x] **C-006** — `npm start` now runs production mode via `scripts/start-production.cjs` wrapper.
- [x] **C-007** — SSE read loop has idle/total timeout; uses `createTimeoutSignal()` instead of `AbortSignal.any`/`timeout`.
- [x] **H-004** — URL security blocks IPv6 link-local, IPv4-mapped IPv6 loopback, and short-form IPv4.
- [x] **H-005 / H-009** — Secure storage rejects plaintext/tampered API key state on Windows/macOS; handles boolean/string flag variants.

### Safety Guard Hardening Fixed
- [x] **H-001** — Nested object extraction performs shallow recursive scan for unknown endpoints.
- [x] **H-002** — Added spelled-out ages and high-risk youth nouns to detection lists.
- [x] **H-003** — Expanded homoglyph map with additional Cyrillic and Greek lookalikes.
- [x] **H-017** — Replaced RegExp lookbehind with capture-group logic for Safari < 16.4 compatibility.
- [x] **M-001** — Proxy defensively converts non-Buffer POST bodies before safety guard.
- [x] **M-002** — Guard exception in web proxy now records synthetic audit decision.
- [x] **M-003** — Increased extraction depth limit from 4 to 8.
- [x] **M-004** — Array payload extraction iterates over all string properties.
- [x] **M-005** — Vision content array extracts all string properties from parts.
- [x] **M-006** — Multipart fallback returns raw decoded string without regex stripping.

### Server Runtime Fixed
- [x] **H-010** — Static-file rate limiter has cleanup interval and max-entry cap.
- [x] **H-011** — `vitest.config.ts` correctly resolves vite config function.
- [x] **H-012** — `electron-builder.config.cjs` decouples Windows/macOS signing checks.
- [x] **H-013** — `tsconfig.json` excludes `electron/` from renderer type-check.
- [x] **L-014** — Server paths use `getModuleDir()` instead of `process.cwd()`.
- [x] **L-015** — Proxy timeout config applied via `timeout`/`proxyTimeout`.
- [x] **L-016** — `HOST` validated through `configSchema.ts`.
- [x] **L-017** — `appVersion` cached at module level.

### Electron IPC/Runtime Fixed
- [x] **H-008** — Windowless webContents no longer bypass confirmation dialog.
- [x] **M-007** — `checkPathContained` uses case-insensitive comparison on Windows.
- [x] **M-008** — CSP listener registered once globally on default session.
- [x] **M-009** — `apiKey:set`/`delete` IPC handlers catch errors and return typed safe responses.
- [x] **M-010** — `writeStore` uses atomic write (tmp + rename).
- [x] **M-011** — Removed `fs.access` TOCTOU race in `getConversation`.
- [x] **M-024** — `bodySizeBytes` catches circular references with descriptive error.
- [x] **M-025** — Corrupt backups append timestamp to avoid overwrite.
- [x] **M-026** — `isValidConversation` accepts optional `systemPrompt`.
- [x] **L-003** — `promptExternalLink` truncation reserves ellipsis space.
- [x] **L-004** — Preload uses `globalThis.crypto.randomUUID()`.

### Renderer/Browser Compat Fixed
- [x] **H-014** — Blob URL revocation delays increased (60s export, 30s download).
- [x] **H-018** — `veniceStreamChat` uses `createTimeoutSignal()` for older browser compat.
- [x] **H-019** — `crypto.randomUUID()` has fallback for non-secure contexts.
- [x] **M-016** — Abort listeners removed in timeout callback to prevent leaks.
- [x] **M-017** — Markdown placeholder uses cryptographically random token.
- [x] **M-018** — `customTheme` validation reused from `exportImport.ts`.
- [x] **M-019** — Draft patches use explicit spread instead of `Object.assign`.
- [x] **M-020** — Heading regex no longer matches `####` as H3.
- [x] **M-021** — Export/import rejects prototype-pollution record IDs.
- [x] **M-022** — `normalizeImageData` detects cycles via `WeakSet`.
- [x] **M-015** — Batch blocked-error stored in correct `error` property.
- [x] **L-005** — Removed duplicate `isElectron` logic; imported from `desktopBridge.ts`.
- [x] **L-006** — Web-search normalization deduplicated via `payloadBuilders.ts`.
- [x] **L-007** — Reverted `veniceFetch<T = unknown>` (breaks existing call sites); deferred.
- [x] **L-008** — Anchor element removed in `try…finally`.
- [x] **L-009** — Toast duration uses nullish coalescing (`??`).
- [x] **L-010** — Accessibility CSS uses correct `--bg` variable.
- [x] **L-011** — Gallery test cleans up `scrollIntoView` stub in `afterEach`.

### Deferred to Future
- [ ] **H-015** — Pending settings save lost on unmount (requires UI state refactor).
- [ ] **H-016** — O(n) conversation lookup in web mode (performance, not security-critical).
- [ ] **M-012** — ChatModule impure state updater (requires broad React refactor).
- [ ] **M-013** — SearchScrape overlapping request race (requires UI refactor).
- [ ] **M-014** — Chat cancel removes user prompt (UX change, not security-critical).
- [ ] **M-023** — `importJsonString` web-mode fallback (feature gap).
- [x] **L-001** — Unbounded `listConversations` file loading. Added `MAX_LIST_CONVERSATIONS = 2000` cap with `logWarn` truncation notice. Added `logWarn` export to `electron/services/logger.ts`.
- [~] **L-012** — Redundant `lint` script in package.json. (`"lint": "tsc --noEmit"` is a subset of `typecheck`). Harmless; referenced in `copilot-instructions.md`. Deferred to avoid breaking existing workflows.
- [x] **L-013** — Missing `engines` field in package.json. Added `"engines": { "node": ">=20.0.0", "npm": ">=10.0.0" }` to match AGENTS.md requirements.
- [~] **L-019** — `@types/express` version drift. Installed `4.17.25` vs declared `^4.17.21` — normal semver resolution. Typecheck passes. No action needed.

### Validation
- `npm run typecheck` ✅
- `npm test` ✅ 335 passed, 1 skipped
- `npm run build` ✅
- `npm run lint:eslint` ✅ 0 errors, 62 warnings (within 96 budget)
- `npm run verify:safety-guard` ✅
- `npm run verify:icon` ✅

## Deferred Dual-Platform Improvements
- [ ] Implement Apple Notarization auto-submission in `macos-release.yml` for CI pipelines.
- [ ] Add explicit auto-updater UI for macOS.


---

## Documentation Remediation — 2026-05-30

### Completed in this pass
- [x] **Doc-001** — Fixed security URL in `.github/ISSUE_TEMPLATE/config.yml` (`Test-ai` → `Venice-API-connector`).
- [x] **Doc-002** — Corrected OS in `docs/AGENTS/gemini.md` (Windows/PowerShell → macOS/bash).
- [x] **Doc-003** — Removed deleted script references from `docs/REPOSITORY_TREE.md`; added `start-production.cjs`.
- [x] **Doc-004** — Added historical note to `docs/HQE_AUDIT_REPORT.md` about pre-conversation IndexedDB stores.
- [x] **Doc-005** — Marked CodeQL changelog entry as deferred/not yet implemented.
- [x] **Doc-006** — Fixed bare `TROUBLESHOOTING.md` link in `docs/ABOUT.md` to `DEVELOPMENT/troubleshooting.md`.
- [x] **Doc-007/024** — Updated `docs/THEME_SYSTEM.md` to reference `src/styles/theme.css` for actual theme content.
- [x] **Doc-008** — Added `conversations` to export format and allowed stores in `docs/AGENTS/gemini.md`.
- [x] **Doc-009** — Added macOS Keychain mention alongside Windows DPAPI in `docs/AGENTS/gemini.md`.
- [x] **Doc-010** — Added `conversations` to IndexedDB storage row in `README.md`.
- [x] **Doc-011** — Added `conversations` to IndexedDB list in `docs/FAQ.md`.
- [x] **Doc-012** — `REPOSITORY_TREE.md` exists; no action needed.
- [x] **Doc-013** — Added macOS DMG/ZIP to Technology Stack in `docs/ABOUT.md`.
- [x] **Doc-014** — Clarified Linux plaintext fallback requires explicit env var in `docs/DEVELOPMENT/platform-support.md`.
- [x] **Doc-015** — Aligned plaintext fallback language between `SECURITY.md` and `docs/FAQ.md`.
- [x] **Doc-016** — Added maintainer name to `SUPPORT.md`; unified nomenclature.
- [x] **Doc-017** — Documented `verify:safety-guard` as local required check (not in CI) in `AGENTS.md`.
- [x] **Doc-018** — Added `docs/THEME_SYSTEM.md` to README docs index.
- [x] **Doc-019** — Added script consolidation entry to `CHANGELOG.md`.
- [x] **Doc-020** — Added `AGENTS.md` and `CHANGELOG.md` to release checklist in `docs/RELEASE/release.md`.
- [x] **Doc-021** — Changed `npm install` → `npm ci` in `docs/RELEASE/release.md` release build sections.
- [x] **Doc-022** — Added `APPLE_TEAM_ID` to `docs/RELEASE/signing-and-notarization.md`.
- [x] **Doc-023** — Removed duplicate `electron/services/chatStorage.ts` entry from `docs/REPOSITORY_TREE.md`.

### Confirmed remaining documentation work
- None — all 24 audit doc findings have been addressed.

### Deferred pending code changes
- None.

### Not reproduced / already fixed
- **Doc-012** — `docs/REPOSITORY_TREE.md` exists at `docs/REPOSITORY_TREE.md`; todo claim was incorrect.

### Documentation validation checklist
- [x] README links checked
- [x] Release docs match scripts
- [x] Security docs match secure storage behavior
- [x] Workflow references match actual `.github/workflows` files
- [x] Storage/export docs match actual stores
