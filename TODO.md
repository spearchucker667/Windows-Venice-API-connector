# Venice Forge - Current Backlog

> Updated: 2026-05-21  
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
| SEC-004 | P1 | Open | Add root private vulnerability reporting instructions if GitHub feature is enabled | Current fallback is issue-label routing. |
| SEC-005 | P1 | Open | Run dependency audit before each public release | Use `npm audit` in an environment with `npm` available. |
| SEC-006 | P2 | Open | Add more runtime validation for Venice API response shapes | Current app uses typed interfaces and targeted normalization. |

## Accessibility and UX

| ID | Priority | Status | Item | Notes |
|----|----------|--------|------|-------|
| A11Y-001 | P1 | Open | Audit modal focus trapping and keyboard flows | Focus on image preview and gallery actions. |
| A11Y-002 | P1 | Open | Confirm toast and error announcements in screen readers | `ToastHost` and `StatusBlock`. |
| A11Y-003 | P2 | Open | Add captions or labels to diagnostics tables where useful | Improves screen-reader navigation. |
| UX-001 | P2 | Open | Add progress/cancel affordance for bulk gallery download | Current implementation delays between downloads. |

## Integration

| ID | Priority | Status | Item | Notes |
|----|----------|--------|------|-------|
| API-001 | P1 | Open | Validate desktop support for file uploads through `/augment/text-parser` | Requires an Electron smoke test with a real Venice key. |
| API-002 | P1 | Open | Cache `/models` with stale-while-revalidate behavior | Reduces redundant model catalog requests. |
| API-003 | P2 | Open | Consider additional Venice endpoints | Embeddings, audio, image edit, and usage endpoints are not currently allowlisted. |

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
