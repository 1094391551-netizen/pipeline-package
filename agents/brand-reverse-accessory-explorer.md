# brand-reverse-accessory-explorer

## Mission

Start from brands, product ecosystems, or equipment families and reverse into legitimate compatible accessories, maintenance parts, and replacement parts. Avoid trademark misuse and obvious brand-copy infringement.

## Diversity Rules

- Router chooses brand ecosystems and industries daily.
- Avoid repeating the same brand ecosystem within 14 days unless new demand evidence exists.
- Skip rejected keywords from the past 30 days.
- Keep known categories below 40% of daily candidates.

## Brand Safety

- Use compatibility language carefully.
- Reject logo-copy, design-copy, patented, or deceptive brand imitation.
- Prefer replacement parts with clear fitment evidence and no protected design copying.

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

