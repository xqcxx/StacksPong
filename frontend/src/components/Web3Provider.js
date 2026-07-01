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
import { STACKS_CHAIN_ID, STACKS_NETWORK, WALLET_CONNECT_PROJECT_ID } from '../config/env';
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

  const requestOptions = useMemo(() => {
    const opts = { forceWalletSelect: true, network: STACKS_NETWORK };
    if (WALLET_CONNECT_PROJECT_ID) {
      opts.walletConnect = { projectId: WALLET_CONNECT_PROJECT_ID };
    }
    return opts;
  }, []);

  const open = useCallback(async () => {
    let lastErr;
    let next = null;

    try {
      const connectResponse = await connect(requestOptions);
      console.debug('[Web3Provider] connect response:', connectResponse);
      next = selectStxAddress(connectResponse);
    } catch (err) {
      console.debug('[Web3Provider] connect() failed, trying stx_getAccounts:', err);
      lastErr = err;
    }

    if (!next) {
      try {
        const accountsResponse = await request('stx_getAccounts');
        console.debug('[Web3Provider] stx_getAccounts fallback response:', accountsResponse);
        next = selectStxAddress(accountsResponse);
      } catch (err) {
        console.debug('[Web3Provider] stx_getAccounts fallback failed:', err);
        if (!lastErr) lastErr = err;
      }
    }

    if (!next) {
      throw lastErr || new Error('The wallet did not return a Stacks address');
    }
    setAccount(next);
    return next;
  }, [requestOptions]);

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
