# Note 42: Anti-Cheat

## Summary
Even simple games attract cheaters. Document heuristics and enforcement levers.

## Implementation Notes
- Keep all physics server-side to minimize tampering surface.
- Monitor improbable input patterns (perfect reaction times, zero latency) and flag accounts.
- Add checksum validation for client payloads and ignore commands that jump more than allowed thresholds.
- Provide a moderation workflow to review flagged replays before banning.

## Observability
- Track number of flags raised per day and reasons.
- Maintain a leaderboard of suspected bots to gauge severity.

## Next Steps
- Integrate CAPTCHA or device fingerprint checks for suspicious signup flows.
- Consider optional recording of raw input streams for high-stakes tournaments.
