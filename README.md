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

Before Sif, each candidate must satisfy all required fields:

- repair / replacement / installation / consumable pain point
- Amazon ASIN or competitor link
- offsite evidence

Then it must pass at least 4 optional signals, and at least one of the exact-fit or replacement/consumable signals must be present:

- exact-fit / model-specific signal
- clear replacement, installation, or consumable use
- keyword is not generic
- price or margin appears feasible
- not in rejected history
- low obvious commodity risk
- category is not over-scanned

`offsite_evidence` is classified as `strong_offsite_evidence` or `weak_offsite_evidence`. Weak evidence can pass Pre-SIF, but high-frequency categories with weak evidence and weak price/margin signals are rejected before Sif. Category frequency is tri-state: `true`, `false`, or `unknown`; unknown means the history is insufficient and does not add or subtract from the optional score.

Category frequency is computed from `runs/`, `opportunities/`, `rejected/`, `watchlist/`, and `knowledge/category-coverage.md`. Missing history is treated as unknown, not as automatic failure.

Failures are written to `rejected/pre_sif_rejected.md`.

No ABA history is not automatic failure for long-tail exact-fit parts, but these candidates cannot become `A` until Sif or ASIN-reverse demand evidence exists.

### 4. Sif Validation

Only Pre-SIF candidates proceed to Sif for ABA, Root, Competition, and Demand validation.

### 5. Supply / Risk / Differentiation

Every opportunity receives:

- `supply_score`
- `supply_notes`
- `risk_score`
- `risk_flags`
- `evidence_based_differentiation`
- `generated_idea_differentiation`
- `differentiation_confidence`

Generated differentiation is not proof. It can support B-class research notes, but only evidence-based differentiation can support an A grade.

### 6. A/B/C Grading

- `A`: can deep dive now, but only with demand evidence from Sif or ASIN reverse plus evidence-based differentiation
- `B`: watch / needs more evidence; B is not a failure pool
- `B_ASIN_REVERSE_REQUIRED`: long-tail exact-fit candidate with strong offsite evidence but no ABA/Sif history; send to `watchlist/YYYY-MM-DD.md`
- `B_WATCH_NEEDS_EVIDENCE`: has some value, but evidence is too weak for ASIN reverse priority
- `B_SUPPLIER_CHECK_REQUIRED`: evidence exists, but supply feasibility is below threshold
- `B_PATENT_CHECK_REQUIRED`: evidence exists, but patent risk must be checked first
- `C`: reject

`A` is not "looks doable." It means the opportunity has passed the quality gates and has evidence of demand. Candidates without Sif or ASIN-reverse evidence are capped at `B`.

Daily watchlist capacity is capped at 15 `B_ASIN_REVERSE_REQUIRED` candidates and 20 `B_WATCH_NEEDS_EVIDENCE` candidates. Overflow is written to `rejected/overflow_rejected.md` with a 14-day recheck note.

### 7. Human Decision

Every opportunity persisted to `opportunities/` must include:

- `ai_recommendation`
- `human_decision`: `GO`, `WATCH`, `KILL`, `SUPPLIER_CHECK`, or `PATENT_CHECK`
- `human_notes`
- `next_review_date`

### 8. Weekly Review

Use `reports/weekly-review-template.md` to review candidate count, A/B/C mix, top opportunities, rejected reasons, agent performance, category coverage, human decisions, and next week's exploration direction.
