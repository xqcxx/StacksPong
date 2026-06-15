# Note 16: Accessibility Pass

## Summary
Document accessibility goals early to avoid expensive retrofits. Pong’s fast pace should still be inclusive.

## Implementation Notes
- Ensure all buttons have accessible labels and keyboard focus states; leverage `aria-live` for dynamic updates like scores.
- Provide color contrast guideline (>4.5:1) for text overlays on the retro background and offer a high-contrast theme.
- Support keyboard-only gameplay and expose shortcuts in the settings menu.
- Add screen reader announcements for game start/end events so players following audio cues stay informed.

## Observability
- Integrate axe-core or Lighthouse in CI to prevent regressions.
- Track accessibility toggle usage to prioritize additional modes.

## Next Steps
- Document testing matrix including screen readers (NVDA, VoiceOver) and switch devices.
- Add transcripts/subtitles for key audio cues within tutorials.
