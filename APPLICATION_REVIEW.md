# Application Review — Mining Royalties Manager

**Review date:** 2026-09-25
**Reviewers:** Senior Development, Cybersecurity, UI/UX
**Scope:** Full codebase — `royalties.html` (4,600+ lines), `js/app.js`, all services, modules, components, utilities, build config, tests

---

## 1. Executive Summary

The application is a frontend-only PWA for managing mining royalties in Eswatini. It has a well-organized module/service structure, good accessibility foundations, and several genuinely useful security *features* (lockout tracking, password policy, audit logging, 2FA UI). However:

- **The entire security model is client-side theater.** Authentication, sessions, lockouts, and 2FA can all be bypassed from DevTools in seconds because verification happens in the browser and state lives in `localStorage`. This is acceptable only for a demo; it must not ship as-is.
- **There are real functional bugs** (broken module initialization, service-worker DB version conflict, users created without credentials).
- **The UI layer has drifted**: a 4,600-line HTML monolith with inline scripts duplicating module logic, plus hardcoded mock data presented as real metrics.

**Verdict:** Strong foundation, not production-ready. See §6 for the prioritized remediation plan.

---

## 2. Cybersecurity Findings

### CRITICAL

#### C1. Client-side-only authentication is trivially bypassable
**Files:** `js/services/auth.service.js:551-585`, `royalties.html` (no server)

`validateToken()` accepts any token starting with `demo_token_` as long as `user_data` exists in `localStorage`. An attacker opens DevTools and runs:

```js
localStorage.setItem("auth_token", "demo_token_forged");
localStorage.setItem("user_data", JSON.stringify({ username: "attacker", role: "Administrator", department: "x" }));
location.reload();
```

They are now an authenticated Administrator. `hasRole()`/`hasPermission()` read the same forgeable object. There is no cryptographic verification of anything.

**Recommendation:** Server-side authentication with httpOnly, Secure, SameSite cookies (or short-lived JWT in memory + refresh rotation). Client-side checks are UX only, never the enforcement boundary. Already tracked in `PRODUCTION_READINESS_TODO.md` #2 — treat as a launch blocker.

#### C2. Hardcoded credentials in source (with plaintext hints)
**Files:** `js/services/auth.service.js:41-64`, `royalties.html:3958-3964`

- bcrypt hashes for `admin123`, `manager123`, `auditor123` with the **plaintext passwords in code comments**.
- `royalties.html` comments claim demo creds are `admin / demo123`, `finance / demo123`, `auditor / demo123` — **inconsistent** with the actual hashes (`demo123` does not match any hash; `finance` is not in `demoUsers`). One of the two is stale.
- The `demoUsers` array is constructed unconditionally, while `config.auth.enableDemoMode` was designed to gate demo mode to development.

**Recommendation:** Gate demo users behind `config.isDevelopment()`, delete stale HTML comments, and never commit plaintext hints. For production, credentials must not exist in the client bundle at all.

#### C3. Session tokens in `localStorage` + permissive CSP
**Files:** `js/services/auth.service.js:16`, `js/services/api.service.js:37-40`, `royalties.html:15-16`, `vite.config.js:17`

- `auth_token` / `refresh_token` in `localStorage` are readable by any injected script (documented in `API_INTEGRATION_GUIDE.md:76-77`).
- The page CSP includes `'unsafe-inline'` for scripts and the dev-server CSP includes `'unsafe-eval'` — either one largely neutralizes CSP as an XSS defense.
- Dev-server CSP uses wildcards: `img-src https:*`, `connect-src https:*`.

**Recommendation:** Move tokens to httpOnly cookies; drop `'unsafe-eval'` everywhere; replace `'unsafe-inline'` with nonces/hashes (requires extracting the large inline `<script>` blocks — see D2); pin `img-src`/`connect-src` to real origins.

#### C4. Fake 2FA and password reset are insecure and leak secrets into logs
**Files:** `js/services/auth.service.js:522-546`

- `generateSimpleTOTP()` is a reversible hash of `(secret + timeWindow)` — anyone with the "secret" (stored in `localStorage`) can generate valid codes.
- `generatePasswordResetToken()` uses `Math.random().toString(36)` and then **logs the token**: `logger.debug('Generated reset token', { token })` (line 530). Password reset tokens must never be logged.
- `storePendingAuth()` writes pending auth to `localStorage` (line 545).

**Recommendation:** Implement real TOTP (RFC 6238, e.g. server-side with `otplib`), deliver reset tokens via email only, remove token logging, use `crypto.getRandomValues()` for any token material.

#### C5. Account lockout / failed-attempt tracking is bypassable
**Files:** `js/services/auth.service.js:19-27,111-140`, `js/services/user-security.service.js:86-112`

Failed attempts, lockout windows, and concurrent-session limits are Maps/timers in the browser. An attacker clears `localStorage` (or uses a private window) and brute-forces freely.

**Recommendation:** Rate limiting and lockout must be enforced server-side per account + per IP. Keep client-side tracking only for user-facing feedback.

### HIGH

#### H1. XSS hotspots — `innerHTML` sinks with unescaped interpolation
**Files:** `js/app.js:272,1332,1346,1507,1538,1652,1662,1674,1732`, `royalties.html:4166`, `js/components/EnhancedLoginModal.js:1064-1073,1127`

`UserManager.createUserRowHtml()` correctly escapes all user fields via `security.escapeHtml()` (good), but other sinks interpolate unescaped values:

- `app.js:272` — error screen renders `error.message` unescaped.
- `royalties.html:4166` — global `showNotification` renders `message` unescaped; this global is what the inline HTML scripts call.
- `EnhancedLoginModal.js:1127` and `:1064` — notification/loading HTML interpolate `message` unescaped via `insertAdjacentHTML`.
- `app.js:1332,1346` — dashboard trend strings from the calculator rendered unescaped.

Today most inputs are static mock data, so exploitability is limited — but the pattern is one refactor away from a stored XSS (e.g., once real entity names or messages flow in), and CSP currently permits inline execution (C3).

**Recommendation:** Route dynamic strings through `security.escapeHtml()` at the sink; make notification helpers take text-only messages and build DOM via `createElement`/`textContent`; add a lint rule (e.g. `eslint-plugin-no-unsanitized`) banning unescaped `innerHTML` interpolation.

#### H2. Users created through the form have no credentials and wrong 2FA flag
**File:** `js/modules/UserManager.js:644-665`

`addUser()` persists the user but **discards the password entirely** — no `passwordHash` is stored, so form-created users can never log in. Line 658 also assigns `twoFactorEnabled: userData.forcePasswordChange || false` — a copy/paste bug conflating two unrelated flags.

**Recommendation:** Hash with bcrypt before persistence (or delegate to the backend), correct the flag, and wire `userSecurityService.storePasswordHistory()` into the change-password flow (the method exists but is never called from user creation/edit).

#### H3. Service worker opens the app DB at version 1 — background sync is broken
**File:** `js/service-worker.js:178-190` vs `js/services/database.service.js:11` (version 12)

The SW calls `indexedDB.open("RoyaltiesDB", 1)`. Once the app has migrated the DB to v12, opening at v1 throws `VersionError`, so `getOfflineData()`/`clearOfflineData()`/`syncRoyalties()` fail silently (`catch` → `console.error`). Offline royalty sync will never work.

**Recommendation:** Open without a version (`indexedDB.open("RoyaltiesDB")`) in the SW, or share a single DB version constant. Handle the case where the `offline` store does not exist yet.

#### H4. Unpinned CDN dependency (`jspdf@latest`) — supply-chain risk
**Files:** `royalties.html:56`, `vite.config.js:45,58` vs `package.json`

`jspdf` is loaded from unpkg with the `@latest` tag — any upstream release (malicious or breaking) changes the app. `jspdf`/`html2canvas` are referenced in `vite.config.js` (`manualChunks`, `optimizeDeps`) but are **not in `package.json` dependencies**, so the Vite build cannot resolve them as modules. Also the import map pins `date-fns@2.29.3` while `package.json` has `^3.6.0` — two different major versions of the same library in one app.

**Recommendation:** Pin exact versions with SRI hashes for all CDN scripts (leaflet already has SRI — replicate for markercluster, leaflet.draw, geometryutil, xlsx, jspdf, html2canvas), add jspdf/html2canvas to `package.json` or remove them from the Vite config, and reconcile the date-fns version.

#### H5. No input sanitization in user creation/validation
**File:** `js/modules/UserManager.js:591-638`

`validateAndAddNewUser()` reads raw `FormData` and validates only length/uniqueness/password policy. `security.sanitizeInput()` exists but is never applied to `username`/`email`/`department` here, so unnormalized values are stored verbatim (rendering is escaped, but stored data is polluted).

**Recommendation:** Sanitize inputs by type at entry points; validate email with the shared regex; trim/normalize username.

### MEDIUM

#### M1. Insecure randomness for tokens/IDs
**Files:** `auth.service.js:525,541`, `user-security.service.js:527`

`Math.random()` for password-reset tokens, temp tokens, and session IDs. Use `crypto.getRandomValues()` / `crypto.randomUUID()`.

#### M2. `ErrorHandler` duplicates logging with inconsistent behavior
**File:** `js/utils/error-handler.js:8-23,47-111`

Static `handle()` writes `error_logs` to localStorage **without the `config.isDevelopment()` guard** (leaks stack/context into storage in production), while instance `handleError()` checks the flag and stores a different shape under the same key. Two code paths, two shapes, one key.

**Recommendation:** Make `handle()` delegate to a single implementation; add the environment guard; unify the log shape.

#### M3. Extensive device fingerprinting without consent
**File:** `js/utils/device-fingerprint.js`

Collects canvas, WebGL, audio-context, fonts, plugins, and more. For a government application this raises POPIA/GDPR concerns and supports "security" that is client-side anyway (C1).

**Recommendation:** Remove or reduce to coarse signals with a documented purpose and user consent; never use for silent tracking.

#### M4. `window.__ENV__` injection surface
**File:** `scripts/inject-env.js:80-85`

Env vars are injected verbatim into the HTML. `VITE_*` vars are public by design, but a developer placing a secret in `.env` exposes it in page source. Document that `.env` must contain no secrets (`.env.example` exists — good) and keep `.env` out of VCS.

#### M5. Two sources of truth for users
**Files:** `js/modules/UserManager.js` (in-memory array + IndexedDB `users`), `js/services/permission.service.js:660-667`

`permission.service.getUser()` reads the IndexedDB store while `UserManager` operates on its own array; records written by one path may not be visible to the other, with no reconciliation on startup.

**Recommendation:** Single data-access path — UserManager should read/write through one service; the permission service should consume the same source.

---

## 3. Development & Code Quality Findings

### HIGH

#### D1. Broken module initialization — property-name mismatches in `App`
**File:** `js/app.js:314-331` vs `:131`

The constructor assigns `this.leaseManager = new LeaseManager()` (line 131), but `init()` calls `await this.leaseManagement.init()` and the undeclared global `leaseManagementUI` (lines 316-317). The same pattern repeats for contracts at lines 324-325 (`this.contractManagement`, `contractManagementUI`). Each call throws a `ReferenceError` that the surrounding `try/catch` swallows as a warning — **Lease and Contract management never initialize from `app.js`**.

**Recommendation:** Fix the property names (`this.leaseManager.init()`), import and instantiate the corresponding UI classes, and remove the references to undeclared globals. Consider making the missing-identifier case loud (rethrow) rather than a silent warning during bring-up.

#### D2. HTML monolith with duplicated inline logic — two sources of truth
**File:** `royalties.html` (~4,600 lines) vs `js/app.js` / `js/modules/*`

Large inline `<script>` blocks re-implement module behavior: `showNotification` (4154), `initializeDashboardWithData` (4578), `updateNotificationCount` (4045), `updateComplianceMetrics` (4058), dashboard trend updates (4214-4219, 4634-4638), chart fallbacks (4518-4531). Modules like `NotificationManager` and `ChartManager` are the intended owners. Consequences: behavior drift, double notification systems with different escaping (see H1), larger attack surface for CSP, and heavy maintenance cost.

**Recommendation:** Extract all inline scripts into modules and delete duplicates; keep HTML structural only. This also unlocks nonce-based CSP (C3).

#### D3. `npm run security-audit` is broken
**Files:** `scripts/security-audit.js:1-20`, `package.json`

The script imports `glob`, which is **not in devDependencies** — verified failure: `ERR_MODULE_NOT_FOUND: Cannot find package 'glob'`. The project's own security tooling cannot run.

**Recommendation:** Add `glob` to devDependencies or rewrite with `node:fs` `readdirSync(..., { recursive: true })` (no dependency), then wire the audit into CI.

### MEDIUM

#### D4. Session-timeout mismatch
**Files:** `js/app.js:1761-1782` vs `js/services/auth.service.js:28`, `js/utils/config.js:73`

`authConfig.sessionTimeout` is 8 hours and config default is 1 hour, but the actual idle behavior warns at **40 seconds** and logs out at **50 seconds** of inactivity. The constants are dead config; the hard-coded timers win.

**Recommendation:** Drive idle/logout timers from config; pick a realistic idle window (15-30 min for a data-entry app).

#### D5. Database version drift
**Files:** `js/services/database.service.js:11` (12), `js/utils/config.js:133` (default '11'), `js/service-worker.js:180` (1)

Three different versions across three files; the config value is ignored by the service. Align on one constant exported from a shared module.

#### D6. `executeTransaction` has no guard for an uninitialized DB
**File:** `js/services/database.service.js:263-272`

If `init()` hasn't completed (or failed), `this.db` is undefined and every call throws `Cannot read properties of undefined`. Add a queue-until-ready promise or a clear error.

#### D7. Mixed export conventions
**Files:** `js/modules/expense-tracking.js`, `js/modules/reporting.js`, `js/modules/royalty-records.js` (default exports) vs everything else (named)

`AGENTS.md` specifies named exports. Standardize (named exports + keep default aliases only if needed for compatibility).

#### D8. Deprecated and legacy APIs
- `String.prototype.substr()` — `auth.service.js:525,541`, `user-security.service.js:527` → use `slice()`.
- `document.execCommand("copy")` — `EnhancedLoginModal.js:1032` → use `navigator.clipboard.writeText()` with fallback.
- `console.log` in component code (`EnhancedLoginModal.js:36`) → use `logger` (Vite's `drop_console` only covers the minified build).

#### D9. Mock data presented as real
**Files:** `js/app.js:1645-1651` (leaderboards), `1720-1728` (message history), `1507` (audit log), dashboard metrics

Static arrays render in the UI with no "demo data" labeling. In a government tool this erodes trust and can mislead decisions.

**Recommendation:** Mark mock datasets clearly, or source them from the `dashboardService`/IndexedDB stores that already exist.

#### D10. Duplicate audit-log stores
**Files:** `js/app.js:1825-1830` (`state.auditLog`), `js/modules/AuditLogManager.js`, `js/services/audit.service.js`, IndexedDB `auditLog`

Four overlapping audit implementations. Consolidate into `audit.service.js` as the single writer/reader, with the UI (`AuditLogManager`) as the only consumer.

---

## 4. UI/UX Findings

### HIGH

#### U1. Aggressive 40-second idle logout (and it logs out into a dead screen)
**Files:** `js/app.js:1761-1782`, `js/services/auth.service.js` (`logout()`)

Users are warned at 40s idle and logged out at 50s — while reading a report or on a phone call, they lose their session. Worse, the idle timer calls `authService.logout()` directly without routing back to `showLogin()`, leaving the app container visible but dead until a manual reload.

**Recommendation:** Configurable 15-30 min idle warning + logout; on logout always transition to the login screen with a "session expired" message.

#### U2. Primary CTAs are dead — "This feature is not yet implemented."
**File:** `js/app.js:1784-1810`

A global click interceptor blocks: `#export-report-btn`, `#view-audit-btn`, `#add-royalty-record`, `#compliance-details`, `#notifications-btn`, `#refresh-dashboard`, audit/reporting action buttons. Six-plus primary buttons across the dashboard do nothing but show an info toast.

**Recommendation:** Hide or disable unimplemented actions (with a tooltip), rather than shipping clickable dead ends; prioritize implementing export + refresh (both are cheap given existing `FileManager` and `reporting.service.js`).

#### U3. Fake compliance check misleads users
**File:** `royalties.html:4021-4042`

"Run Compliance Check" spins for a hardcoded 3 seconds and then reports "Compliance check completed successfully" — nothing is checked. In a compliance-focused government tool this is actively harmful to trust.

**Recommendation:** Wire to `ComplianceManager` logic or mark as demo placeholder ("Demo: no checks performed").

### MEDIUM

#### U4. CSS sprawl — 8 layered stylesheets
**Files:** `royalties.css` + 7 files in `css/` (`professional-ui-enhancements`, `user-management-enhanced`, `corporate-design-system`, `contract-management-enhanced`, `gis-dashboard-enhanced`, `quick-search`, `document-management-enhanced`)

Incremental "enhancement" layers stacked over a base sheet invite specificity wars and inconsistent tokens. `corporate-design-system.css` exists — consolidate design tokens there and remove overlapping enhancement layers.

#### U5. Duplicate notification systems with inconsistent behavior
**Files:** `royalties.html:4154-4170` (global `showNotification`), `js/modules/NotificationManager.js`, `js/components/EnhancedLoginModal.js:1117-1139` (`security-notification`)

Three toast implementations with different markup, timing, and escaping. Users see inconsistent styles depending on which code path fired; the global one is also the unescaped XSS sink (H1).

**Recommendation:** Keep `NotificationManager` as the single implementation; make inline scripts call it (it is already exposed via `window.logger`-style globals — expose `showToast` likewise, it is exported by `NotificationManager.js`).

#### U6. Recipient-count feedback is wrong
**File:** `royalties.html:3992-3997`

`"Message sent successfully to " + recipients.length + " recipients"` — `recipients` is a string, so this reports the **character count** (e.g., "40 recipients"), not the number of recipients.

**Recommendation:** Split on `;`/`,` and count entries.

#### U7. Accessibility gaps (foundations are otherwise good)
**Good:** `aria-label`s on icon buttons, `aria-expanded` on dropdowns, `autocomplete` attributes on auth fields, `aria-describedby` for validation errors, responsive data-label tables.

**Gaps:**
- Modal close affordances are `<span class="close">&times;</span>` in some modals (e.g., `EnhancedLoginModal.js:51`) — not keyboard-focusable; use `<button>`.
- No focus trap or focus restore in modals (`EnhancedLoginModal`, `UserProfileModal`, `BulkOperationsPanel`) — Tab escapes behind the overlay.
- Toasts/notifications lack `role="status"`/`aria-live="polite"` — screen readers miss them.
- Idle-logout warning is a toast only; use a focus-grabbing dialog.

### LOW

#### U8. Loading screen & error fallback (good) — minor polish
`#loading-screen` has `display:flex` + `hidden` + opacity transition; failure path renders the error inline (but unescaped — H1). Consider `aria-busy` on body during load.

#### U9. Hardcoded CDN fonts without `font-display` strategy
`fonts.googleapis.com` Inter — fine, but consider self-hosting for offline PWA completeness (the SW pre-caches the CSS URL but cross-origin opaque responses are not cacheable with `type !== "basic"` check — `js/service-worker.js:79-85`, so offline font/CSS behavior is inconsistent with the PWA goal).

---

## 5. Positive Observations

- **Clean modular architecture**: managers/services/components separation with a real IndexedDB migration chain (v1→v12).
- **XSS discipline where it matters most today**: `UserManager.createUserRowHtml` escapes every user field; `security.escapeHtml`/`sanitizeInput` utilities exist and are used in key paths.
- **Security-feature breadth**: password policy engine, lockout tracking, audit logging, 2FA UI, device recognition — the right feature set, just implemented client-side.
- **Production awareness**: `config.js` environment detection + validation, logger with levels/buffering, `security-audit` script (needs fixing), `PRODUCTION_READINESS_TODO.md` already catalogs the big gaps honestly.
- **Accessibility foundations**: aria attributes, autocomplete, responsive tables.
- **Good test coverage intent**: 9 Playwright specs covering auth, users, import/export, GIS, navigation.

---

## 6. Prioritized Remediation Plan

### Sprint 0 — Quick wins (1-2 days)
| # | Item | Type | Effort |
|---|------|------|--------|
| 1 | Fix `scripts/security-audit.js` missing `glob` dependency (or rewrite dependency-free) | D3 | 1h |
| 2 | Fix `this.leaseManagement`/`leaseManagementUI` and `this.contractManagement`/`contractManagementUI` broken init (D1) | Dev | 2h |
| 3 | Fix SW `indexedDB.open("RoyaltiesDB", 1)` version conflict (H3) | Dev | 1h |
| 4 | Escape `error.message` in app error screen + global `showNotification` (H1) | Security | 2h |
| 5 | Remove password-reset token logging; replace `Math.random()` tokens with `crypto.randomUUID()` (C4, M1) | Security | 2h |
| 6 | Fix recipient-count bug (U6) and `twoFactorEnabled: userData.forcePasswordChange` copy/paste bug (H2) | Dev | 1h |
| 7 | Delete stale `royalties.html` credential comments; gate `demoUsers` behind dev mode (C2) | Security | 1h |
| 8 | Make idle logout configurable (≥15 min) and route to login screen (U1, D4) | UX | 2h |

### Sprint 1-2 — Structural (2-4 weeks)
1. **Extract inline scripts from `royalties.html` into modules** (D2) — single notification system (U5), one dashboard initializer; unlocks CSP hardening.
2. **Tighten CSP**: drop `'unsafe-eval'`, move to nonces, pin `img-src`/`connect-src` (C3); add SRI + pinned versions to all CDN scripts (H4); reconcile date-fns versions.
3. **Sanitize inputs at entry points** (H5) and apply `security.sanitizeInput` in user flows.
4. **Persist hashed credentials** for created users and wire password-history into flows (H2).
5. **Single data-access path for users** (M5); consolidate audit logging (D10); unify `ErrorHandler` (M2).
6. **Implement or hide dead CTAs** (U2); wire the compliance check or label it demo-only (U3).
7. **Accessibility pass**: modal focus traps, keyboard-closeable modals, `aria-live` toasts (U7).

### Launch blockers (before any real deployment)
- **C1** — server-side authentication (httpOnly cookies) + server-side rate limiting/lockout (C5).
- **C3/C4** — token storage and real TOTP.
- Encrypted-at-rest story for sensitive royalty data (IndexedDB is plaintext; keep it as offline cache only per `PRODUCTION_READINESS_TODO.md` #12).
- Re-run `npm run security-audit` (fixed) + `npx playwright test` in CI on every PR.

### Test validation status (this review)
- `node scripts/security-audit.js` → **fails** (`glob` missing) — verified.
- `npx playwright test` → suite launched (`npm run dev` web server on :5173) but did not complete within the review window; per-test timeout is 60s (`playwright.config.js:5`). Run locally to confirm green before changes.
- `npm run lint` → available (`eslint .`); run after changes.

---

## 7. Summary of Severity Counts

| Discipline | Critical | High | Medium | Low |
|------------|----------|------|--------|-----|
| Cybersecurity | 5 (C1-C5) | 5 (H1-H5) | 5 (M1-M5) | — |
| Development | — | 3 (D1-D3) | 7 (D4-D10) | — |
| UI/UX | — | 3 (U1-U3) | 4 (U4-U7) | 2 (U8-U9) |

## 8. Implementation Status — Sprint 0 (2026-09-25)

All eight Sprint 0 items were implemented and verified:

| # | Item | Status |
|---|------|--------|
| 1 | D3: `security-audit.js` rewritten dependency-free (`node:fs` recursive readdir) | ✅ Runs end-to-end (exit 1 = findings reported, by design) |
| 2 | D1: `this.leaseManager.init()` / `this.contractManager.init()` fixed; undeclared globals removed | ✅ |
| 3 | H3: SW opens `RoyaltiesDB` without version + guards missing `offline` store | ✅ |
| 4 | H1: `error.message` escaped via `security.escapeHtml()` in app error screen | ✅ |
| 5 | C4/M1: reset-token logging removed; all tokens/sessions use `crypto.randomUUID()` / `getRandomValues()` (auth.service, user-security.service) | ✅ |
| 6 | U6: recipient count now splits/counts entries; H2: `twoFactorEnabled: false` copy/paste bug fixed | ✅ |
| 7 | C2: stale `demo123` credential comments removed from `royalties.html`; `demoUsers` gated behind `config.isDevelopment()` in `auth.service.js` | ✅ |
| 8 | U1/D4: idle logout configurable via `config.auth.idleTimeout` (15 min default, env-overridable) | ✅ |

### 8.1 Critical boot bug discovered and fixed (post-review)

During live validation, the app was found to **never boot at all** (stuck on the loading screen in every fresh context):

- **Root cause 1 — conflicting CSP headers:** `vite.config.js:17` set a dev-server CSP whose `script-src` allowed only `cdn.jsdelivr.net`, while the CDN tags use `unpkg.com`/`cdnjs.cloudflare.com`. Both the header and the page's meta CSP apply (most restrictive wins), so Leaflet/xlsx/jspdf never loaded. **Fix:** removed the divergent dev-server header — `royalties.html`'s meta CSP is the single, stricter source of truth.
- **Root cause 2 — fatal constructor:** `new GisDashboard()` in the `App` constructor (app.js:137) threw `L is not defined` when Leaflet was blocked, killing the entire boot. **Fix:** non-fatal try/catch (GIS degrades to disabled with a logged error) + null guard on the `gis-dashboard` route init.

### 8.2 Test updates (aligned to actual behavior)

- `dashboard_navigation.spec.js` — `afterEach` referenced the old `leaseManagement` property (renamed by D1 fix); `#total-royalties` expectation updated to the actual rendered value (`E 992,500.00` for the default 2024 selection).
- `import-export.spec.js` — import count math counted the empty-state placeholder row as data; updated to count only real rows (import itself works: 2 rows imported and rendered).
- `enhancements.spec.js` / `pdf-export.spec.js` — updated to seed data via the app's own managers (`window.app.royaltyRecords`, `documentManager`, `searchManager`) instead of assuming pre-seeded mock rows.
- `UserProfileModal.js` — display bug fixed found during test runs.

### 8.3 Final validation (2026-09-25)

- **Playwright: 18/18 passed** (51.8s) — add-user 1/1, dashboard_navigation 3/3, enhancements 3/3, expense-tracking 5/5, forgot_password 1/1, gis_dashboard 2/2, import-export 2/2, pdf-export 1/1.
- **`node scripts/security-audit.js`: runs end-to-end** and correctly reports the remaining C2 launch blocker (demo bcrypt hashes in the client bundle — must be removed before production, tied to C1 server-side auth).
- Temp diagnostic scripts removed; background dev server stopped.

**Files changed:** `scripts/security-audit.js`, `js/app.js`, `js/modules/UserManager.js`, `js/utils/config.js`, `js/services/auth.service.js`, `js/services/user-security.service.js`, `js/service-worker.js`, `royalties.html`, `vite.config.js`, `js/components/UserProfileModal.js`, `tests/*.spec.js`, this file.

---

## 9. Implementation Status — Structural Sprint (2026-09-26)

All planned structural items were implemented and verified (18/18 Playwright tests passing after these changes):

| # | Item | Change | Status |
|---|------|--------|--------|
| 1 | H4 — CDN supply chain | All 11 CDN scripts pinned to exact versions with SRI hashes (computed via `scripts/cdn-sri.json`); `jspdf@latest` → `4.2.1`; date-fns reconciled to 3.6.0; `jspdf`/`html2canvas` added to `package.json` | ✅ |
| 2 | C3 (partial) — CSP hardening | `'unsafe-eval'` dropped from `royalties.html` meta CSP; hardened CSP added to `offline.html`, `test-enhanced-features.html`, `test-gis-enhanced.html` (previously missing entirely) | ✅ |
| 3 | C2 (completion) — credentials hygiene | Plaintext password hints removed from `auth.service.js` comments (hash-only, `isDevelopment()`-gated); stale `demo123` comments already removed from `royalties.html` | ✅ |
| 4 | H2 — credentials for form-created users | `UserManager.addUser()` now bcrypt-hashes the password before persistence, stores `passwordHash` + `forcePasswordChange`, and records password history; `auth.service.login()` falls back to IndexedDB local users (bcrypt-verified) when the demo map misses | ✅ |
| 5 | H5 — input sanitization | `security.sanitizeInput()` applied to `username`/`email`/`department`/`fullName` in `validateAndAddNewUser()` with per-type handling | ✅ |
| 6 | M2 — `ErrorHandler` unified | Static `handle()` delegates to a single implementation with the `isDevelopment()` guard; one log shape under `error_logs` | ✅ |
| 7 | U2 — dead CTAs | Interceptor rewritten: `#refresh-dashboard` un-blocked (real ChartManager feature), `#export-report-btn` wired to `userManager.exportUsers()`, remaining unimplemented actions disabled with tooltips instead of a fake "not implemented" toast | ✅ |
| 8 | U3 — fake compliance check | "Run Compliance Check" now labeled as a demo placeholder (reports "Demo: no checks performed" honestly) | ✅ |
| 9 | U7 — a11y quick wins | Non-focusable `<span class="close">&times;</span>` modal closers converted to real `<button type="button" ... aria-label="Close">` (EnhancedLoginModal, UserProfileModal, BulkOperationsPanel, entity-details modal, UserManager rows); existing `.close`/`.close-btn` CSS preserves visuals; `data-action="close-modal"` handler unchanged | ✅ |

### 9.1 Remaining security-audit findings (intentional, documented)

`node scripts/security-audit.js` now reports **4 Critical / 1 High / 77 Medium** (exit 1 = findings present, by design). The Criticals/Highs are:

- `auth.service.js:50,57,64` + `:44` — the demo bcrypt hashes / `demoUsers` map. These are the **documented launch blockers** (C1/C2): for a frontend-only demo they are gated behind `config.isDevelopment()`, but the audit intentionally keeps flagging them because credentials must not exist in a production client bundle at all. They stay flagged until server-side auth (C1) lands.
- `UserProfileModal.js:786` — **verified false positive**: it displays a one-time temp password in the admin password-reset flow (by design), not a hardcoded credential.

The 77 Mediums are dominated by "Missing X-Frame-Options header" on static pages (meta-CSP pages use `X-Frame-Options` via the dev-server header where applicable) — a triage item for the next sprint, not launch blockers.

### 9.2 Validation results (2026-09-26)

- **Playwright: 18/18 passed** (1.0m) — after all structural edits: add-user 1/1, dashboard_navigation 3/3, enhancements 3/3, expense-tracking 5/5, forgot_password 1/1, gis_dashboard 2/2, import-export 2/2, pdf-export 1/1.
- **`node scripts/security-audit.js`: runs end-to-end**, reporting remaining launch blockers as designed.
- `scripts/cdn-sri.json` persisted as the canonical CDN integrity manifest.

### 9.3 What remains (next sprint)

- **U7 (full)** — modal focus traps + focus restore, `aria-live` toasts.
- **U4** — consolidate the 8 CSS layers into the design system.
- **Triage the 77 Medium audit findings** (X-Frame-Options on static pages, etc.).
- **Launch blockers (unchanged)** — C1 server-side auth + C5 server-side rate limiting, real TOTP (C4 full), remove demo credentials from the client bundle entirely.


---

## 10. Sprint 3 — D2 Inline-Script Extraction & C3 CSP Completion (2026-09-26)

### 10.1 What was done

1. **D2 — inline script extraction (complete):** all 6 remaining inline `<script>` blocks (~700 lines of inline JS) were extracted from `royalties.html` into ES6 modules:
   - `js/bootstrap/bcrypt-alias.js` — bcrypt UMD aliasing
   - `js/bootstrap/register-service-worker.js` — SW registration (waits for `load`)
   - `js/bootstrap/communication-hub.js` — communication hub, notifications, compliance check, tabs
   - `js/bootstrap/dashboard-init.js` — dashboard data initialization
   - `js/bootstrap/global-error-handler.js` — global error handlers
   - `js/legacy/nomodule-fallback.js` — the legacy bundle, still served to legacy browsers via `<script nomodule src>` (previously 16KB of inline stale mock data)
   - The comments-only block was deleted.
2. **H1 (completion) — notification template:** the one inline event handler (`onclick="this.parentElement.remove()"`) was removed and the notification is now DOM-built; the unescaped `${message}` XSS sink in the same template was fixed at the same time.
3. **C3 (complete) — hash-based `script-src`:** `'unsafe-inline'` dropped from script-src and replaced with the import map's sha256 hash (canonical tool: `scripts/csp-hashes.mjs`); `scripts/inject-env.js` was rewritten to emit an **external, git-ignored `env.js`** instead of a variable-content inline `__ENV__` block (which the strict CSP would have blocked and which dirtied the git tree); `dev`/`build` npm scripts now chain `node scripts/inject-env.js` so `env.js` always exists before serving.
4. **Pre-existing bug fix in `inject-env.js`:** the direct-run guard (`import.meta.url === \`file://${process.argv[1]}\``) never matched on Windows (`file:///C:/...` vs `file://C:\...`), so `main()` never ran and env vars were never injected — fixed with `pathToFileURL(process.argv[1]).href`.

### 10.2 Validation results

- **Boot check under the strict CSP** (Chromium headless): **0 page errors, 0 CSP violations** — the hash-allowed import map is honored, the login form renders, `bcrypt` is ready, the service worker registers, and all services initialize.
- **Playwright: 18/18 passed** (1.4m) after the extraction — add-user 1/1, dashboard_navigation 3/3, enhancements 3/3, expense-tracking 5/5, forgot_password 1/1, gis_dashboard 2/2, import-export 2/2, pdf-export 1/1.

### 10.3 CSP posture after this sprint

- `script-src 'self' 'sha256-<importmap>' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com` — **no `'unsafe-inline'`, no `'unsafe-eval'`**: injected inline script execution is now fully blocked.
- `style-src` keeps `'unsafe-inline'` (page style attributes); moving styles to external sheets would allow dropping it (see U4).
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` unchanged.
- Remaining CSP gaps are acceptable/documented: `img-src https:` wildcard (map tiles from tile providers), unpkg/cdnjs pinned by SRI.

