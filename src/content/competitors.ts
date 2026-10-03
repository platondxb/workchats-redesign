/**
 * Products the home page must never name or depict (brief §3.2, the owner's anonymity rule). The one list:
 * src/app/page.test.tsx and e2e/home.spec.ts both read it and fail if any of these appears in the rendered
 * page, its metadata or its structured data. Nothing on the page imports this file.
 *
 * Matching is case-sensitive and whole-word, so ordinary words ("teams", "zoom in") don't trip it; copy
 * that starts a sentence with "Teams" will, which is intended.
 *
 * Calendar integrations (Google Calendar, Outlook, iCal) are integrations, not competitors; the owner
 * confirmed them on 3 October 2026, and they appear only where the page talks about calendars.
 */
export const competitorNames = [
  "Slack",
  "Microsoft Teams",
  "Teams",
  "Zoom",
  "Google Meet",
  "Google Workspace",
  "Loom",
  "WhatsApp",
  "Discord",
  "Webex",
  "Mattermost",
  "Chanty",
  "Flock",
  "Rocket.Chat",
] as const;

/** The names found in `text`, matched case-sensitively as whole words. */
export function findCompetitorNames(text: string): string[] {
  return competitorNames.filter((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![\\w.])${escaped}(?![\\w])`).test(text);
  });
}
