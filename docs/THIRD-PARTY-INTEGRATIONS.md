# Third-Party Integrations

Every external service, platform, and dependency this project touches — what it does,
how it's configured, its current status, and how to change or remove it.

---

## 1. v0.app (authoring & sync platform)

**What:** The app was generated and is continuously synced with [v0.app](https://v0.app)
(Vercel's AI UI generator).

**How it's configured:**

- Repository metadata in `README.md` links the v0 project
  (`https://v0.app/chat/projects/uKa59d1neZn`).
- `metadata.generator: "v0.app"` in `app/layout.tsx` tags the HTML output.
- Any edit made in the v0 chat interface is **automatically pushed to this GitHub repo**,
  and Vercel redeploys from the repo.

**Status:** ✅ Active and working.

**To disconnect:** delete the project from the v0 dashboard; the repo then becomes a
normal standalone Next.js project.

---

## 2. Vercel (hosting & deployment)

**What:** Production hosting, CI/CD, and edge delivery.

**How it's configured:**

- No `vercel.json` in the repo — the deployment uses Vercel's **framework auto-detection**
  (Next.js 15) with default build settings (`pnpm install` → `next build` → `next start`).
- Live project: `https://vercel.com/gileb64375-5584s-projects/v0-ios-style-timer`
- Every push to the default branch triggers a production deploy; pull requests get
  preview deployments automatically.

**Status:** ✅ Active.

**To change:** adjust build settings in the Vercel dashboard
(Project → Settings → General), or add a `vercel.json` for version-controlled config.

**Environment variables:** managed in the dashboard (none currently needed — see
`docs/ENV-CONFIGURATION.md`).

---

## 3. GitHub (source of truth)

**What:** Git remote (`origin`) hosting the code.

**How it's configured:** standard git remote —
`https://github.com/girishlade111/ios-style-timer.git`, default branch `main`.

**Status:** ✅ Connected.

---

## 4. npm Packages (by category)

All packages come from the public npm registry. Install with `pnpm install`.

### 4.1 Core framework

| Package | Version | Role |
| ------- | ------- | ---- |
| `next` | 15.2.8 | React framework: App Router, SSR, build system (patched: CVE-2025-55182/66478/55184/67779) |
| `react` / `react-dom` | 19 | UI library |
| `typescript` | 5.x | Type checking |
| `@types/node`, `@types/react`, `@types/react-dom` | — | Type definitions (dev) |

### 4.2 Styling & design system

| Package | Version | Role |
| ------- | ------- | ---- |
| `tailwindcss` | 3.4.17 | Utility-first CSS (dev) |
| `postcss` | 8.5 | CSS processing pipeline (dev) |
| `autoprefixer` | 10.4.20 | Vendor prefixes — wired in `postcss.config.mjs` |
| `tailwindcss-animate` | 1.0.7 | Animation utilities — registered in `tailwind.config.ts` plugins |
| `clsx` | 2.1.1 | Conditional class-name joining |
| `tailwind-merge` | 2.5.5 | Merges conflicting Tailwind classes (used by `cn()`) |
| `class-variance-authority` | 0.7.1 | Variant-based component APIs (shadcn pattern) |
| `next-themes` | 0.4.4 | Theme switching — installed; `components/theme-provider.tsx` wraps it, but the layout **does not use** `<ThemeProvider>` yet (dark mode is hard-coded via `className="dark"`) |

### 4.3 Radix UI primitives (headless accessible components)

Full set installed for shadcn/ui usage: accordion, alert-dialog, aspect-ratio, avatar,
checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label,
menubar, navigation-menu, popover, progress, radio-group, scroll-area, select,
separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip.

**Status:** ⚠️ Installed but **unused** — no `components/ui/` directory exists and no
component imports them. They add ~0 runtime cost (tree-shaken) but bloat
`node_modules` and install time. Remove with `pnpm remove` if you won't use shadcn
components, or run `npx shadcn-ui@latest add <component>` to start using them.

### 4.4 Animation

| Package | Version | Role | Status |
| ------- | ------- | ---- | ------ |
| `framer-motion` | latest | Digit-reel scroll animation in `components/digit-reel.tsx` | ✅ Used |
| `embla-carousel-react` | 8.5.1 | Carousel primitive | ⚠️ Installed, unused |

### 4.5 Forms & validation

| Package | Version | Role | Status |
| ------- | ------- | ---- | ------ |
| `react-hook-form` | 7.54.1 | Form state management | ⚠️ Installed, unused |
| `zod` | 3.24.1 | Schema validation | ⚠️ Installed, unused |
| `@hookform/resolvers` | 3.9.1 | zod ↔ react-hook-form bridge | ⚠️ Installed, unused |

### 4.6 Data display & utilities

| Package | Version | Role | Status |
| ------- | ------- | ---- | ------ |
| `date-fns` | 4.1.0 | Date formatting/manipulation | ⚠️ Installed, unused |
| `recharts` | 2.15.0 | Charts | ⚠️ Installed, unused |
| `react-day-picker` | 9.8.0 | Calendar/date picker | ⚠️ Installed, unused |
| `react-resizable-panels` | 2.1.7 | Resizable layouts | ⚠️ Installed, unused |
| `cmdk` | 1.0.4 | Command palette (`<Command>`) | ⚠️ Installed, unused |
| `input-otp` | 1.4.1 | OTP input | ⚠️ Installed, unused |
| `sonner` | 1.7.1 | Toast notifications | ⚠️ Installed, unused |
| `vaul` | 0.9.6 | Drawer component | ⚠️ Installed, unused |
| `@emotion/is-prop-valid` | latest | Emotion prop filtering (transitive need) | ⚠️ Installed, unused |

### 4.7 Icons & fonts

| Package | Version | Role | Status |
| ------- | ------- | ---- | ------ |
| `lucide-react` | 0.454.0 | Icon set (shadcn's `iconLibrary`) | ⚠️ Installed, unused |
| `geist` | 1.3.1 | Vercel's Geist font family | ⚠️ Installed, unused (layout uses Inter) |

> **Cleanup recommendation:** the timer itself needs only `next`, `react`,
> `react-dom`, `framer-motion`, `clsx`, `tailwind-merge`, `tailwindcss`, `postcss`,
> `typescript`, and `@types/*`. Everything marked ⚠️ is v0.app boilerplate that can
> be removed to cut install time and surface area — or kept if you plan to expand
> the UI with shadcn components.

---

## 5. @vercel/analytics

**What:** Vercel's privacy-friendly web analytics.

**Status:** ⚠️ **Installed (`"@vercel/analytics": "1.3.1"`) but never imported.**
No `<Analytics />` component exists in `app/layout.tsx`, so zero data is collected.

**To enable** (2 steps):

1. In `app/layout.tsx`:

   ```tsx
   import { Analytics } from "@vercel/analytics/react"

   export default function RootLayout({ children }) {
     return (
       <html lang="en" className="dark">
         <body className={...}>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

2. Deploy — Vercel auto-provisions the analytics backend; no env vars or dashboard
   setup required.

**To remove:** `pnpm remove @vercel/analytics` and skip the step above.

---

## 6. Google Fonts (Inter)

**What:** Body typeface loaded at build time via `next/font/google` in
`app/layout.tsx`:

```ts
import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"] })
```

**Status:** ✅ Working. Fonts are downloaded at build time and self-hosted — no
runtime request to Google servers, no GDPR/privacy concern, works offline after build.

---

## 7. Local font files (TWK Everett)

**What:** Brand/display typeface loaded via `next/font/local` in `app/fonts.ts`
from `public/fonts/TWKEverett-{Medium,Regular}.woff2`.

**Status:** ⚠️ **Temporary swap active (2026-09-27 audit).** The `.woff2` files
were never committed, so `app/fonts.ts` currently uses Google's Space Grotesk
with the same `--font-twk-everett` CSS variable — builds are green and the
`font-twk-everett` Tailwind utility works unchanged.

**To restore TWK Everett:** obtain the licensed woff2 files, place them at
`public/fonts/TWKEverett-Medium.woff2` and `public/fonts/TWKEverett-Regular.woff2`,
and uncomment the `next/font/local` block in `app/fonts.ts` (restore snippet is
kept as a comment in the file).

---

## 8. Integration health summary

| Integration | Status | Action needed |
| ----------- | ------ | ------------- |
| v0.app sync | ✅ Active | None |
| Vercel hosting | ✅ Active | None |
| GitHub remote | ✅ Connected | None |
| Google Fonts (Inter) | ✅ Working | None |
| framer-motion animation | ✅ Used | None |
| @vercel/analytics | ⚠️ Installed, not wired | Add `<Analytics />` or remove package |
| Radix/shadcn set | ⚠️ Installed, not used | Add components or prune |
| Utility packages (forms, charts, etc.) | ⚠️ Installed, not used | Prune if unused |
| TWK Everett local fonts | ⚠️ Temp Google-Font swap | Restore via snippet in `app/fonts.ts` |
| tailwindcss-animate | ✅ Registered | None |
| autoprefixer | ✅ Wired | None |
| next-themes / ThemeProvider | ⚠️ Installed, not used in layout | Wire up or remove |
