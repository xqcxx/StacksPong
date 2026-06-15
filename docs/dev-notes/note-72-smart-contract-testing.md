# Note 72: Smart Contract Testing

## Summary
Foundry tests keep contracts safe. Document expectations.

## Implementation Notes
- Place unit tests in `blockchain/test` using Foundry/Forge; cover success and failure paths.
- Use fuzz tests to ensure reward math behaves under extreme inputs.
- Simulate integration with backend by mocking calls/events to confirm off-chain interactions.
- Run `forge test` inside CI whenever blockchain code changes and display gas reports for regressions.

## Observability
- Track gas usage per function from Forge’s `gas-report` to infer cost trends.
- Log flaky tests and fix them immediately; blockchain code tolerates little ambiguity.

## Next Steps
- Document local testing commands (anvil devnet) for manual verification.
- Add integration tests that run backend + contracts together via scripts in `blockchain/script`.
