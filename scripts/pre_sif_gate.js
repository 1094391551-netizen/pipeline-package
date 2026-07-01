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

function readText(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").toLowerCase() : "";
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isGenericKeyword(keyword) {
  const text = String(keyword || "").trim().toLowerCase();
  if (!text) return true;
  const words = text.split(/\s+/).filter(Boolean);
  const generic = new Set(["part", "parts", "replacement", "accessory", "accessories", "kit", "cover", "wheel", "adapter", "clip", "bracket"]);
  return words.length <= 1 || words.every((word) => generic.has(word));
}

function conditionResults(candidate, blacklistText) {
  const keyword = String(candidate.product_keyword || candidate.keyword || "").toLowerCase();
  const pain = candidate.pain_point || candidate.repair_pain || candidate.problem;
  const fit = candidate.exact_fit_or_model_specific || candidate.model || candidate.compatibility;
  const asin = candidate.amazon_asin_or_link || candidate.amazon || candidate.asin;
  const evidence = candidate.offsite_evidence || candidate.evidence;
  const price = candidate.price || candidate.price_band || candidate.margin_note || candidate.profit_note;

  return [
    { key: "pain_point", pass: hasText(pain) },
    { key: "specific_equipment_model_brand_or_scene", pass: hasText(fit) || hasText(candidate.industry) },
    { key: "amazon_asin_or_competitor_link", pass: hasText(asin) },
    { key: "offsite_evidence", pass: hasText(evidence) },
    { key: "not_generic_keyword", pass: !isGenericKeyword(keyword) },
    { key: "price_or_margin_feasible", pass: hasText(price) || hasText(candidate.supply_notes) },
    { key: "not_in_rejected_blacklist", pass: keyword ? !blacklistText.includes(keyword) : false }
  ];
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const runDir = argValue("run-dir", path.join(process.cwd(), "runs", today));
  const input = argValue("input", path.join(runDir, "raw_candidates.json"));
  const passOut = argValue("pass-out", path.join(runDir, "pre_sif_candidates.json"));
  const rejectOut = argValue("reject-out", path.join(process.cwd(), "rejected", "pre_sif_rejected.md"));

  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(path.dirname(rejectOut), { recursive: true });

  const candidates = readJson(input, []);
  const blacklistText = [
    readText(path.join(process.cwd(), "knowledge", "rejected-keyword-blacklist.md")),
    readText(path.join(process.cwd(), "knowledge", "rejected.md")),
    readText(path.join(process.cwd(), "history", "exhausted.md"))
  ].join("\n");

  const passed = [];
  const rejected = [];

  for (const candidate of candidates) {
    const conditions = conditionResults(candidate, blacklistText);
    const passedConditions = conditions.filter((item) => item.pass).map((item) => item.key);
    const failedConditions = conditions.filter((item) => !item.pass).map((item) => item.key);
    const enriched = {
      ...candidate,
      pre_sif_pass_count: passedConditions.length,
      pre_sif_passed_conditions: passedConditions,
      pre_sif_failed_conditions: failedConditions
    };

    if (passedConditions.length >= 3) {
      passed.push(enriched);
    } else {
      rejected.push({
        ...enriched,
        ai_recommendation: "C",
        rejection_reason: `Pre-SIF Gate failed: ${passedConditions.length}/7 conditions passed`
      });
    }
  }

  fs.writeFileSync(passOut, JSON.stringify(passed, null, 2));

  const lines = [
    "# Pre-SIF Rejected",
    "",
    `Updated: ${today}`,
    "",
    "| Product keyword | Industry | Pass count | Failed conditions | Reason |",
    "|---|---|---:|---|---|",
    ...rejected.map((item) => {
      const keyword = item.product_keyword || item.keyword || "";
      const industry = item.industry || "";
      return `| ${keyword} | ${industry} | ${item.pre_sif_pass_count}/7 | ${item.pre_sif_failed_conditions.join(", ")} | ${item.rejection_reason} |`;
    })
  ];

  fs.writeFileSync(rejectOut, lines.join("\n"));
  console.log(JSON.stringify({ input, passed: passed.length, rejected: rejected.length, passOut, rejectOut }, null, 2));
}

main();
