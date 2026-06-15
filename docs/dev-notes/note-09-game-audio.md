# Note 09: Game Audio

## Summary
Audio builds immersion. Documenting how the current soundtrack loading works and how we gate playback keeps browsers happy and reduces regressions.

## Implementation Notes
- Gate audio playback behind a user gesture to satisfy autoplay policies; store the opt-in flag in context so components know whether to play SFX.
- Preload audio buffers via the Web Audio API to avoid delays when a rally intensifies.
- Provide mixing controls: music volume, SFX volume, mute toggle. Persist them to localStorage.
- Keep audio asset references in a dedicated config file so we can swap tracks without rewriting logic.

## Observability
- Record how often players mute the soundtrack to decide if we need alternative genres.
- Capture audio engine errors (failed decode, unsupported format) and surface them in logs with browser UA to spot compatibility issues.

## Next Steps
- Experiment with procedural music seeds tied to the match genome mentioned in README for unique matches.
- Bundle shorter SFX fallbacks (<50kb) for constrained networks.
