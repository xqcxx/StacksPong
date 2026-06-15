import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  bufferCV,
  boolCV,
  contractPrincipalCV,
  privateKeyToPublic,
  publicKeyToHex,
  serializeCVBytes,
  signMessageHashRsv,
  standardPrincipalCV,
  stringAsciiCV,
  tupleCV,
  uintCV
} from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer");
const player1 = accounts.get("wallet_1");
const player2 = accounts.get("wallet_2");
const outsider = accounts.get("wallet_3");

const oraclePrivateKey =
  "8f2a5594904a34d4f1c2a48116af8f3520f29056dfd932f64f2a8e0aaf773b701";
const oraclePublicKey = publicKeyToHex(privateKeyToPublic(oraclePrivateKey));

const room = "PONG01";
const stake = 1_000_000n;

function call(sender, fn, args = []) {
  return simnet.callPublicFn("pong-escrow", fn, args, sender).result;
}

function resultSignature({
  winner = player1,
  score1 = 5,
  score2 = 2,
  reason = 0,
  roomCode = room,
  contractAddress = deployer,
  chainId = 2147483648
} = {}) {
  const proof = tupleCV({
    "chain-id": uintCV(chainId),
    contract: contractPrincipalCV(contractAddress, "pong-escrow"),
    domain: stringAsciiCV("STACKSPONG_MATCH_RESULT_V1"),
    "room-code": stringAsciiCV(roomCode),
    "player-1": standardPrincipalCV(player1),
    "player-2": standardPrincipalCV(player2),
    winner: standardPrincipalCV(winner),
    "score-1": uintCV(score1),
    "score-2": uintCV(score2),
    reason: uintCV(reason)
  });
  const digest = createHash("sha256").update(serializeCVBytes(proof)).digest("hex");
  return bufferCV(Buffer.from(signMessageHashRsv({
    messageHash: digest,
    privateKey: oraclePrivateKey
  }), "hex"));
}

function stakeBoth() {
  call(player1, "stake-as-player-1", [stringAsciiCV(room), uintCV(stake)]);
  call(player2, "stake-as-player-2", [stringAsciiCV(room)]);
}

beforeEach(() => {
  call(deployer, "set-backend-oracle", [
    bufferCV(Buffer.from(oraclePublicKey, "hex"))
  ]);
});

describe("pong escrow", () => {
  it("escrows equal STX stakes and prevents duplicate rooms", () => {
    expect(call(player1, "stake-as-player-1", [
      stringAsciiCV(room),
      uintCV(stake)
    ])).toBeOk(boolCV(true));

    expect(call(player2, "stake-as-player-2", [
      stringAsciiCV(room)
    ])).toBeOk(boolCV(true));

    expect(call(player1, "stake-as-player-1", [
      stringAsciiCV(room),
      uintCV(stake)
    ])).toBeErr(uintCV(104));

    const status = simnet.callReadOnlyFn(
      "pong-escrow",
      "get-match-status",
      [stringAsciiCV(room)],
      player1
    ).result;
    expect(status).toBeUint(2);
  });

  it("pays exactly the two-player pot to the signed winner", () => {
    stakeBoth();
    const before = simnet.getAssetsMap().get("STX").get(player1);

    expect(call(player1, "claim-prize", [
      stringAsciiCV(room),
      standardPrincipalCV(player1),
      uintCV(5),
      uintCV(2),
      uintCV(0),
      resultSignature()
    ])).toBeOk(boolCV(true));

    const after = simnet.getAssetsMap().get("STX").get(player1);
    expect(after - before).toBe(stake * 2n);
    expect(call(player1, "claim-prize", [
      stringAsciiCV(room),
      standardPrincipalCV(player1),
      uintCV(5),
      uintCV(2),
      uintCV(0),
      resultSignature()
    ])).toBeErr(uintCV(107));
  });

  it("rejects proof tampering and cross-contract replay", () => {
    stakeBoth();

    expect(call(player1, "claim-prize", [
      stringAsciiCV(room),
      standardPrincipalCV(player1),
      uintCV(5),
      uintCV(3),
      uintCV(0),
      resultSignature()
    ])).toBeErr(uintCV(111));

    expect(call(player1, "claim-prize", [
      stringAsciiCV(room),
      standardPrincipalCV(player1),
      uintCV(5),
      uintCV(2),
      uintCV(0),
      resultSignature({ contractAddress: outsider })
    ])).toBeErr(uintCV(111));
  });

  it("allows both participants to GG once and one score report", () => {
    stakeBoth();
    const proof = resultSignature();
    const args = [
      stringAsciiCV(room),
      standardPrincipalCV(player1),
      uintCV(5),
      uintCV(2),
      uintCV(0),
      proof
    ];

    expect(call(player1, "gg", args)).toBeOk(boolCV(true));
    expect(call(player2, "gg", args)).toBeOk(boolCV(true));
    expect(call(player1, "gg", args)).toBeErr(uintCV(114));
    expect(call(outsider, "gg", args)).toBeErr(uintCV(109));

    expect(call(player2, "report-match", args)).toBeOk(boolCV(true));
    expect(call(player1, "report-match", args)).toBeErr(uintCV(115));
  });

  it("allows GG and reporting after the winner claims", () => {
    stakeBoth();
    const args = [
      stringAsciiCV(room),
      standardPrincipalCV(player1),
      uintCV(5),
      uintCV(2),
      uintCV(0),
      resultSignature()
    ];
    expect(call(player1, "claim-prize", args)).toBeOk(boolCV(true));
    expect(call(player1, "gg", args)).toBeOk(boolCV(true));
    expect(call(player2, "report-match", args)).toBeOk(boolCV(true));
  });

  it("returns an unmatched stake only after the join timeout", () => {
    call(player1, "stake-as-player-1", [stringAsciiCV(room), uintCV(stake)]);
    expect(call(player1, "claim-refund", [stringAsciiCV(room)])).toBeErr(uintCV(112));

    simnet.mineEmptyBurnBlocks(2);
    expect(call(player1, "claim-refund", [stringAsciiCV(room)])).toBeOk(boolCV(true));
    expect(call(player2, "stake-as-player-2", [stringAsciiCV(room)])).toBeErr(uintCV(107));
  });

  it("enforces daily check-in and reward eligibility", () => {
    expect(call(player1, "check-in")).toBeOk(uintCV(1));
    expect(call(player1, "check-in")).toBeErr(uintCV(116));
    expect(call(player1, "claim-daily-reward")).toBeOk(uintCV(1));
    expect(call(player1, "claim-daily-reward")).toBeErr(uintCV(116));

    simnet.mineEmptyBurnBlocks(145);
    expect(call(player1, "check-in")).toBeOk(uintCV(2));
    expect(call(player1, "claim-daily-reward")).toBeOk(uintCV(2));
  });

  it("restricts oracle and pause administration to the deployer", () => {
    expect(call(outsider, "set-paused", [boolCV(true)])).toBeErr(uintCV(100));
    expect(call(deployer, "set-paused", [boolCV(true)])).toBeOk(boolCV(true));
    expect(call(player1, "practice-mode")).toBeErr(uintCV(101));
    expect(call(deployer, "set-paused", [boolCV(false)])).toBeOk(boolCV(true));
    expect(call(player1, "practice-mode")).toBeOk(uintCV(1));
  });
});
