# ایمنی مهدی — Design Contract

Industrial luxury storefront for fire-safety and PPE. Minimal Swiss structure, cinematic product photography, warm paper shop, charcoal dashboard.

## Palette

| Role | Hex | Use |
|------|-----|-----|
| Night | `#0C0E12` | Hero, dashboard, dark bands |
| Graphite | `#171B21` | Dashboard panels |
| Ink | `#1C1916` | Body text |
| Paper | `#F4EFE7` | Shop background |
| Bone | `#FBFAF7` | Cards |
| Sand | `#E8E0D4` | Image wells, muted fills |
| Line | `#D9D0C3` | Borders |
| Ash | `#6B6560` | Secondary text |
| Ember | `#C45C26` | Primary CTA only |
| Ember hover | `#A34B1F` | CTA hover |
| Copper | `#C4A484` | Fine highlights, kicker |
| Signal | `#2F6F5E` | Success / approved receipt |
| Danger | `#B42318` | Reject / errors |

Accent is ember copper, used sparingly. Success green is status only, never branding.

## Type

- Persian UI and headlines: Vazirmatn Variable, self-hosted via `@fontsource-variable/vazirmatn`. No Google Fonts CDN.
- Do not letter-space Persian text; it breaks joining. Latin kickers (`IMEN MAHDI`) may use `.kicker-latin`.
- Display (hero h1): weight 800, `clamp(2.2rem, 6vw, 4.2rem)`, line-height 1.15.
- Section titles: weight 800, `clamp(1.7rem, 3.1vw, 2.4rem)`, line-height 1.2.
- Kickers: 13px, weight 600, ember, no tracking.
- Body: 16px, line-height ~1.8.
- Motion: `motion-v` (`MotionPlugin`). Headings use `v-fade-up`. Skip if `prefers-reduced-motion`.

## Layout

- Shop max width 1180px.
- Radius 16px on cards, 999px on buttons.
- Sticky header on warm paper with blur.
- Hero min-height ~88vh, product image as the star, slow spotlight, no slider chrome.

## Motion

- 180–280ms ease on hover.
- Hero image rise on load. Skip if `prefers-reduced-motion`.
- WebGL shaders (`vite-plugin-glsl` + `ShaderLayer`) only on dark cinematic bands: home hero and contact hero. Ember spotlight + grain. Off when the block is off-screen or motion is reduced. Never on cards, forms, checkout.

## Anti-patterns

- Orange supermarket ecommerce bars.
- Mint wellness greens as page background.
- Glassmorphism stacks.
- Emoji as icons.
- Extra fonts from blocked CDNs.
