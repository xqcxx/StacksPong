const ENV = process.env.REACT_APP_STACKS_NETWORK || 'testnet';

function envVar(name) {
  return process.env[`REACT_APP_${name}`] || '';
}

export const STACKS_NETWORK = ENV;
export const STACKS_API_URL = envVar('STACKS_API_URL') ||
  (ENV === 'mainnet' ? 'https://api.mainnet.hiro.so' : 'https://api.testnet.hiro.so');
export const STACKS_CHAIN_ID = Number(envVar('STACKS_CHAIN_ID') ||
  (ENV === 'mainnet' ? 1 : 2147483648));
export const PONG_CONTRACT_ADDRESS = envVar('PONG_CONTRACT_ADDRESS');
export const PONG_CONTRACT_NAME = envVar('PONG_CONTRACT_NAME') || 'pong-escrow';
export const PONG_CONTRACT_ID = `${PONG_CONTRACT_ADDRESS}.${PONG_CONTRACT_NAME}`;
export const BLOCK_EXPLORER_URL = envVar('EXPLORER') || 'https://explorer.hiro.so';
export const ENVIRONMENT = ENV;
export const IS_MAINNET = ENV === 'mainnet';
export const txExplorerUrl = txid =>
  `${BLOCK_EXPLORER_URL}/txid/${txid}?chain=${IS_MAINNET ? 'mainnet' : 'testnet'}`;

// Transitional alias used by history/proof presentation components.
export const PONG_ESCROW_ADDRESS = PONG_CONTRACT_ADDRESS;
