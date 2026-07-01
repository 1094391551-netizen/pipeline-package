# Opportunity Grading

Every opportunity must receive an `A`, `B`, or `C` grade.

## A - Can Deep Dive Now

Use only when:

- Pre-SIF Gate passes.
- Sif history exists and at least 2 of Root / Demand / Competition are established, or ASIN-reverse shows explainable traffic, sales, review growth, or stable demand for a target ASIN.
- At least one `evidence_based_differentiation` path exists.
- `risk_score` is not high.
- `supply_score` is acceptable.

`A` is not "looks doable." It requires demand evidence. If there is no Sif or ASIN-reverse evidence, the maximum grade is `B`.

## B - Watch / Needs Evidence

Use when:

- Pain point is real but evidence is incomplete.
- Sif data is weak, missing, or inconclusive, but exact-fit / model-specific / repair manual / eBay sold / forum / YouTube / independent parts store evidence exists.
- Amazon front page is mixed or partially homogeneous.
- Supply/risk needs further verification.
- Generated differentiation ideas exist but no evidence-based path is proven yet.

Use B sub-states:

- `B_ASIN_REVERSE_REQUIRED`: Pre-SIF passed, no sufficient ABA/Sif evidence, clear exact-fit or model-specific signal, strong offsite evidence, target ASIN/link, and concrete next checks.
- `B_WATCH_NEEDS_EVIDENCE`: useful signal exists, but offsite evidence is weak or incomplete.
- `B_SUPPLIER_CHECK_REQUIRED`: evidence exists, but supply feasibility is not acceptable yet.
- `B_PATENT_CHECK_REQUIRED`: patent risk must be checked before deeper validation.

Do not put all B candidates into ASIN reverse. `B_ASIN_REVERSE_REQUIRED` is capped at 15 per day and `B_WATCH_NEEDS_EVIDENCE` is capped at 20 per day. Overflow goes to `rejected/overflow_rejected.md` with `watchlist_capacity_exceeded` and a 14-day recheck note. Unknown category history should not move a candidate into A or B by itself.

## C - Reject

Use when:

- Pre-SIF Gate fails.
- Keyword is generic or repeated.
- Candidate is in rejected blacklist.
- No Amazon ASIN/link, no offsite evidence, or no repair / replacement / installation / consumable pain point.
- No evidence-based or plausible generated differentiation path exists.
- Hard exclusion or severe risk is present.
- Obvious homogeneity is high.
- Historical rejection exists and no new demand evidence is provided.

Each grade must include a clear reason.

Automatically generated differentiation cannot support `A`. It can only be a `B` note until validated by evidence.
