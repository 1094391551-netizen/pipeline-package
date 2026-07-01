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

Use `B_ASIN_REVERSE_REQUIRED` when the candidate has long-tail exact-fit evidence but lacks ABA/Sif history. These candidates enter `watchlist/YYYY-MM-DD.md`, not the failure pool.

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
