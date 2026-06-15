# StacksPong Contract

```bash
npm install
clarinet check
npm test
```

The contract targets Clarity 4 at epoch 3.3. Deploy with Clarinet using the
appropriate `settings/Testnet.toml` or `settings/Mainnet.toml`, then call
`set-backend-oracle` once with the compressed public key derived from
`SIGNING_MNEMONIC` at `SIGNING_DERIVATION_PATH`.

The canonical STX account path is `m/44'/5757'/0'/0/{index}`. The backend
defaults to account index `0`, or `m/44'/5757'/0'/0/0`. If the mnemonic,
passphrase, account index, or path changes, update the contract oracle before
allowing games to use that backend.

The backend, frontend, and auto-player must all use the same contract address,
contract name, network, and chain ID.
