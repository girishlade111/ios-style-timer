# Environment Variables & Configuration Reference

Complete reference for every environment variable and every configuration file in the
`ios-style-timer` project. Read this before deploying or changing build behavior.

---

## 1. Environment Variables

### 1.1 Current status: no environment variables in use

The codebase contains **zero references to `process.env`** and the repository ships
**no `.env*` files**. The app is a fully client-side countdown timer with no API keys,
no database, and no backend services, so nothing needs to be configured to run it.

```
# Verified 2026-09-27: no .env files exist, no env references in app/, components/, lib/
```

### 1.2 Recommended `.env.example`

If you add integrations later (Vercel Analytics token, API URLs, feature flags), start
from this template. Copy it to `.env.local` for local development.

```bash
# .env.example — copy to .env.local and fill in values. Never commit real secrets.

# --- App config ---
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# --- Vercel Analytics (optional, package already installed) ---
# NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# --- Feature flags ---
# NEXT_PUBLIC_ENABLE_THEMING=false
```

> `.env*` is ignored by git (see `.gitignore` below), so secrets in `.env.local` never
> reach the repository.

### 1.3 Next.js environment variable rules

Next.js loads environment files in this precedence order (later wins):

| File                     | Scope                 | Committed? |
| ------------------------ | --------------------- | ---------- |
| `.env`                   | All environments      | No (ignored) |
| `.env.local`             | All environments      | No (ignored) |
| `.env.development`       | `next dev` only       | No (ignored) |
| `.env.production`        | `next build`/`start`  | No (ignored) |
| `.env.test`              | `next test`           | No (ignored) |

Key rules:

- **Browser exposure:** only variables prefixed with `NEXT_PUBLIC_` are inlined into
  client-side JavaScript. Everything else stays server-side.
- **Build-time inlining:** `NEXT_PUBLIC_*` values are baked in at `next build` time.
  Changing them requires a rebuild (on Vercel: a redeploy).
- **Server-only secrets:** plain names (e.g. `API_SECRET`) are available only in Server
  Components, Route Handlers, and middleware — never sent to the browser.
- **Validation pattern:** when you introduce variables, validate them at startup in a
  small `lib/env.ts` module so misconfiguration fails fast instead of silently.

### 1.4 Vercel dashboard environment variables

The project is deployed on Vercel. Variables for production/preview/development are
managed in the Vercel dashboard: **Project → Settings → Environment Variables**.
None are currently set, and none are needed. When you add one:

1. Add it in the dashboard with the correct environment scope.
2. Redeploy — Vercel only injects new values into new deployments.
3. Mirror it in your local `.env.local` for parity.

---

## 2. Configuration Files (file-by-file)

### 2.1 `next.config.mjs`

```js
const nextConfig = {
  output: "export",             // static export → out/ (2026-09-27 audit)
  eslint: {
    ignoreDuringBuilds: true,   // skip ESLint on `next build` (faster, but lint debt accumulates)
  },
  typescript: {
    ignoreBuildErrors: true,    // ship even with TS errors (dangerous: hides real bugs)
  },
  images: {
    unoptimized: true,          // no Image Optimization API; images served as-is
  },
}
```

What each setting does and why it matters:

- `eslint.ignoreDuringBuilds: true` — the build never fails on lint errors. The repo has
  no ESLint config file, so `next lint` would prompt to set one up. **Recommendation:**
  add a real ESLint config and flip this to `false` once the codebase is clean.
- `typescript.ignoreBuildErrors: true` — type errors don't block deploys. This is a
  v0.app default for rapid prototyping. **Recommendation:** flip to `false` for any
  production app; type errors are cheap to fix and expensive to ship.
- `images.unoptimized: true` — disables Next.js image optimization. Fine here because
  the app uses zero `<Image>` components; also required for static export scenarios.

### 2.2 `tsconfig.json`

| Option                | Value        | Meaning |
| --------------------- | ------------ | ------- |
| `target`              | `ES6`        | Compiles down to ES2015 syntax |
| `lib`                 | `dom`, `dom.iterable`, `esnext` | Browser + modern JS APIs available |
| `strict`              | `true`       | Full strict type checking (null checks, no implicit `any`, etc.) |
| `noEmit`              | `true`       | TypeScript only type-checks; Next.js handles emitting |
| `jsx`                 | `preserve`   | Keep JSX as-is for Next.js/SWC to transform |
| `module` / `moduleResolution` | `esnext` / `bundler` | Modern bundler-style resolution |
| `paths` (`@/*` → `./*`) | alias | Import `@/components/x` instead of relative paths |
| `skipLibCheck`        | `true`       | Don't type-check `node_modules` `.d.ts` files (faster) |
| `isolatedModules`     | `true`       | Every file must be safely transpilable in isolation |
| `plugins: [{name: "next"}]` | Next.js TS plugin | Enables route-type generation etc. |

### 2.3 `tailwind.config.ts`

- `darkMode: ["class"]` — dark theme activates via a `.dark` class on `<html>`
  (the layout hard-codes `className="dark"`), not via `prefers-color-scheme`.
- `content` globs — Tailwind scans `./app`, `./components`, `./pages`, `./src`, and
  root-level files. Any file outside these globs won't get its classes generated.
- `theme.extend.fontFamily["twk-everett"]` — maps `font-twk-everett` utility to the
  `var(--font-twk-everett)` CSS variable injected by `app/fonts.ts`.
- `theme.extend.colors` — semantic color tokens (`background`, `primary`, `muted`,
  …) wired to CSS variables defined in `app/globals.css`, so the shadcn palette
  works in both light and dark themes.
- `theme.extend.borderRadius` — `lg/md/sm` derive from `--radius` (0.5rem).
- `plugins: [require("tailwindcss-animate")]` — animation utilities registered (2026-09-27 audit).

### 2.4 `postcss.config.mjs`

```js
export default {
  plugins: {
    tailwindcss: {},   // Tailwind CSS processing
    autoprefixer: {},   // Vendor prefixes (wired 2026-09-27 audit)
  },
}
```

### 2.5 `components.json` (shadcn/ui)

The shadcn/ui CLI configuration. Generated by `npx shadcn-ui@latest init`:

| Key | Value | Meaning |
| --- | ----- | ------- |
| `style` | `default` | shadcn component style preset |
| `rsc` | `true` | Components are React Server Component compatible |
| `tsx` | `true` | Use TypeScript/TSX variants |
| `tailwind.config` | `tailwind.config.ts` | Tailwind config location |
| `tailwind.css` | `app/globals.css` | Where theme CSS variables live |
| `tailwind.baseColor` | `neutral` | Base color palette |
| `tailwind.cssVariables` | `true` | Use CSS variables for theming |
| `iconLibrary` | `lucide` | Icons come from `lucide-react` |
| `aliases.components` | `@/components` | Where `shadcn add` drops components |
| `aliases.utils` | `@/lib/utils` | Where `cn()` helper lives |

> Note: no `components/ui/` directory exists yet — shadcn components were never
> added to this project. The config is ready for `npx shadcn-ui@latest add <component>`.

### 2.6 `app/fonts.ts` (font configuration)

```ts
export const twkEverett = localFont({
  src: [
    { path: "../public/fonts/TWKEverett-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/TWKEverett-Regular.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-twk-everett",
  display: "swap",
})
```

- Currently loads **Space Grotesk** from Google Fonts (temporary swap, 2026-09-27
  audit — the TWK Everett `.woff2` files were never committed).
- `variable: "--font-twk-everett"` exposes it as a CSS variable; the layout applies
  it on `<body>` and Tailwind's `font-twk-everett` utility consumes it unchanged.
- `display: "swap"` avoids invisible text while the font loads.
- To restore TWK Everett: add the two font files and uncomment the `next/font/local`
  block kept as a comment in `app/fonts.ts`.

The layout also loads **Inter** from Google Fonts (`next/font/google`) for body text.

### 2.7 `package.json`

Scripts:

| Script  | Command      | Use |
| ------- | ------------ | --- |
| `dev`   | `next dev`   | Local development server (hot reload), default http://localhost:3000 |
| `build` | `next build` | Static export → `out/` (`output: "export") |
| `start` | `next start` | Serve a server build (unused with static export) |
| `lint`  | `next lint`  | Lint (will prompt to install ESLint config on first run) |

Engine expectations: Node.js 18.17+ / 20+ (Next 15 requires Node 18.18+); package
manager is **pnpm** (`pnpm-lock.yaml` committed; `npm`/`yarn` also work but the
lockfile won't be honored).

### 2.8 `.gitignore`

Ignores: `node_modules/`, `.next/`, `/out/`, `/build`, debug logs, **`.env*`**
(all env files), `.vercel`, `*.tsbuildinfo`, `next-env.d.ts`.

### 2.9 `app/layout.tsx` metadata config

```ts
export const metadata: Metadata = {
  title: "iOS-style Countdown Timer",
  description: "A countdown timer with iOS-style scrolling digits",
  generator: "v0.app",
}
```

Static metadata rendered into `<head>`. The `generator` tag identifies v0.app as the
authoring tool. `<html lang="en" className="dark">` forces dark mode on.

---

## 3. Environment Behavior Matrix

| Concern | `next dev` | `next build` + `next start` | Vercel |
| ------- | ---------- | --------------------------- | ------ |
| Env files read | `.env`, `.env.local`, `.env.development` | `.env`, `.env.local`, `.env.production` | Dashboard env vars |
| Type errors | Shown in overlay | Ignored (`ignoreBuildErrors`) | Ignored |
| Lint | Overlay | Skipped | Skipped |
| Fonts | Loaded per-request | Embedded at build | Embedded at build |
| Font swap (Space Grotesk) | ✅ Builds green | ✅ Builds green | ✅ Deploys green |

The temporary font swap (2026-09-27 audit) removed the only hard build blocker.
