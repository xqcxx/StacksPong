# Note 74: Wallet Onboarding

## Summary
To interact with Celo, players will eventually connect wallets. Document UX and security considerations.

## Implementation Notes
- Support common wallets (Valora, MetaMask) using WalletConnect; list supported networks explicitly.
- Provide clear prompts explaining why wallet permissions are needed and how gas fees work.
- Store minimal wallet metadata client-side and never expose private keys; signing happens inside the wallet provider.
- Offer a sandbox/testnet mode for new players with faucet links.

## Observability
- Track wallet connection attempts, success rates, and drop-off reasons.
- Monitor which wallet providers dominate to prioritise QA coverage.

## Next Steps
- Document troubleshooting steps for failed connections (e.g., stale WalletConnect sessions).
- Consider guest mode bridging so wallets are optional for casual play.
