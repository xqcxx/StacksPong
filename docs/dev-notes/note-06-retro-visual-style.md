# Note 06: Retro Visual Style

## Summary
The project sells a nostalgic atmosphere, so documenting the visual vocabulary keeps future UI contributions consistent. This includes palette, typography, shader choices, and how canvas filters mimic CRT blur.

## Implementation Notes
- Create a design token file exporting colors, fonts, and spacing; import tokens into React components and SCSS/CSS modules.
- Use canvas gradients + lighter/darker overlays to create scanline effects; isolate the drawing logic inside a helper to avoid duplicating calculations.
- Maintain an asset guideline for sprites (ball glow, paddle trails) so replacements follow the same resolution and dithering rules.
- Provide screenshot references in `screenshots/` and link them to these guidelines for quick visual reviews.

## Observability
- Track FPS on low-end devices when retro shaders are active to ensure visual polish does not tank performance.
- Add a toggle that logs when players switch between retro and clean themes to gauge adoption before investing in more art assets.

## Next Steps
- Document typography fallbacks for browsers missing the retro font stack.
- Consider shipping a design lint step (style-dictionary) that checks token usage.
