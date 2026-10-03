# Prompt: Complete reconstruction and redesign of the Workchats home page

**Scope: the main page only (`/`).** Shared layout (header and footer) is in scope only as far as the home page needs it. Every other route stays on the legacy proxy.

**Repository:** `workchats-redesign` (Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4)

**Your role:** Lead product designer and lead frontend engineer in one person. You have creative authority over structure, layout, visual language, interaction and copy. You are accountable for one outcome: a home page that a team of senior designers and engineers would be proud to ship, and that converts.

---

## 0. Read this first, in this order

Do not write code until you have read all of these.

1. **`AGENTS.md`.** This Next.js version has breaking changes. Read the relevant guides in `node_modules/next/dist/docs/` before writing any Next.js code, and heed deprecation notices.
2. **`README.md` and `UX-REVIEW.md`.** They record how the current MVP works, every measurement taken, and the open questions for the site owner.
3. **The content sources:**
   - `src/content/` — `home.ts`, `pricing.ts`, `site.ts`, `faq.ts`, `demo.ts`, `navigation.ts`;
   - `src/lib/pricing.ts`.

   This is the typed, sourced fact base of the product.
4. **The design and build guardrails:**
   - `src/styles/tokens.css` — tokens, including the brand palette you must keep;
   - `scripts/check-tokens.mjs` and `scripts/check-bundle.mjs` — enforced budgets;
   - `e2e/home.spec.ts` — current behavioural contract.
5. **The two design skills:**
   - `.agents/skills/redesign-existing-projects/SKILL.md` — invoke it with `/redesign-existing-projects`;
   - `.agents/skills/frontend-design/SKILL.md`.

   Section 4.3 lists where this brief overrides them.
6. **The reference images** in `docs/redesign/references/`. Open each file and look at it:
   - `phone-copper-front-and-back.png`
   - `phone-titanium-front-and-back.png`
   - `laptop-space-black-open-and-closed.png`

   Section 6 explains how to use them.
7. **The live site, https://www.workchats.com/, and its sub-pages** (`/features/*`, `/pricing`, `/faq`, `/download`, `/about`, the Terms and the blog post on the cost of five tools). Read them **for facts only**. Do not take layout, visual or copy-structure cues from it.

---

## 1. Current state assessment

### 1.1 What exists

- **Rendering and data.** A statically prerendered `/` built from Server Components. Typed content lives in `src/content/`, and prices come from a single source (`pricing.ts`) that also feeds the meta description and JSON-LD.
- **Sections, in order:**
  1. Hero (a coded HTML product demo in a CSS "handset" and desktop window);
  2. Downloads bar;
  3. Features switcher;
  4. Bento grid with founder quote;
  5. Security;
  6. Cost calculator (the dark "night" section);
  7. Pricing (billing period + 5-currency switch);
  8. FAQ;
  9. Final CTA.
- **Infrastructure:**
  - tokens enforced by `check:tokens`;
  - performance budgets enforced by `check:bundle`: first-load JS **117.8 KB Brotli of a 120 KB budget**, DOM ≤ 1,000 elements, 0 third-party requests before consent;
  - Vitest unit tests, Playwright e2e with axe;
  - a security-headers CSP;
  - a consent-gated analytics setup;
  - a legacy-site proxy for every other route (`LEGACY_SITE_ORIGIN`).

### 1.2 The owner's verdict

The current home page is a **weak MVP that does not meet the company's production standard.** The layouts are visually weak, there is no modern motion, and the structure is rigid. It looks worse than the live workchats.com, and the live site itself has weak UI/UX and a critically low conversion rate.

### 1.3 Problems you must fix (confirm and extend in your audit)

1. **Unclear value proposition.** A first-time visitor does not understand, within seconds, why to choose Workchats over the tools they already use.
2. **The page names competitors.**
   - The cost calculator lists specific products: `fiveToolStack` in `src/content/home.ts`, rendered by `Comparison.tsx`.
   - The comparison intro names them.
   - The FAQ names a competitor in the migration answer.

   This must go: see Section 3.2.
3. **Downloads don't work.** The download buttons are deliberately inert (a press does nothing), and there is no downloads route in this app. One of the page's main business goals is downloads, so an inert button is a conversion leak.
4. **Generic section recipe.** Several sections follow the same pattern (heading → intro → cards/grid). A bento grid and a feature switcher are default patterns, not decisions.
5. **No conversion architecture.** There is no clear path from "visitor" to "free team" to "paying team". The free-for-5 offer is a footnote under the hero button instead of the page's main hook.
6. **The motion is timid.** It is technically correct (CSS-only, reduced-motion aware) but doesn't create a premium, high-end corporate feel.
7. **The hero demo loops** for more than 5 seconds without an in-page pause control. That fails WCAG 2.2.2, as `README.md` already notes.

### 1.4 What to keep

**Keep these. They are good engineering, not design:**

- static rendering of `/`;
- the typed content pipeline and the single source of truth for prices;
- token enforcement;
- the accessibility baseline;
- the privacy posture (no cookies or third-party requests before consent);
- the security headers;
- the legacy proxy;
- CI.

**Rebuild freely:** everything visual, structural and narrative. Delete components and sections you don't need. You are not asked to improve the current layout. You are asked to replace it.

---

## 2. Business objectives

Optimise the page for these outcomes, in this order:

1. **App downloads** on desktop (macOS, Windows, Linux) and mobile (iOS, Android), plus the web app.
2. **Free-tier sign-ups:** teams of up to 5 people use Workchats completely free.
3. **A clear path to monetisation:** free teams that grow, or need more control, move to Pro (and Max or Enterprise for larger organisations).

The funnel the page must make obvious:

> **Land → understand in 5 seconds → try free (up to 5 people, no card, no time limit) → install on every device → team grows past 5 / needs group calls, storage, admin → Pro.**

**Decision-makers** (founders, ops leads, IT/finance approvers) must see the business case within the first two screens:

- what it is;
- what it replaces;
- what it costs;
- why it's safe and reliable.

---

## 3. Positioning: "Why Workchats?"

### 3.1 The facts you can build the pitch on

All of these are already in `src/content/` with their sources, or on workchats.com. **Re-verify each one on the live site before using it**, and keep the source in a code comment next to the content.

**Free plan:**

- up to 5 members, free forever: not a trial, no credit card, no time limit;
- channels, DMs, group chats;
- 1:1 video calls with screen sharing;
- 5 GB storage per user.

**Paid plans (GBP, billed in pounds):**

| Plan | Annual price | Monthly price | What it adds |
|---|---|---|---|
| Pro | £3 per user/month | £4 per user/month | Up to 50 members, group calls for 25, 20 GB per user, SSO and admin controls, guests |
| Max | £5 per user/month | £7 per user/month | Unlimited members, group calls for 50, 50 GB per user, advanced security (DLP, eDiscovery), API |
| Enterprise | Custom | Custom | SAML/SCIM, on-premise or private cloud, unlimited storage |

**Product facts:**

- **Calls:** no time limit, on any plan.
- **Reliability:** a 99.9% uptime SLA on Pro and above. That is the documented reliability claim (see 3.3).
- **Security:** end-to-end encryption on by default on every plan (owner wording is pending — README item 2), AES-256 at rest, TLS in transit. Data is hosted in the UK, EU or Middle East, GDPR-compliant, with compliance and audit logs on Pro and above.
- **Platforms (6):** Web, macOS (Apple Silicon, 12+), Windows 10/11, Linux AppImage, iOS/iPadOS 15+, Android.
- **Product details that differentiate:**
  - working hours respected;
  - one account across several companies;
  - works offline;
  - connection requests (no cold outreach);
  - message history not archived after 90 days on any plan;
  - recordings with AI transcripts and summaries;
  - import history from your current chat tool;
  - adopt gradually, team by team.
- **The cost case:** the blog's breakdown of a typical five-tool stack for a 50-person team, already modelled in `home.ts` and `Comparison.tsx`.

### 3.2 Anonymity rule: no competitor products named

Solve "why us over the market standard" **without naming or depicting any competitor product**:

- **No names, logos or lookalikes.** No product names, logos, brand colours, or recognisable interface lookalikes.
- **Use categories instead of names**, for example:
  - "a team chat app";
  - "a separate video-meeting tool";
  - "an office suite";
  - "a screen-recording tool";
  - "a personal messenger the team falls back to".
- **Keep the cost model, anonymised.** Replace `fiveToolStack` names with category labels. Keep each list price with a source comment in code (product, plan, price, date checked) so the numbers stay auditable, but never render the names.
  - Comparative claims must be fair and verifiable against public list prices; the UK CAP Code applies.
  - Show "list prices, billed annually, checked <month year>" next to the figures.
- **Rewrite the FAQ migration answer** without a product name (e.g. "Import your message history from the chat tool you use today").
- **Add a test that enforces this.** A content test fails if the rendered home page HTML contains any competitor product name. Keep the list in one place, for example:

  > Slack, Microsoft Teams, Teams, Zoom, Google Meet, Google Workspace, Loom, WhatsApp, Discord, Webex, Mattermost, Chanty, Flock, Rocket.Chat

  If calendar integrations (Google Calendar, Outlook, iCal) are shown, they're integrations, not competitors. Allow them only in an integrations context and only after the owner confirms them (Section 10).

### 3.3 Claims discipline

- The owner describes uptime as "exceptional". **The documented claim is a 99.9% uptime SLA on Pro and above.** Use that figure, prominently. Don't invent measured uptime, incident counts, customer counts, ratings, awards or percentages. If the owner provides a public status page or real uptime data, use it and link to it.
- **No invented social proof.** No fake logos, testimonials, ratings or "trusted by" strips. If you design a slot for future proof, it must not render until real, approved content exists.
- **Every number on the page is computed from or traced to `src/content/`.** No "organic-looking" made-up figures, whatever any skill says.
- **Copy is UK English and sentence case.**

### 3.4 Pitch pillars (starting point: refine or replace with reasons)

1. **One app instead of a stack.**
   - Messages, calls, files and search in one place.
   - Show the bill going down, anonymised.
2. **Free for small teams, for real.**
   - Up to 5 people: not a trial, no card, no clock.
   - This is the main hook, not a footnote.
3. **Business-grade by default.**
   - 99.9% uptime SLA (Pro+), encryption by default, regional hosting, GDPR, admin controls.
   - Present it as facts a buyer can forward to IT, not as reassurance copy.
4. **Calm by design.**
   - Working hours, connection requests, offline, history that doesn't disappear.
   - These are the "features with a twist" that make the product feel considered rather than generic.

---

## 4. Creative mandate

### 4.1 Your authority

- **Full authority** over information architecture, section count and order, layout, visual language, typography, iconography, motion, interaction, micro-copy and the unique brand hooks.
- **You are not bound** by the current components or section flow. Re-architect the page to maximise comprehension and conversion.

### 4.2 Fixed constraints

- **Brand palette.** Keep the existing core Workchats colours so the brand stays recognisable:
  - brand blue `#0077FF` (`--color-brand`) and accent `#0068E6`;
  - ink `#0E1626`;
  - canvas `#F6F8FB`;
  - night `#0B1220`;
  - plus the existing neutral and state colours.

  How you apply, pair and supplement them is your call. Supporting tints and shades derived from these hues are allowed. New accent hues are not. All colours stay tokens in `tokens.css`. Contrast is WCAG 2.2 AA.
- **Facts only from workchats.com and `src/content/`** (Section 3).
- **No competitor names** (Section 3.2).
- **Scope is `/` only.**

### 4.3 Using the skills, and where this brief overrides them

Invoke `/redesign-existing-projects` for its **Scan → Diagnose** audit, and apply `frontend-design` for art direction.

Where they conflict with this brief, **this brief wins**:

- **Rewriting.** The redesign skill says "do not rewrite from scratch". **Overridden:** the visual and structural layer is a full reconstruction. Keep only the infrastructure listed in 1.4.
- **Placeholder imagery.** Ignore the skill's suggestion to use placeholder images (e.g. picsum). No stock or placeholder imagery ships.
- **Invented numbers.** Ignore the skill's suggestion to use "organic, messy" invented numbers. Every number must be real (3.3).
- **Mesh gradients and noise.** Use them only if they serve a concrete art-direction purpose you can defend in one sentence. They are not a default texture.

### 4.4 The bar: no generic AI design

The page must read as the work of a senior team that argued about every detail. **Each of the following is banned**, unless you write a one-paragraph justification in `docs/redesign/strategy.md` explaining why it's the best option *for this specific content*:

- **Hero:** a centred hero with headline, subline, two buttons and a product screenshot underneath, as the default.
- **Headline tricks:** one accented word in a headline (colour, italic or gradient); rotating or typewriter words.
- **Labels:** all-caps eyebrow labels above headings; pills with dots; "01 / 02 / 03" numbering on content that isn't a sequence.
- **Default grids:** three equal feature cards; a bento grid used as filler; a 3-tower pricing table with no hierarchy.
- **AI aesthetics:** purple/blue "AI gradients", glow blobs, aurora backgrounds, stacked glassmorphism.
- **Decoration posing as information:**
  - floating decorative UI chips;
  - orbiting icons;
  - concentric rings;
  - sparkle icons for "AI";
  - fake charts, sparklines or counters;
  - animated number tickers for invented stats.
- **Fake people and proof:** stock photos of people; invented testimonials; logo walls; "Trusted by".
- **Copy:**
  - the words "seamless", "elevate", "unleash", "supercharge", "next-gen", "game-changer", "effortless", "all-in-one solution";
  - rhetorical-question headings;
  - "X. Nothing Y." / "Not X, but Y." formulas;
  - three-adjective lists.
- **Repetition:** the same CTA after every section; "No credit card needed" repeated more than once.
- **Text animation:** character-by-character text reveals; text that is unreadable until an animation finishes.
- **Section treatment:** one random dark section in an otherwise light page. If you keep a dark section, it must be a deliberate part of the page's rhythm.

What you should do instead:

- **Specific product moments.** Show real situations, e.g. a call started from a chat on the laptop ringing on the phone.
- **Typography with a point of view.**
- **Asymmetric, content-led composition.**
- **Restraint, with one or two memorable hooks done exceptionally well.**

---

## 5. Conversion architecture (requirements: you choose the form)

1. **One primary action per viewport.**
   - **Primary:** "Start free" (sign-up: `site.links.signUp`). Pair it with the free-for-5 promise right where the action is.
   - **Secondary:** download or "Book a demo", depending on context.
2. **Device-aware downloads.** The page stays static, so detect the visitor's OS on the client, after hydration and without layout shift. Then promote the matching action:
   - "Download for macOS / Windows / Linux";
   - "Get it on the App Store / Google Play";
   - with a visible "All platforms" option.
3. **No inert buttons anywhere.**
   - Download controls link to real destinations: store listings and installer URLs from the owner (Section 10).
   - Until those are provided, link to `/download`, which the legacy proxy serves.
   - Update the e2e test that currently asserts downloads are inert.
4. **Make the free plan concrete.**
   - What exactly a 5-person team gets.
   - That it never expires.
   - What happens when they invite person number 6: a friendly, explicit upgrade path to Pro, at the price per person.
5. **Pricing is the monetisation path.**
   - Free is the obvious start, and Pro is the natural next step.
   - Annual billing is the default.
   - The recommended plan is marked by more than colour.
   - Each plan's CTA matches its action ("Start free", "Start with Pro", "Start with Max", "Contact sales").
   - Keep the currency switch (billed in GBP; other currencies approximate and labelled).
6. **The business case for decision-makers.**
   - A short, forwardable summary of cost, reliability (SLA), security and data residency, readable in under 10 seconds.
   - Optionally a "share with your IT team" affordance, e.g. a copy-link to the security section.
7. **Instrumentation.**
   - Define and implement analytics events through the existing consent-gated setup: `cta_click` (with location), `download_click` (with platform), `pricing_period_change`, `pricing_currency_change`, `calculator_change`, `faq_open`.
   - Nothing fires before consent.
   - Document the events in the README.

---

## 6. 3D devices: phone and laptop

Wherever the page shows Workchats on a phone, render a **3D smartphone model**. Wherever it shows the desktop app, render a **3D laptop model**. The reference images show the target look.

### 6.1 The reference images (`docs/redesign/references/`)

| File | What it shows |
|---|---|
| `phone-copper-front-and-back.png` | A copper/orange smartphone floating at an angle, front and back views together, over a soft light-grey seamless background. Realistic materials, soft lighting and shadow |
| `phone-titanium-front-and-back.png` | The same composition in natural titanium: front with screen on, back with camera module |
| `laptop-space-black-open-and-closed.png` | A space-black laptop: one open, angled towards the viewer, one closed behind it showing the lid. Same floating, studio-lit treatment |

**What to take from them:**

- studio product photography realism;
- the front-and-back pairing;
- floating angled poses;
- soft contact shadows;
- restrained neutral backgrounds.

**These are mood references, not assets.** Your own render may look different if it looks better.

**Legal and brand constraints:**

- Do not use the reference images themselves, the "Mockuply" mockup, Apple's wallpapers or Apple's interface.
- Do not put Apple's logo or wordmark on any device.
- Do not present the devices as specific Apple products.
- Model the devices in contemporary flagship proportions, but brand-neutral.
- Every 3D asset must be **self-made or commercially licensed for web marketing use**. Record the source and licence in `docs/redesign/assets.md`.

### 6.2 What the screens show

- The real Workchats interface (mobile app on the phone, desktop app on the laptop), with consistent demo data from `src/content/demo.ts`: the same team, names and conversations across all devices.
- The screen content must stay **sharp at every size** and should be live HTML or a high-resolution capture of the real product, not a blurry texture.
- **The cross-device moment is a strong candidate for the page's signature interaction.** For example: a call started from a conversation on the laptop rings on the phone; or a message drafted offline on the phone arrives on the desktop. Explore it.

### 6.3 Technical approach: decide and document

Choose in `docs/redesign/adr-3d-devices.md`, comparing at least these three:

| Option | How it works | Strengths | Costs |
|---|---|---|---|
| **A. CSS 3D** | HTML device built from layered elements, `perspective` and transforms, live HTML screen | Crisp screen, tiny cost, fully accessible, pointer-tilt interactions | Hardest to make photoreal |
| **B. Pre-rendered photoreal device** | Stills or a short scroll-scrubbed image sequence/video rendered in Blender or similar. The screen area is a calibrated quad onto which the live HTML UI is mapped with `matrix3d` | Best realism-to-performance ratio; screen stays sharp and live | Rotation limited to what you pre-render; render pipeline to maintain |
| **C. Real-time WebGL** | three.js / React Three Fiber, a compressed GLB (Draco/Meshopt) with KTX2 textures; screen as a canvas or video texture | Full interactivity and any angle | Heaviest: runtime JS, model weight, GPU cost, CSP changes |

A hybrid is allowed; for example, B for the hero and C for one showcase moment below the fold if it materially adds value.

**Whatever you choose, these rules apply:**

- **The LCP element is never a WebGL canvas or a video.** First paint shows a static, optimised device image (AVIF/WebP with explicit dimensions) or HTML.
- **3D runtime code and assets load after LCP and after idle.** They are excluded from first-load JS, and load only when the section approaches the viewport. Skip them, and keep the static poster, when any of these hold:
  - `prefers-reduced-motion`;
  - `navigator.connection.saveData`;
  - low `deviceMemory`;
  - no WebGL2.
- **Add a deferred budget to `check:bundle`.** Suggested: lazy 3D JS ≤ 180 KB Brotli; model + textures ≤ 1.5 MB per device. If you need more, justify it in the ADR.
- **Update the CSP minimally if needed.** For example, a WASM decoder needs `'wasm-unsafe-eval'`. Document why.
- **Screens are accessible.** Each device view has a text alternative describing what the screen shows. Interactive 3D can be used without a pointer (keyboard or buttons), or is purely decorative with the same information available as text.

---

## 7. Motion and interaction

The owner wants **premium, smooth, modern motion with a high-end corporate feel**.

**Principles:**

- **Motion explains** (state changes, cause and effect, cross-device flow) rather than decorates.
- **60 fps on a mid-range phone.** Animate `transform` and `opacity` only. No layout thrash.
- **Platform features first:**
  - CSS scroll-driven animations (`animation-timeline: view()` / `scroll()`), behind `@supports` with a sensible static fallback;
  - the View Transitions API for state changes;
  - `@starting-style` for entrances.

  A JS animation library is allowed only for an interaction that truly needs it. Load it only with that component, and count it in the budget.
- **Motion tokens.** Add durations and easing curves to `tokens.css`, including spring-like curves, and use only those.
- **Scroll-linked storytelling is allowed** (e.g. a sticky device that changes screens as features scroll past), but:
  - never hijack scroll speed or direction;
  - text is readable at every moment;
  - there's a reduced-motion version that shows the same information statically.
- **WCAG 2.2.2.** Anything that moves, loops or auto-plays for more than 5 seconds has a visible pause control, or plays once and stops.
- **`prefers-reduced-motion: reduce`** removes all non-essential motion and shows final states.

**Interaction states:**

- Every interactive element has hover, focus-visible, active/pressed and disabled states (loading too, where relevant).
- Tap targets are ≥ 44 × 44 px.

---

## 8. Engineering requirements

- **Next.js 16 App Router; `/` stays statically prerendered.** No request-time APIs on the route; the build output must mark `/` static. Read `node_modules/next/dist/docs/` for every API you use.
- **Components:** Server Components by default. Client components are small islands (OS detection, interactive 3D, menus, switches).
- **Content stays typed in `src/content/`.** Prices stay single-sourced in `pricing.ts`, which also feeds JSON-LD and meta.
- **Tokens:**
  - all colours, type sizes, radii, shadows, motion and z-indices come from `tokens.css`;
  - update `check:tokens` for any new token categories;
  - no hard-coded values, no inline `style` (lint rule), except computed transforms for 3D/`matrix3d`, which must be documented.
- **Typography.** Two families maximum, self-hosted with `next/font`, metric-matched fallbacks.
  - Stack Sans is the current brand typeface.
  - You may change the typographic system if you can show it serves the brand better; justify it in `art-direction.md`.
- **Images.** AVIF/WebP, explicit dimensions, correct `sizes`. The LCP image is preloaded with high fetch priority.
- **Performance budgets** (production build, Lighthouse mobile and desktop, three runs; WebPageTest on a mid-range Android, 4G):

  | Metric | Budget |
  |---|---|
  | LCP | ≤ 2.0 s mobile (applied throttling), ≤ 1.2 s desktop |
  | CLS | ≤ 0.05 |
  | TBT | ≤ 100 ms |
  | INP | ≤ 200 ms |
  | Lighthouse | ≥ 95 in all four categories |
  | First-load JS | stays within the current budget |
  | Deferred 3D | its own budget (6.3) |
  | DOM size | ≤ 1,000 elements, unless you justify a change in the ADR |

- **Accessibility:** WCAG 2.2 AA.
  - one `h1`, logical headings, labelled landmarks, skip link;
  - full keyboard support;
  - visible focus;
  - live regions for changing prices;
  - axe with no serious or critical issues at desktop and mobile widths.
- **Privacy and security.** No cookies and no third-party requests before consent. Keep the security headers.
- **Tests and CI.** `typecheck`, `lint`, `format:check`, `test`, `check:tokens`, `build`, `check:bundle` and `test:e2e` all pass.
  - Rewrite the e2e and unit tests for the new structure; don't delete coverage without an equivalent replacement.
  - Add tests for: no competitor names (3.2); download links resolving to real destinations; OS-aware CTA fallback; reduced-motion and pause behaviour; the 3D poster fallback.

---

## 9. Process, checkpoints and deliverables

Work on a branch named `redesign/home-v2`, with commits per logical step.

At each checkpoint, write the document, summarise it in chat and **wait for approval if a person is available**. If you are running unattended, continue, and list every assumption at the top of the next document.

| Phase | Output | Checkpoint |
|---|---|---|
| **0. Audit** | `docs/redesign/audit.md`: current page at 1440 / 1024 / 390 / 320 px with screenshots; the redesign-skill audit; a conversion audit (clarity, value proposition, CTA hierarchy, friction, trust, monetisation path); what to keep and what to delete | Findings agreed |
| **1. Strategy** | `docs/redesign/strategy.md`: positioning and message hierarchy; funnel; section-by-section outline (each section's job, the user question it answers, its success signal); CTA map; full draft copy; justified exceptions to 4.4 | Strategy and copy approved |
| **2. Art direction** | `docs/redesign/art-direction.md`: concept, typography, colour application within the brand palette, layout system, motion language. Two hero directions as static screenshots (desktop and mobile), plus `docs/redesign/adr-3d-devices.md` and `docs/redesign/assets.md` | Direction and 3D approach approved |
| **3. Build** | The new home page, section by section, CI green at every commit | Feature-complete |
| **4. QA and handover** | Lighthouse and WebPageTest reports; axe results; checks at 320 / 390 / 768 / 1024 / 1440 / 1920 px, 200% zoom, reduced motion, 6× CPU throttling; Safari, Chrome, Firefox; before/after screenshots; updated `README.md` and `UX-REVIEW.md` | Release-ready |

---

## 10. Questions for the owner (ask, never guess)

1. **Download destinations:** App Store and Google Play listing URLs, and installer URLs for macOS, Windows and Linux. Current status of the Windows (beta?) and Android (in review?) apps.
2. **Reliability evidence:** is there a public status page or real uptime history to show beyond the 99.9% SLA?
3. **Encryption wording:** the exact, legally approved wording (FAQ and Privacy Policy disagree — README item 2).
4. **Company entity:** footer "Workchats Ltd" vs operator "Octogle Technologies Ltd" (Terms). Which one appears where?
5. **Cost comparison:** approval of the anonymised comparison and the date its list prices were checked.
6. **Proof:** any customers, pilots or partners who can be named, with permission.
7. **Integrations:** are calendar integrations (Google Calendar, Outlook, iCal) live and allowed on the page?
8. **3D assets:** budget for commercially licensed device models, or approval to model them in-house.
9. **Currencies:** the confirmed list of display currencies and the default.
10. **Analytics:** confirmed analytics tool and consent requirements.

---

## 11. Definition of done

- [ ] A first-time visitor can say what Workchats is, who it's for and that 5-person teams use it free, after 5 seconds on the first screen (test with at least three people outside the project and record the answers in `UX-REVIEW.md`).
- [ ] The business case (cost, SLA, security, data residency) is visible within the first two screens on desktop.
- [ ] No competitor product is named or depicted anywhere on the page, enforced by a test.
- [ ] Every claim and number traces to `src/content/` with a source, and nothing is invented.
- [ ] No pattern from 4.4 appears without a written justification.
- [ ] The brand palette is preserved, and every colour is a token.
- [ ] Phone and laptop are shown as 3D devices per Section 6:
  - the LCP is a static image or HTML;
  - the 3D loads deferred and falls back to the poster;
  - assets are licensed and documented.
- [ ] All download actions go to real destinations; the OS-aware CTA has a correct fallback.
- [ ] Pricing presents Free → Pro as the default path, with correct CTAs per plan.
- [ ] Motion meets Section 7, including WCAG 2.2.2 and reduced motion.
- [ ] `/` is statically prerendered, and every budget in Section 8 is met on the production build.
- [ ] WCAG 2.2 AA is met; axe is clean; keyboard and VoiceOver walkthroughs pass.
- [ ] CI is fully green, and the README, UX-REVIEW and decision documents are updated.
