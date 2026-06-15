# Note 87 – Game History Pagination Overwrite

## Context
- `GameHistory` fetches `/games/player/:name/history` with `offset/limit`.
- State setter replaces `games` with the new page each time, so Load More never accumulates results.
- Users can’t view older matches, matching the issue description.

## Goals
- Append results while keeping ordering consistent (newest first).
- Avoid duplicate cards when backend returns overlapping items.
- Preserve stats/pagination metadata without corrupting totals.

## Proposed Steps
1. Introduce a helper to merge new pages into existing state by `_id`.
2. Update `GameHistory` to replace results when `offset === 0`, append otherwise.
3. Keep `stats` derived from first page to avoid drift.
4. Export helper from `frontend/src/utils/pagination.js` for reuse.

## Observability
- Log the page size + offset while in development to confirm increments.
- Consider instrumenting a metric for “history_load_more” to detect failures.

## Next Steps
- Evaluate moving pagination logic to a shared hook used by My Wins.
- Investigate backend support for `cursor`-based pagination to remove offset math.
