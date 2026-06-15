/* global BigInt */
import { useCallback, useEffect, useState } from 'react';
import { request } from '@stacks/connect';
import {
  Pc,
  bufferCV,
  fetchCallReadOnlyFunction,
  standardPrincipalCV,
  stringAsciiCV,
  uintCV
} from '@stacks/transactions';
import { useAccount } from '../components/Web3Provider';
import {
  PONG_CONTRACT_ADDRESS,
  PONG_CONTRACT_ID,
  PONG_CONTRACT_NAME,
  STACKS_API_URL,
  STACKS_NETWORK
} from '../config/env';
import { stxToMicroStx } from '../utils/stx';

const RESULT_REASONS = {
  score: 0,
  forfeit: 1,
  disconnect_timeout: 2
};

function signatureCV(signature) {
  const hex = String(signature).replace(/^0x/, '');
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  return bufferCV(bytes);
}

function resultArgs(result) {
  const score = result.finalScore || result.score || [
    result.score1 ?? result.score?.player1,
    result.score2 ?? result.score?.player2
  ];
  return [
    stringAsciiCV(result.roomCode),
    standardPrincipalCV(result.winnerAddress),
    uintCV(Number(score[0])),
    uintCV(Number(score[1])),
    uintCV(RESULT_REASONS[result.resultReason]),
    signatureCV(result.resultSignature)
  ];
}

async function waitForTransaction(txid) {
  const normalized = txid.startsWith('0x') ? txid : `0x${txid}`;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await fetch(`${STACKS_API_URL}/extended/v1/tx/${normalized}`);
    if (response.ok) {
      const transaction = await response.json();
      if (transaction.tx_status === 'success') return transaction;
      if (transaction.tx_status?.startsWith('abort_') ||
          transaction.tx_status?.startsWith('dropped_')) {
        throw new Error(`Transaction failed: ${transaction.tx_status}`);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error('Transaction confirmation timed out');
}

async function readContract(functionName, functionArgs = [], senderAddress) {
  return fetchCallReadOnlyFunction({
    contractAddress: PONG_CONTRACT_ADDRESS,
    contractName: PONG_CONTRACT_NAME,
    functionName,
    functionArgs,
    senderAddress: senderAddress || PONG_CONTRACT_ADDRESS,
    network: STACKS_NETWORK
  });
}

function parseOptionalPrincipal(cv) {
  return cv?.type === 'some' ? cv.value.value : null;
}

function parseMatch(cv) {
  if (!cv || cv.type === 'none') return null;
  const value = cv.type === 'some' ? cv.value.value : cv.value;
  return {
    player1: value['player-1'].value,
    player2: parseOptionalPrincipal(value['player-2']),
    stakeAmount: BigInt(value['stake-amount'].value),
    winner: parseOptionalPrincipal(value.winner),
    status: Number(value.status.value),
    createdAt: Number(value['created-at'].value),
    completedAt: Number(value['completed-at'].value)
  };
}

function useReadOnly(functionName, args, enabled = true, transform = value => value) {
  const { address } = useAccount();
  const [data, setData] = useState();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);

  const argsKey = args.map(arg => JSON.stringify(arg, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )).join(':');
  const refetch = useCallback(async () => {
    if (!enabled) return { data: undefined };
    setIsLoading(true);
    try {
      const value = transform(await readContract(functionName, args, address));
      setData(value);
      setError(null);
      return { data: value };
    } catch (nextError) {
      setError(nextError);
      return { error: nextError };
    } finally {
      setIsLoading(false);
    }
  // argsKey captures Clarity argument values without retriggering on array identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, argsKey, enabled, functionName, transform]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, isLoading, refetch };
}

function useContractAction() {
  const { address } = useAccount();
  const [hash, setHash] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (functionName, functionArgs = [], postConditions = []) => {
    if (!address) throw new Error('Connect your Stacks wallet first');
    setIsPending(true);
    setIsSuccess(false);
    setError(null);
    try {
      const result = await request('stx_callContract', {
        address,
        network: STACKS_NETWORK,
        contract: PONG_CONTRACT_ID,
        functionName,
        functionArgs,
        postConditionMode: 'deny',
        postConditions
      });
      if (!result.txid) throw new Error('Wallet did not return a transaction ID');
      const txid = result.txid.startsWith('0x') ? result.txid : `0x${result.txid}`;
      setHash(txid);
      setIsPending(false);
      setIsConfirming(true);
      const confirmed = await waitForTransaction(txid);
      setReceipt(confirmed);
      setIsConfirming(false);
      setIsSuccess(true);
      return txid;
    } catch (nextError) {
      setIsPending(false);
      setIsConfirming(false);
      setError(nextError);
      throw nextError;
    }
  }, [address]);

  return { execute, hash, receipt, isPending, isConfirming, isSuccess, error };
}

export function useIsRoomCodeAvailable(roomCode) {
  const args = [stringAsciiCV(roomCode || '')];
  return useReadOnly(
    'is-room-code-available',
    args,
    Boolean(roomCode && roomCode.length >= 4),
    cv => cv.type === 'true'
  );
}

export function useGetMatch(roomCode) {
  const args = [stringAsciiCV(roomCode || '')];
  return useReadOnly('get-match', args, Boolean(roomCode), parseMatch);
}

export function useGetMatchStatus(roomCode) {
  const args = [stringAsciiCV(roomCode || '')];
  return useReadOnly('get-match-status', args, Boolean(roomCode), cv => Number(cv.value));
}

export function useTokenAllowance() {
  return { data: 0n, isLoading: false, refetch: async () => ({ data: 0n }) };
}

export function useApproveToken() {
  return {
    approve: async () => null,
    hash: null,
    isPending: false,
    isConfirming: false,
    isSuccess: true,
    error: null
  };
}

export function useStakeAsPlayer1() {
  const action = useContractAction();
  const { address } = useAccount();
  const stakeAsPlayer1 = async (roomCode, currency, stakeAmount) => {
    const amount = stxToMicroStx(stakeAmount);
    console.table({
      network: STACKS_NETWORK,
      walletAddress: address,
      contract: PONG_CONTRACT_ID,
      function: 'stake-as-player-1',
      roomCode,
      amountMicroStx: amount.toString()
    });
    return action.execute(
      'stake-as-player-1',
      [stringAsciiCV(roomCode), uintCV(amount)],
      [Pc.principal(address).willSendEq(amount).ustx()]
    );
  };
  return { ...action, stakeAsPlayer1 };
}

export function useStakeAsPlayer2() {
  const action = useContractAction();
  const { address } = useAccount();
  const stakeAsPlayer2 = async (roomCode, currency, stakeAmount) => {
    const amount = stxToMicroStx(stakeAmount);
    console.table({
      network: STACKS_NETWORK,
      walletAddress: address,
      contract: PONG_CONTRACT_ID,
      function: 'stake-as-player-2',
      roomCode,
      amountMicroStx: amount.toString()
    });
    return action.execute(
      'stake-as-player-2',
      [stringAsciiCV(roomCode)],
      [Pc.principal(address).willSendEq(amount).ustx()]
    );
  };
  return { ...action, stakeAsPlayer2 };
}

export function useClaimPrize() {
  const action = useContractAction();
  const claimPrize = async result => ({
    alreadyClaimed: false,
    hash: await action.execute('claim-prize', resultArgs(result))
  });
  return { ...action, claimPrize };
}

export function useClaimRefund() {
  const action = useContractAction();
  return {
    ...action,
    claimRefund: roomCode => action.execute('claim-refund', [stringAsciiCV(roomCode)])
  };
}

export function useClaimAbandonedMatchRefund() {
  const action = useContractAction();
  return {
    ...action,
    claimAbandonedMatchRefund: (roomCode, signature) => action.execute(
      'claim-abandoned-match-refund',
      [stringAsciiCV(roomCode), signatureCV(signature)]
    )
  };
}

export function useWalletBalances(address) {
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    if (!address) return;
    fetch(`${STACKS_API_URL}/extended/v1/address/${address}/balances`)
      .then(response => response.json())
      .then(body => setBalance((Number(body.stx?.balance || 0) / 1_000_000).toFixed(2)))
      .catch(() => setBalance(null));
  }, [address]);
  return { STX: balance, CELO: balance };
}

function simpleAction(functionName) {
  return function useSimpleAction() {
    const action = useContractAction();
    return action;
  };
}

export function useCheckIn() {
  const action = simpleAction('check-in')();
  return { ...action, checkIn: () => action.execute('check-in') };
}

export function useClaimDailyReward() {
  const action = simpleAction('claim-daily-reward')();
  return { ...action, claimDailyReward: () => action.execute('claim-daily-reward') };
}

export function usePracticeMode() {
  const action = simpleAction('practice-mode')();
  return { ...action, practiceMode: () => action.execute('practice-mode') };
}

export function useGG() {
  const action = useContractAction();
  return { ...action, sendGG: result => action.execute('gg', resultArgs(result)) };
}

export function useCreateChallenge() {
  const action = useContractAction();
  return {
    ...action,
    createChallenge: (roomCode, tokenOrAmount, maybeAmount) => action.execute(
      'create-challenge',
      [stringAsciiCV(roomCode), uintCV(maybeAmount ?? tokenOrAmount)]
    )
  };
}

export function useAcceptChallenge() {
  const action = useContractAction();
  return {
    ...action,
    acceptChallenge: roomCode => action.execute(
      'accept-challenge',
      [stringAsciiCV(roomCode)]
    )
  };
}

export function useReportMatch() {
  const action = useContractAction();
  return {
    ...action,
    reportMatch: result => action.execute('report-match', resultArgs(result))
  };
}

export { waitForTransaction };
