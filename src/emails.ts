export interface Email {
  id: number;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  read: boolean;
  priority: "low" | "normal" | "high";
}

export const mockEmails: Email[] = [
  {
    id: 1,
    from: "alice@company.com",
    to: "you@company.com",
    subject: "Q1 Budget Review Meeting",
    date: "2026-03-09T09:15:00Z",
    body: "Hi, just a reminder that the Q1 budget review is scheduled for Thursday at 2pm in Conference Room B. Please bring your department's updated forecasts. We'll also discuss the new vendor contracts that need approval before month-end.",
    read: false,
    priority: "high",
  },
  {
    id: 2,
    from: "bob@external-client.com",
    to: "you@company.com",
    subject: "Re: Project Milestones Update",
    date: "2026-03-09T08:42:00Z",
    body: "Thanks for the update last week. We've reviewed the revised timeline and are comfortable with the new delivery dates. Can we schedule a quick sync on Monday to align on the Phase 2 requirements? Our team has a few suggestions for the API integration approach.",
    read: false,
    priority: "normal",
  },
  {
    id: 3,
    from: "hr@company.com",
    to: "all-staff@company.com",
    subject: "Updated PTO Policy — Effective April 1",
    date: "2026-03-08T16:00:00Z",
    body: "Dear team, we're rolling out an updated PTO policy effective April 1. Key changes include: increased annual allowance from 20 to 25 days, a new half-day option, and simplified approval workflows. Full details are attached. Please review and reach out to HR with questions.",
    read: true,
    priority: "low",
  },
  {
    id: 4,
    from: "carol@company.com",
    to: "you@company.com",
    subject: "URGENT: Production database latency spike",
    date: "2026-03-09T07:03:00Z",
    body: "We're seeing elevated latency on the primary read replica — p99 jumped from 12ms to 340ms starting around 6:45am. I've opened an incident channel. Can you check if the index migration from last night's deploy may be related? Rolling back the deploy is on the table if we can't isolate it in the next 30 minutes.",
    read: false,
    priority: "high",
  },
  {
    id: 5,
    from: "newsletter@techdigest.io",
    to: "you@company.com",
    subject: "This Week in Tech: AI Agents, Rust 2.0, and More",
    date: "2026-03-08T12:00:00Z",
    body: "Your weekly tech roundup: 1) Major cloud providers announce unified AI agent protocols. 2) Rust 2.0 released with async improvements. 3) Open-source LLM benchmarks show surprising results. 4) New EU data regulation draft published. Click through for full articles.",
    read: true,
    priority: "low",
  },
  {
    id: 6,
    from: "dave@company.com",
    to: "you@company.com",
    subject: "Design review feedback for v2 dashboard",
    date: "2026-03-08T14:30:00Z",
    body: "Hey, I reviewed the v2 dashboard mockups. Overall looks great! A few notes: the sidebar nav feels cluttered — maybe collapse secondary items by default. The new chart widgets are solid but could use a loading skeleton state. Also, the color contrast on the status badges doesn't meet WCAG AA. I've left detailed comments in Figma.",
    read: false,
    priority: "normal",
  },
];
