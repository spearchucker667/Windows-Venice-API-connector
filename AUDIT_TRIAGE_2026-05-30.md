# Audit Triage Matrix

| ID | Severity in report | Confirmed? | Actual severity | File/path | Action |
|---|---|---:|---|---|---|
| C-001 | Critical | **CONFIRMED** | Critical | `src/shared/safety/promptPayloadExtractor.ts:49-52` | Fix now |
| C-002 | Critical | **CONFIRMED** | Critical | `src/shared/safety/childExploitationGuard.ts:248`, `promptPayloadExtractor.ts:33` | Fix now |
| C-003 | Critical | **CONFIRMED** | Critical | `electron/ipc/handlers.ts:129` | Fix now |
| C-004 | Critical | **CONFIRMED** | Critical | `server.ts:6` | Fix now |
| C-005 | Critical | **CONFIRMED** | Critical | `server.ts:336-338` | Fix now |
| C-006 | Critical | **CONFIRMED** | Critical | `server.ts:328-338`, `package.json:28` | Fix now |
| C-007 | Critical | **CONFIRMED** | Critical | `src/services/veniceClient.ts:811-814` | Fix now |
| H-001 | High | **CONFIRMED** | High | `src/shared/safety/promptPayloadExtractor.ts:81-118` | Fix now |
| H-002 | High | **CONFIRMED** | High | `src/shared/safety/childExploitationGuard.ts:155-167` | Fix now |
| H-003 | High | **CONFIRMED** | High | `src/shared/safety/childExploitationGuard.ts:255-273` | Fix now |
| H-004 | High | **CONFIRMED** | High | `electron/utils/urlSecurity.ts:2-15` | Fix now |
| H-005 | High | **CONFIRMED** | High | `electron/services/secureStore.ts:90-105` | Fix now |
| H-008 | High | **CONFIRMED** | High | `electron/main.ts:222,229` | Fix now |
| H-009 | High | **CONFIRMED** | High | `electron/services/secureStore.ts:90-105` | Fix now (same as H-005) |
| H-010 | High | **CONFIRMED** | High | `server.ts:301-320` | Fix now |
| H-011 | High | **CONFIRMED** | High | `vitest.config.ts:5` | Fix now |
| H-012 | High | **CONFIRMED** | High | `electron-builder.config.cjs:10-15,82-84` | Fix now |
| H-013 | High | **CONFIRMED** | High | `tsconfig.json` | Fix now |
| H-014 | High | **CONFIRMED** | High | `src/services/desktopBridge.ts:206-212`, `src/utils/download.ts:26-41` | Fix now |
| H-015 | High | **CONFIRMED** | High | `src/hooks/useSettingsPersistence.ts:18-46` | Defer — requires UI state refactor, low immediate impact |
| H-016 | High | **CONFIRMED** | Medium | `src/services/chatStorage.ts:47-54` | Defer — web-mode performance, not security-critical |
| H-017 | High | **CONFIRMED** | High | `src/shared/safety/childExploitationGuard.ts:306-314` | Fix now |
| H-018 | High | **CONFIRMED** | High | `src/services/veniceClient.ts:811-814` | Fix now (same as C-007) |
| H-019 | High | **CONFIRMED** | High | `src/services/desktopBridge.ts:30-32` | Fix now |
| M-001 | Medium | **CONFIRMED** | Medium | `server.ts:214` | Fix now |
| M-002 | Medium | **CONFIRMED** | Medium | `server.ts:220-225` | Fix now |
| M-003 | Medium | **CONFIRMED** | Medium | `src/shared/safety/promptPayloadExtractor.ts:73` | Fix now |
| M-004 | Medium | **CONFIRMED** | Medium | `src/shared/safety/promptPayloadExtractor.ts:205-218` | Fix now |
| M-005 | Medium | **CONFIRMED** | Medium | `src/shared/safety/promptPayloadExtractor.ts:96-100` | Fix now |
| M-006 | Medium | **CONFIRMED** | Low | `src/shared/safety/promptPayloadExtractor.ts:146-147` | Fix now |
| M-007 | Medium | **CONFIRMED** | Medium | `electron/utils/navigation.ts:22` | Fix now |
| M-008 | Medium | **CONFIRMED** | Medium | `electron/main.ts:129` | Fix now |
| M-009 | Medium | **CONFIRMED** | Medium | `electron/ipc/handlers.ts:171-180` | Fix now |
| M-010 | Medium | **CONFIRMED** | Medium | `electron/services/secureStore.ts:54` | Fix now |
| M-011 | Medium | **CONFIRMED** | Medium | `electron/services/chatStorage.ts:130-134` | Fix now |
| M-012 | Medium | **CONFIRMED** | Medium | `src/modules/ChatModule.tsx:217-221` | Defer — UI refactor risk |
| M-013 | Medium | **CONFIRMED** | Medium | `src/modules/SearchScrapeModule.tsx:53-89` | Defer — UI refactor risk |
| M-014 | Medium | **CONFIRMED** | Medium | `src/modules/ChatModule.tsx:244-263` | Defer — UX change, not security-critical |
| M-015 | Medium | **CONFIRMED** | Medium | `src/modules/BatchModule.tsx:106-111` | Fix now |
| M-016 | Medium | **CONFIRMED** | Medium | `src/services/veniceClient.ts:63-81,97-109` | Fix now |
| M-017 | Medium | **CONFIRMED** | Low | `src/utils/markdown.tsx:17-35` | Fix now |
| M-018 | Medium | **CONFIRMED** | Low | `src/state/appReducer.ts:278-283` | Fix now |
| M-019 | Medium | **CONFIRMED** | Low | `src/state/appReducer.ts:321-333` | Fix now |
| M-020 | Medium | **CONFIRMED** | Low | `src/utils/markdown.tsx:26-28` | Fix now |
| M-021 | Medium | **CONFIRMED** | Medium | `src/services/exportImport.ts:98-101` | Fix now |
| M-022 | Medium | **CONFIRMED** | Medium | `src/utils/image.ts:29-44` | Fix now |
| M-023 | Medium | **CONFIRMED** | Medium | `src/services/desktopBridge.ts:223-230` | Defer — web-mode feature gap |
| M-024 | Medium | **CONFIRMED** | Low | `electron/ipc/validation.ts:30` | Fix now |
| M-025 | Medium | **CONFIRMED** | Low | `electron/services/chatStorage.ts:59` | Fix now |
| M-026 | Medium | **CONFIRMED** | Low | `electron/services/chatStorage.ts:85` | Fix now |
| L-001 | Low | **CONFIRMED** | Low | `electron/services/chatStorage.ts:106-118` | Defer |
| L-002 | Low | **CONFIRMED** | Low | `electron/services/logger.ts:42-53` | Defer |
| L-003 | Low | **CONFIRMED** | Low | `electron/main.ts:62-68` | Defer — cosmetic |
| L-004 | Low | **CONFIRMED** | Low | `electron/preload.ts:34` | Fix now |
| L-005 | Low | **CONFIRMED** | Low | `src/services/desktopBridge.ts` / `chatStorage.ts` | Fix now |
| L-006 | Low | **CONFIRMED** | Low | `src/state/appReducer.ts:103-109` | Fix now |
| L-007 | Low | **CONFIRMED** | Low | `src/services/veniceClient.ts:705-744` | Fix now |
| L-008 | Low | **CONFIRMED** | Low | `src/utils/download.ts:8-15` | Fix now |
| L-009 | Low | **CONFIRMED** | Low | `src/components/ToastHost.tsx:24` | Fix now |
| L-010 | Low | **CONFIRMED** | Low | `src/styles/accessibility.css:8` | Fix now |
| L-011 | Low | **CONFIRMED** | Low | `src/modules/GalleryModule.test.tsx:67` | Fix now |
| L-012 | Low | **CONFIRMED** | Low | `package.json:38` | Fix now |
| L-013 | Low | **CONFIRMED** | Low | `package.json` | Fix now |
| L-014 | Low | **CONFIRMED** | Low | `server.ts:76,300` | Fix now |
| L-015 | Low | **CONFIRMED** | Low | `server.ts:16,238-278` | Fix now |
| L-016 | Low | **CONFIRMED** | Low | `server.ts:329` | Fix now |
| L-017 | Low | **CONFIRMED** | Low | `server.ts:74-80` | Fix now |
| L-018 | Low | **CONFIRMED** | Low | `electron-builder.config.cjs:104-108` | Fix now |
| L-019 | Low | **CONFIRMED** | Low | `package.json:56,68` | Defer — type package upgrade |
| L-020 | Low | **CONFIRMED** | Low | `package.json:74,92` | Fix now |
| L-021 | Low | **CONFIRMED** | Low | `src/shared/configSchema.ts:40-41` | Fix now |
| L-022 | Low | **CONFIRMED** | Low | `scripts/verify-dist.cjs:73` | Fix now |
