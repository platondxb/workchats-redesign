# Assets and licences

Every visual on the home page, where it comes from and under what terms. Nothing on the page is stock
imagery, a placeholder, a third-party product image or a logo of another company.

| Asset                              | Where                                                                                                          | Source                                                                                                                                                                                                  | Licence                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Workchats logo (mark and wordmark) | `src/components/layout/Logo.tsx`, `public/brand/`                                                              | The owner's, from workchats.com                                                                                                                                                                         | The owner's                                                                                      |
| Phone and laptop                   | `components/product/Handset.tsx`, `components/ui/container-scroll-animation.tsx`                               | Drawn in HTML and CSS for this site                                                                                                                                                                     | Ours                                                                                             |
| The app's screens                  | `components/product/DesktopApp.tsx`, `Handset.tsx`, the working-day moments                                    | Rebuilt in HTML from the live product's patterns; the team and messages are demo data in `src/content/demo.ts`                                                                                          | Ours                                                                                             |
| Region flags (UK, EU, UAE)         | `public/flags/*.svg`                                                                                           | Added on 1 October 2026. The SVGs match the 4:3 artwork of the open-source flag-icons project (lipis/flag-icons); the flags themselves are public designs                                               | flag-icons is MIT: keep its notice if the files are confirmed to come from there                 |
| Icons                              | `@phosphor-icons/react` 2.1.10, rendered on the server                                                         | Phosphor Icons                                                                                                                                                                                          | MIT                                                                                              |
| Typefaces                          | Stack Sans Text and Stack Sans Headline, self-hosted by `next/font`; `src/assets/fonts/` for the preview image | The Stack Sans Project                                                                                                                                                                                  | SIL Open Font License 1.1 (`src/assets/fonts/OFL.txt`)                                           |
| Container scroll animation         | `components/ui/container-scroll-animation.tsx`                                                                 | Supplied by the owner (Aceternity UI's "container scroll animation"); rebuilt here with CSS scroll-driven animations, keeping its structure, names and motion values but none of its framer-motion code | The owner should confirm the source's terms allow commercial use of the design                   |
| Liquid glass button                | `components/ui/liquid-glass-button.tsx`, `button-classes.ts`                                                   | Supplied by the owner; adapted (server-rendered, tokens, one shared SVG filter, pseudo-elements instead of extra elements)                                                                              | As above                                                                                         |
| Customer names                     | `src/content/site.ts` (`customers`)                                                                            | The owner, 3 October 2026, as customers who may be named                                                                                                                                                | Shown as text in our typeface, not as logos: each company's logo needs that company's permission |

## Reference images

`docs/redesign/references/` holds the three mood references from the brief (a copper phone, a titanium
phone and a space-black laptop). They show a third-party company's products, its interface and wallpaper,
and a commercial mockup's watermark, so they are **not used on the page, not traced, and not committed**:
the folder is in `.gitignore` because the repository is public. What was taken from them is described in
words in `art-direction.md` (the top key light, the lit device edges, the floating poses and the layered
contact shadow).

## 3D models

None. The decision and the path to photoreal devices, should they be wanted, are in `adr-3d-devices.md`.
`check:bundle` budgets any future `public/3d/<device>/` folder at 1.5 MB.
