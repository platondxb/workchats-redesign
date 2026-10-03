/**
 * Demo data for the product views. One small team and one launch across every view: a file is shared
 * in a channel, a message turns into a call, and search finds the file later. People are shown as
 * initials, not photos; nobody here is a real customer.
 */

export type AvatarTone = "blue" | "green" | "amber" | "rose" | "violet";

export const people = {
  amara: { name: "Amara Okafor", initials: "AO", role: "Product lead", tone: "violet" },
  tom: { name: "Tom Hughes", initials: "TH", role: "Designer", tone: "blue" },
  priya: { name: "Priya Shah", initials: "PS", role: "Operations", tone: "amber" },
  daniel: { name: "Daniel Novak", initials: "DN", role: "Engineer", tone: "green" },
  sofia: { name: "Sofia Marín", initials: "SM", role: "Brand and marketing", tone: "rose" },
} as const satisfies Record<string, { name: string; initials: string; role: string; tone: AvatarTone }>;

export type PersonId = keyof typeof people;

export const channels = [
  { name: "spring-launch", unread: 0 },
  { name: "design", unread: 3 },
  { name: "field-ops", unread: 0 },
  { name: "announcements", unread: 1 },
] as const;

export const directMessages: readonly { person: PersonId; unread: number; online: boolean }[] = [
  { person: "priya", unread: 1, online: true },
  { person: "tom", unread: 0, online: true },
  { person: "daniel", unread: 0, online: false },
];

export const sharedFile = {
  name: "Brand guidelines v3.pdf",
  kind: "PDF",
  size: "2.4 MB",
  pages: 18,
} as const;

/** The hero demo: two messages are already there, Priya types, posts, starts a call, the phone rings. */
export const heroDemo = {
  channel: "spring-launch",
  members: 8,
  earlier: [
    {
      person: "amara" as PersonId,
      time: "09:12",
      text: "Final brand guidelines are in. Please use v3 from today.",
      file: sharedFile,
      reactions: 4,
    },
    {
      person: "tom" as PersonId,
      time: "09:20",
      text: "Thanks. I'll update the homepage mockups this afternoon.",
    },
  ],
  typing: "priya" as PersonId,
  next: { person: "priya" as PersonId, time: "09:41", text: "Quick check-in at 10? I'll start a call here." },
  call: {
    title: "Spring launch check-in",
    startedBy: "priya" as PersonId,
    joined: ["priya", "amara", "daniel"] as PersonId[],
  },
} as const;

/** The phone in the hero: Daniel is out on a site visit when Priya starts the call. */
export const phoneView = {
  owner: "daniel" as PersonId,
  time: "09:41",
  chats: [
    {
      kind: "channel",
      name: "spring-launch",
      preview: "Tom: Thanks. I'll update the homepage mockups…",
      time: "09:20",
    },
    {
      kind: "person",
      person: "priya" as PersonId,
      preview: "Can you send the photos from site?",
      time: "09:05",
      unread: 1,
    },
    { kind: "channel", name: "field-ops", preview: "You: Site visit done. Photos coming…", time: "08:47" },
    {
      kind: "person",
      person: "tom" as PersonId,
      preview: "Left two comments on the header spacing.",
      time: "Yesterday",
    },
    { kind: "channel", name: "announcements", preview: "Amara: Office closed on Friday.", time: "Tue" },
  ],
} as const;

export const launchCall = {
  title: "Spring launch check-in",
  channel: "spring-launch",
  elapsed: "1:04:12",
  sharing: "tom" as PersonId,
  shared: "Homepage mockups",
  speaking: "priya" as PersonId,
  muted: ["daniel"] as PersonId[],
  participants: ["priya", "amara", "tom", "daniel"] as PersonId[],
} as const;

/** Workspaces one person belongs to: the first is Northgate Studio, where the demo team works. */
export const workspaces = [
  { name: "Northgate Studio", initials: "NS", tone: "blue", active: true },
  { name: "Harbour Clinic", initials: "HC", tone: "green", active: false },
  { name: "Brightline Freight", initials: "BF", tone: "amber", active: false },
] as const satisfies readonly { name: string; initials: string; tone: AvatarTone; active: boolean }[];

export const workingHours = { days: "Mon to Fri", from: "09:00", to: "17:30", timezone: "London" } as const;

export const offlineQueue = {
  person: "daniel" as PersonId,
  text: "Site visit done. Photos coming when I'm back on signal.",
} as const;

/** Someone outside the team asking Sofia to connect before they can message her (the working day, 14:10). */
export const outsideRequest = {
  name: "Leo Brandt",
  initials: "LB",
  tone: "blue",
  company: "Harbour Clinic",
} as const satisfies { name: string; initials: string; tone: AvatarTone; company: string };

/** The recording of the check-in, as it lands in #spring-launch (the working day, 10:32). */
export const callSummary = {
  title: "Spring launch check-in",
  length: "48 min",
  decision: "Launch date stays 14 May",
  actions: [
    { person: "tom" as PersonId, text: "Final homepage mockups" },
    { person: "daniel" as PersonId, text: "Site photos to #field-ops" },
  ],
} as const;

/** Northgate Studio's five members: the whole Free plan, before the sixth invite. */
export const freeTeam: readonly PersonId[] = ["amara", "tom", "priya", "daniel", "sofia"];
