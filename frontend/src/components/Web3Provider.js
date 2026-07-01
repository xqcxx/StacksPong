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
  clearLocalStorage,
  isConnected,
  request
} from '@stacks/connect';
import { STACKS_CHAIN_ID, STACKS_NETWORK } from '../config/env';
import { selectStxAddress } from '../utils/stacksWallet';

const StacksWalletContext = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (isConnected()) {
      const cached = selectStxAddress(getLocalStorage());
      if (cached) setAccount(cached);
    }
  }, []);

  const open = useCallback(async () => {
    const response = await connect({ network: STACKS_NETWORK });
    console.debug('[Web3Provider] connect response:', response);
    let next = selectStxAddress(response);
    if (!next) {
      console.debug('[Web3Provider] connect() returned no STX address, trying stx_getAccounts as Xverse fallback');
      try {
        const accountsResponse = await request('stx_getAccounts', { network: STACKS_NETWORK });
        console.debug('[Web3Provider] stx_getAccounts response:', accountsResponse);
        next = selectStxAddress(accountsResponse);
      } catch (fallbackErr) {
        console.debug('[Web3Provider] stx_getAccounts fallback failed:', fallbackErr);
      }
    }
    if (!next) throw new Error('The wallet did not return a Stacks address');
    setAccount(next);
    return next;
  }, []);

  const close = useCallback(() => {
    disconnect();
    clearLocalStorage();
    setAccount(null);
  }, []);

  const signStructuredMessage = useCallback(async ({ message, domain }) => {
    return request('stx_signStructuredMessage', { message, domain });
  }, []);

  const value = useMemo(() => ({
    address: account?.address || null,
    publicKey: account?.publicKey || null,
    isConnected: Boolean(account?.address) && isConnected(),
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
