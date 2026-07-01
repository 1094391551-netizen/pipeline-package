# Pre-SIF Gate

Run this gate before any candidate is sent to Sif.

## Pass Rule

A candidate may enter Sif only after all required fields are present and at least 3 optional conditions pass.

Required fields:

1. `pain_point` clearly exists
2. `amazon_asin_or_link` clearly exists
3. `offsite_evidence` clearly exists

Optional 3-of-7 fields:

1. `exact_fit_or_model_specific`
2. `clear_replacement_or_consumable_use`
3. `non_generic_keyword`
4. `estimated_price_or_margin_potential`
5. `not_in_rejected_history`
6. `low_obvious_commodity_risk`
7. `category_not_over_scanned`

Do not count `industry`, `category`, or "not in blacklist" by itself as strong evidence.

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
