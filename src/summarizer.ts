import type { Email } from "./emails.js";

interface EmailSummary {
  id: number;
  from: string;
  subject: string;
  oneLiner: string;
  priority: Email["priority"];
  actionRequired: boolean;
}

export interface Report {
  generatedAt: string;
  totalEmails: number;
  unread: number;
  highPriority: number;
  summaries: EmailSummary[];
}

function summarizeEmail(email: Email): EmailSummary {
  const actionKeywords = [
    "please",
    "can you",
    "could you",
    "schedule",
    "review",
    "check",
    "bring",
    "urgent",
    "need",
  ];
  const bodyLower = email.body.toLowerCase();
  const actionRequired = actionKeywords.some((kw) => bodyLower.includes(kw));

  // Extract a one-liner: first sentence, capped at 120 chars
  const firstSentence = email.body.split(/\.(?:\s|$)/)[0] + ".";
  const oneLiner =
    firstSentence.length <= 120
      ? firstSentence
      : firstSentence.slice(0, 117) + "...";

  return {
    id: email.id,
    from: email.from,
    subject: email.subject,
    oneLiner,
    priority: email.priority,
    actionRequired,
  };
}

export function generateReport(emails: Email[]): Report {
  const sorted = [...emails].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    generatedAt: new Date().toISOString(),
    totalEmails: emails.length,
    unread: emails.filter((e) => !e.read).length,
    highPriority: emails.filter((e) => e.priority === "high").length,
    summaries: sorted.map(summarizeEmail),
  };
}
