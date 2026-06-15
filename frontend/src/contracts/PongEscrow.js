import {
  BLOCK_EXPLORER_URL,
  PONG_CONTRACT_ADDRESS,
  PONG_CONTRACT_ID,
  PONG_CONTRACT_NAME
} from '../config/env';

export {
  BLOCK_EXPLORER_URL,
  PONG_CONTRACT_ADDRESS,
  PONG_CONTRACT_ID,
  PONG_CONTRACT_NAME
};

// Kept as a compatibility export while components move from ABI calls to Clarity calls.
export const PONG_ESCROW_ADDRESS = PONG_CONTRACT_ADDRESS;
export const PONG_ESCROW_ABI = [];
