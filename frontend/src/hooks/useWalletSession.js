import { useCallback } from 'react';
import {
  standardPrincipalCV,
  stringAsciiCV,
  tupleCV,
  uintCV
} from '@stacks/transactions';
import { request } from '@stacks/connect';
import { useAccount } from '../components/Web3Provider';
import { BACKEND_URL } from '../constants';

const STORAGE_PREFIX = 'stacks-pong-wallet-session';

function storageKey(address) {
  return `${STORAGE_PREFIX}:${address}`;
}

export function getStoredWalletSession(address) {
  if (!address) return null;
  try {
    const session = JSON.parse(sessionStorage.getItem(storageKey(address)));
    return session?.token && new Date(session.expiresAt).getTime() > Date.now()
      ? session
      : null;
  } catch {
    return null;
  }
}

export function useWalletSession() {
  const { address } = useAccount();

  const ensureWalletSession = useCallback(async () => {
    if (!address) throw new Error('Connect your Stacks wallet first.');
    const stored = getStoredWalletSession(address);
    if (stored) return stored.token;

    const challengeResponse = await fetch(
      `${BACKEND_URL}/auth/wallet-challenge/${address}`
    );
    const challenge = await challengeResponse.json();
    if (!challengeResponse.ok) {
      throw new Error(challenge.error || 'Unable to create wallet session challenge.');
    }

    const domain = tupleCV({
      name: stringAsciiCV(challenge.domain.name),
      version: stringAsciiCV(challenge.domain.version),
      'chain-id': uintCV(challenge.domain.chainId)
    });
    const message = tupleCV({
      action: stringAsciiCV(challenge.message.action),
      challenge: stringAsciiCV(challenge.message.challenge),
      wallet: standardPrincipalCV(address)
    });

    const signed = await request('stx_signStructuredMessage', { message, domain });

    const sessionResponse = await fetch(`${BACKEND_URL}/auth/wallet-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: address,
        signature: signed.signature,
        publicKey: signed.publicKey
      })
    });
    const session = await sessionResponse.json();
    if (!sessionResponse.ok) {
      throw new Error(session.error || 'Unable to authenticate wallet session.');
    }

    sessionStorage.setItem(storageKey(address), JSON.stringify(session));
    return session.token;
  }, [address]);

  return { ensureWalletSession };
}
