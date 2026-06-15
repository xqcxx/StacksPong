# Note 89 – My Wins Pagination Overwrite

## Context
- My Wins fetches `/games/my-wins` with pagination params but replaces `wins` state on every request.
- The existing issue notes that “Load more” discards previous results, which we can now fix similar to Game History.

## Goals
- Reuse `mergePages`/`shouldResetPagination` so pagination appends properly.
- Avoid duplicate cards and keep “claimable only” filter working after new pages load.
- Show accurate pagination info (showing N of M wins).
- Indicate when all wins are loaded and disable the button accordingly.

## Observability
- Add console.debug logs for offset/limit similar to Game History for easier troubleshooting.
