const test = require('node:test');
const assert = require('node:assert/strict');

process.env.STACKS_NETWORK = 'testnet';
process.env.STACKS_CHAIN_ID = '2147483648';
process.env.STACKS_API_URL = 'https://api.testnet.hiro.so';
process.env.PONG_CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
process.env.PONG_CONTRACT_NAME = 'pong-escrow';

const service = require('../src/services/escrowVerificationService');

test('accepts only the configured Player 2 stake call', () => {
  service.initialize();
  assert.doesNotThrow(() => service.assertContractCall({
    tx_type: 'contract_call',
    sender_address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    contract_call: {
      contract_id: `${process.env.PONG_CONTRACT_ADDRESS}.pong-escrow`,
      function_name: 'stake-as-player-2',
      function_args: [{ repr: '"PONG01"' }]
    }
  }, {
    functionName: 'stake-as-player-2',
    roomCode: 'PONG01',
    playerAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'
  }));
});

test('rejects a transaction sent to another contract', () => {
  service.initialize();
  assert.throws(() => service.assertContractCall({
    tx_type: 'contract_call',
    sender_address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    contract_call: {
      contract_id: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG.fake',
      function_name: 'stake-as-player-2',
      function_args: [{ repr: '"PONG01"' }]
    }
  }, {
    functionName: 'stake-as-player-2',
    roomCode: 'PONG01',
    playerAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'
  }), /configured escrow/);
});
