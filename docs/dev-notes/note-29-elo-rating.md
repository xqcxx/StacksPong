# Note 29: ELO Rating

## Summary
ELO keeps matches competitive. Document formula choices and rating ranges.

## Implementation Notes
- Start every player at 1000 rating; store rating in the player service with wins/losses.
- Use standard ELO: `newRating = rating + K * (score - expectedScore)` where expected score uses opponents’ ratings.
- Choose K-factor (e.g., 32) and consider dynamic adjustments (lower for high rated players) to stabilize leaderboards.
- Persist rating history for analytics or per-season resets.

## Observability
- Track rating distribution histogram to ensure values do not drift unrealistically.
- Log large rating swings (>100) to guard against bugs or cheating.

## Next Steps
- Provide a REST endpoint returning rating change breakdown for players.
- Consider season-based resets or decay for inactive players.
