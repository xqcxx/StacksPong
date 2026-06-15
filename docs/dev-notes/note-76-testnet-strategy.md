# Note 76: Testnet Strategy

## Summary
Testnets derisk changes before mainnet. Document how we use them.

## Implementation Notes
- Primary network: Alfajores (Celo testnet). Maintain funded accounts in a shared password manager.
- Mirror production contract deployments and backend config to testnet with realistic data where possible.
- Run scheduled soak tests on testnet to validate performance.
- Provide faucet links and scripts for developers to top up accounts quickly.

## Observability
- Track testnet-specific issues separately from mainnet to avoid confusion.
- Monitor faucet balances and refill proactively.

## Next Steps
- Document cleanup routines to remove stale test data so leaderboards stay readable.
- Evaluate additional private devnets when contract iterations are rapid.
