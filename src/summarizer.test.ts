import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Email } from "./emails.js";

// Mock the Anthropic SDK before importing summarizer
vi.mock("@anthropic-ai/sdk", () => {
  const createMock = vi.fn();
  return {
    default: class Anthropic {
      messages = { create: createMock };
    },
    __createMock: createMock,
  };
});

// Access the shared mock — use type assertion to bypass module type
const { __createMock: createMock } = (await import("@anthropic-ai/sdk")) as any;
const { generateReport } = await import("./summarizer.js");

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

function mockClaude(response: {
  oneLiner: string;
  priority: string;
  actionRequired: boolean;
}) {
  (createMock as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    content: [{ type: "text", text: JSON.stringify(response) }],
  });
}

beforeEach(() => {
  (createMock as ReturnType<typeof vi.fn>).mockReset();
});

describe("generateReport", () => {
  it("returns correct stats for an empty list", async () => {
    const report = await generateReport([]);
    expect(report.totalEmails).toBe(0);
    expect(report.unread).toBe(0);
    expect(report.highPriority).toBe(0);
    expect(report.summaries).toEqual([]);
  });

  it("counts totalEmails and unread correctly", async () => {
    const emails = [
      makeEmail({ id: 1, read: false, priority: "high" }),
      makeEmail({ id: 2, read: true, priority: "normal" }),
      makeEmail({ id: 3, read: false, priority: "low" }),
      makeEmail({ id: 4, read: true, priority: "high" }),
    ];
    for (const e of emails) {
      mockClaude({
        oneLiner: "Summary.",
        priority: e.priority,
        actionRequired: false,
      });
    }
    const report = await generateReport(emails);
    expect(report.totalEmails).toBe(4);
    expect(report.unread).toBe(2);
  });

  it("counts highPriority based on AI response", async () => {
    const emails = [
      makeEmail({ id: 1 }),
      makeEmail({ id: 2 }),
    ];
    // AI decides first is high, second is normal
    mockClaude({ oneLiner: "Urgent.", priority: "high", actionRequired: true });
    mockClaude({ oneLiner: "Info.", priority: "normal", actionRequired: false });
    const report = await generateReport(emails);
    expect(report.highPriority).toBe(1);
  });

  it("includes a generatedAt ISO timestamp", async () => {
    mockClaude({ oneLiner: "Test.", priority: "normal", actionRequired: false });
    const report = await generateReport([makeEmail()]);
    expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("sorting", () => {
  it("sorts emails by date descending (newest first)", async () => {
    const emails = [
      makeEmail({ id: 1, date: "2026-03-07T10:00:00Z" }),
      makeEmail({ id: 2, date: "2026-03-09T10:00:00Z" }),
      makeEmail({ id: 3, date: "2026-03-08T10:00:00Z" }),
    ];
    for (const _e of emails) {
      mockClaude({ oneLiner: "Summary.", priority: "normal", actionRequired: false });
    }
    const report = await generateReport(emails);
    expect(report.summaries.map((s) => s.id)).toEqual([2, 3, 1]);
  });

  it("does not mutate the original array", async () => {
    const emails = [
      makeEmail({ id: 1, date: "2026-03-07T10:00:00Z" }),
      makeEmail({ id: 2, date: "2026-03-09T10:00:00Z" }),
    ];
    for (const _e of emails) {
      mockClaude({ oneLiner: "Summary.", priority: "normal", actionRequired: false });
    }
    await generateReport(emails);
    expect(emails[0].id).toBe(1);
    expect(emails[1].id).toBe(2);
  });
});

describe("AI-powered analysis", () => {
  it("uses Claude response for oneLiner", async () => {
    mockClaude({
      oneLiner: "Budget review meeting Thursday at 2pm.",
      priority: "high",
      actionRequired: true,
    });
    const report = await generateReport([makeEmail()]);
    expect(report.summaries[0].oneLiner).toBe(
      "Budget review meeting Thursday at 2pm."
    );
  });

  it("uses Claude response for priority assessment", async () => {
    mockClaude({
      oneLiner: "Newsletter roundup.",
      priority: "low",
      actionRequired: false,
    });
    const email = makeEmail({ priority: "normal" });
    const report = await generateReport([email]);
    // AI can reassess priority differently from the original
    expect(report.summaries[0].priority).toBe("low");
  });

  it("uses Claude response for action detection", async () => {
    mockClaude({
      oneLiner: "Please review the dashboard mockups.",
      priority: "normal",
      actionRequired: true,
    });
    const report = await generateReport([makeEmail()]);
    expect(report.summaries[0].actionRequired).toBe(true);
  });

  it("preserves id, from, and subject from the original email", async () => {
    mockClaude({
      oneLiner: "Summary.",
      priority: "normal",
      actionRequired: false,
    });
    const email = makeEmail({
      id: 42,
      from: "alice@test.com",
      subject: "Important Thing",
    });
    const report = await generateReport([email]);
    const summary = report.summaries[0];
    expect(summary.id).toBe(42);
    expect(summary.from).toBe("alice@test.com");
    expect(summary.subject).toBe("Important Thing");
  });

  it("calls Claude API for each email", async () => {
    const emails = [
      makeEmail({ id: 1 }),
      makeEmail({ id: 2 }),
      makeEmail({ id: 3 }),
    ];
    for (const _e of emails) {
      mockClaude({ oneLiner: "Summary.", priority: "normal", actionRequired: false });
    }
    await generateReport(emails);
    expect(createMock).toHaveBeenCalledTimes(3);
  });
});
