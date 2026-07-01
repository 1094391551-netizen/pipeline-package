# Differentiation Check

Every opportunity must include 1-3 differentiation paths.

Split differentiation into two fields:

- `evidence_based_differentiation`: supported by review gaps, competitor comparison, repair/offsite evidence, manual fitment requirements, packaging damage evidence, or verified installation pain.
- `generated_idea_differentiation`: script or agent suggestions that still need validation.

Allowed path types:

- material upgrade
- bundle / kit
- size coverage
- compatible model table
- installation tool kit
- better manual / video
- error-proof installation
- damage-resistant packaging

## Rule

Only `evidence_based_differentiation` can support `A`.

If no credible evidence-based path exists:

- `A` is forbidden.
- The candidate is capped at `B`.
- Set `differentiation_confidence = low`.

Generated ideas can be carried forward as B-class research notes, but cannot be treated as proof.
