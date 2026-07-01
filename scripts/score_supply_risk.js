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

function hasAny(text, words) {
  const value = String(text || "").toLowerCase();
  return words.some((word) => value.includes(word));
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
  const existing = candidate.differentiation_paths;
  if (Array.isArray(existing) && existing.length) return existing.slice(0, 3);

  const text = JSON.stringify(candidate).toLowerCase();
  const paths = [];
  if (hasAny(text, ["exact-fit", "model", "compatible", "part number"])) paths.push("compatible model table");
  if (hasAny(text, ["install", "mount", "bracket", "clip"])) paths.push("installation tool kit");
  if (hasAny(text, ["size", "diameter", "bore", "thread"])) paths.push("size coverage");
  if (hasAny(text, ["fragile", "shipping", "damage"])) paths.push("damage-resistant packaging");
  if (!paths.length) paths.push("better manual / video");
  return paths.slice(0, 3);
}

function grade(candidate) {
  const diff = candidate.differentiation_paths || [];
  if (candidate.pre_sif_pass_count < 3) return { ai_recommendation: "C", grade_reason: "failed Pre-SIF Gate" };
  if ((candidate.risk_score || 0) >= 70) return { ai_recommendation: "C", grade_reason: "risk score too high" };
  if (!diff.length) return { ai_recommendation: "B", grade_reason: "no strong differentiation path" };
  if ((candidate.supply_score || 0) >= 60 && (candidate.risk_score || 0) <= 45 && diff.length) {
    return { ai_recommendation: "A", grade_reason: "passes Pre-SIF with acceptable supply/risk and differentiation" };
  }
  return { ai_recommendation: "B", grade_reason: "needs additional evidence or supply/risk verification" };
}

function humanDefaults(candidate) {
  if (candidate.ai_recommendation === "A") {
    return {
      human_decision: (candidate.risk_flags || []).includes("patent_risk") ? "PATENT_CHECK" : "SUPPLIER_CHECK",
      human_notes: "",
      next_review_date: ""
    };
  }
  if (candidate.ai_recommendation === "B") {
    return { human_decision: "WATCH", human_notes: "", next_review_date: "" };
  }
  return { human_decision: "KILL", human_notes: "", next_review_date: "" };
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const runDir = argValue("run-dir", path.join(process.cwd(), "runs", today));
  const input = argValue("input", path.join(runDir, "pre_sif_candidates.json"));
  const output = argValue("output", path.join(runDir, "scored_candidates.json"));
  const candidates = readJson(input, []);

  const scored = candidates.map((candidate) => {
    const supply = supplyScore(candidate);
    const risk = riskScore(candidate);
    const differentiation_paths = differentiation(candidate);
    const withScores = { ...candidate, ...supply, ...risk, differentiation_paths };
    const graded = { ...withScores, ...grade(withScores) };
    return { ...graded, ...humanDefaults(graded) };
  });

  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(output, JSON.stringify(scored, null, 2));
  console.log(JSON.stringify({ input, output, scored: scored.length }, null, 2));
}

main();
