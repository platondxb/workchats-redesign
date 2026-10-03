# Phase 2 — Art direction

**Status:** the owner set the direction at the Phase 0 checkpoint (3 October 2026) with two screenshots of
the top of the page, a dark theme, the scroll animation and the liquid glass buttons, and asked to keep
the brand's colours and typefaces. This document records the system built from that.

## Concept: a night stage, lit from the top

The page is a dark stage lit in the brand blue from above, the way the owner's product-photography
references light a device against a seamless backdrop. On that stage, light is reserved for real
artefacts: the app's own screens, on the laptop and the phone, and the one-page brief an approver can
forward. Everything else is the stage: type, quiet panels and the controls.

That one rule does the work a decorative system usually does. It explains why the brief is a white sheet
(it is a document), why the app is light (it is the product as it looks), and why there is no random
dark section: the whole page is the dark section, and the light things are the point.

## Colour

All colours are tokens in `src/styles/tokens.css`. The brand palette is unchanged; the dark roles reuse
the existing night colours and add tints derived from them and from the brand hue.

| Role                                      | Token                                           | Value                                              | Contrast                                                                         |
| ----------------------------------------- | ----------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| Page                                      | `night`                                         | #0b1220                                            | —                                                                                |
| Panels on the page                        | `night-raised`                                  | #141d30                                            | —                                                                                |
| Menus, selected controls                  | `night-overlay`                                 | #1b2640                                            | —                                                                                |
| Hairlines; control boundaries             | `night-line`, `night-line-strong`               | #27324a, #5a6884                                   | boundary 3.3:1                                                                   |
| Text                                      | `on-night`, `on-night-muted`, `on-night-subtle` | #f5f7fb, #a8b3c7, #8a94a6                          | 17.9, 8.9 and 6.1 to 1                                                           |
| Links, focus rings, selection on the page | `accent-on-night`                               | #5ca8ff (a tint of #0077ff)                        | 7.6:1                                                                            |
| Primary button                            | `accent` with `on-accent`                       | #0068e6, white                                     | 5.1:1                                                                            |
| The stage light                           | `--gradient-stage-light`                        | #0077ff at 30–34%, from the top corners and centre | the headline's muted line keeps at least 3.9:1 even where the light is brightest |
| Light artefacts                           | `surface`, `canvas`, `ink`…                     | the existing light tokens                          | as before                                                                        |

The brand blue appears in three places only: the light from the top (and from below, behind the closing
band), the primary button, and selected states. It never fills a section.

## Typography

Stack Sans stays, as the owner asked: Stack Sans Headline Bold for display and Stack Sans Text for
everything else, self-hosted, two files, metric-matched fallbacks. The hero headline is set in two tones
by line, following the owner's reference: the first line says what Workchats is (`on-night`), the
second what it costs to try (`on-night-subtle`). That is the only two-tone heading on the page. Prices,
times and totals use tabular figures, and the times in the working day are set in the display face so
the sequence reads at a glance.

## Layout

- **One centred composition, at each end.** The hero (the owner's reference) and the closing band are
  centred; every section between them is asymmetric on the 12-column grid: the brief 5 / 7, the free plan
  6 / 5 with a gap, the working day 5 / 6 with a running line, the cost 5 / 6, pricing 5 / 7 and then a
  full-width row.
- **The header** runs wider than the content at the top of the page (1400px) and gathers to the content's
  width (1216px) as a floating glass bar once the page scrolls, as in the reference.
- **Radii by hierarchy:** 28px for devices and large panels, 16px for sheets, app windows and the header,
  10px for chips and small controls, round for buttons and avatars.
- **Vertical rhythm** from the section tokens (64 / 80 / 96px), tightened above the brief so it lands in
  the first two screens on a desktop.

## Components

- **Liquid glass buttons** (the owner's): the primary is solid brand blue under a glass rim, so the
  hierarchy never depends on the effect; the secondary is clear glass that refracts the page behind it
  (Chromium) or shows a quiet fill (elsewhere). They lift on a spring when hovered and press in.
- **Devices**: a machined edge lit from the top, a dark bezel, a light screen; layered contact shadows.
  See `adr-3d-devices.md`.
- **The brief**: a white sheet with a definition list, the regions as flag chips.
- **Platform buttons**: dark panels with the platform's icon, name and requirement; the visitor's own is
  first, outlined in the link blue and marked "This device" in words.

## Motion

Tokens: durations `instant` 100ms, `fast` 160ms, `base` 240ms, `slow` 360ms, `slower` 600ms; easing
`ease-out`, `ease-in-out`, and two springs generated from a damped spring (`ease-spring`, ζ = 0.62, 8%
overshoot, for controls; `ease-spring-gentle`, ζ = 0.78, 2%).

| Motion                                             | Trigger                          | Why it is there                                                             |
| -------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| The laptop tilts back and settles; the title lifts | Scroll (0–70% of a screen)       | The owner's signature interaction: the product arrives as you start reading |
| The call drops into the app, then onto the phone   | Scroll                           | Cause and effect across devices: the product's story in one gesture         |
| The header gathers into the glass bar              | Scroll (first 96px)              | Keeps the navigation legible over content                                   |
| The working day's line fills                       | Scroll, while the day is in view | Time passing through the day; decorative, the times carry the order         |
| A price rises in                                   | Changing the currency or period  | Shows what changed                                                          |
| Menus pop in, answers open, buttons spring         | The visitor's action             | Feedback                                                                    |

Nothing loops and nothing plays on its own, so WCAG 2.2.2 has nothing to pause (an e2e test fails on
any infinite animation). Scroll-linked effects follow the scroll position and never change its speed or
direction. Under reduced motion every animation and transition is removed and each element shows its
settled state, which is also what browsers without scroll timelines show.

## The hero, two directions

|                    | Direction A — the owner's (built)                                                        | Direction B — the previous page                                               |
| ------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Composition        | Centred two-tone headline on the night stage, two buttons, caption, then the scroll card | Split headline and lead on a light canvas, product window on a blue slab      |
| What it says first | What it is, and that 5 people use it free                                                | A feeling ("a simpler way to talk")                                           |
| Motion             | Scroll-linked tilt and cross-device call                                                 | A 14-second loop with no pause control                                        |
| Screenshots        | `audit/after/1440-first-viewport.jpg`, `audit/after/390-first-viewport.jpg`              | `audit/before/1440-first-viewport.jpg`, `audit/before/390-first-viewport.jpg` |

The owner chose A at the checkpoint, with their references.

## What we chose not to do

No mesh gradients, grain or glow blobs (the single stage light does the work); no eyebrow labels; no
icon grids or bento; no logos for the customers; no fake data visualisation; no glass on cards (glass is
for the header and the buttons only); and no second accent hue.
