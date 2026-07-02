import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  AppConfig,
  UserSession,
  authenticate,
  request
} from '@stacks/connect';
import { STACKS_CHAIN_ID, STACKS_NETWORK } from '../config/env';
import { getStxAddressFromSession } from '../utils/stacksWallet';

const StacksWalletContext = createContext(null);

export function Web3Provider({ children }) {
  const [stxAddress, setStxAddress] = useState(null);
  const userSessionRef = useRef(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    const session = new UserSession({ appConfig });
    userSessionRef.current = session;

    const sessionAccount = getStxAddressFromSession(session);
    if (sessionAccount) {
      setStxAddress(sessionAccount.address);
    }
    setSessionReady(true);
  }, []);

  const open = useCallback(async () => {
    const session = userSessionRef.current;
    if (!session) throw new Error('Session not initialized');

    return new Promise((resolve, reject) => {
      try {
        authenticate({
          appDetails: {
            name: 'StacksPong',
            icon: window.location.origin + '/logo192.png'
          },
          userSession: session,
          onFinish: () => {
            const userData = session.loadUserData();
            const addr = userData.profile?.stxAddress?.mainnet
              || userData.profile?.stxAddress?.testnet;
            if (!addr) {
              reject(new Error('The wallet did not return a Stacks address'));
              return;
            }
            setStxAddress(addr);
            resolve(addr);
          },
          onCancel: (error) => {
            reject(error || new Error('Wallet connection cancelled'));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  const close = useCallback(() => {
    const session = userSessionRef.current;
    if (session) {
      session.signUserOut();
    }
    setStxAddress(null);
  }, []);

  const signStructuredMessage = useCallback(async ({ message, domain }) => {
    return request('stx_signStructuredMessage', { message, domain });
  }, []);

  const value = useMemo(() => ({
    address: stxAddress,
    publicKey: null,
    isConnected: Boolean(stxAddress),
    chainId: STACKS_CHAIN_ID,
    chain: { id: STACKS_CHAIN_ID, name: STACKS_NETWORK },
    userSession: userSessionRef.current,
    open,
    disconnect: close,
    signStructuredMessage
  }), [stxAddress, close, open, signStructuredMessage]);

  if (!sessionReady) return null;

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
