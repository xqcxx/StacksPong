# Note 27: Score Tracking

## Summary
Scoring determines match lifecycle and feeds the leaderboard. Capture expectations for data flow.

## Implementation Notes
- Maintain scores inside the authoritative game state; increment when the ball crosses bounds and emit `scoreUpdate` events or include values inside `gameUpdate`.
- Reset paddles/ball positions after each score and include a short countdown to give players time.
- Persist final scores to the player service once `gameOver` fires, along with rating changes.
- Handle mercy rules or early exits gracefully by awarding points appropriately.

## Observability
- Log scoring events with metadata (rally length, winner) to analyze game balance.
- Track mismatches between displayed scores and backend values to catch UI desyncs.

## Next Steps
- Document API responses for retrieving recent matches with scores for player history.
- Provide admin tooling to adjust results when disputes occur.
