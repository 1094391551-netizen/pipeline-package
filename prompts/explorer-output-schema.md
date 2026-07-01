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
  "recommended_action": "PASS_TO_SIF | WATCH | REJECT"
}
```

Candidates missing an Amazon ASIN/link or offsite evidence must be marked `REJECT` or `WATCH`, never `PASS_TO_SIF`.

