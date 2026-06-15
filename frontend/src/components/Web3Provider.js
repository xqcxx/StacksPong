import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  connect,
  disconnect,
  getLocalStorage,
  request
} from '@stacks/connect';
import { STACKS_CHAIN_ID, STACKS_NETWORK } from '../config/env';

const StacksWalletContext = createContext(null);

function selectStxAddress(addresses = []) {
  return addresses.find(entry => entry.symbol === 'STX') || addresses[0] || null;
}

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const cached = selectStxAddress(getLocalStorage()?.addresses || []);
    if (cached) setAccount(cached);
  }, []);

  const open = useCallback(async () => {
    const response = await connect({ network: STACKS_NETWORK });
    const next = selectStxAddress(response.addresses);
    if (!next) throw new Error('The wallet did not return a Stacks address');
    setAccount(next);
    return next;
  }, []);

  const close = useCallback(() => {
    disconnect();
    setAccount(null);
  }, []);

  const signStructuredMessage = useCallback(async ({ message, domain }) => {
    return request('stx_signStructuredMessage', { message, domain });
  }, []);

  const value = useMemo(() => ({
    address: account?.address || null,
    publicKey: account?.publicKey || null,
    isConnected: Boolean(account?.address),
    chainId: STACKS_CHAIN_ID,
    chain: { id: STACKS_CHAIN_ID, name: STACKS_NETWORK },
    open,
    disconnect: close,
    signStructuredMessage
  }), [account, close, open, signStructuredMessage]);

  return (
    <StacksWalletContext.Provider value={value}>
      {children}
    </StacksWalletContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(StacksWalletContext);
  if (!context) throw new Error('useAccount must be used within Web3Provider');
  return context;
}

export function useStacksWallet() {
  return useAccount();
}
