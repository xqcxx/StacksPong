# Note 28: Game Over Sequence

## Summary
Game endings anchor the user experience. Document how we wrap up matches, show results, and clean state.

## Implementation Notes
- Backend emits `gameOver` with winner, loser, rating delta, and highlight data; frontends route to a results screen overlay.
- Stop the render loop and remove socket listeners before showing results to prevent stray updates.
- Provide CTA buttons (Play Again, Share Score) and rehydrate leaderboard immediately.
- Clean up timers, room references, and stored state to avoid memory leaks.

## Observability
- Track the time between match end and `gameOver` display; long delays indicate event handling issues.
- Log the proportion of players pressing “Play Again” to inform matchmaking optimization.

## Next Steps
- Add celebratory animations tied to rating milestones.
- Support screenshot or shareable GIF generation down the line.
