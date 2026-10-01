import { site } from "./site";

/** Icon names for menu items, mapped to the icon set in components/ui/icons.tsx. */
export type MenuIcon =
  | "chats"
  | "video"
  | "files"
  | "feed"
  | "events"
  | "polls"
  | "distributed"
  | "field"
  | "studio"
  | "healthcare"
  | "about"
  | "download"
  | "blog"
  | "faq"
  | "contact";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  icon?: MenuIcon;
  /** Shown as a badge; the item is not available yet. */
  comingSoon?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavLink[];
  /** Optional second column, e.g. features that are coming soon. */
  aside?: { title: string; items: NavLink[] };
  footer?: NavLink;
}

export type NavEntry = NavLink | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const comingSoonFeatures: NavLink[] = [
  {
    label: "Social feed",
    href: "/features/social-feed",
    description: "Company news, wins and culture your team will actually read.",
    icon: "feed",
    comingSoon: true,
  },
  {
    label: "Events",
    href: "/features/events",
    description: "Internal events with RSVP, without the spreadsheet.",
    icon: "events",
    comingSoon: true,
  },
  {
    label: "Polls and surveys",
    href: "/features/polls-surveys",
    description: "Ask your team anything. Get real answers, not silence.",
    icon: "polls",
    comingSoon: true,
  },
];

/** Header navigation. Descriptions are the ones the current site uses in its menus. */
export const primaryNav: NavEntry[] = [
  {
    label: "Features",
    items: [
      {
        label: "Messaging and channels",
        href: "/features/messaging",
        description: "One place for every team conversation.",
        icon: "chats",
      },
      {
        label: "Video and meetings",
        href: "/features/video-meetings",
        description: "One-click calls, screen sharing, recording and calendar sync.",
        icon: "video",
      },
      {
        label: "Files and search",
        href: "/features/files-search",
        description: "Share once. Find it always. Organised by team, searchable.",
        icon: "files",
      },
    ],
    aside: { title: "Coming soon", items: comingSoonFeatures },
    footer: { label: "Explore all features", href: site.links.features },
  },
  {
    label: "Solutions",
    items: [
      {
        label: "Distributed teams",
        href: "/solutions/distributed-teams",
        description: "One workspace, wherever your team works.",
        icon: "distributed",
      },
      {
        label: "Field teams",
        href: "/solutions/field-teams",
        description: "A mobile-first workspace that holds up off a laptop.",
        icon: "field",
      },
      {
        label: "Studios and agencies",
        href: "/solutions/studios-and-agencies",
        description: "One workspace from brief to delivery.",
        icon: "studio",
      },
      {
        label: "Healthcare teams",
        href: "/solutions/healthcare-teams",
        description: "A governed workspace that meets the regulator's bar.",
        icon: "healthcare",
      },
    ],
  },
  { label: "Pricing", href: site.links.pricing },
  {
    label: "Resources",
    items: [
      {
        label: "Download",
        href: site.links.download,
        description: "Find all the available versions.",
        icon: "download",
      },
      { label: "Blog and news", href: "/blog", description: "Product updates and insights.", icon: "blog" },
      { label: "FAQ", href: site.links.faq, description: "Common questions, answered.", icon: "faq" },
      { label: "About", href: site.links.about, description: "The team behind Workchats.", icon: "about" },
      {
        label: "Contact",
        href: site.links.contact,
        description: "Sales, partnerships, or press.",
        icon: "contact",
      },
    ],
  },
];

export const footerNav: NavGroup[] = [
  {
    label: "Product",
    items: [
      { label: "Features", href: site.links.features },
      { label: "Pricing", href: site.links.pricing },
      { label: "Download", href: site.links.download },
      { label: "Sign in", href: site.links.signIn },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "Distributed teams", href: "/solutions/distributed-teams" },
      { label: "Field teams", href: "/solutions/field-teams" },
      { label: "Studios and agencies", href: "/solutions/studios-and-agencies" },
      { label: "Healthcare teams", href: "/solutions/healthcare-teams" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About", href: site.links.about },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: site.links.faq },
      { label: "Contact", href: site.links.contact },
    ],
  },
  {
    label: "Legal",
    items: [
      { label: "Terms and conditions", href: "/terms-conditions" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Cookie policy", href: site.links.cookiePolicy },
    ],
  },
];

/** Unreleased features, listed in the Features menu, the roadmap section and the footer, always labelled. */
export const comingSoon: NavGroup = { label: "Coming soon", items: comingSoonFeatures };
