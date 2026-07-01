# Human Decision Fields

Every opportunity persisted to `opportunities/` must include:

- `ai_recommendation`: `A`, `B`, or `C`
- `human_decision`: `GO`, `WATCH`, `KILL`, `SUPPLIER_CHECK`, or `PATENT_CHECK`
- `human_notes`
- `next_review_date`

## Defaults

- `A` defaults to `SUPPLIER_CHECK` unless risk flags require `PATENT_CHECK`.
- `B` defaults to `WATCH`.
- `C` defaults to `KILL`.

