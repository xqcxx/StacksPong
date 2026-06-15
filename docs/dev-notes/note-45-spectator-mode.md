# Note 45: Spectator Mode

## Summary
Spectators boost community energy. This note outlines architecture requirements.

## Implementation Notes
- Support read-only sockets that join a room without influencing gameplay; serve them reduced-frequency updates to save bandwidth.
- Provide UI to select live matches from a directory and display metadata (player names, score, timer).
- Hide sensitive data (player inputs) from spectators to reduce cheating opportunities.
- Add moderation controls to kick spectators if they become abusive (once chat exists).

## Observability
- Track spectator counts per match to understand load.
- Monitor the impact on bandwidth and adjust update frequency accordingly.

## Next Steps
- Offer rewind/pause once the replay system (note 46) lands.
- Explore monetization hooks (sponsor overlays) for spectator streams.
