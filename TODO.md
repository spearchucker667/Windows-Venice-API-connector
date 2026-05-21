# Venice Forge - Current Backlog

> Updated: 2026-05-22  
> Scope: Public repository readiness, release quality, security, accessibility, and integration follow-ups.

This backlog reflects the current repository state. Completed items from earlier audits have been removed or moved into the changelog.

## Public Readiness

| ID | Priority | Status | Item | Notes |
|----|----------|--------|------|-------|
| PUB-001 | P0 | Done | Public README badges and release ribbon | See [README.md](README.md). |
| PUB-002 | P0 | Done | Repository tree and segment map | See [docs/REPOSITORY_TREE.md](docs/REPOSITORY_TREE.md). |
| PUB-003 | P0 | Done | Legal/TOS coverage | See [docs/LEGAL.md](docs/LEGAL.md). |
| PUB-004 | P0 | Done | Root support and security routing | See [SUPPORT.md](SUPPORT.md) and [SECURITY.md](SECURITY.md). |
| PUB-005 | P1 | Done | Issue and PR templates | See `.github/ISSUE_TEMPLATE/` and `.github/pull_request_template.md`. |
| PUB-006 | P1 | Done | Dependabot metadata | See `.github/dependabot.yml`. |
| PUB-007 | P1 | Open | Replace generated placeholder icon before broad public promotion | `build/icon.ico` is valid for packaging but still placeholder artwork. |

## Release

| ID | Priority | Status | Item | Notes |
|----|----------|--------|------|-------|
| REL-001 | P0 | Done | Windows release workflow builds NSIS and portable artifacts | See `.github/workflows/windows-release.yml`. |
| REL-002 | P0 | Done | Release artifact verification script | See `scripts/verify-dist.cjs`. |
| REL-003 | P1 | Done | SHA-256 checksum generation in release workflow | Checksums upload with `.exe` artifacts. |
| REL-004 | P1 | Open | Smoke-test on a clean Windows VM before publishing a release | Follow [docs/RELEASE.md](docs/RELEASE.md). |
| REL-005 | P2 | Open | Configure code signing for public distribution | Requires maintainer certificate secrets. |
| REL-006 | P2 | Open | Add auto-update strategy | Currently a documented non-goal. |

## Security and Privacy

| ID | Priority | Status | Item | Notes |
|----|----------|--------|------|-------|
| SEC-001 | P0 | Done | Shared endpoint allowlist for IPC and web proxy | `src/shared/validation.ts`. |
| SEC-002 | P0 | Done | Web proxy rejects proxy root and disallowed endpoints | `server.ts`, `server.test.ts`. |
| SEC-003 | P0 | Done | Web proxy strips renderer-controlled forbidden headers | `server.ts`, `server.test.ts`. |
| SEC-004 | P1 | Done | Root private vulnerability reporting instructions | `SECURITY.md` updated: GitHub private reporting link, supported versions, and `npm audit` gate documented. |
| SEC-005 | P1 | Open | Run dependency audit before each public release | `npm audit` last run clean (0 vulnerabilities, 2026-05-21). Re-run before every release. |
| SEC-006 | P2 | Done | Add runtime validation for Venice API response shapes | `src/utils/veniceValidation.ts` — validators for `/models`, `/image/generate`, `/image/upscale`, `/chat/completions`, `/augment/search`. Integrated into `modelService.ts`, `imageWorkflowService.ts`, and `SearchScrapeModule.tsx`. 26 tests. Extended to cover `dataUrl`/`dataBase64` binary PNG shapes from upscale endpoint. |

## Accessibility and UX

| ID | Priority | Status | Item | Notes |
|----|----------|--------|------|-------|
| A11Y-001 | P1 | Done | Modal focus trapping and keyboard flows | `ImageActionModal.tsx`: Tab cycling and Escape were already in place. Added return-focus: captures `document.activeElement` before opening, restores it on close. |
| A11Y-002 | P1 | Done | Toast and error announcements in screen readers | `ToastHost` uses `role="alert"` + `aria-live="assertive"` for errors and `role="status"` + `aria-live="polite"` for info/success. `StatusBlock` mirrors the same pattern. No changes required. |
| A11Y-003 | P2 | Done | Captions/labels on diagnostics tables | Only one `<table>` exists in the codebase (`DiagnosticsModule`); it already carries `<caption className="sr-only">Venice API response headers</caption>`. No changes required. |
| UX-001 | P2 | Done | Progress/cancel affordance for bulk gallery download | `imageWorkflowService.ts`: `downloadAllGallery` now accepts `onProgress` and `cancelSignal` options. `GalleryModule.tsx`: toolbar shows live `Saving N/M…` counter and a **Cancel** button while a bulk download is in progress. |

## Integration

| ID | Priority | Status | Item | Notes |
|----|----------|--------|------|-------|
| API-001 | P1 | Open | Validate desktop support for file uploads through `/augment/text-parser` | Requires an Electron smoke test with a real Venice key. |
| API-002 | P1 | Done | Cache `/models` with stale-while-revalidate behavior | `modelService.ts`: cached models are served immediately (even when stale), with a background refresh triggered once the 5-minute TTL expires. Background refresh errors are swallowed silently when a cache hit was already dispatched. |
| API-003 | P2 | Open | Consider additional Venice endpoints | Embeddings, audio, image edit, and usage endpoints are not currently allowlisted. |
| API-004 | P1 | Done | Venice API full spec alignment | Completed review of full Swagger YAML + LLM info docs. Fixes: (1) `normalizeError` now covers 404 (`model/resource not found`) and 413 (`payload too large`); (2) `/image/upscale` request body no longer sends `model` or `return_binary` — both are outside the `additionalProperties: false` schema; (3) upscale binary PNG responses (`{ dataUrl }` web, `{ dataBase64 }` Electron) handled correctly in `isValidImageResponse`, `extractImages`, and `normalizeImageData`; (4) `x-ratelimit-type`, `x-venice-model-deprecation-date`, and all content safety headers tracked in diagnostics. `?type=all` query param on `/models` confirmed valid. |

## Bug Fixes (Session)

| ID | Priority | Status | Item | Notes |
|----|----------|--------|------|-------|
| BUG-004 | P0 | Done | `enable_web_search` sent as boolean instead of string enum | `payloadBuilders.ts`: now passes string value directly (`"off"` default). Root cause of all `/chat/completions` HTTP 400s. |
| BUG-005 | P0 | Done | Venice `DetailedError` (Zod) not parsed — fell through to "Unknown Venice API error" | `src/services/veniceClient.ts` + `electron/services/veniceClient.ts`: both now extract `details._errors` and field-level errors. |
| BUG-006 | P1 | Done | Every failed request produced two diagnostic log entries | `veniceFetchDesktop` now sets the error message in the initial dispatch; catch block skips re-dispatch when `err.diagnostics` is set. |
| BUG-007 | P0 | Done | Legacy boolean `webSearch` values could still produce invalid chat payloads | `appReducer.ts` now coerces legacy boolean/imported values to valid enum strings (`off`/`on`/`auto`), and `buildChatPayload` enforces the same normalization before sending. |
| BUG-008 | P1 | Done | Electron text-parser FormData uploads were not using serialized IPC payload | `veniceFetchDesktop` now sends `serializedBody` across IPC for `isFormData` requests, restoring reliable `/augment/text-parser` uploads in desktop mode. |
| BUG-009 | P2 | Done | Web transport showed duplicate diagnostics and weak schema-error parsing on non-2xx responses | Web path in `veniceClient.ts` now parses Venice `DetailedError` format and avoids catch-path re-dispatch when an HTTP diagnostics entry already exists. |

## Deep Scan Findings

> Deep scan performed: 2026-05-21. All items verified against source. Severity: **Major** = functional breakage or security gap, **Medium** = degraded reliability or incorrect behavior under specific conditions, **Minor** = cosmetic, dead code, or sub-optimal patterns.

| ID | Severity | Status | Item | Notes |
|----|----------|--------|------|-------|
| DSC-001 | Major | Open | **Search result links non-functional in Electron desktop mode** — `TRUSTED_EXTERNAL_HOSTS` in `electron/main.ts:L29` only allows `venice.ai`, `docs.venice.ai`, and `github.com`. The `setWindowOpenHandler` at `main.ts:L90` denies all other `target="_blank"` navigations. Search results rendered in `SearchScrapeModule.tsx:L177` use `<a target="_blank">`, so clicking any Brave/Google result link is silently blocked and never opens in the system browser. | Expand `TRUSTED_EXTERNAL_HOSTS` or route arbitrary HTTPS links through `shell.openExternal`. |
| DSC-002 | Medium | Open | **Web streaming error extraction drops structured error details** — In `src/services/veniceClient.ts:L550–554`, `veniceStreamChat` reads the non-2xx body with `response.text()` and passes the raw string to `normalizeError`. Unlike `veniceFetch` (which parses JSON and calls `readWebErrorBody`), streaming errors bypass structured Zod/DetailedError parsing, so the user sees raw JSON instead of a human-readable message. | Parse the text as JSON and pass through `readWebErrorBody` before `normalizeError`. |
| DSC-003 | Medium | Open | **Bulk download aborts on single-item failure** — `downloadAllGallery` in `src/services/imageWorkflowService.ts:L106` calls `downloadImage` without a per-item `try/catch`. A network timeout or filesystem error on any single image terminates the entire remaining queue. | Wrap the `downloadImage` call in a try/catch and continue the loop; report partial failures via `onProgress` or a summary toast. |
| DSC-004 | Medium | Open | **File IPC handlers lack filesystem error trapping** — `app:saveJsonFile` (`electron/ipc/handlers.ts:L128–142`) and `app:loadJsonFile` (`handlers.ts:L144–157`) call `fs.writeFile` / `fs.readFile` / `fs.stat` without catching filesystem errors (e.g. access denied, disk full). Failures surface as uncaught promise rejections on the main process. | Wrap handler bodies in try/catch and return `{ ok: false, error: sanitizeError(err) }`. |
| DSC-005 | Minor | Open | **`galleryFilename` called with wrong arguments in GalleryModule** — At `GalleryModule.tsx:L149` and `L210`, `galleryFilename` is invoked as `galleryFilename(item.prompt, item.timestamp)` instead of `galleryFilename(item)`. The first parameter is expected to be the full gallery item object; passing a string causes `item.model` and `item.id` to be undefined, producing fallback filenames like `venice-0.png`. | Change both call sites to `galleryFilename(item)`. |
| DSC-006 | Minor | Open | **StatusBlock hides success when error is also set** — `StatusBlock.tsx:L4` returns early if `error` is truthy, completely hiding any concurrent `success` message. In `ImageModule`, a partial batch success (some images generated, then a failure) sets both `error` and `success`, but only the error is ever shown. | Render both blocks when both props are present, or clear `success` when setting `error`. |
| DSC-007 | Minor | Open | **Cleared chat injects phantom assistant message into API context** — `ChatModule.tsx:L169` sets `messages` to `[{ role: "assistant", content: "Conversation cleared." }]` on clear. Subsequent prompts include this placeholder in the payload sent to `/chat/completions`, wasting tokens and potentially confusing the model. | Set messages to `[]` and display "Conversation cleared." via a transient UI indicator instead. |
| DSC-008 | Minor | Open | **Chat prompt field shows validation error on first blur** — `ChatModule.tsx:L363` fires `onBlur` → `setPromptTouched(true)` when the user clicks/taps the empty textarea and then clicks away, immediately showing "Please enter a prompt before sending." before any submit attempt. | Only set `promptTouched` on first submit attempt, not on blur. |
| DSC-009 | Minor | Open | **Batch cancellation leaves active task stuck in "running" state** — `BatchModule.tsx:L173–175` aborts the controller and sets `isRunning = false`, but does not update the current in-flight task's status from `"running"` to `"cancelled"`. The task row remains visually stuck as running in the results list. | In `cancel()`, update all `"running"` results to `"cancelled"` status before setting `isRunning = false`. |
| DSC-010 | Minor | Open | **Dead code: `ab2str` and `str2ab` in cryptoService** — `src/services/cryptoService.ts:L39–50` defines `ab2str` and `str2ab` helper functions that are never called anywhere in the codebase. The actual encrypt/decrypt flow uses `TextEncoder`/`TextDecoder` instead. | Remove both functions or suppress with an explicit `// @ts-expect-error unused` if kept for future use. |
| DSC-011 | Minor | Open | **TextEncoder allocation overhead in `byteLength`** — `src/services/exportImport.ts:L35–37` calls `new TextEncoder().encode(value).length`, which allocates a full `Uint8Array` copy of the string (up to 25 MB) just to read `.length`. This causes unnecessary memory churn, especially in browser contexts with constrained heaps. | Use `new Blob([value]).size` or a manual byte-counting loop to avoid the allocation. |

## Verification Commands


```bash
npm run typecheck
npm test
npm run build
npm run verify:icon
npm run dist:win
npm run verify:dist
```

When working from a shell without `npm` on `PATH`, use the bundled Node runtime directly for TypeScript, Vitest, Vite, esbuild, and local scripts.
