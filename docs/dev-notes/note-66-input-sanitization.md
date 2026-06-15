# Note 66: Input Sanitization

## Summary
Sanitizing input reduces XSS/injection risk. Document requirements for both client and server.

## Implementation Notes
- Escape/render usernames and chat messages via libraries (DOMPurify) before injecting into the DOM.
- On the backend, normalize strings (trim, collapse whitespace) and enforce allowed character sets via regex.
- Use parameterized queries once persistence arrives to avoid SQL injection.
- Provide utility functions for sanitization so every module reuses the same logic.

## Observability
- Track sanitization rejections and categorize by reason to detect targeted attacks.

## Next Steps
- Add fuzz tests that send random unicode/control characters through APIs to ensure sanitization holds up.
- Document language for user guidelines to discourage offensive names with a filter list.
