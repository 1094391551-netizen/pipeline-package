# Scoring

Scoring notes for product opportunity review.

Core gates:

- Demand exists.
- Root market boundary is clear.
- Competition is not locked by extreme concentration.
- Amazon front page is not heavily homogeneous or intent-polluted.
- Product avoids hard exclusions.

## Pre-SIF Gate

Before Sif, a candidate must first satisfy all required fields:

- clear repair / replacement / installation / consumable pain point
- Amazon ASIN or competitor link
- offsite evidence

Only then can it pass the optional 3-of-7 check:

- exact-fit or model-specific signal
- clear replacement / installation / consumable use
- keyword is not purely generic
- price or margin appears feasible
- not in rejected history blacklist
- low obvious commodity risk
- category is not over-scanned

Failures go to `rejected/pre_sif_rejected.md`.

Do not count industry/category labels as evidence. Do not let "not in blacklist" carry a weak candidate by itself.

## A/B/C Grade

- A: can deep dive now only when Pre-SIF passes, demand evidence exists, risk is not high, supply is acceptable, and at least one evidence-based differentiation path exists.
- B: watch / needs evidence. B is an observation pool, not a failure pool.
- C: reject.

No ABA does not equal failure for long-tail exact-fit replacement parts, but no Sif or ASIN-reverse demand evidence means the candidate cannot be `A`.

Use `B_ASIN_REVERSE_REQUIRED` when a candidate has Amazon/offsite/exact-fit evidence but lacks ABA or Sif history. It must be placed in the watchlist for ASIN reverse traffic, Amazon bought/review velocity, eBay sold comps, parts manual confirmation, and supplier availability checks.

## Supply Score

Score structure complexity, tooling difficulty, SKU/size complexity, QC difficulty, aftersales risk, logistics risk, and supplier findability.

## Risk Score

Score trademark, patent, safety, certification, platform policy, and aftersales liability risk.

## Differentiation

Differentiate between:

- `evidence_based_differentiation`: validated by competitor gaps, reviews, fitment tables, installation issues, packaging damage evidence, or offsite repair evidence.
- `generated_idea_differentiation`: script-generated ideas such as material upgrade, kit, size coverage, compatible model table, install tool kit, better manual/video, error-proof install, or damage-resistant packaging.

Only `evidence_based_differentiation` can support `A`. Generated ideas can support `B` notes only. If no real differentiation exists, set `differentiation_confidence = low` and cap the candidate at `B`.
