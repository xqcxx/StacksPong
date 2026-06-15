# Note 19: Player Profile UI

## Summary
Leaderboards and match results reuse profile widgets. Documenting expected props and layout ensures contributions align with the retro style.

## Implementation Notes
- Create a `PlayerBadge` component that render avatar initials, username, rating, and win/loss record.
- Support compact and full variants; the compact version is used inside match cards while full version powers the leaderboard.
- Provide skeleton placeholders for asynchronous data loads to avoid layout flicker.
- Expose color accents to highlight the local player, the opponent, and top-ranked players differently.

## Observability
- Track how often profile cards render without stats (API failures) to flag backend issues.
- Log the latency between scoreboard update and UI render so we can monitor perception.

## Next Steps
- Provide CTA slots (e.g., “Add friend”) for future social features.
- Document CSS custom properties controlling badge colors for theme overrides.
