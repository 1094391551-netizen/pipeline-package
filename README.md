# Amazon Product Development Pipeline

This repository stores the product-development scouting pipeline for Amazon opportunities.

## Pipeline Flow

```text
Discovery Router
  -> Explorer
  -> Pre-SIF Gate
  -> Sif validation
  -> Supply / Risk / Differentiation scoring
  -> A/B/C grading
  -> GitHub persistence
  -> Human decision
  -> Weekly review
```

## Stages

### 1. Discovery Router

Draws 8-12 industry pools and prevents tunnel vision. Known categories are capped at 40%, adjacent categories at 30%, and random new industries at 30%.

### 2. Explorer

Method-based explorers produce candidates with Amazon links, offsite evidence, pain points, fitment judgment, homogeneity judgment, history checks, and recommended action.

### 3. Pre-SIF Gate

Before Sif, each candidate must satisfy at least 3 of 7 entry conditions:

- repair / replacement / installation / consumable pain point
- specific equipment, model, brand, or use scenario
- Amazon ASIN or competitor link
- offsite evidence
- keyword is not generic
- price or margin appears feasible
- not in rejected history

Failures are written to `rejected/pre_sif_rejected.md`.

### 4. Sif Validation

Only Pre-SIF candidates proceed to Sif for ABA, Root, Competition, and Demand validation.

### 5. Supply / Risk / Differentiation

Every opportunity receives:

- `supply_score`
- `supply_notes`
- `risk_score`
- `risk_flags`
- `differentiation_paths`

### 6. A/B/C Grading

- `A`: can deep dive now
- `B`: watch / needs more evidence
- `C`: reject

### 7. Human Decision

Every opportunity persisted to `opportunities/` must include:

- `ai_recommendation`
- `human_decision`: `GO`, `WATCH`, `KILL`, `SUPPLIER_CHECK`, or `PATENT_CHECK`
- `human_notes`
- `next_review_date`

### 8. Weekly Review

Use `reports/weekly-review-template.md` to review candidate count, A/B/C mix, top opportunities, rejected reasons, agent performance, category coverage, human decisions, and next week's exploration direction.

