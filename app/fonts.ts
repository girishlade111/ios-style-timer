import { Space_Grotesk } from "next/font/google"

// TEMPORARY: TWK Everett .woff2 files are missing from public/fonts/
// (see docs/THIRD-PARTY-INTEGRATIONS.md §7). Space Grotesk is a close
// geometric-grotesk stand-in so `next build` stays green.
// To restore TWK Everett, replace this whole file with:
//
//   import localFont from "next/font/local"
//   export const twkEverett = localFont({
//     src: [
//       { path: "../public/fonts/TWKEverett-Medium.woff2", weight: "500", style: "normal" },
//       { path: "../public/fonts/TWKEverett-Regular.woff2", weight: "400", style: "normal" },
//     ],
//     variable: "--font-twk-everett",
//     display: "swap",
//   })
export const twkEverett = Space_Grotesk({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-twk-everett",
  display: "swap",
})
