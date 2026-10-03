import { formatDisplayPrice, gbpPrice } from "@/lib/pricing";
import { plans, quotas } from "./pricing";
import { calendarIntegrations, hostingRegions } from "./site";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const pro = plans.find((plan) => plan.id === "pro");
const proPrice = (period: "annual" | "monthly") => {
  const amount = pro ? gbpPrice(pro, period) : null;
  if (amount === null) throw new Error(`Missing the Pro ${period} price in content/pricing.ts`);
  return formatDisplayPrice(amount, "GBP");
};
const regions = hostingRegions.map((region) => `the ${region.short}`);
const calendars = `${calendarIntegrations.slice(0, -1).join(", ")} and ${calendarIntegrations.at(-1) ?? ""}`;

/**
 * The questions teams ask before they switch, from the home page FAQ and /faq on workchats.com, tightened
 * for clarity. No answer names another product: the migration answer describes the tool by what it is.
 */
export const faq: readonly FaqItem[] = [
  {
    id: "free-plan",
    question: "Is the Free plan really free?",
    answer: `Yes. A team of up to ${quotas.free.members} people uses Workchats free, with no time limit. You get channels, DMs and group chats, 1:1 video calls with screen sharing, and ${quotas.free.storagePerUserGb} GB of storage per person.`,
  },
  {
    id: "sixth-person",
    question: "What happens when we add a sixth person?",
    answer: `Your team moves to Pro, which covers up to ${quotas.pro.members} people for ${proPrice("annual")} per person a month, billed annually, or ${proPrice("monthly")} billed monthly. Your conversations, files and settings carry over.`,
  },
  {
    id: "switching",
    question: "Can we move over from the tools we use now?",
    answer:
      "Yes. Import your message history from the chat tool you use today, run Workchats alongside your current tools, and move one team at a time.",
  },
  {
    id: "data",
    question: "Where is our data stored, and is it encrypted?",
    answer: `In ${regions.slice(0, -1).join(", ")} or ${regions.at(-1) ?? ""}, so it stays inside your region, and Workchats is GDPR compliant. Every message, call and file is end-to-end encrypted, on every plan.`,
  },
  {
    id: "calendar",
    question: "Does it work with our calendar?",
    answer: `Yes. Workchats syncs with ${calendars}, and people outside your company can join a call with a link, without an account.`,
  },
  {
    id: "platforms",
    question: "Which platforms does Workchats run on?",
    answer:
      "The web, macOS (Apple Silicon, macOS 12 or later), Windows 10 or 11, Linux as an AppImage, iPhone and iPad (iOS 15 or later), and Android phones and tablets.",
  },
];
