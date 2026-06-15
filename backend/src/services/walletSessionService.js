const crypto = require('crypto');
const {
  encodeStructuredDataBytes,
  getAddressFromPublicKey,
  publicKeyFromSignatureRsv
} = require('@stacks/transactions');
const WalletSession = require('../models/WalletSession');
const {
  configuredChainId,
  normalizePrincipal,
  sip018Domain,
  walletChallengeMessage
} = require('../utils/stacks');

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function structuredPayload(walletAddress, challenge, action = 'authenticate', username = '') {
  return {
    domain: sip018Domain(),
    message: walletChallengeMessage({ walletAddress, challenge, action, username })
  };
}

function structuredDigest(payload) {
  return crypto.createHash('sha256')
    .update(encodeStructuredDataBytes(payload))
    .digest('hex');
}

function verifySip018({ walletAddress, signature, publicKey, challenge, action, username }) {
  const normalized = normalizePrincipal(walletAddress);
  if (!normalized || !signature) throw new Error('Wallet principal and signature are required');

  const digest = structuredDigest(
    structuredPayload(normalized, challenge, action, username)
  );
  const cleanSignature = signature.replace(/^0x/, '');
  const recoveredPublicKey = publicKeyFromSignatureRsv(digest, cleanSignature);
  if (publicKey && recoveredPublicKey !== publicKey.replace(/^0x/, '')) {
    throw new Error('Signature public key does not match the wallet response');
  }

  const network = process.env.STACKS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
  const recoveredAddress = getAddressFromPublicKey(recoveredPublicKey, network);
  if (recoveredAddress !== normalized) throw new Error('Invalid SIP-018 wallet signature');
  return recoveredPublicKey;
}

async function createChallenge(walletAddress) {
  const normalized = normalizePrincipal(walletAddress);
  if (!normalized) throw new Error('Valid Stacks wallet principal is required');

  const challenge = crypto.randomBytes(32).toString('hex');
  const challengeExpiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
  await WalletSession.findOneAndUpdate(
    { walletAddress: normalized },
    {
      walletAddress: normalized,
      challenge,
      challengeExpiresAt,
      tokenHash: null,
      tokenExpiresAt: null
    },
    { upsert: true, new: true }
  );

  return {
    walletAddress: normalized,
    challenge,
    domain: {
      name: 'StacksPong',
      version: '1',
      chainId: configuredChainId()
    },
    message: {
      action: 'authenticate',
      wallet: normalized,
      challenge
    },
    expiresAt: challengeExpiresAt
  };
}

async function verifyChallenge({ walletAddress, signature, publicKey }) {
  const normalized = normalizePrincipal(walletAddress);
  if (!normalized) throw new Error('Valid Stacks wallet principal is required');

  const session = await WalletSession.findOne({ walletAddress: normalized });
  if (!session?.challenge || !session.challengeExpiresAt ||
      session.challengeExpiresAt.getTime() <= Date.now()) {
    throw new Error('Wallet challenge expired');
  }

  verifySip018({
    walletAddress: normalized,
    signature,
    publicKey,
    challenge: session.challenge,
    action: 'authenticate'
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  session.challenge = null;
  session.challengeExpiresAt = null;
  session.tokenHash = tokenHash(token);
  session.tokenExpiresAt = expiresAt;
  session.publicKey = publicKey;
  await session.save();
  return { token, walletAddress: normalized, expiresAt };
}

async function authenticateToken(token) {
  if (!token) return null;
  const session = await WalletSession.findOne({
    tokenHash: tokenHash(token),
    tokenExpiresAt: { $gt: new Date() }
  }).lean();
  return session?.walletAddress || null;
}

module.exports = {
  authenticateToken,
  createChallenge,
  structuredDigest,
  structuredPayload,
  verifyChallenge,
  verifySip018
};
