# ADR: how the phone and the laptop are drawn

**Status:** decided, 3 October 2026. **Deciders:** the site owner and the redesign lead.

## Context

The brief (§6) asks for the phone and the laptop to be shown as 3D devices in the spirit of three
studio-photography references (floating, angled, front-and-back, soft contact shadows on a neutral
ground), with the real Workchats interface on the screens: sharp at any size, the same demo team
throughout, and a cross-device moment as a candidate signature interaction. It sets hard rules: the LCP
is never a canvas or a video, 3D runtime code loads after LCP and idle and only near the section, it is
skipped under reduced motion, Save-Data, low memory or no WebGL2, and it has its own budget (lazy JS
≤ 180 KB Brotli, model and textures ≤ 1.5 MB per device).

Two constraints come from the page itself. First-load JavaScript is 117.8 KB of a 120 KB budget, and the
DOM is capped at 1,000 elements. And at the Phase 0 checkpoint the owner answered the 3D question with a
specific component: a container scroll animation, in which a screen tilts back and straightens as the
page scrolls. Asked whether to use it as written (framer-motion, about 30 KB more on first load) or rebuild
it without JavaScript, the owner chose the rebuild.

## Options

| Option                     | How it works                                                                                                                                            | For                                                                                                                                             | Against                                                                                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. CSS 3D**              | HTML devices built from layered elements, perspective and transforms; the screens are live HTML; motion from CSS scroll-driven animations               | Screens are as sharp as the text around them. No runtime JS, no model, no CSP change. Fully accessible. Cheap to keep in step with the product. | Hardest to make photoreal. Rotation is limited to what reads well with CSS perspective. Firefox has no scroll timelines yet, so it shows the settled frame.                                                                                                                  |
| **B. Pre-rendered device** | Stills or a scroll-scrubbed image sequence rendered in Blender; the screen area is a calibrated quad onto which the live HTML is mapped with `matrix3d` | The best realism for the cost; the screen stays live.                                                                                           | A render pipeline to own; every pose is a file; image weight (an AVIF sequence for a scrub is several hundred KB per device); calibration breaks when the device art changes.                                                                                                |
| **C. Real-time WebGL**     | three.js or React Three Fiber, a Draco/Meshopt GLB with KTX2 textures, the screen as a canvas or video texture                                          | Any angle, full interactivity.                                                                                                                  | Heaviest: 150 KB+ Brotli of runtime, a model per device, GPU cost on mid-range phones, `'wasm-unsafe-eval'` and `worker-src blob:` in the CSP for the decoders, and the screen becomes a texture (blurry or expensive to keep sharp, and invisible to assistive technology). |

## Decision

**A, CSS 3D devices with live HTML screens, animated by CSS scroll-driven animations.** It is the only
option that meets every hard rule with room to spare, keeps the screens as real interface rather than
pictures of it, and is exactly the interaction the owner chose.

- **The laptop** is the owner's scroll card (`components/ui/container-scroll-animation.tsx`): a machined
  edge lit from the top (`--gradient-device-edge`), a dark bezel and the desktop app
  (`components/product/DesktopApp.tsx`). Over the first 70% of a screen of scrolling it goes from
  `rotateX(20deg) scale(1.05)` to flat and the title above it lifts 100px, the original's values.
- **The phone** (`components/product/Handset.tsx`) uses the same edge and bezel, with the camera island,
  home indicator and side buttons drawn as pseudo-elements. Beside the laptop it rises into place as the
  laptop settles; on phones it is the device itself and takes the card's tilt.
- **The signature moment** is cause and effect across the two: as the laptop settles, Priya's call drops
  into #spring-launch, then onto Daniel's phone. Transform only, clipped by each screen's edge, driven by
  the visitor's scroll position, never autoplaying.

How the brief's rules are met:

| Rule                                                        | How                                                                                                                                                      |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LCP is never a canvas or a video                            | The LCP is the headline. The devices are HTML.                                                                                                           |
| 3D code loads after LCP and idle                            | There is no 3D code. `check:bundle` budgets deferred JS (0 KB today) and `public/3d/*` assets (none).                                                    |
| Skip under reduced motion, Save-Data, low memory, no WebGL2 | Nothing to skip: under reduced motion every animation is removed and the devices show their settled frame; without scroll timelines (Firefox), the same. |
| Poster fallback                                             | The settled frame is the resting style of every animated element, so it is the poster. An e2e test checks it under reduced motion.                       |
| CSP                                                         | Unchanged. No WASM, no workers, no new origins.                                                                                                          |
| Accessible screens                                          | The two devices are one `role="img"` with a description of the scene; their interfaces are `inert`.                                                      |
| Brand-neutral devices                                       | No logos, no recognisable product's camera layout or wallpaper; contemporary flagship proportions (`--aspect-device` 393 × 852).                         |
| DOM ≤ 1,000                                                 | The devices and their screens cost 154 elements; the page is at 935.                                                                                     |

## Consequences

- The devices are stylised rather than photoreal. The references' studio feel comes from the lighting
  (the top key light on the page, the lit edge, layered contact shadows), not from materials.
- If photoreal devices are wanted later, B is the next step and fits the existing guardrails: render a
  still per device and pose, keep the live HTML screen mapped onto it with `matrix3d`, put the files in
  `public/3d/<device>/` (budgeted at 1.5 MB each by `check:bundle`) and load them after LCP. C would need
  the CSP changes above and a written reason to exceed the deferred budget.
- Firefox shows the devices settled. That is a fair fallback for an enhancement; when Firefox ships scroll
  timelines it animates with no code change.
