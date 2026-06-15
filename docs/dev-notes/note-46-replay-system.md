# Note 46: Replay System

## Summary
Replays let players analyze matches and share highlights. Document the desired approach.

## Implementation Notes
- Record deterministic inputs (player actions, random seeds) instead of raw frames to keep files small.
- Store replay files server-side linked to match IDs; expose a download/watch endpoint protected by auth once available.
- Build a replay player that reuses the existing render loop but sources data from the replay file.
- Version replay formats so older files continue to work after protocol changes.

## Observability
- Track replay generation success rates and file sizes.
- Log playback errors to catch incompatible versions.

## Next Steps
- Allow users to flag replays when reporting cheating.
- Consider automatic highlight reels (e.g., longest rally) for social sharing.
