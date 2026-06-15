# Note 15: Responsive Layout

## Summary
Players join from laptops and phones. Documenting breakpoints and layout decisions keeps the UI consistent.

## Implementation Notes
- Define breakpoints (mobile, tablet, desktop) inside a single constants file consumed by CSS and JS.
- Use CSS grid/flexbox to reposition panels; prefer column layout on narrow screens and side-by-side panels on desktop.
- Scale the canvas proportionally and adjust paddle sizes to maintain gameplay readability at smaller widths.
- Test in both orientations on mobile and lock orientation to landscape where possible.

## Observability
- Track viewport sizes hitting the app to understand real usage rather than guessing.
- Record UI overflow errors to catch missing breakpoints.

## Next Steps
- Add responsive screenshots to documentation for visual QA.
- Consider supporting full-screen mode with friendly instructions for mobile browsers.
