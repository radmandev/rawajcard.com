# Base44 Dependency & Reference Audit Report

Date: 2026-02-27
Repository: `my.rawajcard.com`

## Scope & method

I scanned the repository for:

- direct string mentions of `base44` (case-insensitive),
- package and import references,
- environment variable patterns (`VITE_BASE44_*`),
- related runtime APIs (e.g. `createClientFromRequest`, `asServiceRole`, `connectors`, `entities`, and Base44 function invocation patterns).

Primary command used:

```bash
rg -n --hidden -i "base44|base\s*44|@base44|api\.base44|base44\." .
```

## Executive summary

Base44 references are still present across backend edge functions, frontend config/helpers, package manifests, docs, and static asset URLs. The app already contains a partial migration layer (`src/api/base44Client.js`) that emulates parts of the Base44 SDK on top of Supabase, but several serverless functions still import `npm:@base44/sdk` directly.

## Findings

### 1) Direct Base44 SDK dependency in runtime functions (high priority)

All files below import and use `npm:@base44/sdk@0.8.6`:

- `functions/connectCRM.ts`
- `functions/createPayPalOrder.ts`
- `functions/sendContactToCRM.ts`
- `functions/testCRMConnection.ts`
- `functions/trackQRScan.ts`
- `functions/capturePayPalPayment.ts`
- `functions/syncContactsToCRM.ts`
- `functions/syncContactToCRM.ts`

Common API patterns found:

- `createClientFromRequest(req)`
- `base44.auth.me()`
- `base44.asServiceRole.entities.*`
- `base44.asServiceRole.connectors.getAccessToken('salesforce' | 'hubspot')`
- `base44.functions.invoke(...)`

Impact:

- Hard runtime coupling to Base44 SDK and service-role data access model.
- CRM connector token handling currently depends on Base44 connector APIs.

### 2) Build-time Base44 package dependencies (high priority)

`package.json` and `package-lock.json` still include:

- `@base44/sdk`
- `@base44/vite-plugin`

Impact:

- Base44 packages are still install-time dependencies.
- Even if app runtime paths are mostly migrated, CI/build remains coupled.

### 3) Vite aliasing and mock compatibility layer references (medium priority)

`vite.config.js` still aliases:

- `@base44/sdk` → `src/mocks/base44Sdk.js`
- `@base44/sdk/dist/utils/axios-client` → `src/mocks/axiosClient.js`

(including commented duplicate config block).

Impact:

- Indicates transitional compatibility mode is still expected by some codepaths.

### 4) Base44 naming/env references in app helper layer (medium priority)

`src/lib/app-params.js` includes:

- storage keys like `base44_*`
- `base44_access_token`
- env defaults: `VITE_BASE44_APP_ID`, `VITE_BASE44_FUNCTIONS_VERSION`, `VITE_BASE44_APP_BASE_URL`

Impact:

- App configuration semantics still branded around Base44.
- Risk of stale env assumptions during full migration.

### 5) Base44-branded internal API abstraction object (medium priority)

`src/api/base44Client.js` exports `base44` object and mimics Base44-style APIs:

- `base44.auth.*`
- `base44.entities.*`
- `base44.functions.invoke(...)`

Impact:

- Functional and useful for compatibility, but name keeps coupling and confusion alive.

### 6) Documentation and project metadata still Base44-branded (low/cleanup)

- `README.md` contains Base44 onboarding/deploy docs and links.
- package name in `package.json`/`package-lock.json` is `base44-app`.

Impact:

- Onboarding confusion and inaccurate platform guidance.

### 7) Static asset URLs reference a `base44-prod` storage path (verify ownership)

Found in:

- `src/pages/PublicCard.jsx`
- `src/components/shared/Header.jsx`
- `src/components/landing/Navbar.jsx`
- `src/components/landing/Footer.jsx`

These URLs point to Supabase storage paths containing `/base44-prod/`.

Impact:

- Not necessarily a code dependency on Base44 APIs, but signals historical namespace/bucket naming.
- Requires verification before renaming/moving assets.

## Replacement plan

## Phase 0 — inventory lock and safety rails

1. Freeze current behavior with a migration checklist and owners.
2. Add smoke tests around auth, order capture, contact sync, and QR tracking.
3. Confirm all required secrets for non-Base44 services (CRM, payments, Supabase) exist in deployment environments.

## Phase 1 — remove Base44 from edge functions (highest impact)

Target files:

- `functions/*.ts` currently importing `npm:@base44/sdk@0.8.6`.

Actions:

1. Replace `createClientFromRequest(req)` with explicit Supabase server client initialization (anon/session client + service-role client where needed).
2. Map Base44 entity operations to direct Supabase table operations (the same mapping model used in `src/api/base44Client.js`).
3. Replace `base44.asServiceRole.connectors.getAccessToken(...)` by implementing CRM OAuth token storage/refresh in your own tables + OAuth clients.
4. Replace cross-function `base44.functions.invoke(...)` with direct internal module calls or `supabase.functions.invoke(...)` depending on architecture.
5. Add integration tests for each migrated function:
   - auth-required path,
   - happy path,
   - invalid payload,
   - provider/token expiry errors.

Exit criteria:

- No `npm:@base44/sdk` imports remain in `functions/`.

## Phase 2 — finalize frontend API abstraction

Actions:

1. Rename `src/api/base44Client.js` to a neutral name (e.g. `platformClient.js` or `backendClient.js`).
2. Provide a temporary compatibility export:
   - `export { backendClient as base44 }` only during transition.
3. Migrate callsites to neutral naming, then drop compatibility export.

Exit criteria:

- No runtime code imports/uses an object named `base44`.

## Phase 3 — remove package/build coupling

Actions:

1. Remove `@base44/sdk` and `@base44/vite-plugin` from `package.json`.
2. Regenerate lockfile.
3. Remove Vite aliases pointing to Base44 SDK mock paths.
4. Verify dev/build/test pipelines with clean install.

Exit criteria:

- No `@base44/*` packages in manifests/lockfiles.
- `vite.config.js` has no Base44 alias references.

## Phase 4 — config and naming cleanup

Actions:

1. Replace `VITE_BASE44_*` env names with neutral names (`VITE_APP_ID`, `VITE_BACKEND_BASE_URL`, etc.), keeping temporary fallback reads for one release.
2. Replace local storage keys `base44_*` with versioned neutral keys and migration logic.
3. Update package name from `base44-app` if desired.

Exit criteria:

- No new docs/code references to `VITE_BASE44_*` or `base44_*` keys.

## Phase 5 — docs and asset namespace cleanup

Actions:

1. Rewrite `README.md` deployment/setup docs away from Base44 builder workflows.
2. Audit all static URLs under `/base44-prod/`:
   - if namespace is only historical and still valid, document and keep;
   - if required, migrate assets to new bucket/path and update references.

Exit criteria:

- README reflects actual deployment architecture.
- Asset path decision documented and implemented.

## Suggested order of execution

1. Functions migration (Phase 1)
2. Frontend abstraction rename (Phase 2)
3. Package/build cleanup (Phase 3)
4. Config key migration (Phase 4)
5. Docs + asset namespace cleanup (Phase 5)

This order minimizes production risk by removing hard runtime dependencies first.

## Quick validation checklist after migration

- `rg -n --hidden -i "base44|@base44|VITE_BASE44|base44_" .` returns only approved historical notes (or zero).
- End-to-end flows verified:
  - login/session
  - create order + capture payment
  - QR scan tracking
  - CRM connection test
  - contact sync
- Clean install/build/test in CI and staging.
