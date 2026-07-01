#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function argValue(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function pct(n, d) {
  return d ? `${Math.round((n / d) * 100)}%` : "0%";
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const input = argValue("input", path.join(process.cwd(), "runs", today, "scored_candidates.json"));
  const output = argValue("output", path.join(process.cwd(), "knowledge", "category-coverage.md"));
  const candidates = readJson(input, []);

  const stats = new Map();
  for (const candidate of candidates) {
    const industry = candidate.industry || "unknown";
    const current = stats.get(industry) || { total: 0, sifPass: 0, watch: 0, reject: 0 };
    current.total += 1;
    if (candidate.recommended_action === "PASS_TO_SIF") current.sifPass += 1;
    if (candidate.ai_recommendation === "B" || candidate.human_decision === "WATCH") current.watch += 1;
    if (candidate.ai_recommendation === "C" || candidate.human_decision === "KILL") current.reject += 1;
    stats.set(industry, current);
  }

  const rows = [...stats.entries()].sort((a, b) => b[1].total - a[1].total);
  const high = rows.filter(([, item]) => item.total >= 3).map(([industry]) => industry);
  const low = rows.filter(([, item]) => item.total <= 1).map(([industry]) => industry);

  const lines = [
    "# Category Coverage",
    "",
    `Updated: ${today}`,
    "",
    "## Past 7 Days Scanned Industries",
    "",
    rows.length ? rows.map(([industry]) => `- ${industry}`).join("\n") : "- No scored candidates found.",
    "",
    "## Past 30 Days Scanned Industries",
    "",
    rows.length ? rows.map(([industry]) => `- ${industry}`).join("\n") : "- No scored candidates found.",
    "",
    "## High-Frequency Industries",
    "",
    high.length ? high.map((industry) => `- ${industry}`).join("\n") : "- None in current scored set.",
    "",
    "## Low-Frequency Industries",
    "",
    low.length ? low.map((industry) => `- ${industry}`).join("\n") : "- None in current scored set.",
    "",
    "## Industry Rates",
    "",
    "| Industry | Total | SIF pass rate | WATCH rate | REJECT rate |",
    "|---|---:|---:|---:|---:|",
    ...rows.map(([industry, item]) => `| ${industry} | ${item.total} | ${pct(item.sifPass, item.total)} | ${pct(item.watch, item.total)} | ${pct(item.reject, item.total)} |`),
    "",
    "## Suggested Next Industries",
    "",
    "- aquarium",
    "- vending machine",
    "- sewing machine",
    "- garage tools",
    "- photo/video equipment",
    "- musical instruments",
    "- pool/spa",
    "- packaging equipment"
  ];

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, lines.join("\n"));
  console.log(JSON.stringify({ input, output, industries: rows.length }, null, 2));
}

main();
