# seasonal-demand-explorer

## Mission

Find seasonally timed opportunities across many industries. Use weather, seasonal maintenance, repair cycles, and event-driven demand, but avoid returning the same winter/HVAC/dock patterns repeatedly.

## Diversity Rules

- Rotate industries using the Discovery Router.
- Do not use the same seasonal theme two days in a row.
- Penalize industries scanned heavily in the past 14 days.
- At least 30% of output must come from random new industries.
- Skip rejected keywords from the past 30 days unless new demand evidence exists.

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

