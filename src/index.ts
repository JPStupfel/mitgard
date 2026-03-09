import { mockEmails } from "./emails.js";
import { generateReport, type Report } from "./summarizer.js";

export function formatReport(report: Report): string {
  const lines: string[] = [];

  lines.push("=".repeat(60));
  lines.push("  EMAIL SUMMARIZATION REPORT");
  lines.push("=".repeat(60));
  lines.push(`  Generated: ${report.generatedAt}`);
  lines.push(
    `  Total: ${report.totalEmails}  |  Unread: ${report.unread}  |  High Priority: ${report.highPriority}`
  );
  lines.push("=".repeat(60));

  for (const s of report.summaries) {
    const flags = [
      s.priority === "high" ? "[HIGH]" : null,
      s.actionRequired ? "[ACTION]" : null,
    ]
      .filter(Boolean)
      .join(" ");

    lines.push("");
    lines.push(`  ${flags ? flags + " " : ""}${s.subject}`);
    lines.push(`  From: ${s.from}`);
    lines.push(`  Summary: ${s.oneLiner}`);
    lines.push("-".repeat(60));
  }

  return lines.join("\n");
}

async function main() {
  console.log("\nAnalyzing emails with Claude...\n");

  const report = await generateReport(mockEmails);
  console.log(formatReport(report));
}

if (process.argv[1] && !process.argv[1].includes("vitest")) {
  main();
}
