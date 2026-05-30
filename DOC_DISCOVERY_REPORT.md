## Documentation Discovery Report

| Area | Current state | Source of truth | Notes |
|---|---|---|---|
| README | Accurate overall; misses `conversations` in storage table and `THEME_SYSTEM.md` in docs index | README.md | Good shape, minor omissions |
| Security docs | Accurate; `SECURITY.md` correctly describes no plaintext fallback on Win/Mac, env-var plaintext on Linux | SECURITY.md, electron/services/secureStore.ts | Well-maintained |
| Release docs | `release.md` uses `npm install` instead of `npm ci`; omits AGENTS.md/CHANGELOG.md from checklist; signing doc omits APPLE_TEAM_ID | docs/RELEASE/release.md, docs/RELEASE/signing-and-notarization.md | Needs accuracy fixes |
| Platform docs | `platform-support.md` accurate; `macos.md` accurate; `troubleshooting.md` accurate | docs/DEVELOPMENT/*.md | Good shape |
| Support docs | Accurate; asks for OS, arch, artifact type, version, diagnostics | SUPPORT.md | Well-maintained |
| Contributing docs | Accurate; includes before-PR validation; mentions `verify:safety-guard` | CONTRIBUTING.md | Good shape |
| Agent docs | `gemini.md` has wrong OS (Windows instead of macOS), incomplete export format, omits macOS Keychain; `copilot-instructions.md` accurate | docs/AGENTS/gemini.md, .github/copilot-instructions.md | Needs fixes |
| GitHub templates | `config.yml` has wrong security URL (`Test-ai` instead of `Venice-API-connector`); bug report and feature request templates good | .github/ISSUE_TEMPLATE/* | One broken link |
| Changelog | References missing CodeQL workflow; doesn't mention script consolidation | CHANGELOG.md | Needs correction |
| TODO file | `todo.md` is canonical; contains false claim that `REPOSITORY_TREE.md` is absent | todo.md | Needs correction |
| Workflows | `ci.yml` runs lint:eslint, typecheck, test, build (no `verify:safety-guard`); release workflows correct | .github/workflows/*.yml | Accurate |
| Package scripts | `package.json` accurate; `engines` field present; `start` uses production wrapper | package.json | Accurate |
| Build/release scripts | `verify-dist.cjs` consolidated mac+win verifiers; `verify-dist-mac.cjs` and `verify-dist-win.cjs` deleted | scripts/ | Accurate |
| Repository tree doc | References deleted scripts; duplicate `chatStorage.ts` entry | docs/REPOSITORY_TREE.md | Needs cleanup |
| Theme system doc | Claims `src/index.css` contains theme CSS content, but actual file only has 3 `@import` lines | docs/THEME_SYSTEM.md, src/index.css | Needs correction |
| About doc | Technology Stack omits macOS packaging; `TROUBLESHOOTING.md` link is bare filename | docs/ABOUT.md | Minor fixes |
| FAQ | Storage section omits `conversations` from IndexedDB description | docs/FAQ.md | Minor fix |
| HQE audit report | Historical doc; IndexedDB store list omits `conversations` and `diagnostics` | docs/HQE_AUDIT_REPORT.md | Historical — note as stale |
