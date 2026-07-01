#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function argValue(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const runDir = path.join(process.cwd(), "runs", today);
  const output = argValue("output", path.join(process.cwd(), "reports", "diversity-report.md"));
  const scoredPath = path.join(runDir, "scored_candidates.json");
  const filteredPath = path.join(runDir, "history_filtered_candidates.json");
  const candidatesPath = fs.existsSync(scoredPath) ? scoredPath : filteredPath;
  const candidates = fs.existsSync(candidatesPath)
    ? JSON.parse(fs.readFileSync(candidatesPath, "utf8").replace(/^\uFEFF/, ""))
    : [];

  const byIndustry = new Map();
  const byGrade = new Map();
  let supplyTotal = 0;
  let riskTotal = 0;
  let scoredCount = 0;
  let differentiated = 0;

  for (const candidate of candidates) {
    const industry = candidate.industry || "unknown";
    byIndustry.set(industry, (byIndustry.get(industry) || 0) + 1);
    const grade = candidate.ai_recommendation || "ungraded";
    byGrade.set(grade, (byGrade.get(grade) || 0) + 1);
    if (typeof candidate.supply_score === "number") {
      supplyTotal += candidate.supply_score;
      scoredCount += 1;
    }
    if (typeof candidate.risk_score === "number") {
      riskTotal += candidate.risk_score;
    }
    if (Array.isArray(candidate.differentiation_paths) && candidate.differentiation_paths.length > 0) {
      differentiated += 1;
    }
  }

  const average = (total, count) => (count ? Math.round(total / count) : 0);

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
    "## Quality Gates",
    "",
    `- A/B/C mix: ${[...byGrade.entries()].map(([grade, count]) => `${grade}=${count}`).join(", ") || "none"}`,
    `- Supply score average: ${average(supplyTotal, scoredCount)}`,
    `- Risk score average: ${average(riskTotal, scoredCount)}`,
    `- Differentiation coverage: ${candidates.length ? Math.round((differentiated / candidates.length) * 100) : 0}%`,
    "",
    "## Rules",
    "",
    "- Known categories max 40%.",
    "- Adjacent categories 30%.",
    "- Random new industries 30%.",
    "- No same primary industry on consecutive days.",
    "- Recent rejected keywords are skipped by default."
  ];

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, lines.join("\n"));
  console.log(lines.join("\n"));
}

main();
