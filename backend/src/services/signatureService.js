const { createHash } = require('crypto');
const {
  privateKeyToPublic,
  publicKeyToHex,
  serializeCVBytes,
  signMessageHashRsv
} = require('@stacks/transactions');
const {
  abandonedProofTuple,
  configuredContract,
  resultProofTuple
} = require('../utils/stacks');
const { loadSigningPrivateKey } = require('../utils/signingWallet');

const RESULT_REASON_CODES = Object.freeze({
  score: 0,
  forfeit: 1,
  disconnect_timeout: 2
});

function proofHash(tuple) {
  return createHash('sha256').update(serializeCVBytes(tuple)).digest('hex');
}

function buildResultHash(input) {
  const reasonCode = RESULT_REASON_CODES[input.resultReason];
  if (reasonCode === undefined) {
    throw new Error(`Unsupported result reason: ${input.resultReason}`);
  }
  const contract = input.contractName
    ? { address: input.contractAddress, name: input.contractName }
    : configuredContract();
  return proofHash(resultProofTuple({
    ...input,
    contractAddress: contract.address,
    contractName: contract.name,
    reasonCode
  }));
}

class SignatureService {
  constructor() {
    this.privateKey = null;
    this.publicKey = null;
    this.initializeWallet();
  }

  initializeWallet() {
    const signingKey = loadSigningPrivateKey();
    if (!signingKey) {
      console.warn(
        'SIGNING_MNEMONIC or SIGNING_PRIVATE_KEY is not configured; result proofs are disabled'
      );
      return;
    }

    try {
      this.privateKey = signingKey.privateKey;
      this.publicKey = publicKeyToHex(privateKeyToPublic(this.privateKey));
      const pathDescription = signingKey.derivationPath
        ? ` at ${signingKey.derivationPath}`
        : '';
      console.log(
        `Stacks result signer initialized from ${signingKey.source}${pathDescription}:`,
        this.publicKey
      );
      if (signingKey.source === 'private-key') {
        console.warn(
          'SIGNING_PRIVATE_KEY is deprecated; configure SIGNING_MNEMONIC and SIGNING_DERIVATION_PATH'
        );
      }
    } catch (error) {
      this.privateKey = null;
      console.error('Failed to initialize Stacks result signer:', error.message);
    }
  }

  signHash(hash) {
    if (!this.privateKey) throw new Error('Stacks result signer is not initialized');
    return `0x${signMessageHashRsv({
      messageHash: hash,
      privateKey: this.privateKey
    })}`;
  }

  async signResult(result) {
    return this.signHash(buildResultHash(result));
  }

  async signAbandonedRefund(
    roomCode,
    player1Address,
    player2Address,
    contractAddress,
    chainId,
    contractName = process.env.PONG_CONTRACT_NAME
  ) {
    return this.signHash(proofHash(abandonedProofTuple({
      roomCode,
      player1Address,
      player2Address,
      contractAddress,
      contractName,
      chainId
    })));
  }

  getSignerAddress() {
    return this.publicKey;
  }

  getSignerPublicKey() {
    return this.publicKey;
  }

  isReady() {
    return Boolean(this.privateKey);
  }
}

module.exports = new SignatureService();
module.exports.RESULT_REASON_CODES = RESULT_REASON_CODES;
module.exports.buildResultHash = buildResultHash;
module.exports.proofHash = proofHash;
