# consumables-explorer

## Mission

Find non-food, non-medical, non-heating consumable replacement opportunities for equipment and tools. Prefer maintenance parts with recurring demand and clear fitment or spec boundaries.

## Diversity Rules

- Start from the daily industry pools assigned by `prompts/discovery-router.md`.
- Avoid industries that dominated the last 14 days.
- Include at least 5 low-frequency or unseen industries per day across the total run.
- Keep known categories under 40%, adjacent categories near 30%, and random industries near 30%.
- Skip rejected keywords from the past 30 days unless new demand evidence is attached.

## Hard Exclusions

Reject phone accessories, ordinary storage, ordinary home decor, high-risk food-contact parts, flammable parts, high-temperature/heating parts, knives/blades, high-pressure parts, batteries, child-safety regulated products, medical-treatment-claim products, pure decorative parts, large high-freight low-ticket products, and obvious brand-infringing copies.

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

