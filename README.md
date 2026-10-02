# Workchats website

The workchats.com home page (`/`), rebuilt in Next.js 16 (App Router), React 19, strict TypeScript and
Tailwind CSS 4. The page is statically prerendered. Every other URL can be proxied to the current site
while the migration continues (see `LEGACY_SITE_ORIGIN`).

## Run it

```bash
npm ci
npm run dev          # http://localhost:3000
npm run build && npm run start
```

| Command                | What it checks                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `npm run typecheck`    | `tsc --noEmit`, strict mode (run `npx next typegen` first on a clean checkout)              |
| `npm run lint`         | ESLint: Next.js, typed TypeScript rules, jsx-a11y strict, no inline `style`                 |
| `npm run format:check` | Prettier, with Tailwind class sorting                                                       |
| `npm test`             | Vitest: pricing maths, content rules, structured data, header, pricing and FAQ components   |
| `npm run check:tokens` | No hard-coded colours or raw arbitrary values; after a build, every class exists in the CSS |
| `npm run check:bundle` | After a build: JS, total transfer, fonts and third-party budgets                            |
| `npm run test:e2e`     | Playwright + axe on the production build, desktop and Pixel 7                               |

CI (`.github/workflows/ci.yml`) runs all of these on every push and pull request.

Environment variables are documented in `.env.example`. With none set, the site ships no analytics,
no consent banner and no third-party requests.

## Where the content comes from

Every claim on the page comes from the current workchats.com pages. Nothing on the page is a placeholder.

| Page content                                                                | Source on workchats.com                                                                  |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Headline, section titles, founder quote                                     | Home page                                                                                |
| Feature copy, coming-soon features                                          | `/features`, `/features/messaging`, `/features/video-meetings`, `/features/files-search` |
| Smaller details (working hours, privacy levels, connections, multi-company) | `/faq`, feature pages                                                                    |
| Prices, plan contents, guests, SLA                                          | Home page pricing, `/faq`, Terms (Pro £36, Max £60 per user a year)                      |
| Display currencies and rates (USD, EUR, AED, RUB)                           | The current pricing widget (`data-rate-*`, rounding 0.5)                                 |
| Cost comparison (five tools, 50 seats)                                      | Blog: _The real cost of running five team communication tools_                           |
| Security and hosting                                                        | `/faq` (Security, Privacy and Compliance)                                                |
| Platforms and what each one needs                                           | `/download`                                                                              |
| Company details                                                             | `/about`, `/faq`, Terms, footer                                                          |

Content lives in `src/content/` (copy, plans, demo data, navigation) and is typed. Prices, the
comparison totals, the meta description and the structured data are all computed from
`src/content/pricing.ts`, so they can't disagree.

## How the page works

**Sections, in order:**

1. **Hero:** an animated product demo. Priya types in #spring-launch, posts, starts a call, and it rings on Daniel's phone.
2. **Downloads:** every platform Workchats runs on, as a real, pressable button. No release-status
   badges. The buttons are inert by design in this MVP: the app serves no downloads route yet, so a
   press navigates nowhere and changes nothing.
3. **Features:** a switcher for messaging, meetings and files, plus the coming-soon features.
4. **Bento grid** of product details, with the founder quote.
5. **Security:** the hosting regions as flag chips next to the heading, then three cards in the original
   site's form (a piece of product interface, a short title, one line): the encryption switch, privacy
   controls with their three levels, and the compliance list with plan badges. One strip offers a security
   walkthrough. Plan-level extras (SSO, DLP, SLAs) live in the pricing cards. It comes before the price, so
   the main objection is answered before the ask.
6. **Cost calculator** (the dark section): a team-size slider recalculates the five-tool bill against
   Workchats (Pro up to 50 people, Max above). Server-rendered for 50 people, so it reads without
   JavaScript.
7. **Pricing:** billing period and currency.
8. **FAQ.**
9. **Final call to action.**

**Product UI** is coded HTML, not screenshots. Each view is exposed to assistive technology as one
image with a written description. The demo team uses initials, not stock photos.

**Interactive without JavaScript.** The feature switcher, billing period and currency switch are native
radio buttons; CSS shows the matching panel or price (custom variants in `src/app/globals.css`). The FAQ
uses `<details>`. Phones show all three features stacked, rather than behind a switcher.

**JavaScript that does ship:**

- The framework.
- `HeaderNav`, the only client component: desktop menus and the phone menu. Menu panels are rendered on the server and mounted on first open, so they add nothing to the initial DOM and their icons never ship as JS.
- Three tiny inline scripts. One pauses the hero demo while it's off screen. One remembers the chosen currency for the session (`sessionStorage`) and announces new prices to screen readers. One runs the cost calculator.
- The consent manager, only when analytics is configured.

**Motion** is CSS only and uses transform and opacity:

- The hero demo loops every 14 s. It stops while it is off screen. There is no pause button: the demo is
  decorative, and `prefers-reduced-motion` shows its final frame instead (see the note below).
- The stage settles in on load, and the header gains a surface as you scroll (scroll timeline).
- Tiles rise into view and the comparison bars grow (view timelines, progressive enhancement).
- Feature panels fade in, menus pop in, and FAQ answers open smoothly.
- `prefers-reduced-motion` removes all of it and shows the demo's final frame.

**Motion and WCAG 2.2.2.** The hero demo runs on a loop longer than five seconds, so 2.2.2 asks for a
way to pause it. The pause control was removed by design decision; what remains is the off-screen stop
and `prefers-reduced-motion`, which is a user-agent mechanism rather than an in-page one. If the site
has to claim 2.2.2 outright, restore a control in `HeroStage` (the CSS hook is already documented) or
make the demo run once instead of looping. This is recorded in `UX-REVIEW.md`.

**Design tokens** live in `src/styles/tokens.css`. Tailwind's default scales are reset, so components can
only use the defined colours, type sizes, radii, shadows and motion; `check:tokens` enforces this.

**Type:**

- Stack Sans Text (variable) and Stack Sans Headline Bold, self-hosted by `next/font`: two WOFF2 files.
- The fallback faces are metric-matched, so text doesn't reflow when the web fonts arrive.

## Budgets and latest measurements

Measured on the production build (`next start`), Lighthouse 13.5.0, three runs each, 1 October 2026.

|                                     | Budget                  | Result                                                                 |
| ----------------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| Lighthouse performance              | ≥ 95                    | Mobile 97–99 (simulated), 99 (applied throttling); desktop 100         |
| Accessibility, Best practices, SEO  | ≥ 95                    | 100, 100, 100 (mobile and desktop)                                     |
| LCP mobile                          | ≤ 2.0 s                 | 1.6–1.7 s with applied slow-4G throttling; 2.2–2.6 s simulated (below) |
| LCP desktop                         | ≤ 1.2 s                 | 0.6 s                                                                  |
| CLS                                 | ≤ 0.05                  | 0                                                                      |
| TBT                                 | ≤ 100 ms                | 10–20 ms (simulated mobile), 50 ms (applied), 0 ms (desktop)           |
| JavaScript                          | ≤ 120 KB                | 117.8 KB Brotli (137.5 KB gzip)                                        |
| Total first view                    | ≤ 800 KB                | 208 KB                                                                 |
| Fonts                               | ≤ 2 families, ≤ 4 files | 2 families, 2 files, 48.5 KB                                           |
| DOM elements                        | ≤ 1,000                 | 952                                                                    |
| Third-party requests before consent | 0                       | 0                                                                      |

Two deviations to know about:

- **JS is budgeted on Brotli, not gzip.** Next.js 16's framework runtime alone is about 131 KB gzip, so a
  120 KB gzip ceiling isn't reachable with any Next.js page. Production hosts serve Brotli.
- **Simulated mobile LCP reads high.** Lighthouse's simulation counts every request that starts before
  the first paint: the framework's script chunks (requested from the head), the fonts, and an HTML file
  whose React Server Components payload roughly doubles its size. With real throttling the LCP element
  (the hero paragraph on phones) paints at 1.6 s.

The DOM budget is tight: a new section has to pay for itself. Icons are styled SVGs without wrapper
elements, and menus mount only when opened.

## Accessibility (WCAG 2.2 AA)

- One `h1` and a logical heading order. Landmarks are labelled, and a skip link is the first stop.
- Visible 2px focus rings everywhere, including the custom radio controls.
- Tap targets are at least 44 × 44 px on phones, and colour pairs are checked for contrast.
- Desktop menus open on click, Enter and Space, and also on hover with a delay. Escape closes them and returns focus.
- The phone menu is a modal `<dialog>`.
- The animated demo stops while it is off screen and disappears entirely under reduced motion. It has no
  in-page pause control (see "Motion and WCAG 2.2.2" above).
- axe (WCAG 2.2 A/AA) runs in CI on desktop and mobile with no serious or critical issues.

## Privacy and security

- No cookies and no third-party requests by default.
- With `NEXT_PUBLIC_GA_MEASUREMENT_ID` set, Google Analytics loads only after the visitor accepts. Accept and Reject carry equal weight.
- Security headers are set in `next.config.ts`: CSP, HSTS, `nosniff`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy and COOP.
- The CSP has no nonces, because the page is static. It allows `'unsafe-inline'` for scripts, which Next.js's own inline bootstrap needs, and the page has no user-generated content.

## For the site owner to check

These come from contradictions or gaps on the current site, not from this rebuild:

1. **Company name.** The footer says "Workchats Ltd". The Terms, Privacy Policy, About page and FAQ name
   Octogle Technologies Ltd (Dubai, UAE) as the company that runs Workchats. The new footer shows both,
   as the current site does. Confirm which entity is the contracting party.
2. **Encryption wording.** The FAQ says end-to-end encryption is on by default, with AES-256 at rest,
   TLS 1.3 and zero-access storage. The Privacy Policy mentions only TLS 1.2+ and AES-256. The page
   follows the FAQ and says "TLS in transit" without a version. Align the two documents.
3. **Currencies.** Billing is in GBP (FAQ). The other currencies use the current site's fixed rates and are
   labelled approximate. The old widget defaulted to US dollars; the new one defaults to pounds.
4. **Launch timing.** The FAQ still describes a pre-launch, Q2 2026 early-access programme and a waitlist.
   None of that is repeated here; the FAQ page itself needs updating.
5. **Platform status.** The redesign drops every release-status badge, so the downloads bar and the FAQ
   now present all six platforms as current. `/download` still marks Windows as beta and Android as in
   Google Play review: either keep the page's claim softer than the docs, or update `src/content/site.ts`
   and `src/content/faq.ts` when the statuses change. `UX-REVIEW.md` records the decision.
6. **Middle East hosting.** The site says data is hosted "in the UK, EU, or Middle East" and the Terms cite
   the UAE's PDPL, but no page names the Middle East hosting country. The region chip uses the UAE flag;
   swap `public/flags/ae.svg` if hosting is elsewhere.
7. **Privacy levels.** The FAQ says each privacy setting has three visibility levels but doesn't name them.
   The security card shows Everyone, My team and Nobody; replace them in `src/content/demo.ts` with the
   product's real names.
