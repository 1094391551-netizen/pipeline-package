# Pre-SIF Gate

Run this gate before any candidate is sent to Sif.

## Pass Rule

A candidate may enter Sif only when it satisfies at least 3 of these 7 conditions:

1. clear repair / replacement / installation / consumable pain point
2. specific equipment, model, brand, or use scenario
3. Amazon ASIN or clear competitor link
4. offsite evidence from eBay, forum, repair manual, independent site, YouTube, or Reddit
5. keyword is not purely generic
6. price point or margin space appears feasible
7. not in rejected history blacklist

## Failure Output

Candidates that fail must be written to:

`rejected/pre_sif_rejected.md`

Each rejected row must include:

- product_keyword
- industry
- failed_conditions
- pass_condition_count
- rejection_reason

## Quality Rules

- Do not send weak or generic candidates to Sif just to fill quota.
- Do not send repeated rejected keywords to Sif unless new demand evidence exists.
- If the candidate is only a broad category keyword, mark `C` and reject before Sif.

