# Note 69: Blockchain Integration

## Summary
The repository includes a blockchain package. Document how on-chain pieces interact with the game.

## Implementation Notes
- Smart contracts (see `blockchain/src`) can escrow rewards or record high scores; define clear APIs between backend and contracts.
- Backend signs transactions using a wallet configured via env vars; isolate signing logic into a service module.
- Use events emitted by the contract to notify the backend about reward settlements, relaying them to players.
- Keep blockchain operations asynchronous so gameplay never blocks on chain confirmations.

## Observability
- Monitor contract event listeners for lag and catch up if the node restarts.
- Log transaction hashes and statuses for auditing.

## Next Steps
- Document local testnet setup (Foundry/Anvil) for contributors touching blockchain code.
- Plan for failure modes when the blockchain RPC provider is down.
