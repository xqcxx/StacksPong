# Note 12: Component Boundaries

## Summary
Component boundaries influence performance and testability. This note maps the current component tree and codifies how to split responsibilities.

## Implementation Notes
- Keep layout components (wrapping cards, panels) dumb and rely on container components (e.g., `Welcome`, `MultiplayerGame`) to handle data fetching.
- Extract shared UI (buttons, forms, modals) into `frontend/src/components/common/` once duplication emerges.
- Use prop interfaces to enforce what data crosses the boundary; avoid passing raw socket objects deep into the tree.
- Document each component’s dependencies in JSDoc so new contributors can see at a glance what it touches.

## Observability
- Maintain Storybook or Ladle stories for commonly reused components to catch regressions visually.
- Track bundle analyzer output to see when components start importing large modules by accident.

## Next Steps
- Introduce ESLint rules (e.g., boundaries plugin) to keep certain layers from importing each other directly.
- Review the tree quarterly to ensure the architecture still matches feature growth.
