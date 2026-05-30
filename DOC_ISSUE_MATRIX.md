## Documentation Issue Matrix

| ID | Audit claim | Status | File(s) | Action |
|---|---|---:|---|---|
| Doc-001 | `.github/ISSUE_TEMPLATE/config.yml` wrong security URL | **CONFIRMED** | `.github/ISSUE_TEMPLATE/config.yml` | Fix URL from `Test-ai` to `Venice-API-connector` |
| Doc-002 | `docs/AGENTS/gemini.md` incorrect OS | **CONFIRMED** | `docs/AGENTS/gemini.md` | Change "Windows" to "macOS" and "PowerShell" to "bash/zsh" |
| Doc-003 | `docs/REPOSITORY_TREE.md` references deleted scripts | **CONFIRMED** | `docs/REPOSITORY_TREE.md` | Remove `verify-dist-mac.cjs` and `verify-dist-win.cjs` lines; add `start-production.cjs` |
| Doc-004 | `docs/HQE_AUDIT_REPORT.md` outdated claims | **PARTIALLY CONFIRMED** | `docs/HQE_AUDIT_REPORT.md` | Add note that IndexedDB stores list is historical (pre-conversations); do not rewrite historical audit |
| Doc-005 | `CHANGELOG.md` references missing CodeQL workflow | **CONFIRMED** | `CHANGELOG.md` | Remove or mark CodeQL entry as removed/deferred |
| Doc-006 | Broken link to `TROUBLESHOOTING.md` | **CONFIRMED** | `docs/ABOUT.md` | Fix bare `TROUBLESHOOTING.md` link to `DEVELOPMENT/troubleshooting.md` |
| Doc-007 | `docs/THEME_SYSTEM.md` wrong CSS file location | **CONFIRMED** | `docs/THEME_SYSTEM.md` | Update `src/index.css` references to `src/styles/theme.css` for actual theme content |
| Doc-008 | `docs/AGENTS/gemini.md` incomplete export format | **CONFIRMED** | `docs/AGENTS/gemini.md` | Add `conversations` to export example and allowed stores list |
| Doc-009 | `docs/AGENTS/gemini.md` omits macOS Keychain | **CONFIRMED** | `docs/AGENTS/gemini.md` | Add macOS Keychain alongside Windows DPAPI in security description |
| Doc-010 | `README.md` missing web conversations in storage table | **CONFIRMED** | `README.md` | Add `conversations` to IndexedDB storage row |
| Doc-011 | `docs/FAQ.md` missing conversations in IndexedDB description | **CONFIRMED** | `docs/FAQ.md` | Add `conversations` to IndexedDB storage list |
| Doc-012 | `todo.md` false claim about `REPOSITORY_TREE.md` | **NOT REPRODUCED** | `todo.md` | File exists; update todo to mark as present |
| Doc-013 | `docs/ABOUT.md` incomplete packaging description | **CONFIRMED** | `docs/ABOUT.md` | Update Technology Stack to include macOS DMG/ZIP |
| Doc-014 | `docs/DEVELOPMENT/platform-support.md` misleading Linux storage | **PARTIALLY CONFIRMED** | `docs/DEVELOPMENT/platform-support.md` | Clarify plaintext fallback requires explicit env var |
| Doc-015 | `SECURITY.md` vs `docs/FAQ.md` inconsistent plaintext fallback instructions | **PARTIALLY CONFIRMED** | `SECURITY.md`, `docs/FAQ.md` | Align language: both should say "environment variable" (not specifically `.env`) |
| Doc-016 | Inconsistent maintainer nomenclature | **PARTIALLY CONFIRMED** | `SUPPORT.md`, `CONTRIBUTING.md`, `AGENTS.md` | Add maintainer reference to `SUPPORT.md`; unify as "Maintainer: fayeblade (@spearchucker667)" |
| Doc-017 | `AGENTS.md` missing CI gap for safety guard | **CONFIRMED** | `AGENTS.md` | Document that `verify:safety-guard` is a local required check, not currently in CI |
| Doc-018 | `README.md` missing `THEME_SYSTEM.md` from index | **CONFIRMED** | `README.md` | Add `docs/THEME_SYSTEM.md` to docs index |
| Doc-019 | `CHANGELOG.md` missing release script consolidation entry | **CONFIRMED** | `CHANGELOG.md` | Add entry for `verify-dist-mac.cjs` + `verify-dist-win.cjs` → `verify-dist.cjs` consolidation |
| Doc-020 | `docs/RELEASE/release.md` missing docs in checklist | **CONFIRMED** | `docs/RELEASE/release.md` | Add `AGENTS.md` and `CHANGELOG.md` to release checklist |
| Doc-021 | `docs/RELEASE/release.md` uses `npm install` instead of `npm ci` | **CONFIRMED** | `docs/RELEASE/release.md` | Change `npm install` to `npm ci` in release build sections |
| Doc-022 | `docs/RELEASE/signing-and-notarization.md` imprecise Apple credential naming | **CONFIRMED** | `docs/RELEASE/signing-and-notarization.md` | Add `APPLE_TEAM_ID` to the list of required credentials |
| Doc-023 | `docs/REPOSITORY_TREE.md` duplicate table entry | **CONFIRMED** | `docs/REPOSITORY_TREE.md` | Remove duplicate `electron/services/chatStorage.ts` entry |
| Doc-024 | `docs/THEME_SYSTEM.md` / `docs/AGENTS/gemini.md` stale `src/index.css` references | **CONFIRMED** | `docs/THEME_SYSTEM.md`, `docs/AGENTS/gemini.md` | Update references to point to `src/styles/theme.css` for actual theme CSS content |
