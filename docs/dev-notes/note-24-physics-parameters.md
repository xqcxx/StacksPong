# Note 24: Physics Parameters

## Summary
Physics constants shape the feel of the game. Documenting them avoids unintentional changes.

## Implementation Notes
- Keep all constants (ball speed, paddle acceleration, friction, max bounce angle) in a single module imported by the game manager.
- Store default values and per-mode overrides (e.g., faster private rooms) to allow experimentation.
- Provide helper functions to clamp velocities and enforce minimum speeds after collisions.
- Document the rationale for each constant in comments referencing playtest feedback.

## Observability
- Log average rally length and ball speed distribution to gauge whether adjustments had the intended effect.
- Track how often collisions trigger extreme bounce angles; outliers indicate misconfigured constants.

## Next Steps
- Build an admin endpoint to tweak constants at runtime (feature flagged) for quick balancing sessions.
- Add unit tests for helper functions that clamp/normalize values.
