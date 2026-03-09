import { describe, it, expect } from "vitest";
import { generateReport } from "./summarizer.js";
import type { Email } from "./emails.js";

function makeEmail(overrides: Partial<Email> = {}): Email {
  return {
    id: 1,
    from: "test@example.com",
    to: "you@example.com",
    subject: "Test Subject",
    date: "2026-03-09T10:00:00Z",
    body: "This is a test email body.",
    read: false,
    priority: "normal",
    ...overrides,
  };
}

describe("generateReport", () => {
  it("returns correct stats for an empty list", () => {
    const report = generateReport([]);
    expect(report.totalEmails).toBe(0);
    expect(report.unread).toBe(0);
    expect(report.highPriority).toBe(0);
    expect(report.summaries).toEqual([]);
  });

  it("counts totalEmails, unread, and highPriority correctly", () => {
    const emails = [
      makeEmail({ id: 1, read: false, priority: "high" }),
      makeEmail({ id: 2, read: true, priority: "normal" }),
      makeEmail({ id: 3, read: false, priority: "low" }),
      makeEmail({ id: 4, read: true, priority: "high" }),
    ];
    const report = generateReport(emails);
    expect(report.totalEmails).toBe(4);
    expect(report.unread).toBe(2);
    expect(report.highPriority).toBe(2);
  });

  it("includes a generatedAt ISO timestamp", () => {
    const report = generateReport([makeEmail()]);
    expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("sorting", () => {
  it("sorts emails by date descending (newest first)", () => {
    const emails = [
      makeEmail({ id: 1, date: "2026-03-07T10:00:00Z" }),
      makeEmail({ id: 2, date: "2026-03-09T10:00:00Z" }),
      makeEmail({ id: 3, date: "2026-03-08T10:00:00Z" }),
    ];
    const report = generateReport(emails);
    expect(report.summaries.map((s) => s.id)).toEqual([2, 3, 1]);
  });

  it("does not mutate the original array", () => {
    const emails = [
      makeEmail({ id: 1, date: "2026-03-07T10:00:00Z" }),
      makeEmail({ id: 2, date: "2026-03-09T10:00:00Z" }),
    ];
    generateReport(emails);
    expect(emails[0].id).toBe(1);
    expect(emails[1].id).toBe(2);
  });
});

describe("action detection", () => {
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

  for (const keyword of actionKeywords) {
    it(`flags actionRequired when body contains "${keyword}"`, () => {
      const email = makeEmail({ body: `Hello, ${keyword} do the thing.` });
      const report = generateReport([email]);
      expect(report.summaries[0].actionRequired).toBe(true);
    });
  }

  it("is case-insensitive", () => {
    const email = makeEmail({ body: "PLEASE do the thing." });
    const report = generateReport([email]);
    expect(report.summaries[0].actionRequired).toBe(true);
  });

  it("does not flag when no keywords are present", () => {
    const email = makeEmail({ body: "Just a friendly hello." });
    const report = generateReport([email]);
    expect(report.summaries[0].actionRequired).toBe(false);
  });
});

describe("one-liner summary", () => {
  it("extracts the first sentence", () => {
    const email = makeEmail({ body: "First sentence here. Second sentence." });
    const report = generateReport([email]);
    expect(report.summaries[0].oneLiner).toBe("First sentence here.");
  });

  it("truncates to 120 chars with ellipsis for long sentences", () => {
    const longSentence = "A".repeat(200) + ". Done.";
    const email = makeEmail({ body: longSentence });
    const report = generateReport([email]);
    const oneLiner = report.summaries[0].oneLiner;
    expect(oneLiner.length).toBe(120);
    expect(oneLiner.endsWith("...")).toBe(true);
  });

  it("keeps short sentences as-is with a period", () => {
    const email = makeEmail({ body: "Short." });
    const report = generateReport([email]);
    expect(report.summaries[0].oneLiner).toBe("Short.");
  });
});

describe("priority passthrough", () => {
  it.each(["low", "normal", "high"] as const)(
    "preserves %s priority from the email",
    (priority) => {
      const email = makeEmail({ priority });
      const report = generateReport([email]);
      expect(report.summaries[0].priority).toBe(priority);
    }
  );
});

describe("summary fields", () => {
  it("copies id, from, and subject from the email", () => {
    const email = makeEmail({
      id: 42,
      from: "alice@test.com",
      subject: "Important Thing",
    });
    const report = generateReport([email]);
    const summary = report.summaries[0];
    expect(summary.id).toBe(42);
    expect(summary.from).toBe("alice@test.com");
    expect(summary.subject).toBe("Important Thing");
  });
});
