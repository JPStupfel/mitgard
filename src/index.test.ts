import { describe, it, expect } from "vitest";
import { formatReport } from "./index.js";
import type { Report } from "./summarizer.js";

function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    generatedAt: "2026-03-09T10:00:00.000Z",
    totalEmails: 1,
    unread: 1,
    highPriority: 0,
    summaries: [
      {
        id: 1,
        from: "alice@test.com",
        subject: "Test Subject",
        oneLiner: "This is a test.",
        priority: "normal",
        actionRequired: false,
      },
    ],
    ...overrides,
  };
}

describe("formatReport", () => {
  it("includes the report header", () => {
    const output = formatReport(makeReport());
    expect(output).toContain("EMAIL SUMMARIZATION REPORT");
  });

  it("shows stats line with total, unread, and high priority", () => {
    const output = formatReport(
      makeReport({ totalEmails: 5, unread: 3, highPriority: 2 })
    );
    expect(output).toContain("Total: 5");
    expect(output).toContain("Unread: 3");
    expect(output).toContain("High Priority: 2");
  });

  it("shows generatedAt timestamp", () => {
    const output = formatReport(makeReport());
    expect(output).toContain("2026-03-09T10:00:00.000Z");
  });

  it("displays subject, from, and summary for each email", () => {
    const output = formatReport(makeReport());
    expect(output).toContain("Test Subject");
    expect(output).toContain("From: alice@test.com");
    expect(output).toContain("Summary: This is a test.");
  });

  it("shows [HIGH] flag for high priority emails", () => {
    const report = makeReport({
      summaries: [
        {
          id: 1,
          from: "a@b.com",
          subject: "Urgent",
          oneLiner: "Fix now.",
          priority: "high",
          actionRequired: false,
        },
      ],
    });
    const output = formatReport(report);
    expect(output).toContain("[HIGH]");
  });

  it("shows [ACTION] flag for action-required emails", () => {
    const report = makeReport({
      summaries: [
        {
          id: 1,
          from: "a@b.com",
          subject: "Review",
          oneLiner: "Please review.",
          priority: "normal",
          actionRequired: true,
        },
      ],
    });
    const output = formatReport(report);
    expect(output).toContain("[ACTION]");
    expect(output).not.toContain("[HIGH]");
  });

  it("shows both [HIGH] and [ACTION] flags together", () => {
    const report = makeReport({
      summaries: [
        {
          id: 1,
          from: "a@b.com",
          subject: "Urgent Review",
          oneLiner: "Fix now.",
          priority: "high",
          actionRequired: true,
        },
      ],
    });
    const output = formatReport(report);
    expect(output).toContain("[HIGH] [ACTION]");
  });

  it("shows no flags for low priority non-action emails", () => {
    const report = makeReport({
      summaries: [
        {
          id: 1,
          from: "a@b.com",
          subject: "FYI",
          oneLiner: "Just info.",
          priority: "low",
          actionRequired: false,
        },
      ],
    });
    const output = formatReport(report);
    expect(output).not.toContain("[HIGH]");
    expect(output).not.toContain("[ACTION]");
  });
});
