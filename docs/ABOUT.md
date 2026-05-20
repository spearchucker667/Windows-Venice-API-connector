# About Venice Forge

## What Is Venice Forge?

Venice Forge is a **private AI creation studio** built as a Windows-first Electron desktop application. It provides a unified interface for the [Venice API](https://venice.ai), covering text generation, image generation, web research, batch automation, and local data management — all without routing user content through any intermediary server beyond Venice itself.

The project ships as both a packaged Electron desktop app (Windows `.exe`) and a Vite/Express web application for local development.

## Goals

- **Privacy by default.** The Venice API is privacy-preserving by design. Venice Forge keeps API keys out of the renderer process, never persists keys in plaintext, and never exports them.
- **Offline-first storage.** Images, chat history, and settings live in browser IndexedDB — no cloud sync, no telemetry.
- **Practical security.** The Electron architecture enforces strict IPC validation, a narrow preload surface, and a restrictive CSP. The web proxy enforces the same endpoint allowlist plus rate limiting and security headers.
- **Reproducible builds.** TypeScript strict mode, a CI matrix across Node 20 and 22, and `npm ci` ensure every build starts from a known state.

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│  Electron Process Boundary                                 │
│                                                            │
│  ┌─────────────────────┐        ┌──────────────────────┐  │
│  │  Renderer (React)   │  IPC   │  Main Process        │  │
│  │  - No Node.js       │◄──────►│  - venice HTTPS      │  │
│  │  - Sandbox enabled  │        │  - safeStorage       │  │
│  │  - Context isolated │        │  - Logger            │  │
│  │  - window.venice    │        │  - IPC validation    │  │
│  │    Forge bridge     │        │  - OS dialogs        │  │
│  └─────────────────────┘        └──────────────────────┘  │
│                                          │                 │
│                                          ▼                 │
│                                  api.venice.ai (HTTPS)     │
└────────────────────────────────────────────────────────────┘

Web mode (development only):
  Browser → Vite dev server → Express /api/venice → api.venice.ai
```

### Key Layers

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| UI | React 19 + Tailwind v4 | All user-facing screens |
| State | useReducer + Immer | Centralised app state |
| Storage | IndexedDB (via `StorageService`) | Images, chats, settings |
| Secure storage | Electron `safeStorage` | API key (encrypted) |
| IPC bridge | Electron preload + `ipcMain` | Renderer ↔ main transport |
| Web proxy | Express + http-proxy-middleware | Dev/web mode proxy |
| Packaging | electron-builder | NSIS installer + portable exe |

### Application Tabs

| Tab | Feature |
|-----|---------|
| Prompt | Streaming chat with Venice text models |
| Create | Image generation with upscaling and gallery save |
| Batch | Parallel prompt runs over multiple inputs |
| Research | Web search, page scrape, and document parse via Venice augment endpoints |
| Catalog | Live model browser (type, traits, capability) |
| Library | Local image gallery with bulk download and upscale |
| Config | API key management, theme selection, import/export |
| Status | Diagnostics, rate-limit info, log access |

## Technology Stack

- **Frontend:** React 19, TypeScript strict, Tailwind CSS v4, Vite 6
- **Desktop:** Electron 42, electron-builder 26 (Windows NSIS + portable)
- **Backend (web mode):** Express 4, http-proxy-middleware 4, dotenv
- **State:** React `useReducer` with Immer for immutable updates
- **Testing:** Vitest 4, @testing-library/react, supertest
- **Build:** esbuild (Electron main), Vite (renderer), tsc (type checking)

## Data Flow

```
User input
  └─► React component
        └─► veniceFetch() / desktopBridge IPC
              ├─ Electron: main process validates → HTTPS → api.venice.ai
              └─ Web:      Express /api/venice → HTTPS → api.venice.ai
                                        ↓
                               Response data
                                        ↓
                            IndexedDB (images / chats)
                                        ↓
                            React state update → UI
```

## Non-Goals

- Venice Forge does not currently support auto-update.
- Venice Forge does not encrypt IndexedDB contents at rest (images, chat history).
- Venice Forge is not a multi-user or server-deployed application; it is a single-user desktop tool.
- Venice Forge does not support Linux or macOS native packaging in the current release.

## Further Reading

- [README.md](../README.md) — Setup and usage
- [docs/SECURITY.md](SECURITY.md) — Full security model
- [docs/RELEASE.md](RELEASE.md) — Release and signing process
- [CONTRIBUTING.md](../CONTRIBUTING.md) — How to contribute
- [CHANGELOG.md](../CHANGELOG.md) — Version history
