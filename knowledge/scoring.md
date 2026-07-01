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

Only then can it pass the optional 4-of-7 check. At least one of `exact-fit or model-specific signal` or `clear replacement / installation / consumable use` must be present:

- exact-fit or model-specific signal
- clear replacement / installation / consumable use
- keyword is not purely generic
- price or margin appears feasible
- not in rejected history blacklist
- low obvious commodity risk
- category is not over-scanned

Failures go to `rejected/pre_sif_rejected.md`.

Do not count industry/category labels as evidence. Do not let "not in blacklist" carry a weak candidate by itself.

Classify offsite evidence:

- Strong: eBay sold/completed listings, parts/service manuals, exploded diagrams, manufacturer parts pages, independent replacement parts stores, repair forum threads, YouTube repair videos, or Reddit/forum threads with explicit repair or replacement demand.
- Weak: plain eBay listings, general blog mentions, Pinterest/TikTok/Instagram content, search-result summaries, or plain compatibility claims without a repair or replacement context.
- Alibaba/1688 evidence is supply evidence only and cannot carry demand.

High-frequency categories with weak offsite evidence and weak price/margin signals should fail Pre-SIF. Category frequency must be computed from history files; missing history is `unknown`, not automatic failure. Unknown should not count as a pass or a fail in optional scoring.

## A/B/C Grade

- A: can deep dive now only when Pre-SIF passes, demand evidence exists, risk is not high, supply is acceptable, and at least one evidence-based differentiation path exists.
- B: watch / needs evidence. B is an observation pool, not a failure pool.
- C: reject.

No ABA does not equal failure for long-tail exact-fit replacement parts, but no Sif or ASIN-reverse demand evidence means the candidate cannot be `A`.

Use B sub-states:

- `B_ASIN_REVERSE_REQUIRED`: Pre-SIF passed, no sufficient Sif/ABA evidence, explicit exact-fit/model-specific signal, strong offsite evidence, target ASIN/link, and concrete next checks.
- `B_WATCH_NEEDS_EVIDENCE`: value exists but evidence is too weak for ASIN reverse priority.
- `B_SUPPLIER_CHECK_REQUIRED`: demand/evidence path exists but supply feasibility is below threshold.
- `B_PATENT_CHECK_REQUIRED`: patent risk must be checked before further validation.

Daily caps: `B_ASIN_REVERSE_REQUIRED` max 15, `B_WATCH_NEEDS_EVIDENCE` max 20. Overflow goes to `rejected/overflow_rejected.md` and is eligible for recheck after 14 days if new evidence appears.

## Supply Score

Score structure complexity, tooling difficulty, SKU/size complexity, QC difficulty, aftersales risk, logistics risk, and supplier findability.

## Risk Score

Score trademark, patent, safety, certification, platform policy, and aftersales liability risk.

## Differentiation

Differentiate between:

- `evidence_based_differentiation`: validated by competitor gaps, reviews, fitment tables, installation issues, packaging damage evidence, or offsite repair evidence.
- `generated_idea_differentiation`: script-generated ideas such as material upgrade, kit, size coverage, compatible model table, install tool kit, better manual/video, error-proof install, or damage-resistant packaging.

Only `evidence_based_differentiation` can support `A`. Generated ideas can support `B` notes only. If no real differentiation exists, set `differentiation_confidence = low` and cap the candidate at `B`.
