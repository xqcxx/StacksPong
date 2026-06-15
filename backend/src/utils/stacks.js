const {
  contractPrincipalCV,
  standardPrincipalCV,
  stringAsciiCV,
  tupleCV,
  uintCV,
  validateStacksAddress
} = require('@stacks/transactions');

const STACKS_CHAIN_IDS = Object.freeze({
  mainnet: 1,
  testnet: 2147483648,
  devnet: 2147483648
});

function normalizePrincipal(value) {
  if (typeof value !== 'string') return null;
  const principal = value.trim();
  return validateStacksAddress(principal) ? principal : null;
}

function principalsEqual(left, right) {
  return Boolean(left && right && left === right);
}

function configuredChainId() {
  if (process.env.STACKS_CHAIN_ID) return Number(process.env.STACKS_CHAIN_ID);
  return STACKS_CHAIN_IDS[process.env.STACKS_NETWORK || 'testnet'];
}

function configuredContract() {
  const address = normalizePrincipal(process.env.PONG_CONTRACT_ADDRESS);
  const name = process.env.PONG_CONTRACT_NAME;
  if (!address || !name) {
    throw new Error('PONG_CONTRACT_ADDRESS and PONG_CONTRACT_NAME are required');
  }
  return { address, name, id: `${address}.${name}` };
}

function sip018Domain() {
  return tupleCV({
    name: stringAsciiCV('StacksPong'),
    version: stringAsciiCV('1'),
    'chain-id': uintCV(configuredChainId())
  });
}

function walletChallengeMessage({ walletAddress, challenge, action = 'authenticate', username = '' }) {
  const fields = {
    action: stringAsciiCV(action),
    challenge: stringAsciiCV(challenge),
    wallet: standardPrincipalCV(walletAddress)
  };
  if (username) fields.username = stringAsciiCV(username);
  return tupleCV(fields);
}

function resultProofTuple({
  chainId,
  contractAddress,
  contractName,
  roomCode,
  player1Address,
  player2Address,
  winnerAddress,
  score1,
  score2,
  reasonCode
}) {
  return tupleCV({
    'chain-id': uintCV(chainId),
    contract: contractPrincipalCV(contractAddress, contractName),
    domain: stringAsciiCV('STACKSPONG_MATCH_RESULT_V1'),
    'room-code': stringAsciiCV(roomCode),
    'player-1': standardPrincipalCV(player1Address),
    'player-2': standardPrincipalCV(player2Address),
    winner: standardPrincipalCV(winnerAddress),
    'score-1': uintCV(score1),
    'score-2': uintCV(score2),
    reason: uintCV(reasonCode)
  });
}

function abandonedProofTuple({
  chainId,
  contractAddress,
  contractName,
  roomCode,
  player1Address,
  player2Address
}) {
  return tupleCV({
    'chain-id': uintCV(chainId),
    contract: contractPrincipalCV(contractAddress, contractName),
    domain: stringAsciiCV('STACKSPONG_ABANDONED_REFUND_V1'),
    'room-code': stringAsciiCV(roomCode),
    'player-1': standardPrincipalCV(player1Address),
    'player-2': standardPrincipalCV(player2Address)
  });
}

module.exports = {
  STACKS_CHAIN_IDS,
  abandonedProofTuple,
  configuredChainId,
  configuredContract,
  normalizePrincipal,
  principalsEqual,
  resultProofTuple,
  sip018Domain,
  walletChallengeMessage
};
