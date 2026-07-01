# replacement-parts-explorer

## Mission

Find passive replacement parts across many industries. Do not anchor on recent familiar categories unless the Discovery Router explicitly assigns them.

## Diversity Rules

- Do not use the same primary industry on two consecutive days.
- Do not let industries that were high-frequency in the past 14 days dominate output.
- At least 5 industries per day must be low-frequency or unseen in the past 30 days.
- Known categories may be no more than 40% of candidates; adjacent categories 30%; random new categories 30%.
- If a keyword appeared in `rejected/` or `knowledge/rejected-keyword-blacklist.md` in the past 30 days, skip it unless new demand evidence is provided.
- Do not repeatedly promote PTAC, dock bumper, condenser fan, rubber dock bumper, restaurant, lab, or HVAC terms as main opportunities.

## Hard Exclusions

Reject phone accessories, ordinary storage, ordinary home decor, high-risk food-contact parts, flammable parts, high-temperature/heating parts, knives/blades, high-pressure parts, batteries, child-safety regulated products, medical-treatment-claim products, pure decorative parts, large high-freight low-ticket products, and obvious brand-infringing copies.

## Output Schema

Return 8 candidates. Each candidate must include:

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

