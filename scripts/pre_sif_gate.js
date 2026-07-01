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

function fieldValue(candidate, keys) {
  for (const key of keys) {
    if (hasText(candidate[key])) return candidate[key];
  }
  return "";
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
  const overScanned = candidate.category_over_scanned === true ||
    candidate.industry_over_scanned === true ||
    candidate.scanned_in_past_30_days === true ||
    Number(candidate.industry_scan_count_14d || 0) >= 3;
  const rejectedHit = candidate.rejected_history_hit === true || (keyword ? blacklistText.includes(keyword) : false);

  return [
    { key: "exact_fit_or_model_specific", pass: hasText(fit) || hasAny(replacementText, ["exact-fit", "model-specific", "part number", "compatible with"]) },
    { key: "clear_replacement_or_consumable_use", pass: hasAny(replacementText, ["repair", "replacement", "replace", "install", "installation", "consumable", "wear part", "gasket", "belt", "seal", "strip", "latch", "strap", "tire", "filter"]) },
    { key: "non_generic_keyword", pass: !isGenericKeyword(keyword) },
    { key: "estimated_price_or_margin_potential", pass: hasText(price) || hasText(candidate.supply_notes) || hasText(candidate.estimated_price_or_margin_potential) },
    { key: "not_in_rejected_history", pass: keyword ? !rejectedHit : false },
    { key: "low_obvious_commodity_risk", pass: !hasAny(homogeneity, ["high", "commodity", "homogeneous", "same", "generic"]) && !isGenericKeyword(keyword) },
    { key: "category_not_over_scanned", pass: candidate.category_not_over_scanned === true || candidate.industry_frequency === "low" || candidate.industry_frequency === "unseen" || (!overScanned && hasText(candidate.industry_frequency)) }
  ];
}

function gateResult(candidate, blacklistText) {
  const required = requiredResults(candidate);
  const optional = optionalResults(candidate, blacklistText);
  const failedRequired = required.filter((item) => !item.pass).map((item) => item.key);
  const passedOptional = optional.filter((item) => item.pass).map((item) => item.key);
  const failedOptional = optional.filter((item) => !item.pass).map((item) => item.key);
  const passed = failedRequired.length === 0 && passedOptional.length >= 3;
  const reason = passed
    ? "Pre-SIF Gate passed: required fields present and optional threshold met"
    : failedRequired.length
      ? `Pre-SIF Gate failed: missing required fields (${failedRequired.join(", ")})`
      : `Pre-SIF Gate failed: optional threshold not met (${passedOptional.length}/7)`;

  return {
    passed,
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
  const blacklistText = [
    readText(path.join(process.cwd(), "knowledge", "rejected-keyword-blacklist.md")),
    readText(path.join(process.cwd(), "knowledge", "rejected.md")),
    readText(path.join(process.cwd(), "history", "exhausted.md"))
  ].join("\n");

  const passed = [];
  const rejected = [];

  for (const candidate of candidates) {
    const result = gateResult(candidate, blacklistText);
    const enriched = {
      ...candidate,
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
  isGenericKeyword
};
