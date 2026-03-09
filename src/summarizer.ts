import Anthropic from "@anthropic-ai/sdk";
import type { Email } from "./emails.js";

export interface EmailSummary {
  id: number;
  from: string;
  subject: string;
  oneLiner: string;
  priority: "low" | "normal" | "high";
  actionRequired: boolean;
}

export interface Report {
  generatedAt: string;
  totalEmails: number;
  unread: number;
  highPriority: number;
  summaries: EmailSummary[];
}

const client = new Anthropic();

async function summarizeEmail(email: Email): Promise<EmailSummary> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Analyze this email and return a JSON object with exactly these fields:
- "oneLiner": a concise one-sentence summary (max 120 chars)
- "priority": reassess priority as "low", "normal", or "high" based on content urgency
- "actionRequired": boolean, true if the recipient needs to do something

Email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Respond with ONLY valid JSON, no markdown fences or extra text.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(text);

  return {
    id: email.id,
    from: email.from,
    subject: email.subject,
    oneLiner: parsed.oneLiner,
    priority: parsed.priority,
    actionRequired: parsed.actionRequired,
  };
}

export async function generateReport(emails: Email[]): Promise<Report> {
  const sorted = [...emails].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const summaries = await Promise.all(sorted.map(summarizeEmail));

  return {
    generatedAt: new Date().toISOString(),
    totalEmails: emails.length,
    unread: emails.filter((e) => !e.read).length,
    highPriority: summaries.filter((s) => s.priority === "high").length,
    summaries,
  };
}
