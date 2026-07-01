# Explorer Output Schema

Every explorer must return exactly 8 candidates using this schema:

```json
{
  "industry": "",
  "product_keyword": "",
  "amazon_asin_or_link": "",
  "offsite_evidence": "",
  "pain_point": "",
  "exact_fit_or_model_specific": "",
  "homogeneity_judgment": "",
  "scanned_in_past_30_days": false,
  "rejected_history_hit": false,
  "recommended_action": "PASS_TO_SIF | WATCH | REJECT",
  "pre_sif_pass_count": 0,
  "supply_score": 0,
  "supply_notes": "",
  "risk_score": 0,
  "risk_flags": [],
  "differentiation_paths": [],
  "ai_recommendation": "A | B | C",
  "grade_reason": "",
  "human_decision": "GO | WATCH | KILL | SUPPLIER_CHECK | PATENT_CHECK",
  "human_notes": "",
  "next_review_date": ""
}
```

Candidates missing an Amazon ASIN/link or offsite evidence must be marked `REJECT` or `WATCH`, never `PASS_TO_SIF`.

Candidates without differentiation paths cannot be graded `A`.
