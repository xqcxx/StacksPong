# Note 13: Error Banner

## Summary
Visible feedback matters when sockets drop or matchmaking fails. This note documents the design and logic for user-facing error banners.

## Implementation Notes
- Introduce a top-level `StatusBanner` component that accepts severity, message, and optional retry action.
- Trigger the banner from shared error hooks that listen to socket events (`connect_error`, `disconnect`) and backend error payloads.
- Auto-dismiss info banners after a timer but require manual dismissal for warnings/errors to ensure players notice them.
- Log banner shows to analytics so we understand the top user pain points.

## Observability
- Track banner frequency and categorize by error code to inform backend prioritization.
- Record the time between error occurrence and user retry clicks to gauge UX effectiveness.

## Next Steps
- Localize banner copy once i18n lands.
- Provide inline troubleshooting links (e.g., open `STARTUP_GUIDE.md` section) for network-related issues.
