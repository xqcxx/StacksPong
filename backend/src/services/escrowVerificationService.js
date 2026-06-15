const fetch = require('node-fetch');
const {
  ClarityType,
  deserializeCV,
  serializeCV,
  stringAsciiCV
} = require('@stacks/transactions');
const {
  configuredChainId,
  configuredContract,
  normalizePrincipal,
  principalsEqual
} = require('../utils/stacks');

function hexArg(cv) {
  const serialized = serializeCV(cv);
  return serialized.startsWith('0x') ? serialized : `0x${serialized}`;
}

function unwrapOptional(cv) {
  if (!cv || cv.type === ClarityType.OptionalNone) return null;
  return cv.type === ClarityType.OptionalSome ? cv.value : cv;
}

function principalValue(cv) {
  const value = unwrapOptional(cv);
  if (!value) return null;
  return value.value;
}

function uintValue(cv) {
  return Number(cv.value);
}

class EscrowVerificationService {
  constructor() {
    this.receiptRetryAttempts = 20;
    this.receiptRetryDelayMs = 3000;
  }

  initialize() {
    this.apiUrl = (process.env.STACKS_API_URL || 'https://api.testnet.hiro.so').replace(/\/$/, '');
    this.network = process.env.STACKS_NETWORK || 'testnet';
    this.chainId = configuredChainId();
    this.contract = configuredContract();
  }

  async request(path, options = {}) {
    this.initialize();
    const response = await fetch(`${this.apiUrl}${path}`, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.error || body.reason || `Stacks API request failed (${response.status})`);
    }
    return body;
  }

  async sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getChainDiagnostics() {
    this.initialize();
    const [info, contractSource] = await Promise.all([
      this.request('/v2/info'),
      fetch(`${this.apiUrl}/v2/contracts/source/${this.contract.address}/${this.contract.name}`)
    ]);
    return {
      network: this.network,
      chainId: this.chainId,
      expectedChainId: configuredChainId(),
      blockHeight: info.stacks_tip_height,
      contractAddress: this.contract.address,
      contractName: this.contract.name,
      contractId: this.contract.id,
      contractDeployed: contractSource.ok
    };
  }

  async assertExpectedChain(clientChainId) {
    const diagnostics = await this.getChainDiagnostics();
    if (clientChainId && Number(clientChainId) !== diagnostics.chainId) {
      throw new Error(
        `Network mismatch: wallet used chain ${clientChainId}, backend expects ${diagnostics.chainId}`
      );
    }
    if (!diagnostics.contractDeployed) {
      throw new Error(`Escrow contract ${diagnostics.contractId} is not deployed`);
    }
    return diagnostics;
  }

  async callReadOnly(functionName, args = [], sender = this.contract.address) {
    const body = await this.request(
      `/v2/contracts/call-read/${this.contract.address}/${this.contract.name}/${functionName}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sender,
          arguments: args.map(hexArg)
        })
      }
    );
    if (!body.okay) throw new Error(body.cause || `${functionName} read-only call failed`);
    return deserializeCV(body.result);
  }

  async getMatch(roomCode) {
    const optional = await this.callReadOnly('get-match', [stringAsciiCV(roomCode)]);
    const tuple = unwrapOptional(optional);
    if (!tuple) return null;
    const value = tuple.value;
    return {
      player1: principalValue(value['player-1']),
      player2: principalValue(value['player-2']),
      stakeAmountMicroStx: value['stake-amount'].value.toString(),
      winner: principalValue(value.winner),
      status: uintValue(value.status),
      createdAt: uintValue(value['created-at']),
      completedAt: uintValue(value['completed-at'])
    };
  }

  async fetchConfirmedTransaction(txId) {
    let last = null;
    for (let attempt = 0; attempt < this.receiptRetryAttempts; attempt += 1) {
      try {
        last = await this.request(`/extended/v1/tx/${txId}`);
        if (last.tx_status === 'success') return last;
        if (['abort_by_response', 'abort_by_post_condition', 'dropped_replace_by_fee',
          'dropped_replace_across_fork', 'dropped_too_expensive', 'dropped_stale_garbage_collect']
          .includes(last.tx_status)) {
          throw new Error(`Staking transaction failed: ${last.tx_status}`);
        }
      } catch (error) {
        if (!/not found|404/i.test(error.message)) throw error;
      }
      if (attempt < this.receiptRetryAttempts - 1) {
        await this.sleep(this.receiptRetryDelayMs);
      }
    }
    throw new Error(
      last ? `Staking transaction is not confirmed: ${last.tx_status}` :
        'Staking transaction is not visible on the Stacks API yet'
    );
  }

  assertContractCall(transaction, {
    functionName,
    roomCode,
    playerAddress
  }) {
    if (transaction.tx_type !== 'contract_call') {
      throw new Error('Transaction is not a contract call');
    }
    if (transaction.contract_call?.contract_id !== this.contract.id) {
      throw new Error('Transaction was not sent to the configured escrow contract');
    }
    if (transaction.contract_call?.function_name !== functionName) {
      throw new Error(`Transaction does not call ${functionName}`);
    }
    if (!principalsEqual(transaction.sender_address, playerAddress)) {
      throw new Error('Transaction sender does not match the authenticated wallet');
    }
    const roomArg = transaction.contract_call?.function_args?.[0];
    if (!roomArg || roomArg.repr !== `"${roomCode}"`) {
      throw new Error('Transaction does not target this room');
    }
  }

  async waitForPlayer2MatchState(roomCode, expectedPlayer) {
    let game = null;
    for (let attempt = 0; attempt < this.receiptRetryAttempts; attempt += 1) {
      game = await this.getMatch(roomCode);
      if (game?.status === 2 && principalsEqual(game.player2, expectedPlayer)) return game;
      if (attempt < this.receiptRetryAttempts - 1) {
        await this.sleep(this.receiptRetryDelayMs);
      }
    }
    throw new Error('Confirmed transaction has not reached the expected Player 2 match state');
  }

  async verifyPlayer2Stake({ roomCode, txHash, playerAddress, chainId }) {
    this.initialize();
    const expectedPlayer = normalizePrincipal(playerAddress);
    if (!expectedPlayer) throw new Error('A valid Stacks player principal is required');
    if (!/^(0x)?[0-9a-f]{64}$/i.test(txHash || '')) {
      throw new Error('A valid Stacks transaction ID is required');
    }
    const txId = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
    await this.assertExpectedChain(chainId);
    const transaction = await this.fetchConfirmedTransaction(txId);
    this.assertContractCall(transaction, {
      functionName: 'stake-as-player-2',
      roomCode,
      playerAddress: expectedPlayer
    });
    await this.waitForPlayer2MatchState(roomCode, expectedPlayer);
    return { player2Address: expectedPlayer, player2TxHash: txId };
  }

  async verifyRefund({ roomCode, playerAddress }) {
    const expectedPlayer = normalizePrincipal(playerAddress);
    if (!expectedPlayer) throw new Error('A valid Stacks player principal is required');
    const game = await this.getMatch(roomCode);
    if (!game || game.status !== 4) throw new Error('Match has not been refunded on-chain');
    if (!principalsEqual(game.player1, expectedPlayer) &&
        !principalsEqual(game.player2, expectedPlayer)) {
      throw new Error('Connected wallet is not a player in this match');
    }
    return true;
  }
}

module.exports = new EscrowVerificationService();
module.exports.hexArg = hexArg;
