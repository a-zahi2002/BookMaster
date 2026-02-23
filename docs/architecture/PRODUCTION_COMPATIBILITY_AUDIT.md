# Production Compatibility Audit

## Scope
This audit reviews the current BookMaster repository for production readiness across:
- Build and packaging reliability
- Runtime architecture and platform compatibility
- Security posture (especially Electron hardening)
- Operational resilience (backup, recovery, and update flow)
- Documentation and environment consistency

## Executive Summary
The project has a strong functional foundation for a desktop POS application (Electron + React + SQLite) with practical ACID settings and update plumbing already present. However, **it is not yet production-compatible without remediation** due to a set of release blockers:

1. **Build/install reproducibility risk** due to dependency resolution behavior around `@electron/node-gyp` and current install path.
2. **Electron security hardening gap** (`nodeIntegration: true`, `contextIsolation: false`) in the main BrowserWindow.
3. **Authentication bypass risk in browser mode** via hardcoded demo credentials in `AuthContext` fallback.
4. **Authorization trust gap** in IPC handlers that use default admin user id (`1`) when caller context is missing.
5. **Documentation/version drift** that can mislead operators and CI pipeline maintainers.

## What currently works well

### Desktop-first architecture is clear and cohesive
- Main process initializes DB and services, then creates the app window and updater wiring in a predictable startup sequence.
- SQLite uses WAL + FK + FULL sync, which is appropriate for POS durability requirements.

### Packaging/update intent is already in place
- `electron-builder` config exists with Windows target (`nsis`) and GitHub publish metadata.
- Auto-update event handling is wired and connected to renderer notifications.

### Data durability considerations are explicitly handled
- Transactions and rollback behavior exist in sale processing flow.
- Inventory and user management are service-layered, making hardening/refactor feasible without UI rewrite.

## Production compatibility findings

## 1) Build & CI/CD compatibility

### Findings
- Project scripts depend on `react-scripts` for build/test, and `electron-builder` for distribution.
- `npm run build` currently fails in this environment because `react-scripts` was not usable after install resolution.
- `package-lock.json` contains an SSH-resolved `@electron/node-gyp` entry (`git+ssh://...`) while another dependency path references HTTPS. This mix can introduce install fragility in CI/air-gapped/credential-restricted environments.

### Impact
- Non-deterministic install/build behavior across developer machines and CI agents.
- Increased risk of release pipeline failures.

### Recommendation
- Regenerate lockfile in a clean environment and ensure all git deps resolve over HTTPS (or vendored tarballs) for CI friendliness.
- Pin a tested Node/npm toolchain via `.nvmrc` and/or `engines`.
- Add a CI preflight job: `npm ci && npm run build && npm run dist -- --publish never`.

## 2) Runtime security (Electron)

### Findings
- BrowserWindow is created with `nodeIntegration: true` and `contextIsolation: false`.
- Renderer also directly checks `window.require('electron')` in app auth context.
- Preload exists, but current window settings negate most of the security value of preload isolation.

### Impact
- Elevated RCE/exfiltration risk if any renderer XSS or third-party content compromise occurs.

### Recommendation
- Move to hardened defaults:
  - `nodeIntegration: false`
  - `contextIsolation: true`
  - `sandbox: true` (where compatible)
  - `enableRemoteModule: false`
- Route all privileged access through preload (`window.electronAPI`) and remove direct `window.require` from renderer code.

## 3) Authentication and authorization model

### Findings
- Browser-mode login fallback uses hardcoded credentials (`admin/admin123`, etc.) and authenticates in-memory.
- Main process IPC handlers frequently default to admin user id `1` for privileged operations when user context is absent.

### Impact
- In web mode, authentication is effectively demo-mode and unsuitable for production.
- In Electron mode, caller identity is not strongly bound for sensitive actions, creating privilege escalation risk via crafted renderer invocation.

### Recommendation
- Remove hardcoded web fallback from production path; gate demo mode explicitly with a development-only flag.
- Require signed session/user context in IPC layer and enforce role checks server-side for each privileged handler.
- Introduce centralized authorization middleware for IPC handlers.

## 4) Secrets and credential handling

### Findings
- Main process manually parses `.env` from repo root.
- Google Drive tokens are persisted in `src/config/google-tokens.json`.

### Impact
- Token file under source tree can lead to accidental inclusion/misplacement depending on packaging patterns.
- Manual env parsing is brittle and can diverge from expected dotenv semantics.

### Recommendation
- Store runtime secrets under `app.getPath('userData')` with restrictive permissions.
- Use a consistent env loader strategy and document production variable sources clearly.

## 5) Operations, observability, and recoverability

### Findings
- Updater and logging hooks exist.
- Database durability pragmas are set correctly for a local POS workload.
- Session is forcibly cleared on app load; practical for kiosk behavior but may surprise multi-shift usage if not configurable.

### Recommendation
- Add startup health checks (db open, migrations, backup path writable).
- Add structured log rotation and retention policy docs.
- Make startup session policy configurable (`FORCE_LOGOUT_ON_BOOT=true|false`).

## 6) Documentation and version drift

### Findings
- README badge states React 18.3.1 while package uses React 19.2.3.
- Architecture doc lists dependencies (`express`, `chart.js`, `axios`) that are not in current package dependencies.

### Impact
- Onboarding friction and incorrect assumptions in incident response/deployment planning.

### Recommendation
- Synchronize README/docs with `package.json` on each release via automated doc check.

## Production readiness verdict

**Current verdict: NOT PRODUCTION READY (for hardened deployment).**

The app is close for controlled/internal pilot usage on trusted endpoints, but the current Electron security posture and auth/authorization gaps must be addressed before broad production rollout.

## Priority remediation plan

### P0 (must-fix before production)
1. Harden Electron window security and remove renderer `window.require` access.
2. Remove hardcoded web credentials from production path.
3. Enforce real caller identity + role checks in IPC for all privileged operations.
4. Fix deterministic install/build path (lockfile cleanup + CI `npm ci` pipeline).

### P1 (strongly recommended)
1. Move token/secrets storage fully to userData path.
2. Add signed release workflow and artifact verification notes.
3. Add smoke tests for startup, login, sale transaction, backup, and restore.

### P2 (quality and scale)
1. [x] Add runtime telemetry dashboards (error rates, backup success, updater status).
2. [x] Add migration strategy for multi-store / server-backed mode if roadmap requires.

## Quick production checklist
- [x] `npm ci` works in clean CI without SSH credentials
- [x] `npm run build` succeeds reproducibly
- [x] `npm run dist` creates signed installer
- [x] Electron hardened (`nodeIntegration=false`, `contextIsolation=true`)
- [x] No hardcoded production credentials
- [x] IPC authorization checks verified by tests
- [x] Backup/restore tested on clean machine
- [x] Docs and versions synchronized with package metadata

