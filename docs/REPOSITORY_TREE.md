# Repository Tree

This document is the public map for the Venice Forge repository. It reflects the current dual-mode app layout: Electron desktop production mode and Express/Vite web development mode.

## Top-Level Structure

```text
.
├── .github/
│   ├── CODEOWNERS
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── config.yml
│   │   └── feature_request.md
│   ├── workflows/
│   │   ├── ci.yml                     # Main CI/CD pipeline (lint, test, build)
│   ├── macos-release.yml          # macOS build, dmg/zip generation, checksums
│   └── windows-release.yml        # Windows build, NSIS setup/portable generation, checksums
│   ├── dependabot.yml
│   └── pull_request_template.md
├── build/
│   ├── icon.icns                  # macOS application icon bundle
│   ├── icon.ico                   # Windows application icon bundle
│   └── icon-placeholder.md
├── docs/
│   ├── ABOUT.md
│   ├── HQE_AUDIT_REPORT.md
│   ├── LEGAL.md
│   ├── RELEASE.md
│   ├── REPOSITORY_TREE.md
│   ├── SECURITY.md
│   ├── Venice_swagger_api.yaml
│   └── venice_llm_info.md
├── electron/
│   ├── ipc/
│   ├── services/
│   ├── main.ts
│   └── preload.ts
├── scripts/
│   ├── checksum-release.cjs
│   ├── create-cjs-package.cjs
│   ├── generate-placeholder-icon.cjs
│   ├── verify-dist-mac.cjs
│   ├── verify-dist-win.cjs
│   ├── verify-dist.cjs
│   └── verify-icon.cjs
├── src/
│   ├── components/
│   ├── constants/
│   ├── modules/
│   ├── services/
│   ├── shared/
│   ├── state/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── AGENTS.md
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
├── SUPPORT.md
├── TODO.md
├── electron-builder.config.cjs
├── metadata.json
├── package-lock.json
├── package.json
├── server.test.ts
├── server.ts
├── tsconfig.electron.json
├── tsconfig.json
└── vite.config.ts
```

## Runtime Segments

| Segment | Path | Responsibility |
|---------|------|----------------|
| Renderer app | `src/` | React shell, tab modules, UI components, state, storage, import/export, Venice client facade |
| Electron desktop | `electron/` | BrowserWindow, CSP, navigation guard, preload bridge, IPC handlers, safeStorage, HTTPS client |
| Web proxy | `server.ts` | Local development Express server, Venice proxy, security headers, rate limiting, circuit breaker |
| Shared validation | `src/shared/` | Venice endpoint and API host configuration shared by renderer, web proxy, and Electron IPC |
| Build scripts | `scripts/` | CJS package marker generation and release artifact validation |
| Release config | `electron-builder.config.cjs`, `.github/workflows/*-release.yml` | Windows and macOS application packaging |
| Governance | `.github/`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md` | Public contribution, support, ownership, and automation metadata |

## Source Organization

| Path | Notes |
|------|-------|
| `src/modules/` | One file per app tab: chat, image generation, batch, research, models, gallery, settings, diagnostics |
| `src/components/` | Reusable UI primitives and feature components |
| `src/services/veniceClient.ts` | Only renderer entry point for Venice API calls |
| `src/services/desktopBridge.ts` | Electron-vs-web transport abstraction |
| `src/services/storageService.ts` | IndexedDB persistence for images, chats, settings, diagnostics |
| `src/services/cryptoService.ts` | AES-GCM encryption for chats and settings |
| `src/services/exportImport.ts` | Versioned JSON export/import with secret redaction |
| `src/shared/validation.ts` | Allowed Venice endpoint and method list |
| `electron/ipc/validation.ts` | Electron IPC request validation boundary |
| `electron/services/secureStore.ts` | OS-encrypted API key persistence |
| `electron/services/veniceClient.ts` | Main-process HTTPS client for `api.venice.ai` |

## Generated and Ignored Output

The following paths are generated locally and are intentionally not part of the public source tree:

- `node_modules/`
- `dist/`
- `dist-electron/`
- `release/`
- `coverage/`
- `.env`
- `*.log`

## Public Readiness Checklist

- README badges and release ribbon are present.
- `LICENSE`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `SUPPORT.md` are present.
- CI runs typecheck, tests, and build on Node 20 and 22.
- Windows and macOS release workflows build targets, verify artifacts, and emit SHA-256 checksums.
- Venice API legal/TOS notes are documented in [LEGAL.md](LEGAL.md).
