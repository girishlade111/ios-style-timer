# iOS-Style Countdown Timer

A pixel-faithful recreation of the **iOS Clock app's countdown timer** — digits roll
vertically like a slot machine with smooth spring physics, fading reel edges, and a
pure-black OLED-friendly canvas. Built with Next.js 15, React 19, Tailwind CSS, and
Framer Motion.

> *"Voting ends in:" — 15:42 and counting.*

---

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [How It Works](#how-it-write)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Third-Party Integrations](#third-party-integrations)
- [Developer Guide](#developer-guide)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## Demo

**Live:** the project is deployed on Vercel and stays in sync with its
[v0.app project](https://v0.app/chat/projects/uKa59d1neZn) — edits made in v0 are
auto-pushed here and redeployed.

The home page renders a centered countdown on a black background:

```
Voting ends in:  1 5 : 4 2
                 ↑ ↑   ↑ ↑
              rolling digit reels
```

Each digit sits in its own reel showing the current digit plus its neighbors
(`d−2 … d+2`), dimmed at the edges with gradient masks — exactly like iOS.

---

## Features

- **iOS-style rolling digits** — every second, changed digits animate vertically
  with a 300ms `easeInOut` roll (Framer Motion `AnimatePresence`)
- **Reel illusion** — 5-digit window per column with top/bottom gradient fade masks
- **Zero-padded `mm:ss` display** — four independent `DigitReel` columns + colon
- **Self-contained countdown engine** — deadline-based (`Date.now()`), drift-free, auto-stops at `00:00`
- **Dark-first design** — hard-coded dark theme, pure-black background
- **Custom typography** — Space Grotesk display font (Google, temporary) + Inter body font — TWK Everett restore snippet in `app/fonts.ts`
- **Responsive** — centered flex layout, works on mobile and desktop
- **shadcn-ready** — full shadcn/ui CLI config + Radix primitives pre-installed

---

## Tech Stack

| Layer | Technology | Version |
| ----- | ---------- | ------- |
| Framework | Next.js (App Router) | 15.2.8 |
| UI library | React | 19 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.17 |
| Animation | Framer Motion | latest |
| Component system | shadcn/ui + Radix UI | — |
| Icons | Lucide React | 0.454.0 |
| Theming | next-themes | 0.4.4 |
| Fonts | next/font (Inter + Space Grotesk via Google) | — |
| Analytics | @vercel/analytics (installed, not wired) | 1.3.1 |
| Package manager | pnpm | — |
| Hosting | Vercel | — |
| Authoring | v0.app (auto-sync) | — |

---

## Quick Start

### Prerequisites

- Node.js 18.18+ or 20+
- pnpm (`npm i -g pnpm`)

### Run it

```bash
git clone https://github.com/girishlade111/ios-style-timer.git
cd ios-style-timer
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> ℹ️ **Fonts:** `app/fonts.ts` temporarily uses Google's Space Grotesk — the original
> TWK Everett `.woff2` files were never committed. Restore snippet is in the file.

---

## Project Structure

```
ios-style-timer/
├── app/
│   ├── layout.tsx            # Root layout: fonts, metadata, dark mode
│   ├── page.tsx              # Home page → <CountdownTimer minutes={15} seconds={42} />
│   ├── fonts.ts              # Font loader (Space Grotesk, temporary — TWK Everett restore snippet inside)
│   └── globals.css           # Tailwind + shadcn theme tokens
├── components/
│   ├── countdown-timer.tsx   # mm:ss state machine, 1-second tick
│   ├── digit-reel.tsx        # Animated rolling digit column
│   └── theme-provider.tsx    # next-themes wrapper (currently unused)
├── lib/
│   └── utils.ts              # cn() class-name helper
├── public/                   # Static assets (placeholder images)
├── docs/
│   ├── ENV-CONFIGURATION.md       # Env vars + every config file explained
│   ├── THIRD-PARTY-INTEGRATIONS.md # All external services & dependencies
│   └── DEVELOPER-GUIDE.md         # Setup, architecture, tasks, troubleshooting
├── components.json           # shadcn/ui CLI config
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json             # @/* path alias
└── package.json
```

---

## How It Works

### Countdown engine (`components/countdown-timer.tsx`)

The component computes a deadline once (`Date.now() + totalMs`) and polls it
every 250 ms. Display value = `Math.ceil(remainingMs / 1000)`, clamped at 0 —
no drift, immune to background-tab throttling. When the deadline passes, the
interval clears and the timer stops at `00:00`.

The padded `mm:ss` string is split into characters; each character renders in its
own `<DigitReel>`.

### Digit reel (`components/digit-reel.tsx`)

For digit `d`, the reel renders `[d−2, d−1, d, d+1, d+2]` (mod 10). Framer Motion's
`AnimatePresence` keyed on the digit value animates the old column out (`y: +100`)
and the new one in (`y: −100 → 0`) over 300ms. Gradient overlays fade the reel's
top and bottom edges, completing the cylindrical iOS effect.

### Styling & fonts

- Semantic color tokens (`bg-background`, `text-primary`, …) in `app/globals.css`,
  consumed via Tailwind utilities mapped in `tailwind.config.ts`.
- `font-twk-everett` utility → `--font-twk-everett` CSS variable from `app/fonts.ts`.
- Dark mode is forced via `className="dark"` on `<html>`.

---

## Configuration

Every config file is documented option-by-option in
**[`docs/ENV-CONFIGURATION.md`](docs/ENV-CONFIGURATION.md)**:

- `next.config.mjs` — static export (`output: "export"`), ESLint/TS build behavior, unoptimized images
- `tsconfig.json` — strict mode, `@/*` alias, bundler resolution
- `tailwind.config.ts` — class dark mode, content globs, theme tokens, `tailwindcss-animate` plugin
- `postcss.config.mjs` — Tailwind + autoprefixer pipeline
- `components.json` — shadcn/ui CLI setup (ready for `npx shadcn-ui@latest add …`)
- `app/fonts.ts` — local + Google font loading
- `package.json` — scripts and dependency inventory
- `.gitignore` — what stays out of git (including all `.env*`)

---

## Environment Variables

**None are used.** The app is fully client-side with no APIs, keys, or backends —
it runs with zero configuration. A recommended `.env.example` template and the full
Next.js env-var rules (including Vercel dashboard setup for the future) live in
[`docs/ENV-CONFIGURATION.md`](docs/ENV-CONFIGURATION.md).

---

## Third-Party Integrations

Full details in [`docs/THIRD-PARTY-INTEGRATIONS.md`](docs/THIRD-PARTY-INTEGRATIONS.md).
Summary:

| Integration | Status |
| ----------- | ------ |
| v0.app (authoring + auto-sync) | ✅ Active |
| Vercel (hosting, auto-deploys) | ✅ Active |
| GitHub (source of truth) | ✅ Connected |
| Google Fonts — Inter | ✅ Working, self-hosted at build |
| Framer Motion digit animation | ✅ In use |
| @vercel/analytics | ⚠️ Installed, not wired — 2-line enable |
| Radix UI / shadcn component set | ⚠️ Installed, unused |
| Form/chart/carousel/toast utilities | ⚠️ Installed, unused (prune or use) |
| next-themes `ThemeProvider` | ⚠️ Installed, not used by layout |
| TWK Everett local fonts | ⚠️ Files never committed — temporary Google-Font swap active |

---

## Developer Guide

**[`docs/DEVELOPER-GUIDE.md`](docs/DEVELOPER-GUIDE.md)** covers:

- Prerequisites, setup, dev/build/start
- Architecture deep-dive (rendering model, countdown state machine, reel animation)
- Common tasks: change start time, add pause/reset, add shadcn components, new routes, theming, analytics
- Code conventions (client boundaries, `@/` imports, `cn()`, English-only code)
- Known issues with fixes
- Troubleshooting table
- Deployment (Vercel, manual, other platforms)

---

## Scripts

| Script | Command | Description |
| ------ | ------- | ----------- |
| `pnpm dev` | `next dev` | Dev server with hot reload |
| `pnpm build` | `next build` | Static export → `out/` |
| `pnpm start` | `next start` | Serve a server build (not used with `output: "export"`) |
| `pnpm lint` | `next lint` | Lint (prompts ESLint setup on first run) |

---

## Deployment

**Vercel (current):** push to `main` → production deploy automatically; pull requests
get preview URLs. Framework auto-detection handles the build — no `vercel.json`
needed.

**Manual (static export):**

```bash
pnpm build   # → out/
npx serve out
```

**Other platforms:** static output — works on Cloudflare Pages (live:
https://ios-style-timer.pages.dev), Netlify, GitHub Pages, or any static host.

---

## Known Issues

1. ⚠️ **Font swap is temporary** — `app/fonts.ts` uses Google's Space Grotesk;
   restore TWK Everett via the snippet in the file once the licensed `.woff2` files exist.
2. ⚠️ `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` are `true` —
   fine for prototyping, flip to `false` for production.
3. ⚠️ Large unused dependency footprint (Radix set, recharts, form libs, …) —
   prune or put to use.

---

## Roadmap

- [x] Fix TWK Everett font files (temporary Google-Font swap active)
- [ ] Pause / resume / reset controls
- [ ] Configurable duration via URL params or a settings UI
- [x] Deadline-based timing (drift-free)
- [ ] Completion callback (sound, confetti, webhook)
- [ ] Enable Vercel Analytics
- [ ] Turn on strict TypeScript + ESLint build gates
- [ ] Prune unused dependencies
- [ ] Multi-timer / lap support

---

## Contributing

1. Fork the repo and create a feature branch.
2. Keep code and docs in **English**.
3. Follow existing conventions: `"use client"` boundaries, `@/` imports, `cn()`
   for classes.
4. Open a pull request — Vercel will give you a preview deploy automatically.

---

## License

No license file is currently included. All rights reserved by the author unless a
license is added.

---

## Credits

Built by **Girish Lade** — [ladestack.in](https://ladestack.in)

UI originally generated with [v0.app](https://v0.app) and synced to this repository.
