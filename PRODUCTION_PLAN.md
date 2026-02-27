# MockMe — Production Readiness Plan

## Phase 1: Security & Code Cleanup (Current)

### Security

- [x] **1.1 Verify .env.local not in git** — Confirmed `.env.local` is properly gitignored and not tracked. No API keys in source code.
- [x] **1.2 Strengthen password validation** — Upgraded from 6 chars to 8+ with uppercase + number requirements. Updated UI indicators.
- [x] **1.3 Add security headers** — Added X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control via `next.config.ts`.
- [x] **1.4 Audit Firebase rules** — Verify Firestore Security Rules restrict read/write to authenticated users' own data. Verify Storage Rules mirror client-side file validation (25MB, image/video only).
- [x] **1.5 Add Firebase App Check** — Prevent API abuse from unauthorized clients.

### Code Cleanup

- [x] **1.6 Remove debug console statements** — Clean up `console.log` in `SceneCaptureController`, `useCapture`, `useUploadedFile`. Keep `console.error` only where it adds value (Firebase ops that already surface errors to UI should not double-log).
- [x] **1.7 Replace `alert()` with toast notifications** — Installed `sonner`, replaced `alert()` in `FileUpload.tsx` and `BackgroundPicker.tsx`. Added `<Toaster>` to layout. (`window.confirm()` in `ProjectContext.tsx` still pending — needs custom confirmation modal.)
- [x] **1.8 Consolidate `@keyframes slideUp`** — Moved to `globals.css`. Removed inline `<style>` blocks from 8 components.
- [x] **1.9 Remove unused dependencies** — Uninstalled `@heroicons/react` and `@use-gesture/react`.
- [x] **1.10 Replace hardcoded backdrop color** — `PreviewModal.tsx` now uses Tailwind `bg-slate-950/70`.

---

## Phase 2: Testing

- [ ] **2.1 Setup Vitest + React Testing Library**
- [ ] **2.2 Unit tests** — Hook logic (`useAnimationLoop`, `useCapture`, `useProjectStorage`), context reducers (`SceneContext`)
- [ ] **2.3 Component tests** — `FileUpload` (valid/invalid files, size limit), `SignInModal` (validation, error states), `TimelinePanel` (scene management)
- [ ] **2.4 Setup Playwright for E2E**
- [ ] **2.5 E2E critical paths** — Auth flow, file upload, model switching, animation playback, screenshot capture, project save/load

---

## Phase 3: Error Handling & Resilience

- [ ] **3.1 Add React Error Boundary** — Wrap `<Scene>` to catch Three.js crashes with a "reload scene" fallback UI
- [ ] **3.2 Consistent error messaging** — Replace remaining `console.error` catch blocks with user-facing toast notifications
- [ ] **3.3 Offline detection** — Warn when network is down since Firebase operations will fail
- [ ] **3.4 Firebase retry logic** — Allow retry on transient network failures for save/load

---

## Phase 4: UI Polish

- [ ] **4.1 Toast notification system** — Global toast provider for success/error/info messages
- [ ] **4.2 Loading skeletons** — Replace spinners with skeleton UI for project list loading
- [ ] **4.3 Keyboard shortcuts** — Ctrl+S save, Space play/pause, Ctrl+Z undo
- [ ] **4.4 Accessibility** — ARIA labels, keyboard navigation, focus management in modals
- [ ] **4.5 Empty states** — Design for "no projects", "no file uploaded" states
- [ ] **4.6 Confirmation modals** — Replace `window.confirm()` with styled confirmation dialogs

---

## Phase 5: Performance

- [ ] **5.1 Lazy load heavy components** — `React.lazy` + `Suspense` for 3D scene and modals
- [ ] **5.2 Bundle analysis** — Add `@next/bundle-analyzer` and identify bloat
- [ ] **5.3 Image/texture optimization** — Resize uploaded textures before applying to 3D models
- [ ] **5.4 CDN for GLB models** — Move from `/public/models` to CDN or Firebase Storage

---

## Phase 6: Deployment

- [ ] **6.1 Vercel setup** — Connect repo, configure environment variables
- [ ] **6.2 Separate Firebase environments** — Dev vs production Firebase projects
- [ ] **6.3 Custom domain** — Configure domain with SSL
- [ ] **6.4 CI/CD pipeline** — GitHub Actions for lint + test on PRs
- [ ] **6.5 Error monitoring** — Sentry integration for production error tracking
- [ ] **6.6 Analytics** — Verify Firebase Analytics is properly configured
- [ ] **6.7 Security headers in production** — CSP, HSTS, etc. via `vercel.json` or `next.config.ts`
