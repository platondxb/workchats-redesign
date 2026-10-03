# Phase 1 — Strategy, structure and copy

**Status:** written after the owner's answers to the Phase 0 questions (3 October 2026). The owner asked to
move straight to the build, so this document records the decisions rather than waiting at a gate.

## Assumptions and owner decisions

| Topic                 | Decision                                                                                                                                                                                                                            | Source                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Theme                 | The whole page moves to a dark theme. Brand colours and Stack Sans stay.                                                                                                                                                            | Owner, 3 Oct                    |
| Top of the page       | Follows the owner's two reference screenshots: centred two-tone headline on a dark stage with a blue light from the top, two buttons, a caption, then a scroll-animated product card. Floating nav bar.                             | Owner, 3 Oct                    |
| Navigation actions    | Sign in, Download and Book a demo stay in the header. "Start free" stays as the primary action.                                                                                                                                     | Owner; brief §5                 |
| Download buttons      | May stay without an action for the MVP. Platform buttons are pressable, record `download_click`, and navigate nowhere. "Download" in the header and hero scrolls to the platforms.                                                  | Owner answer 1                  |
| Reliability           | No status page. The page states the 99.9% uptime SLA on Pro and above and nothing measured.                                                                                                                                         | Owner answer 2                  |
| Security wording      | The owner's approved lines: granular privacy settings; end-to-end encryption on every message, call and file, with the 99.9% SLA on Pro and above; GDPR compliant with compliance and audit logs, data export and regional hosting. | Owner answer 2                  |
| Middle East region    | United Arab Emirates.                                                                                                                                                                                                               | Owner answer 3                  |
| Company name          | Workchats Ltd, everywhere on the home page and in its structured data.                                                                                                                                                              | Owner answer 4                  |
| Cost comparison       | Approved, anonymised; the screen-recording tool counts as replaced. No check date was given: the page uses "checked May 2026", the date the live pricing page gives for its competitor prices. **Re-check before launch.**          | Owner answer 5; live `/pricing` |
| Customers             | AWS, Microsoft, Google, GoDaddy, IBM, Ericsson and EPAM, as customers who may be named. Shown as text in our typeface, not logos ("Ericson" spelled as the company does).                                                           | Owner answer 6                  |
| Calendar integrations | Live: Google Calendar, Outlook and iCal, shown in an integrations context.                                                                                                                                                          | Owner answer 7                  |
| Device showcase       | The owner's scroll animation (a card that tilts back and straightens as you scroll) replaces 3D models, built with CSS scroll-driven animations instead of framer-motion.                                                           | Owner answer 8, follow-up       |
| Currencies            | GBP (default, billed), USD, EUR, AED, RUB.                                                                                                                                                                                          | Owner answer 9                  |
| Analytics             | GA4 through the existing consent manager.                                                                                                                                                                                           | Owner answer 10                 |
| Buttons               | The owner's "liquid glass" buttons, adapted to the token system.                                                                                                                                                                    | Owner, 3 Oct                    |

## 1. Positioning

**For** teams of 10 to 500 people in the UK, the EU and the Middle East who pay for a chat app, a meeting tool
and a screen recorder and still end up in a personal messenger, **Workchats is** one app for messages,
calls and files. **It is free** for up to 5 people, with no time limit, and **£3 a person** on Pro when the
team grows, **with** end-to-end encryption, hosting in the UK, the EU or the UAE, and a 99.9% uptime SLA on Pro
and above, which an IT approver can sign off.

## 2. Message hierarchy

1. **What it is:** team chat, calls and files, in one app. (Headline, first line.)
2. **The hook:** free for up to 5 people, with no time limit. (Headline, second line; caption beside the
   action.)
3. **Why switch:** it replaces the chat app, the meeting tool, the screen recorder and the messenger, and
   keeps your office suite. That is £15,744 a year less for 50 people at list prices.
4. **Safe to approve:** end-to-end encryption, hosted in the UK, the EU or the UAE, GDPR, and a 99.9% uptime
   SLA on Pro and above.
5. **Calm by design:** it works offline and shows working hours, calls start inside the chat, recordings
   come with summaries, and connection requests replace cold messages.
6. **Everywhere:** web, macOS, Windows, Linux, iPhone and iPad, and Android.
7. **The path:** Free, then Pro at £3 when you pass 5 people, then Max or Enterprise.

## 3. The funnel and the call-to-action map

Land → understand in 5 seconds → start free → install on every device → grow past 5 or need more → Pro.

| Where         | Primary action                                               | Secondary                                       | Event                                                                              |
| ------------- | ------------------------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Header        | Start free                                                   | Book a demo, Download (to `#download`), Sign in | `cta_click` (location `header`)                                                    |
| Hero          | Start free                                                   | Download for {your OS} (to `#download`)         | `cta_click` / `download_click` (`hero`)                                            |
| Business case | Copy link for your IT team                                   | Book a security walkthrough                     | `cta_click` (`business-case`)                                                      |
| Free plan     | Start free                                                   | Compare plans (to `#pricing`)                   | `cta_click` (`free-plan`)                                                          |
| Downloads     | The platform that matches the device                         | The other five platforms                        | `download_click` (platform)                                                        |
| Cost          | Compare plans (to `#pricing`)                                | Read the full cost breakdown                    | `calculator_change`                                                                |
| Pricing       | Start free / Start with Pro / Start with Max / Contact sales | Billing period, currency                        | `cta_click` (`pricing-{plan}`), `pricing_period_change`, `pricing_currency_change` |
| FAQ           | —                                                            | See all questions, support email                | `faq_open`                                                                         |
| Closing band  | Start free                                                   | Book a demo                                     | `cta_click` (`final`)                                                              |

One primary action per viewport. "No credit card needed" appears once, beside the hero action.

## 4. Sections

| #   | Section               | Its job                                                                                              | The visitor's question                         | Success signal                               |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| 1   | Hero and product card | Say what it is and that 5 people use it free; show it working across devices                         | What is this, and what does trying it cost?    | `cta_click` / `download_click` from the hero |
| 2   | Customers             | Real proof, quietly                                                                                  | Who uses it?                                   | —                                            |
| 3   | The short version     | Give an approver cost, reliability, security and residency in 10 seconds, in a form they can forward | Can we sign this off?                          | Copy-link and walkthrough clicks             |
| 4   | Free for 5            | Make the free plan concrete and the upgrade path explicit                                            | What do we get, and what happens when we grow? | `cta_click` (`free-plan`)                    |
| 5   | One working day       | Show the considered details as product moments                                                       | Why is this better than what we use?           | Scroll depth                                 |
| 6   | On every device       | Downloads, with the visitor's own platform first                                                     | Will it run on our devices?                    | `download_click`                             |
| 7   | Cost                  | Make the saving real for their team size                                                             | What would we save?                            | `calculator_change`                          |
| 8   | Pricing               | Convert, Free first and Pro next                                                                     | Which plan, and how much?                      | Plan CTAs, period and currency changes       |
| 9   | Questions             | Remove the last objections                                                                           | What about migration, data, calendars?         | `faq_open`                                   |
| 10  | Closing band          | The last ask                                                                                         | —                                              | `cta_click` (`final`)                        |

The business case (section 3) starts inside the first two screens on a 1440 × 900 desktop.

## 5. Copy

UK English, sentence case. Every number is computed from `src/content/`.

### Header

Features · Solutions · Pricing · Resources — Sign in · Download · Book a demo · **Start free**

### 1. Hero

- **Headline:** Team chat, calls and files. / Free for up to 5 people.
- **Lead:** Workchats replaces the separate chat, meeting and recording tools your team pays for. End-to-end
  encrypted on every plan.
- **Actions:** Start free · Download for {macOS | Windows | Linux | iPhone | iPad | Android} (no match:
  "Download the app")
- **Caption:** No credit card needed, no time limit. Pro is £3 a person a month when you grow.
- **Product card (text alternative):** Workchats on a laptop and a phone. In the #spring-launch channel,
  Priya Shah posts "Quick check-in at 10? I'll start a call here." and starts a call, which rings on Daniel
  Novak's phone while he is out on a site visit.

### 2. Customers

Used by teams at AWS, Microsoft, Google, GoDaddy, IBM, Ericsson and EPAM.

### 3. The short version

- **Heading:** The short version, for whoever signs it off
- **Intro:** Cost, reliability, security and where your data lives, on one page you can forward.
- **Actions:** Copy link for your IT team · Book a security walkthrough
- **Sheet, "Workchats in brief":**
  - Cost: Free for up to 5 people. Pro is £3 per person a month, billed annually. Max is £5.
  - What it replaces: A chat app, a meeting tool, a screen recorder and the messenger your team falls back
    to. For 50 people, £15,744 a year less at list prices.
  - Reliability: 99.9% uptime SLA on Pro and above.
  - Encryption: End-to-end encryption on every message, call and file.
  - Data residency: Hosted in the UK, the EU or the UAE. GDPR compliant.
  - Compliance: Compliance and audit logs, and data export, on Pro and above.
  - Privacy: Granular privacy settings: every team member controls who sees their role, status and messages.

### 4. Free for 5

- **Heading:** Five people, free, for as long as you like
- **Intro:** The Free plan has no trial period and no end date. This is what a team of 5 gets.
- **List:** Channels, DMs and group chats · 1:1 voice and video calls with screen sharing · Calls with no time
  limit · 5 GB of storage per person · End-to-end encryption · Message history that is never archived after 90
  days · Email and calendar integrations · Apps for the web, desktop and mobile
- **The sixth person (product moment):** Adding a sixth person moves the team to Pro. 6 people on Pro: £18 a
  month, billed annually. Everything you have carries over.
- **Actions:** Start free · Compare plans

### 5. One working day

- **Heading:** One working day at Northgate Studio
- **Intro:** Five details that make Workchats quieter than the tools it replaces.
- 08:47 · **Works offline.** Daniel writes from a site with no signal. The message waits, then sends when he
  is back online.
- 09:00 · **Working hours.** Tom's day starts at 09:00, and his profile says so. Nobody has to guess whether
  he's around.
- 09:41 · **Calls start in the chat.** Priya starts a call from the #spring-launch thread. No link to paste
  and no time limit.
- 10:32 · **Recordings with summaries.** The recording lands in the channel with an AI summary of the
  decisions and action items.
- 14:10 · **Connection requests.** Someone outside the team asks to connect before they can message Sofia.
  No cold outreach.

### 6. On every device

- **Heading:** On every device your team already uses
- **Intro:** Your workspace follows you from the browser to the desktop to your phone.
- Web (any modern browser) · macOS (Apple Silicon, macOS 12+) · Windows (Windows 10 or 11) · Linux (AppImage,
  64-bit) · iPhone and iPad (iOS 15+) · Android (phone and tablet). The visitor's own platform is marked
  "This device".
- **Integrations:** Syncs with Google Calendar, Outlook and iCal.

### 7. Cost

- **Quote:** "We built Workchats because our own team was paying for five tools to do what one should."
  Yaseen Deen, founder.
- **Heading:** A typical team pays for five tools. Workchats replaces four.
- **The stack, per person a month:** A team chat app £7.25 · A separate video-meeting tool £11.99 · A
  screen-recording tool £10 · A personal messenger the team falls back to £0 · An office suite £12 (you keep
  this one)
- **Calculator:** team size (10 to 200, default 50); five tools, Workchats Pro plus your office suite (Max
  above 50 people), you save; currency switch.
- **Note:** List prices per person, billed annually, before VAT, checked May 2026. Above 50 people the sum uses
  Workchats Max. Totals in other currencies are approximate.
- **Links:** Compare plans · Read the full cost breakdown

### 8. Pricing

- **Heading:** Start free. Move to Pro when you grow.
- **Intro:** Billed in pounds sterling. Prices in other currencies are approximate.
- **Free:** For teams of up to 5. £0. Start free.
- **Pro:** Recommended once you pass 5 people. £3 per person a month, billed annually. Start with Pro.
- **Max:** For larger teams with advanced security needs. £5. Start with Max.
- **Enterprise:** For large or regulated organisations. Custom. Contact sales.
- **Link:** Compare every plan in detail

### 9. Questions

- **Heading:** Questions teams ask before they switch
- Is the Free plan really free? / Yes. Teams of up to 5 people use Workchats free, with no time limit. You get
  channels, DMs and group chats, 1:1 video calls with screen sharing, and 5 GB of storage per person.
- What happens when we add a sixth person? / Your team moves to Pro, which covers up to 50 people for £3 per
  person a month, billed annually, or £4 billed monthly. Your conversations, files and settings carry over.
- Can we move over from the tools we use now? / Yes. Import your message history from the chat tool you use
  today, run Workchats alongside your current tools, and move one team at a time.
- Where is our data stored, and is it encrypted? / In the UK, the EU or the UAE, so it stays inside your
  region, and Workchats is GDPR compliant. Every message, call and file is end-to-end encrypted, on every plan.
- Does it work with our calendar? / Yes. Workchats syncs with Google Calendar, Outlook and iCal, and people
  outside your company can join a call with a link, without an account.
- Which platforms does Workchats run on? / The web, macOS (Apple Silicon, macOS 12 or later), Windows 10 or
  11, Linux as an AppImage, iPhone and iPad (iOS 15 or later), and Android phones and tablets.

### 10. Closing band

- **Heading:** Start with five people and grow from there
- **Body:** Free for up to 5, with no time limit. For a bigger rollout, book a demo and we'll walk your team
  through it.
- **Actions:** Start free · Book a demo

## 6. Patterns from the brief's banned list (§4.4), with the reason each is used

1. **Centred hero, headline, subline, two buttons, product underneath.** The owner chose this composition
   with two reference screenshots. The product underneath does work a screenshot can't: it is a
   scroll-linked device reveal that carries the cross-device story (the call started on the laptop rings on
   the phone as the card settles), so the default shape holds a specific moment.
2. **A two-tone headline.** Also the owner's reference. It splits the headline by line, into what it is and
   what trying it costs, rather than accenting one word, and the muted line still reads at 6.1:1 on the page
   colour (3.9:1 at the brightest point of the light, above the 3:1 large-text minimum).
3. **A blue light behind the top of the page.** The brief bans glow blobs and aurora backgrounds. This is one
   still, static light in the brand blue, falling from the top edge like the key light in the owner's product
   photography references. It frames the navigation and headline, and nothing else on the page glows.
4. **Glass buttons.** "Stacked glassmorphism" is banned; the owner asked for liquid glass buttons. Each button
   is a single glass layer on a control, never a glass card on a glass card, and the primary button stays a
   solid brand blue so the hierarchy doesn't depend on the effect.
5. **A strip of company names.** Logo walls and "Trusted by" are banned because they are usually invented.
   These are real customers the owner approved on 3 October 2026. They are set as text in our own typeface,
   not as logos, and labelled with what is true ("Used by teams at"), not with a trust claim.
6. **Times of day as markers.** The working-day section is a real sequence through one day, so its times
   are information, not "01 / 02 / 03" decoration.

Nothing else from §4.4 appears: no eyebrow labels in capitals, no three equal cards, no bento, no
pricing towers without hierarchy, no invented numbers, no rhetorical-question headings, no
"X. Nothing Y." lines, no character-by-character text animation, and no isolated dark section (the whole
page is dark; light is kept for real artefacts, the app screens and the one-page brief).
