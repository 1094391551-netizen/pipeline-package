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
  if (Array.isArray(value)) return value.some((item) => hasText(item));
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

function isGenericKeyword(keyword) {
  const text = String(keyword || "").trim().toLowerCase();
  if (!text) return true;
  const words = text.split(/\s+/).filter(Boolean);
  const generic = new Set(["part", "parts", "replacement", "accessory", "accessories", "kit", "cover", "wheel", "adapter", "clip", "bracket"]);
  return words.length <= 1 || words.every((word) => generic.has(word));
}

function lowerText(value) {
  if (Array.isArray(value)) return value.map(lowerText).join(" ");
  if (value && typeof value === "object") return JSON.stringify(value).toLowerCase();
  return String(value || "").toLowerCase();
}

function hasAny(text, words) {
  const value = lowerText(text);
  return words.some((word) => value.includes(word));
}

function countMatches(text, pattern) {
  const matches = lowerText(text).match(pattern);
  return matches ? matches.length : 0;
}

function fieldValue(candidate, keys) {
  for (const key of keys) {
    if (hasText(candidate[key])) return candidate[key];
  }
  return "";
}

function priceUpperBound(value) {
  const nums = String(value || "").match(/\d+(?:\.\d+)?/g);
  if (!nums || !nums.length) return 0;
  return Math.max(...nums.map(Number));
}

function evidenceQuality(candidate) {
  const evidence = fieldValue(candidate, ["offsite_evidence", "evidence", "external_evidence"]);
  const text = lowerText(evidence);
  const reasons = [];

  if (!hasText(evidence)) {
    return { strength: "none", strong: false, weak: false, supply_only: false, reasons: ["missing offsite evidence"] };
  }

  const supplyOnly = /\b(alibaba|1688|supplier directory|factory quote|made-in-china)\b/.test(text);
  if (supplyOnly) reasons.push("supply evidence only");

  const strongPatterns = [
    ["ebay sold_or_completed", /\b(ebay sold|sold comps?|completed listings?|sold listings?)\b/],
    ["manual_or_diagram", /\b(parts manual|service manual|repair manual|exploded diagram|parts diagram)\b/],
    ["manufacturer_parts_page", /\b(manufacturer parts page|manufacturer parts|official parts page|oem parts page)\b/],
    ["independent_parts_store", /\b(independent (replacement )?parts store|replacement parts store|parts store|repair shop|mobility repair shop)\b/],
    ["repair_forum_thread", /\b(repair forum|forum thread|forums? .{0,40}(repair|replace|replacement|broken|worn|failure)|reddit .{0,40}(repair|replace|replacement|broken|worn|failure))\b/],
    ["youtube_repair_video", /\b(youtube repair|repair video|youtube .{0,40}(repair|replace|replacement|install))\b/]
  ];
  const weakPatterns = [
    ["plain_ebay_listing", /\bebay listings?\b/],
    ["plain_blog_or_guide", /\b(blog|guide|guides|installation guide|search result|search results|summary)\b/],
    ["social_content", /\b(pinterest|tiktok|instagram)\b/],
    ["compatible_without_repair_context", /\bcompatible\b/]
  ];

  const strongReasons = strongPatterns.filter(([, pattern]) => pattern.test(text)).map(([reason]) => reason);
  const weakReasons = weakPatterns.filter(([, pattern]) => pattern.test(text)).map(([reason]) => reason);
  reasons.push(...strongReasons, ...weakReasons);

  if (strongReasons.length && !supplyOnly) {
    return { strength: "strong", strong: true, weak: false, supply_only: false, reasons };
  }
  return {
    strength: supplyOnly && !strongReasons.length ? "supply_only" : "weak",
    strong: false,
    weak: true,
    supply_only: supplyOnly,
    reasons: reasons.length ? reasons : ["offsite evidence present but not demand-strong"]
  };
}

function normalizeCategory(value) {
  return String(value || "").trim().toLowerCase();
}

function extractDateFromPath(file) {
  const match = String(file).match(/(20\d{2})[-_](\d{2})[-_](\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function daysBetween(a, b) {
  const start = new Date(`${a}T00:00:00Z`);
  const end = new Date(`${b}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.floor((end - start) / 86400000);
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full));
    } else if (/\.(md|json|txt)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function parseCoverageLists(text) {
  const lower = lowerText(text);
  const high = new Set();
  const low = new Set();
  let section = "";
  for (const line of lower.split(/\r?\n/)) {
    if (line.startsWith("## high-frequency")) section = "high";
    else if (line.startsWith("## low-frequency")) section = "low";
    else if (line.startsWith("## ")) section = "";
    const item = line.match(/^\s*-\s+(.+?)\s*$/);
    if (item && section === "high") high.add(normalizeCategory(item[1]));
    if (item && section === "low") low.add(normalizeCategory(item[1]));
  }
  return { high, low };
}

function buildCategoryHistory(options = {}) {
  const root = options.root || process.cwd();
  const today = options.today || new Date().toISOString().slice(0, 10);
  const exclude = new Set((options.excludeFiles || []).map((file) => path.resolve(file)));
  const dirs = ["runs", "opportunities", "rejected", "watchlist"].map((name) => path.join(root, name));
  const files = dirs.flatMap(listFiles).filter((file) => !exclude.has(path.resolve(file)));
  const coveragePath = path.join(root, "knowledge", "category-coverage.md");
  const coverageText = readText(coveragePath);
  const coverage = parseCoverageLists(coverageText);
  const datedTexts = [];
  let undatedText = coverageText;

  for (const file of files) {
    const text = readText(file);
    const date = extractDateFromPath(file);
    if (date) {
      datedTexts.push({ date, text });
    } else {
      undatedText += `\n${text}`;
    }
  }

  return {
    today,
    has_history: Boolean(coverageText.trim() || datedTexts.length || undatedText.trim()),
    coverage_high: coverage.high,
    coverage_low: coverage.low,
    datedTexts,
    undatedText
  };
}

function categoryScanResult(candidate, history) {
  const category = normalizeCategory(candidate.industry || candidate.category || candidate.market || "");
  if (!category) {
    return { value: "unknown", category, count_14d: 0, count_30d: 0, category_scan_frequency: "unknown", category_penalty_reason: "missing category" };
  }
  if (!history || !history.has_history) {
    return { value: "unknown", category, count_14d: 0, count_30d: 0, category_scan_frequency: "unknown", category_penalty_reason: "history unavailable" };
  }

  const pattern = new RegExp(`\\b${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
  let count14 = countMatches(history.undatedText, pattern);
  let count30 = countMatches(history.undatedText, pattern);

  for (const item of history.datedTexts) {
    const age = daysBetween(item.date, history.today);
    if (age === null || age < 0) continue;
    const count = countMatches(item.text, pattern);
    if (age <= 14) count14 += count;
    if (age <= 30) count30 += count;
  }

  if (history.coverage_high.has(category) || count14 >= 4) {
    return {
      value: false,
      category,
      count_14d: count14,
      count_30d: count30,
      category_scan_frequency: "high_14d",
      category_penalty_reason: history.coverage_high.has(category) ? "listed as high-frequency category" : `seen ${count14} times in the last 14 days`
    };
  }
  if (history.coverage_low.has(category) || count30 <= 1) {
    return {
      value: true,
      category,
      count_14d: count14,
      count_30d: count30,
      category_scan_frequency: count30 === 0 ? "unseen_30d" : "low_30d",
      category_penalty_reason: history.coverage_low.has(category) ? "listed as low-frequency category" : `seen ${count30} times in the last 30 days`
    };
  }
  return {
    value: "unknown",
    category,
    count_14d: count14,
    count_30d: count30,
    category_scan_frequency: "medium_or_unknown",
    category_penalty_reason: `seen ${count14} times in 14 days and ${count30} times in 30 days`
  };
}

function requiredResults(candidate) {
  return [
    {
      key: "pain_point",
      pass: hasText(fieldValue(candidate, ["pain_point", "repair_pain", "problem"]))
    },
    {
      key: "amazon_asin_or_link",
      pass: hasText(fieldValue(candidate, ["amazon_asin_or_link", "amazon", "asin", "target_asin_or_link"]))
    },
    {
      key: "offsite_evidence",
      pass: hasText(fieldValue(candidate, ["offsite_evidence", "evidence", "external_evidence"]))
    }
  ];
}

function optionalResults(candidate, blacklistText) {
  const keyword = String(candidate.product_keyword || candidate.keyword || "").toLowerCase();
  const pain = candidate.pain_point || candidate.repair_pain || candidate.problem;
  const fit = fieldValue(candidate, ["exact_fit_or_model_specific", "model", "compatibility", "part_number", "exact_fit_signal"]);
  const price = candidate.price || candidate.price_band || candidate.margin_note || candidate.profit_note;
  const replacementText = [keyword, pain, candidate.use_case, candidate.recommended_action].map(lowerText).join(" ");
  const homogeneity = lowerText(candidate.homogeneity_judgment || candidate.commodity_risk || "");
  const categoryValue = candidate.category_not_over_scanned;
  const categoryNeutral = categoryValue === "unknown" || candidate.category_scan_frequency === "unknown" || candidate.category_scan_frequency === "medium_or_unknown";
  const rejectedHit = candidate.rejected_history_hit === true || (keyword ? blacklistText.includes(keyword) : false);

  return [
    { key: "exact_fit_or_model_specific", pass: hasText(fit) && !hasAny(fit, ["generic", "universal", "not model-specific"]) || hasAny(replacementText, ["exact-fit", "model-specific", "part number", "compatible with"]) },
    { key: "clear_replacement_or_consumable_use", pass: hasAny(replacementText, ["repair", "replacement", "replace", "install", "installation", "consumable", "wear part", "gasket", "belt", "seal", "strip", "latch", "strap", "tire", "filter"]) },
    { key: "non_generic_keyword", pass: !isGenericKeyword(keyword) },
    { key: "estimated_price_or_margin_potential", pass: priceUpperBound(price) >= 25 || hasAny(price, ["margin", "profit", "high value"]) || hasText(candidate.estimated_price_or_margin_potential) },
    { key: "not_in_rejected_history", pass: keyword ? !rejectedHit : false },
    { key: "low_obvious_commodity_risk", pass: !hasAny(homogeneity, ["high", "commodity", "homogeneous", "same", "generic"]) && !isGenericKeyword(keyword) },
    { key: "category_not_over_scanned", pass: categoryValue === true, neutral: categoryNeutral || categoryValue === undefined }
  ];
}

function gateResult(candidate, blacklistText, categoryHistory) {
  const evidence = evidenceQuality(candidate);
  const category = categoryScanResult(candidate, categoryHistory);
  const candidateWithCategory = {
    ...candidate,
    category_not_over_scanned: category.value,
    industry_frequency: category.value === true ? "low" : candidate.industry_frequency
  };
  const required = requiredResults(candidate);
  const optional = optionalResults(candidateWithCategory, blacklistText);
  const failedRequired = required.filter((item) => !item.pass).map((item) => item.key);
  const passedOptional = optional.filter((item) => item.pass).map((item) => item.key);
  const neutralOptional = optional.filter((item) => !item.pass && item.neutral).map((item) => item.key);
  const failedOptional = optional.filter((item) => !item.pass && !item.neutral).map((item) => item.key);
  const hasCoreOptional = passedOptional.includes("exact_fit_or_model_specific") || passedOptional.includes("clear_replacement_or_consumable_use");
  const highFrequencyWeakLowValue = category.value === false && !evidence.strong && !passedOptional.includes("estimated_price_or_margin_potential");
  const passed = failedRequired.length === 0 && passedOptional.length >= 4 && hasCoreOptional && !highFrequencyWeakLowValue;
  const reason = passed
    ? "Pre-SIF Gate passed: required fields present and optional threshold met"
    : failedRequired.length
      ? `Pre-SIF Gate failed: missing required fields (${failedRequired.join(", ")})`
      : !hasCoreOptional
        ? "Pre-SIF Gate failed: neither exact-fit nor clear replacement/consumable signal was present"
        : highFrequencyWeakLowValue
          ? "Pre-SIF Gate failed: high-frequency category with weak offsite evidence and low price/margin signal"
        : `Pre-SIF Gate failed: optional threshold not met (${passedOptional.length}/7; needs 4)`;

  return {
    passed,
    evidence,
    category,
    required,
    optional,
    failedRequired,
    passedOptional,
    failedOptional,
    reason
  };
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
  const categoryHistory = buildCategoryHistory({ root: process.cwd(), today, excludeFiles: [input, passOut, rejectOut] });
  const blacklistText = [
    readText(path.join(process.cwd(), "knowledge", "rejected-keyword-blacklist.md")),
    readText(path.join(process.cwd(), "knowledge", "rejected.md")),
    readText(path.join(process.cwd(), "history", "exhausted.md"))
  ].join("\n");

  const passed = [];
  const rejected = [];

  for (const candidate of candidates) {
    const result = gateResult(candidate, blacklistText, categoryHistory);
    const enriched = {
      ...candidate,
      strong_offsite_evidence: result.evidence.strong,
      weak_offsite_evidence: result.evidence.weak,
      offsite_evidence_strength: result.evidence.strength,
      offsite_evidence_reasons: result.evidence.reasons,
      category_not_over_scanned: result.category.value === true,
      category_scan_frequency: result.category.category_scan_frequency,
      category_penalty_reason: result.category.category_penalty_reason,
      category_scan_count_14d: result.category.count_14d,
      category_scan_count_30d: result.category.count_30d,
      pre_sif_passed: result.passed,
      pre_sif_status: result.passed ? "passed" : "failed",
      pre_sif_required_fields_passed: result.required.filter((item) => item.pass).map((item) => item.key),
      pre_sif_failed_required_fields: result.failedRequired,
      pre_sif_pass_count: result.passedOptional.length,
      pre_sif_passed_optional_fields: result.passedOptional,
      pre_sif_failed_optional_fields: result.failedOptional
    };

    if (result.passed) {
      passed.push(enriched);
    } else {
      rejected.push({
        ...enriched,
        ai_recommendation: "C",
        rejection_reason: result.reason,
        can_recheck_after_days: result.failedRequired.length ? 14 : 7
      });
    }
  }

  fs.writeFileSync(passOut, JSON.stringify(passed, null, 2));

  const lines = [
    "# Pre-SIF Rejected",
    "",
    `Updated: ${today}`,
    "",
    "| Candidate | Failed required fields | Failed optional fields | Reason | Can recheck after days |",
    "|---|---|---|---|---:|",
    ...rejected.map((item) => {
      const keyword = item.product_keyword || item.keyword || "";
      return `| ${keyword} | ${item.pre_sif_failed_required_fields.join(", ") || "-"} | ${item.pre_sif_failed_optional_fields.join(", ") || "-"} | ${item.rejection_reason} | ${item.can_recheck_after_days} |`;
    })
  ];

  fs.writeFileSync(rejectOut, lines.join("\n"));
  console.log(JSON.stringify({ input, passed: passed.length, rejected: rejected.length, passOut, rejectOut }, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  gateResult,
  isGenericKeyword,
  evidenceQuality,
  buildCategoryHistory,
  categoryScanResult,
  priceUpperBound
};
