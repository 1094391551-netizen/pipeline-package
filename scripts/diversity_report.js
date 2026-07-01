#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const runDir = path.join(process.cwd(), "runs", today);
  const candidatesPath = path.join(runDir, "history_filtered_candidates.json");
  const candidates = fs.existsSync(candidatesPath)
    ? JSON.parse(fs.readFileSync(candidatesPath, "utf8"))
    : [];

  const byIndustry = new Map();
  for (const candidate of candidates) {
    const industry = candidate.industry || "unknown";
    byIndustry.set(industry, (byIndustry.get(industry) || 0) + 1);
  }

  const lines = [
    "# Diversity Report",
    "",
    `Date: ${today}`,
    `Total candidates: ${candidates.length}`,
    "",
    "## Industry Counts",
    "",
    ...[...byIndustry.entries()].sort((a, b) => b[1] - a[1]).map(([industry, count]) => `- ${industry}: ${count}`),
    "",
    "## Rules",
    "",
    "- Known categories max 40%.",
    "- Adjacent categories 30%.",
    "- Random new industries 30%.",
    "- No same primary industry on consecutive days.",
    "- Recent rejected keywords are skipped by default."
  ];

  fs.mkdirSync(path.join(process.cwd(), "reports"), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), "reports", "diversity-report.md"), lines.join("\n"));
  console.log(lines.join("\n"));
}

main();

