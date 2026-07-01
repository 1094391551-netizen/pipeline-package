#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function argValue(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

function readJson(file, fallback) {
  if (!file || !fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function hasText(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

function keyword(candidate) {
  return String(candidate.product_keyword || candidate.keyword || "").trim().toLowerCase();
}

function isGenericKeyword(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return true;
  const words = text.split(/\s+/).filter(Boolean);
  const generic = new Set(["part", "parts", "replacement", "accessory", "accessories", "kit", "cover", "wheel", "adapter", "clip", "bracket"]);
  return words.length <= 1 || words.every((word) => generic.has(word));
}

function hasDemandEvidence(candidate) {
  const sifCount = Number(candidate.sif_established_count || 0) ||
    ["root_established", "demand_established", "competition_established"].filter((key) => candidate[key] === true).length;
  return candidate.has_sif_history === true && sifCount >= 2 ||
    candidate.asin_reverse_evidence === true ||
    hasText(candidate.asin_reverse_traffic) ||
    hasText(candidate.target_asin_traffic) ||
    hasText(candidate.amazon_bought_velocity) ||
    hasText(candidate.review_velocity) ||
    hasText(candidate.sales_velocity) ||
    hasText(candidate.stable_demand_signal);
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const runDir = argValue("run-dir", path.join(process.cwd(), "runs", today));
  const scoredPath = argValue("input", argValue("scored", path.join(runDir, "scored_candidates.json")));
  const rawPath = argValue("raw", path.join(runDir, "raw_candidates.json"));
  const preSifPath = argValue("pre-sif", path.join(runDir, "pre_sif_candidates.json"));
  const watchlistPath = argValue("watchlist", path.join(process.cwd(), "watchlist", `${today}.md`));
  const overflowPath = argValue("overflow", path.join(process.cwd(), "rejected", "overflow_rejected.md"));

  const scored = readJson(scoredPath, []);
  const raw = readJson(rawPath, []);
  const preSif = readJson(preSifPath, []);

  const failures = [];
  const warnings = [];
  const totalForPassRate = raw.length || scored.length;
  const preSifPassRate = totalForPassRate ? preSif.length / totalForPassRate : 0;
  const aCandidates = scored.filter((candidate) => candidate.ai_recommendation === "A" || candidate.gate_status === "A");
  const aRate = scored.length ? aCandidates.length / scored.length : 0;
  const gradeCounts = scored.reduce((acc, candidate) => {
    const grade = candidate.ai_recommendation || "unknown";
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});
  const statusCounts = scored.reduce((acc, candidate) => {
    const status = candidate.gate_status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  if (raw.length >= 10 && (preSifPassRate < 0.4 || preSifPassRate > 0.75)) {
    failures.push(`Pre-SIF pass rate outside target 40%-75%: ${(preSifPassRate * 100).toFixed(1)}%`);
  }
  if (scored.length >= 10 && aRate > 0.25) {
    failures.push(`A-class ratio too high: ${(aRate * 100).toFixed(1)}%`);
  }

  for (const candidate of scored) {
    const name = keyword(candidate);
    if (isGenericKeyword(name) && candidate.gate_status !== "C") {
      failures.push(`Generic keyword entered non-C status: ${name}`);
    }
  }

  for (const candidate of aCandidates) {
    const name = keyword(candidate);
    if (!hasDemandEvidence(candidate)) {
      failures.push(`A candidate lacks SIF/ASIN-reverse demand evidence: ${name}`);
    }
    if (isGenericKeyword(name)) {
      failures.push(`Generic keyword entered A: ${name}`);
    }
    if (!hasText(candidate.evidence_based_differentiation)) {
      failures.push(`A candidate lacks evidence-based differentiation: ${name}`);
    }
    if (hasText(candidate.generated_idea_differentiation) && !hasText(candidate.evidence_based_differentiation)) {
      failures.push(`Generated differentiation is supporting A: ${name}`);
    }
  }

  const asinReverseRequired = scored.filter((candidate) => candidate.gate_status === "B_ASIN_REVERSE_REQUIRED");
  const watchNeedsEvidence = scored.filter((candidate) => candidate.gate_status === "B_WATCH_NEEDS_EVIDENCE");
  const watchlistTotal = asinReverseRequired.length + watchNeedsEvidence.length;
  const overflowRejected = scored.filter((candidate) => candidate.overflow_rejected === true);

  if (asinReverseRequired.length > 15) {
    failures.push(`B_ASIN_REVERSE_REQUIRED exceeds daily cap: ${asinReverseRequired.length}/15`);
  }
  if (watchNeedsEvidence.length > 20) {
    failures.push(`B_WATCH_NEEDS_EVIDENCE exceeds daily cap: ${watchNeedsEvidence.length}/20`);
  }
  if (watchlistTotal > 35) {
    failures.push(`Watchlist total exceeds daily cap: ${watchlistTotal}/35`);
  }
  for (const candidate of asinReverseRequired) {
    const name = keyword(candidate);
    if (candidate.strong_offsite_evidence !== true && candidate.offsite_evidence_strength !== "strong") {
      failures.push(`B_ASIN_REVERSE_REQUIRED lacks strong offsite evidence: ${name}`);
    }
    if (isGenericKeyword(name)) {
      failures.push(`Generic keyword entered B_ASIN_REVERSE_REQUIRED: ${name}`);
    }
  }

  if (asinReverseRequired.length && !fs.existsSync(watchlistPath)) {
    failures.push(`B_ASIN_REVERSE_REQUIRED candidates exist but watchlist was not written: ${watchlistPath}`);
  }
  if (!watchlistTotal) {
    warnings.push("No B_ASIN_REVERSE_REQUIRED candidates found in this run; regression sample should cover this status.");
  }
  if (overflowRejected.length && !fs.existsSync(overflowPath)) {
    failures.push(`Overflow rejected candidates exist but overflow file was not written: ${overflowPath}`);
  }

  const summary = {
    scored: scored.length,
    raw: raw.length,
    pre_sif_passed: preSif.length,
    pre_sif_pass_rate: Number(preSifPassRate.toFixed(4)),
    grade_counts: gradeCounts,
    gate_status_counts: statusCounts,
    a_count: aCandidates.length,
    a_rate: Number(aRate.toFixed(4)),
    b_asin_reverse_required: asinReverseRequired.length,
    b_watch_needs_evidence: watchNeedsEvidence.length,
    watchlist_total: watchlistTotal,
    overflow_rejected: overflowRejected.length,
    warnings,
    failures
  };

  console.log(JSON.stringify(summary, null, 2));
  if (failures.length) process.exit(1);
}

main();
