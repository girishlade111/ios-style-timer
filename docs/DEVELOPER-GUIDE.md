# Developer Guide

How to set up, run, understand, extend, and deploy the iOS-style countdown timer.

---

## 1. Prerequisites

- **Node.js** 18.18+ or 20+ (Next.js 15 requirement). Check: `node -v`
- **pnpm** (recommended — `pnpm-lock.yaml` is committed). Install: `npm i -g pnpm`
  - `npm` or `yarn` also work, but the lockfile won't be honored.
- **Git**

---

## 2. Setup & running

```bash
# 1. Clone
git clone https://github.com/girishlade111/ios-style-timer.git
cd ios-style-timer

# 2. Install
pnpm install

# 3. Fix fonts FIRST (required — see §7)
#    Add public/fonts/TWKEverett-Medium.woff2 and TWKEverett-Regular.woff2,
#    or apply the temporary Google-Font swap documented in
#    docs/THIRD-PARTY-INTEGRATIONS.md §7.

# 4. Develop
pnpm dev        # → http://localhost:3000, hot reload

# 5. Production build & serve
pnpm build
pnpm start      # → http://localhost:3000 serving .next/
```

> There is no `.env` to configure — the app uses no environment variables.
> See `docs/ENV-CONFIGURATION.md`.

---

## 3. Project structure

```
ios-style-timer/
├── app/
│   ├── layout.tsx        # Root layout: <html>, fonts, metadata, dark mode
│   ├── page.tsx          # Home page: renders <CountdownTimer>
│   ├── fonts.ts          # TWK Everett local-font config (⚠️ files missing)
│   └── globals.css       # Tailwind + shadcn CSS variables (light/dark)
├── components/
│   ├── countdown-timer.tsx  # Countdown logic: mm:ss state, 1s interval
│   ├── digit-reel.tsx       # Animated digit column (framer-motion)
│   └── theme-provider.tsx   # next-themes wrapper (⚠️ unused by layout)
├── lib/
│   └── utils.ts          # cn() — clsx + tailwind-merge class helper
├── public/
│   └── placeholder.*     # v0.app placeholder images
├── styles/
│   └── globals.css       # Duplicate/legacy stylesheet (see §8)
├── docs/
│   ├── ENV-CONFIGURATION.md
│   ├── THIRD-PARTY-INTEGRATIONS.md
│   └── DEVELOPER-GUIDE.md   # this file
├── components.json       # shadcn/ui CLI config
├── next.config.mjs       # Next.js config
├── tailwind.config.ts    # Tailwind theme
├── postcss.config.mjs    # PostCSS pipeline
├── tsconfig.json         # TypeScript config (@/* alias)
└── package.json          # Scripts + dependencies
```

---

## 4. Architecture

### 4.1 Rendering model

```
app/layout.tsx (Server Component)
 └─ app/page.tsx ("use client")
     └─ components/countdown-timer.tsx ("use client")
         └─ components/digit-reel.tsx × 4 ("use client")
```

- The root layout is a **Server Component**: it sets metadata, loads fonts, and
  applies the `dark` class.
- Everything interactive is client-side. The page holds the initial time in state
  (`{ minutes: 15, seconds: 42 }`) and passes it as props — change these values to
  change the starting countdown.

### 4.2 `countdown-timer.tsx` — the countdown engine

State:

| State | Type | Purpose |
| ----- | ---- | ------- |
| `minutes` / `seconds` | `number` | Remaining time |
| `isActive` | `boolean` | `false` stops the interval at 00:00 |

Behavior:

- A `useEffect` on `[isActive, minutes, seconds]` runs a `setInterval(1000)`.
- Each tick: `seconds > 0` → decrement seconds; else if `minutes > 0` → minute − 1,
  seconds = 59; else clear the interval and set `isActive(false)`.
- Cleanup clears the interval on unmount or dependency change (no leaks, no double
  intervals under React StrictMode remounts).
- Numbers are zero-padded (`padStart(2, "0")`), split into single characters, and
  each character renders in its own `<DigitReel>`.

Limitations to know:

- **Drift:** `setInterval(1000)` drifts over long runs (tab throttling, event-loop
  lag). For a production-grade timer, compute remaining time from a `Date.now()`
  deadline instead of decrementing a counter.
- **No pause/reset UI:** `isActive` starts `true`; there are no controls. Add buttons
  that call `setIsActive` / reset state if you need them.
- **No persistence:** refresh restarts from the initial props.

### 4.3 `digit-reel.tsx` — the iOS-style rolling digit

Each digit column shows a vertical "reel" of 5 digits: `[d−2, d−1, d, d+1, d+2]`
(mod 10), with the current digit highlighted white and neighbors dimmed gray.

Animation mechanics:

- `framer-motion`'s `<AnimatePresence mode="popLayout">` wraps a `motion.div`
  keyed by `value`. When the digit changes, the old column exits (`y: 100`,
  fading) while the new one enters (`y: -100 → 0`) over 0.3s with `easeInOut` —
  this creates the iOS Clock app's rolling effect.
- Top/bottom gradient overlays (`from-black to-transparent`) fade the reel edges,
  enhancing the cylindrical illusion.
- The `-mb-4` / `-mt-4` negative margins tighten the reel spacing.

Props: `value: string` (single character), optional `className` (merged via `cn()`).

### 4.4 Styling system

- `app/globals.css` defines shadcn CSS variables (`--background`, `--primary`,
  `--radius`, …) for `:root` (light) and `.dark`. The layout hard-codes
  `className="dark"`, so the dark tokens are always active.
- `tailwind.config.ts` maps semantic utilities (`bg-background`, `text-primary`,
  `rounded-lg`, …) to those variables, plus the `font-twk-everett` utility.
- `lib/utils.ts` exports `cn()` — the standard `clsx` + `tailwind-merge` helper
  for conditional class merging.

### 4.5 Fonts

- **Inter** (body): `next/font/google` in `layout.tsx` — self-hosted at build time.
- **TWK Everett** (display digits): `next/font/local` in `app/fonts.ts` —
  **currently broken** because `public/fonts/*.woff2` are missing (see §7).

---

## 5. Common tasks

### 5.1 Change the starting time

In `app/page.tsx`:

```tsx
const [initialTime, setInitialTime] = useState({ minutes: 15, seconds: 42 })
```

### 5.2 Add pause / reset controls

```tsx
// inside CountdownTimer, expose controls:
<button onClick={() => setIsActive(a => !a)}>{isActive ? "Pause" : "Resume"}</button>
<button onClick={() => { setMinutes(initialMinutes); setSeconds(initialSeconds); setIsActive(true) }}>
  Reset
</button>
```

(Requires lifting `initialMinutes`/`initialSeconds` into component scope — they are
already props.)

### 5.3 Add a shadcn/ui component

```bash
npx shadcn-ui@latest add button   # drops into components/ui/button.tsx
```

`components.json` already points aliases at `@/components`, `@/lib/utils`, and
`@/hooks`. Import as `import { Button } from "@/components/ui/button"`.

### 5.4 Enable Vercel Analytics

Add `<Analytics />` from `@vercel/analytics/react` to `app/layout.tsx`
(package already installed). Full steps in `docs/THIRD-PARTY-INTEGRATIONS.md` §5.

### 5.5 Add a new page/route

Create `app/<route>/page.tsx` — the App Router picks it up automatically, no
registration needed. Shared UI goes in `app/<route>/layout.tsx`.

### 5.6 Theming

`components/theme-provider.tsx` wraps `next-themes`, but `app/layout.tsx` doesn't
use it. To enable runtime theme switching:

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

<html lang="en" suppressHydrationWarning>
  <body className={...}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>
```

(Remove the hard-coded `className="dark"` on `<html>` when you do this.)

---

## 6. Code conventions

- **Client boundaries:** mark interactive files `"use client"` at the top; keep
  layouts/metadata as Server Components.
- **Imports:** use the `@/` alias (`@/components/...`, `@/lib/...`) — never deep
  relative paths across directories.
- **Classes:** build conditional classes with `cn()` from `@/lib/utils`.
- **Language:** code, comments, and all docs/PRs in **English**.
- **Commits:** author as `girishlade111 <girishlade111@gmail.com>` so GitHub
  attributes them to the right profile.

---

## 7. Known issues (fix before shipping)

| # | Issue | Impact | Fix |
| - | ----- | ------ | --- |
| 1 | `public/fonts/*.woff2` missing | `next build` fails | Add licensed files or apply Google-Font swap (see integrations doc §7) |
| 2 | `typescript.ignoreBuildErrors: true` | Type bugs ship silently | Set `false` after cleaning types |
| 3 | `eslint.ignoreDuringBuilds: true` + no ESLint config | No lint gate at all | Add ESLint config, set `false` |
| 4 | `@vercel/analytics` installed but unused | Dead dependency | Wire `<Analytics />` or `pnpm remove` it |
| 5 | `ThemeProvider` unused in layout | Dead code path | Wire up (see §5.6) or remove |
| 6 | `styles/globals.css` duplicates `app/globals.css` | Confusion, possible drift | Delete `styles/` (nothing imports it) |
| 7 | `setInterval` drift | Timer loses accuracy over hours | Deadline-based countdown (`Date.now()`) |
| 8 | Unused deps (radix set, recharts, form libs…) | Slow installs, larger surface | Prune per integrations doc §4 |

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| `next build` fails on `next/font/local` | Missing `public/fonts/*.woff2` | §7 issue #1 |
| `font-twk-everett` has no effect | Font failed to load or variable not applied | Check `app/fonts.ts` + layout `body` class |
| Digits don't animate | `framer-motion` not installed / SSR mismatch | `pnpm install`; ensure `"use client"` |
| Timer keeps running in background tab | Browsers throttle `setInterval` | Deadline-based timing (§7 #7) |
| Tailwind classes missing in new files | File outside `content` globs | Add path to `tailwind.config.ts` `content` |
| `next lint` asks to set up ESLint | No ESLint config in repo | Accept the prompt, then configure rules |
| Port 3000 in use | Another dev server running | `pnpm dev -- -p 3001` |

---

## 9. Deployment

**Vercel (current):** push to `main` → automatic production deploy. Preview deploys
on every PR. No `vercel.json` needed; framework auto-detection handles it.

**Manual:**

```bash
pnpm build && pnpm start   # serves on :3000
```

**Other platforms:** the app is a standard Next.js 15 app — deployable to Netlify,
Cloudflare Pages (via `@cloudflare/next-on-pages`), or any Node host. Static export
(`output: "export"`) is possible but requires `images.unoptimized` (already set) and
removal of any future server-only features.

---

## 10. Useful commands

```bash
pnpm dev              # dev server
pnpm build            # production build
pnpm start            # serve production build
pnpm dlx shadcn-ui@latest add <component>  # add shadcn component
pnpm remove <pkg>     # drop unused dependency
pnpm outdated         # check for updates
npx tsc --noEmit      # type-check without building
```
