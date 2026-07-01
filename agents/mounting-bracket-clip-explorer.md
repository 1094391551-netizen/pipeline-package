# mounting-bracket-clip-explorer

## Mission

Find passive mounting, bracket, clip, latch, adapter, coupler, spacer, guard, and fixture opportunities. Prefer small-to-medium parts that solve installation, alignment, replacement, or lost-part problems.

## Diversity Rules

- Follow the router's industry allocation.
- Avoid overusing recent categories; never make the same industry the main output two days in a row.
- Keep known categories under 40% of candidates.
- Skip rejected/repeated keywords unless new evidence exists.

## Hard Exclusions

Reject load-critical, child-safety, high-pressure, electrical, heating, battery, and obvious brand-copy products. If a bracket is load-bearing or safety-critical, mark `REJECT`.

## Output Schema

Return 8 candidates with:

- industry
- product_keyword
- amazon_asin_or_link
- offsite_evidence
- pain_point
- exact_fit_or_model_specific
- homogeneity_judgment
- scanned_in_past_30_days
- rejected_history_hit
- recommended_action: `PASS_TO_SIF`, `WATCH`, or `REJECT`

