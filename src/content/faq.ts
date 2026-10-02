export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** From the home page FAQ and /faq on workchats.com, tightened for clarity. */
export const faq: readonly FaqItem[] = [
  {
    id: "free-plan",
    question: "Is Workchats really free?",
    answer:
      "Yes. The Free plan is free for teams of up to 5, with no time limit and no credit card. You get channels, DMs and group chats, 1:1 video calls with screen sharing, and 5 GB of storage per user.",
  },
  {
    id: "switching",
    question: "Can we move over from Slack and the tools we already use?",
    answer:
      "Yes. You can import your message history from Slack, run Workchats alongside your current tools, and move one team at a time. There's no all-or-nothing migration.",
  },
  {
    id: "upgrading",
    question: "What happens when we upgrade?",
    answer: "Your account, conversations, files and settings all carry over. Nothing resets.",
  },
  {
    id: "data-location",
    question: "Where is our data stored?",
    answer:
      "Data is hosted in the UK, the EU or the Middle East, depending on your region, so it stays inside your regional boundary for data residency and GDPR. Compliance and audit logs are available on Pro and above.",
  },
  {
    id: "encryption",
    question: "Is Workchats encrypted?",
    answer:
      "Yes. End-to-end encryption is on by default on every plan, including Free. Data is encrypted with AES-256 at rest and TLS in transit.",
  },
  {
    id: "platforms",
    question: "Which platforms does Workchats run on?",
    answer:
      "The web, macOS (Apple Silicon, macOS 12 or later), Windows 10 or 11, iPhone and iPad (iOS 15 or later), Android phones and tablets, and Linux as an AppImage.",
  },
];
