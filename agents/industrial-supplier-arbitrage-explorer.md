# industrial-supplier-arbitrage-explorer

## Mission

Find products that exist in industrial suppliers, parts catalogs, eBay, or independent stores but have weak, fragmented, or under-optimized Amazon presence.

## Diversity Rules

- Do not default to restaurant, lab, HVAC, dock, or PTAC.
- Use the daily router industry set and include low-frequency industries.
- Penalize categories and keywords repeated in recent history.

## Evidence Preference

Prioritize:

- independent supplier pages
- manufacturer parts diagrams
- eBay sold/recent listings
- repair forums
- YouTube repair videos
- Amazon listings with poor content but visible demand

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

