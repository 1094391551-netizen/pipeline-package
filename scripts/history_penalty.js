#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function normalize(text) {
  return text.toLowerCase();
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const outDir = path.join(process.cwd(), "runs", today);
  fs.mkdirSync(outDir, { recursive: true });

  const historyText = [
    readIfExists(path.join(process.cwd(), "history", "exhausted.md")),
    readIfExists(path.join(process.cwd(), "knowledge", "rejected-keyword-blacklist.md")),
    readIfExists(path.join(process.cwd(), "knowledge", "category-coverage.md"))
  ].map(normalize).join("\n");

  const candidatesPath = path.join(outDir, "raw_candidates.json");
  const candidates = fs.existsSync(candidatesPath)
    ? JSON.parse(fs.readFileSync(candidatesPath, "utf8").replace(/^\uFEFF/, ""))
    : [];

  const skipped = [];
  const kept = [];

  for (const candidate of candidates) {
    const keyword = String(candidate.product_keyword || "").toLowerCase();
    if (keyword && historyText.includes(keyword)) {
      skipped.push({ ...candidate, skip_reason: "history keyword hit" });
    } else {
      kept.push(candidate);
    }
  }

  const report = [
    `# Skipped Due To History - ${today}`,
    "",
    `Skipped: ${skipped.length}`,
    `Kept: ${kept.length}`,
    "",
    ...skipped.map((item) => `- ${item.product_keyword || "(missing keyword)"}: ${item.skip_reason}`)
  ].join("\n");

  fs.writeFileSync(path.join(outDir, "skipped_due_to_history.md"), report);
  fs.writeFileSync(path.join(outDir, "history_filtered_candidates.json"), JSON.stringify(kept, null, 2));
  console.log(report);
}

main();
