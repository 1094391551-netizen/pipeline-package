# Pre-SIF Gate

Run this gate before any candidate is sent to Sif.

## Pass Rule

A candidate may enter Sif only after all required fields are present, at least 4 optional conditions pass, and at least one of the exact-fit or replacement/consumable optional signals is present.

Required fields:

1. `pain_point` clearly exists
2. `amazon_asin_or_link` clearly exists
3. `offsite_evidence` clearly exists

Optional 4-of-7 fields:

1. `exact_fit_or_model_specific`
2. `clear_replacement_or_consumable_use`
3. `non_generic_keyword`
4. `estimated_price_or_margin_potential`
5. `not_in_rejected_history`
6. `low_obvious_commodity_risk`
7. `category_not_over_scanned`

Do not count `industry`, `category`, or "not in blacklist" by itself as strong evidence.

Classify offsite evidence:

- `strong_offsite_evidence`: eBay sold/completed listings, parts manual, service manual, exploded diagram, manufacturer parts page, independent replacement parts store, repair forum thread, YouTube repair video, or Reddit/forum thread with explicit repair/replacement demand.
- `weak_offsite_evidence`: plain eBay listing, general blog, Pinterest/TikTok/Instagram content, search result summary, or compatibility-only mention without repair/replacement context.
- Alibaba/1688 evidence is supply evidence only.

Weak evidence may pass Pre-SIF, but high-frequency categories with weak evidence and weak price/margin signal must fail before Sif. Unknown category history should not add or subtract from the optional score.

Compute `category_not_over_scanned` from `runs/`, `opportunities/`, `rejected/`, `watchlist/`, and `knowledge/category-coverage.md`. If history is unavailable, use `unknown`; do not mark every category false.

## Failure Output

Candidates that fail must be written to:

`rejected/pre_sif_rejected.md`

Each rejected row must include:

- candidate
- failed_required_fields
- failed_optional_fields
- reason
- can_recheck_after_days

## Quality Rules

- Do not send weak or generic candidates to Sif just to fill quota.
- Do not send repeated rejected keywords to Sif unless new demand evidence exists.
- If the candidate is only a broad category keyword, mark `C` and reject before Sif.
- No ABA data is not automatic failure for exact-fit long-tail parts, but it cannot become `A` without ASIN-reverse evidence.
