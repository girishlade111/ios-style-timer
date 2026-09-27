# Code Audit Report — ios-style-timer

**Date:** 2026-09-27
**Scope:** full codebase (app, components, lib, configs, dependencies)
**Methods:** traditional static review, terminal-based audit (`tsc`, `next build`,
`pnpm install --frozen-lockfile`), server-based audit (dev server + live browser test)

---

## Summary

| Method | Result |
| ------ | ------ |
| Static review | 13 findings (8 fixed, 5 left as user decisions) |
| `tsc --noEmit` (strict) | ✅ 0 errors |
| `pnpm build` (Next 15.2.8) | ✅ success, 147 kB first-load JS |
| `pnpm install --frozen-lockfile` | ✅ lockfile consistent |
| Live browser functional test | pending (see §5) |

---

## 1. Static review findings

### Fixed

| # | Finding | Severity | Fix |
| - | ------- | -------- | --- |
| 1 | `public/fonts/*.woff2` missing — `next/font/local` made `next build` fail | 🔴 Blocker | Temporary swap to Google Font (Space Grotesk) in `app/fonts.ts`; restore snippet included as comment. See integrations doc §7 for the permanent fix. |
| 2 | `digit-reel.tsx`: `isAnimating`, `prevValue` state + `useEffect` never affected rendering (dead code) | 🟡 Cleanup | Component is now stateless; animation is fully driven by `AnimatePresence key={value}`. |
| 3 | `countdown-timer.tsx`: `setInterval(1000)` decrement drifted over time and slowed in background tabs | 🟡 Correctness | Rewrote to deadline-based timing (`endRef = Date.now() + totalMs`, 250 ms poll, `Math.ceil` display). Immune to drift and tab throttling. |
| 4 | `NodeJS.Timeout` type used in a browser component | 🟢 Hygiene | Removed with rewrite; interval id is now correctly inferred. |
| 5 | `styles/globals.css` duplicated `app/globals.css`, imported nowhere | 🟢 Hygiene | Deleted `styles/`. |
| 6 | `autoprefixer` installed but missing from `postcss.config.mjs` | 🟢 Config | Added `autoprefixer: {}`. |
| 7 | `tailwindcss-animate` installed but not in `tailwind.config.ts` plugins | 🟢 Config | Registered `require("tailwindcss-animate")`. |
| 8 | `next@15.2.4` vulnerable: CVE-2025-55182 (React2Shell, CVSS 10.0 RCE), CVE-2025-66478, CVE-2025-55184/67779. Note: 15.2.6 (the old fix) is itself deprecated per the Dec-2025 advisory — verified via web. | 🔴 Security | Bumped to **15.2.8** (latest patched in the 15.2 line; `@next/swc-*` stay at 15.2.5 per upstream). `pnpm-lock.yaml` updated by hand (37 entries) because pnpm can't write temp files on this VM (EPERM chown) — verified with `pnpm install --frozen-lockfile`. |

### Left as user decisions (documented, not bugs)

| # | Finding | Note |
| - | ------- | ---- |
| 9 | ~25 unused dependencies (full Radix set, recharts, react-hook-form, zod, date-fns, embla, sonner, vaul, cmdk, lucide-react, geist…) | v0.app boilerplate. Prune or keep for expansion — see integrations doc §4. |
| 10 | `@vercel/analytics` installed but `<Analytics />` never rendered | 2-line wire-up or `pnpm remove` — see integrations doc §5. |
| 11 | `ThemeProvider` (next-themes) exists but layout hard-codes `className="dark"` | Wire up or remove — see developer guide §5.6. |
| 12 | `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds` are `true`; no ESLint config exists | Fine for prototyping; flip to `false` for production. |
| 13 | pnpm EPERM on chown for temp files on this VM (container lacks CAP_CHOWN) | Workaround: fresh `node_modules` install worked for package linking; lockfile edited manually. New AGENTS.md lesson added. |

---

## 2. Terminal-based audit

```
$ npx tsc --noEmit            → 0 errors (strict mode)
$ pnpm build                  → ✓ Compiled successfully, 4/4 static pages
$ pnpm install --frozen-lockfile → clean (lockfile ↔ package.json consistent)
```

Route `/`: 45.7 kB, first-load JS 147 kB (shared 101 kB). No type errors, no build
warnings other than the standard browserslist notice.

---

## 3. Server-based audit

Dev server (`pnpm dev --port 3100`) served `/` with HTTP 200. A live Chromium
browser task then performed the functional test below.

---

## 4. Files changed by this audit

- `app/fonts.ts` — temporary Space Grotesk swap (+ restore instructions)
- `components/countdown-timer.tsx` — deadline-based countdown rewrite
- `components/digit-reel.tsx` — dead state removed
- `postcss.config.mjs` — autoprefixer wired
- `tailwind.config.ts` — tailwindcss-animate registered
- `package.json` / `pnpm-lock.yaml` — next 15.2.4 → 15.2.8 (security)
- `styles/` — deleted (dead duplicate)
- `AGENTS.md` — new lesson: pnpm EPERM chown quirk; 15.2.6 deprecated, use 15.2.8+

---

## 5. Functional test results (live browser, 2026-09-27)

**URL tested:** https://ios-style-timer.pages.dev (Cloudflare Pages deployment of the
audited code — the browser task runs on a separate VM and cannot reach localhost,
so the site was deployed publicly for the test, per the standing deploy rule).

| Check | Result |
| ----- | ------ |
| Page load | ✅ 200, full render |
| Screenshot | ✅ black full-page background, centered gray "Voting ends in:" label, large white thin iOS-style digits with colon separator, rolling-wheel digit animation (trailing digits visible/blurred like iOS) |
| Timer ticking | ✅ 15:37 → 15:27 (after 4 s wait) → 15:05 — counts down correctly |
| Visual check | ✅ no overflow, no missing elements, correct colors |
| Console errors | ⚠️ not verifiable — browser tooling has no DevTools console access; no page-visible errors observed, fonts render correctly (no fallback glyphs) |
| Failed network requests | ⚠️ not verifiable directly (no network tab); no indirect evidence of failures |

**Note:** an earlier browser task attempt hit a stale dev server (15.2.4) that was
left running on port 3100 — it was killed and replaced with a fresh 15.2.8 server
before the final test. The final test ran against the public deployment of the
audited code, so results are valid.
