# Note 26: Ball Spin

## Summary
Spin adds depth to rallies. This note captures how we plan to compute and apply spin to the ball trajectory.

## Implementation Notes
- Track paddle movement during the few milliseconds before impact; faster paddle motion imparts more spin.
- Represent spin as an angular velocity that influences post-collision velocity adjustments over time.
- Decay spin gradually to zero to avoid perpetual curveballs.
- Expose tunable constants (`MAX_SPIN`, decay rate) in the physics config file.

## Observability
- Record spin magnitudes per collision to ensure values stay within designed ranges.
- Log matches where spin average exceeds thresholds; they might indicate exploits.

## Next Steps
- Provide UI cues (particle trails) to show when a ball carries heavy spin.
- Add integration tests to guarantee spin calculations remain deterministic.
