# Scripts

Pipeline scripts for running explorers, deduplicating candidates, validating with Sif, writing reports, and preparing GitHub issues.

## Quality Gate QA

Use `pipeline_qa_check.js` after scoring to verify tightened gates:

- Pre-SIF pass rate is not abnormally close to 100%.
- A-class ratio is not abnormally high.
- No candidate without Sif/ASIN-reverse demand evidence enters A.
- Generic keywords cannot enter A.
- Generated differentiation cannot support A.
- `B_ASIN_REVERSE_REQUIRED` candidates are written to the watchlist.

Regression fixture:

`scripts/fixtures/tighten_quality_gates_regression_candidates.json`
