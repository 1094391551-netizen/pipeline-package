# Explorer Output Schema

Every explorer must return exactly 8 candidates using this schema:

```json
{
  "industry": "",
  "product_keyword": "",
  "amazon_asin_or_link": "",
  "offsite_evidence": "",
  "strong_offsite_evidence": false,
  "weak_offsite_evidence": false,
  "pain_point": "",
  "exact_fit_or_model_specific": "",
  "category_scan_frequency": "high_14d | low_30d | unseen_30d | medium_or_unknown | unknown",
  "category_penalty_reason": "",
  "homogeneity_judgment": "",
  "scanned_in_past_30_days": false,
  "rejected_history_hit": false,
  "recommended_action": "PASS_TO_SIF | WATCH | REJECT",
  "pre_sif_pass_count": 0,
  "supply_score": 0,
  "supply_notes": "",
  "risk_score": 0,
  "risk_flags": [],
  "evidence_based_differentiation": [],
  "generated_idea_differentiation": [],
  "differentiation_confidence": "high | medium | low",
  "gate_status": "A | B_ASIN_REVERSE_REQUIRED | B_WATCH_NEEDS_EVIDENCE | B_SUPPLIER_CHECK_REQUIRED | B_PATENT_CHECK_REQUIRED | C",
  "ai_recommendation": "A | B | C",
  "grade_reason": "",
  "human_decision": "GO | WATCH | KILL | SUPPLIER_CHECK | PATENT_CHECK",
  "human_notes": "",
  "next_review_date": ""
}
```

Candidates missing an Amazon ASIN/link or offsite evidence must be marked `REJECT` or `WATCH`, never `PASS_TO_SIF`.

Candidates without `evidence_based_differentiation` cannot be graded `A`. Generated differentiation ideas can be included, but they only support `B` notes until validated.

Candidates with strong exact-fit / model-specific evidence, strong offsite evidence, a target ASIN/link, and no ABA/Sif history should use `gate_status = "B_ASIN_REVERSE_REQUIRED"` and enter the ASIN-reverse watchlist instead of being auto-rejected. Unknown category frequency should remain neutral and not force a pass or fail.

Candidates with weak offsite evidence should use `B_WATCH_NEEDS_EVIDENCE`, not `B_ASIN_REVERSE_REQUIRED`.
