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

function hasText(value) {
  if (Array.isArray(value)) return value.some((item) => hasText(item));
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

function hasAny(text, words) {
  const value = String(text || "").toLowerCase();
  return words.some((word) => value.includes(word));
}

function wholeCandidateText(candidate) {
  return JSON.stringify(candidate || {}).toLowerCase();
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function supplyScore(candidate) {
  const text = JSON.stringify(candidate).toLowerCase();
  let score = 75;
  const notes = [];

  if (hasAny(text, ["exact-fit", "model-specific", "compatible", "part number"])) {
    score -= 10;
    notes.push("fitment accuracy required");
  }
  if (hasAny(text, ["many sizes", "size matrix", "diameter", "bore", "thread", "pitch"])) {
    score -= 12;
    notes.push("SKU/size complexity");
  }
  if (hasAny(text, ["rubber", "plastic", "clip", "cover", "bracket", "pad"])) {
    score += 8;
    notes.push("common passive manufacturing process");
  }
  if (hasAny(text, ["large", "oversize", "heavy", "bulky"])) {
    score -= 18;
    notes.push("logistics risk");
  }
  if (hasAny(text, ["return", "leak", "safety", "load-bearing", "high pressure"])) {
    score -= 20;
    notes.push("aftersales or liability risk");
  }

  return {
    supply_score: Math.max(0, Math.min(100, score)),
    supply_notes: notes.length ? notes.join("; ") : "standard sourcing feasibility; verify supplier availability"
  };
}

function riskScore(candidate) {
  const text = JSON.stringify(candidate).toLowerCase();
  const flags = [];
  let score = 20;

  const checks = [
    ["trademark_risk", ["logo", "genuine", "oem only", "brand copy"]],
    ["patent_risk", ["patent", "patented"]],
    ["safety_risk", ["safety", "load-bearing", "child", "medical", "treatment"]],
    ["certification_risk", ["electrical", "battery", "heated", "heating", "high pressure"]],
    ["platform_policy_risk", ["counterfeit", "replica", "compatible logo"]],
    ["aftersales_liability_risk", ["leak", "failure", "pressure", "return"]]
  ];

  for (const [flag, words] of checks) {
    if (hasAny(text, words)) {
      flags.push(flag);
      score += 14;
    }
  }

  return {
    risk_score: Math.max(0, Math.min(100, score)),
    risk_flags: flags
  };
}

function differentiation(candidate) {
  const evidenceBased = asArray(
    candidate.evidence_based_differentiation ||
    candidate.verified_differentiation_paths ||
    candidate.real_differentiation_paths
  ).slice(0, 3);

  const text = wholeCandidateText(candidate);
  const paths = [];
  if (hasAny(text, ["exact-fit", "model", "compatible", "part number"])) paths.push("compatible model table");
  if (hasAny(text, ["install", "mount", "bracket", "clip"])) paths.push("installation tool kit");
  if (hasAny(text, ["size", "diameter", "bore", "thread"])) paths.push("size coverage");
  if (hasAny(text, ["fragile", "shipping", "damage"])) paths.push("damage-resistant packaging");
  if (!paths.length) paths.push("better manual / video");

  return {
    evidence_based_differentiation: evidenceBased,
    generated_idea_differentiation: paths.slice(0, 3),
    differentiation_confidence: evidenceBased.length ? "medium" : "low"
  };
}

function established(value) {
  if (value === true) return true;
  if (!value) return false;
  if (typeof value === "number") return value > 0;
  const text = typeof value === "string" ? value.toLowerCase() : JSON.stringify(value).toLowerCase();
  return ["established", "passed", "pass", "true", "yes", "valid", "成立", "通过"].some((word) => text.includes(word));
}

function hasSifHistory(candidate) {
  return [
    candidate.sif_history,
    candidate.aba_history,
    candidate.keyword_history,
    candidate.market_get_keyword_history,
    candidate.sif,
    candidate.root,
    candidate.competition,
    candidate.demand
  ].some((value) => hasText(value));
}

function sifSignals(candidate) {
  const root = established(candidate.root_established) ||
    established(candidate.root_market_established) ||
    established(candidate.root?.established) ||
    established(candidate.root?.latest?.coverage_ratio) ||
    established(candidate.sif?.root);
  const demand = established(candidate.demand_established) ||
    established(candidate.demand?.established) ||
    established(candidate.demand?.trend?.direction) ||
    established(candidate.demand?.current?.search_volume) ||
    established(candidate.sif?.demand);
  const competition = established(candidate.competition_established) ||
    established(candidate.competition?.established) ||
    established(candidate.competition?.top_competitors) ||
    established(candidate.sif?.competition);

  return {
    has_sif_history: hasSifHistory(candidate),
    root_established: root,
    demand_established: demand,
    competition_established: competition,
    established_count: [root, demand, competition].filter(Boolean).length
  };
}

function asinReverseEvidence(candidate) {
  const text = wholeCandidateText(candidate);
  const explicit = established(candidate.asin_reverse_evidence) ||
    hasText(candidate.asin_reverse_traffic) ||
    hasText(candidate.target_asin_traffic) ||
    hasText(candidate.amazon_bought_velocity) ||
    hasText(candidate.review_velocity) ||
    hasText(candidate.sales_velocity) ||
    hasText(candidate.stable_demand_signal);
  const explanatory = hasAny(text, ["asin reverse", "traffic growth", "sales growth", "review growth", "review velocity", "bought velocity", "stable demand"]);

  return explicit || (hasText(candidate.target_asin_or_link || candidate.amazon_asin_or_link || candidate.asin) && explanatory);
}

function hasExactFitOffsiteEvidence(candidate) {
  const text = wholeCandidateText(candidate);
  return hasAny(text, [
    "exact-fit",
    "exact fit",
    "model-specific",
    "fit by",
    "compatible",
    "part number",
    "manual",
    "repair manual",
    "service manual",
    "ebay",
    "ebay sold",
    "sold comps",
    "forum",
    "youtube",
    "reddit",
    "independent parts store",
    "parts store"
  ]);
}

function genericKeyword(candidate) {
  const text = String(candidate.product_keyword || candidate.keyword || "").trim().toLowerCase();
  if (!text) return true;
  const words = text.split(/\s+/).filter(Boolean);
  const generic = new Set(["part", "parts", "replacement", "accessory", "accessories", "kit", "cover", "wheel", "adapter", "clip", "bracket"]);
  return words.length <= 1 || words.every((word) => generic.has(word));
}

function grade(candidate) {
  const preSifPassed = candidate.pre_sif_passed === true || (candidate.pre_sif_status === "passed") || (candidate.pre_sif_pass_count >= 3 && !(candidate.pre_sif_failed_required_fields || []).length);
  const evidenceDiff = candidate.evidence_based_differentiation || [];
  const sif = sifSignals(candidate);
  const hasAsinReverse = asinReverseEvidence(candidate);
  const hasDemandEvidence = (sif.has_sif_history && sif.established_count >= 2) || hasAsinReverse;
  const supplyAcceptable = (candidate.supply_score || 0) >= 55;
  const riskNotHigh = (candidate.risk_score || 0) < 70;
  const riskGoodForA = (candidate.risk_score || 0) <= 45;
  const exactFitEvidence = hasExactFitOffsiteEvidence(candidate);

  if (!preSifPassed) return { ai_recommendation: "C", gate_status: "C", grade_reason: "failed Pre-SIF Gate" };
  if (genericKeyword(candidate)) return { ai_recommendation: "C", gate_status: "C", grade_reason: "generic keyword cannot enter A/B opportunity pool" };
  if ((candidate.risk_score || 0) >= 70) return { ai_recommendation: "C", gate_status: "C", grade_reason: "risk score too high" };
  if (candidate.rejected_history_hit === true && !hasDemandEvidence) {
    return { ai_recommendation: "C", gate_status: "C", grade_reason: "historically rejected without new demand evidence" };
  }

  if (hasDemandEvidence && evidenceDiff.length && riskGoodForA && supplyAcceptable) {
    return {
      ai_recommendation: "A",
      gate_status: "A",
      grade_reason: hasAsinReverse
        ? "passes Pre-SIF with ASIN-reverse demand evidence, acceptable supply/risk, and evidence-based differentiation"
        : "passes Pre-SIF with SIF evidence on at least 2 of Root/Demand/Competition, acceptable supply/risk, and evidence-based differentiation"
    };
  }

  if (!hasDemandEvidence && exactFitEvidence) {
    return {
      ai_recommendation: "B",
      gate_status: "B_ASIN_REVERSE_REQUIRED",
      grade_reason: "long-tail exact-fit evidence exists, but no SIF/ASIN-reverse demand evidence yet"
    };
  }

  if (!evidenceDiff.length) {
    return {
      ai_recommendation: "B",
      gate_status: "B",
      grade_reason: "no evidence-based differentiation; generated ideas cannot support A"
    };
  }

  if (!hasDemandEvidence) {
    return {
      ai_recommendation: "B",
      gate_status: "B",
      grade_reason: "passes Pre-SIF but lacks SIF or ASIN-reverse demand evidence; max grade is B"
    };
  }

  if (!riskNotHigh || !supplyAcceptable) {
    return {
      ai_recommendation: "B",
      gate_status: "B",
      grade_reason: "needs supply or risk verification before A"
    };
  }

  return { ai_recommendation: "B", gate_status: "B", grade_reason: "needs additional evidence before A" };
}

function humanDefaults(candidate) {
  if (candidate.gate_status === "A") {
    return {
      human_decision: (candidate.risk_flags || []).includes("patent_risk") ? "PATENT_CHECK" : "SUPPLIER_CHECK",
      human_notes: "",
      next_review_date: ""
    };
  }
  if (candidate.gate_status === "B_ASIN_REVERSE_REQUIRED") {
    return { human_decision: "WATCH", human_notes: "ASIN reverse required before promotion to A", next_review_date: addDaysIso(7) };
  }
  if (candidate.ai_recommendation === "B") {
    return { human_decision: "WATCH", human_notes: "", next_review_date: "" };
  }
  return { human_decision: "KILL", human_notes: "", next_review_date: "" };
}

function watchlistEntry(candidate) {
  const keyword = candidate.product_keyword || candidate.keyword || "";
  return {
    keyword,
    target_asin_or_link: candidate.target_asin_or_link || candidate.amazon_asin_or_link || candidate.amazon || candidate.asin || "",
    exact_fit_signal: candidate.exact_fit_or_model_specific || candidate.exact_fit_signal || candidate.compatibility || "",
    offsite_evidence: candidate.offsite_evidence || candidate.evidence || "",
    why_keyword_sif_failed_or_missing: candidate.why_keyword_sif_failed_or_missing || candidate.sif_missing_reason || "No ABA/SIF demand evidence available yet; ASIN-reverse validation required before A.",
    required_next_check: [
      "ASIN reverse traffic",
      "Amazon bought/review velocity",
      "eBay sold comps",
      "parts manual confirmation",
      "supplier availability"
    ],
    next_review_date: candidate.next_review_date || addDaysIso(7)
  };
}

function writeWatchlist(file, candidates) {
  if (!candidates.length) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const lines = [
    `# ASIN-Reverse Watchlist ${path.basename(file, ".md")}`,
    "",
    "These candidates passed Pre-SIF and have long-tail exact-fit evidence, but cannot become A without SIF or ASIN-reverse demand evidence.",
    "",
    ...candidates.flatMap((candidate) => {
      const entry = watchlistEntry(candidate);
      return [
        `## ${entry.keyword}`,
        "",
        `- target_asin_or_link: ${entry.target_asin_or_link}`,
        `- exact_fit_signal: ${entry.exact_fit_signal}`,
        `- offsite_evidence: ${entry.offsite_evidence}`,
        `- why_keyword_sif_failed_or_missing: ${entry.why_keyword_sif_failed_or_missing}`,
        "- required_next_check:",
        ...entry.required_next_check.map((item) => `  - ${item}`),
        `- next_review_date: ${entry.next_review_date}`,
        ""
      ];
    })
  ];
  fs.writeFileSync(file, lines.join("\n"));
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const runDir = argValue("run-dir", path.join(process.cwd(), "runs", today));
  const input = argValue("input", path.join(runDir, "pre_sif_candidates.json"));
  const output = argValue("output", path.join(runDir, "scored_candidates.json"));
  const watchlistOut = argValue("watchlist-out", path.join(process.cwd(), "watchlist", `${today}.md`));
  const candidates = readJson(input, []);

  const scored = candidates.map((candidate) => {
    const supply = supplyScore(candidate);
    const risk = riskScore(candidate);
    const diff = differentiation(candidate);
    const sif = sifSignals(candidate);
    const withScores = {
      ...candidate,
      ...supply,
      ...risk,
      ...diff,
      has_sif_history: sif.has_sif_history,
      root_established: sif.root_established,
      demand_established: sif.demand_established,
      competition_established: sif.competition_established,
      sif_established_count: sif.established_count,
      asin_reverse_evidence: asinReverseEvidence(candidate)
    };
    const graded = { ...withScores, ...grade(withScores) };
    return { ...graded, ...humanDefaults(graded) };
  });

  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(output, JSON.stringify(scored, null, 2));
  const asinReverseWatchlist = scored.filter((candidate) => candidate.gate_status === "B_ASIN_REVERSE_REQUIRED");
  writeWatchlist(watchlistOut, asinReverseWatchlist);
  console.log(JSON.stringify({ input, output, scored: scored.length, b_asin_reverse_required: asinReverseWatchlist.length, watchlistOut }, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  supplyScore,
  riskScore,
  differentiation,
  grade,
  sifSignals,
  asinReverseEvidence,
  watchlistEntry
};
