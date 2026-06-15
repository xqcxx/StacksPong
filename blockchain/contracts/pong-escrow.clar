;; StacksPong escrow. Gameplay remains backend-authoritative; this contract
;; escrows STX and verifies signed terminal results before releasing funds.

(define-constant contract-owner tx-sender)

(define-constant status-not-created u0)
(define-constant status-player-1-staked u1)
(define-constant status-both-staked u2)
(define-constant status-completed u3)
(define-constant status-refunded u4)

(define-constant reason-score u0)
(define-constant reason-forfeit u1)
(define-constant reason-disconnect-timeout u2)

(define-constant join-timeout-seconds u600)
(define-constant claim-timeout-seconds u2592000)
(define-constant challenge-timeout-seconds u3600)
(define-constant one-day-seconds u86400)
(define-constant two-days-seconds u172800)

(define-constant result-domain "STACKSPONG_MATCH_RESULT_V1")
(define-constant abandoned-domain "STACKSPONG_ABANDONED_REFUND_V1")

(define-constant err-owner-only (err u100))
(define-constant err-paused (err u101))
(define-constant err-invalid-oracle (err u102))
(define-constant err-invalid-room (err u103))
(define-constant err-room-exists (err u104))
(define-constant err-room-not-found (err u105))
(define-constant err-invalid-amount (err u106))
(define-constant err-invalid-status (err u107))
(define-constant err-same-player (err u108))
(define-constant err-not-participant (err u109))
(define-constant err-not-winner (err u110))
(define-constant err-invalid-signature (err u111))
(define-constant err-timeout-not-reached (err u112))
(define-constant err-timeout-expired (err u113))
(define-constant err-already-sent (err u114))
(define-constant err-already-reported (err u115))
(define-constant err-not-eligible (err u116))
(define-constant err-challenge-exists (err u117))
(define-constant err-challenge-not-found (err u118))
(define-constant err-challenge-expired (err u119))
(define-constant err-challenge-accepted (err u120))
(define-constant err-invalid-result (err u121))

(define-data-var backend-oracle (buff 33) 0x000000000000000000000000000000000000000000000000000000000000000000)
(define-data-var paused bool false)

(define-map matches
  (string-ascii 12)
  {
    player-1: principal,
    player-2: (optional principal),
    stake-amount: uint,
    winner: (optional principal),
    status: uint,
    created-at: uint,
    completed-at: uint
  }
)

(define-map gg-sent {room-code: (string-ascii 12), player: principal} bool)
(define-map match-scores
  (string-ascii 12)
  {score-1: uint, score-2: uint, reporter: principal, reported-at: uint}
)

(define-map engagement
  principal
  {
    last-check-in: uint,
    streak: uint,
    last-reward-claim: uint,
    total-claims: uint,
    gg-count: uint,
    practice-count: uint
  }
)

(define-map challenges
  (string-ascii 12)
  {
    creator: principal,
    amount: uint,
    created-at: uint,
    expires-at: uint,
    acceptor: (optional principal),
    accepted: bool
  }
)

(define-private (assert-active)
  (if (var-get paused) err-paused (ok true))
)

(define-private (assert-room-code (room-code (string-ascii 12)))
  (if (and (>= (len room-code) u4) (<= (len room-code) u12))
    (ok true)
    err-invalid-room
  )
)

(define-private (default-engagement)
  {
    last-check-in: u0,
    streak: u0,
    last-reward-claim: u0,
    total-claims: u0,
    gg-count: u0,
    practice-count: u0
  }
)

(define-private (transfer-from-contract (amount uint) (recipient principal))
  (as-contract?
    ((with-stx amount))
    (try! (stx-transfer? amount tx-sender recipient))
    true
  )
)

(define-private (verify-result-proof
    (room-code (string-ascii 12))
    (player-1 principal)
    (player-2 principal)
    (winner principal)
    (score-1 uint)
    (score-2 uint)
    (reason uint)
    (signature (buff 65)))
  (secp256k1-verify
    (sha256
      (unwrap-panic
        (to-consensus-buff?
          {
            chain-id: chain-id,
            contract: current-contract,
            domain: result-domain,
            room-code: room-code,
            player-1: player-1,
            player-2: player-2,
            winner: winner,
            score-1: score-1,
            score-2: score-2,
            reason: reason
          }
        )
      )
    )
    signature
    (var-get backend-oracle)
  )
)

(define-private (verify-abandoned-proof
    (room-code (string-ascii 12))
    (player-1 principal)
    (player-2 principal)
    (signature (buff 65)))
  (secp256k1-verify
    (sha256
      (unwrap-panic
        (to-consensus-buff?
          {
            chain-id: chain-id,
            contract: current-contract,
            domain: abandoned-domain,
            room-code: room-code,
            player-1: player-1,
            player-2: player-2
          }
        )
      )
    )
    signature
    (var-get backend-oracle)
  )
)

(define-public (stake-as-player-1 (room-code (string-ascii 12)) (amount uint))
  (let ((now stacks-block-time))
    (try! (assert-active))
    (try! (assert-room-code room-code))
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (is-none (map-get? matches room-code)) err-room-exists)
    (try! (stx-transfer? amount tx-sender current-contract))
    (map-set matches room-code {
      player-1: tx-sender,
      player-2: none,
      stake-amount: amount,
      winner: none,
      status: status-player-1-staked,
      created-at: now,
      completed-at: u0
    })
    (print {
      event: "match-created",
      room-code: room-code,
      player-1: tx-sender,
      stake-amount: amount,
      timestamp: now
    })
    (ok true)
  )
)

(define-public (stake-as-player-2 (room-code (string-ascii 12)))
  (let (
      (game (unwrap! (map-get? matches room-code) err-room-not-found))
      (amount (get stake-amount game))
      (now stacks-block-time)
    )
    (try! (assert-active))
    (asserts! (is-eq (get status game) status-player-1-staked) err-invalid-status)
    (asserts! (not (is-eq tx-sender (get player-1 game))) err-same-player)
    (asserts! (<= now (+ (get created-at game) join-timeout-seconds)) err-timeout-expired)
    (try! (stx-transfer? amount tx-sender current-contract))
    (map-set matches room-code (merge game {
      player-2: (some tx-sender),
      status: status-both-staked
    }))
    (print {
      event: "player-joined",
      room-code: room-code,
      player-2: tx-sender,
      total-pot: (* amount u2),
      timestamp: now
    })
    (ok true)
  )
)

(define-public (claim-prize
    (room-code (string-ascii 12))
    (winner principal)
    (score-1 uint)
    (score-2 uint)
    (reason uint)
    (signature (buff 65)))
  (let (
      (game (unwrap! (map-get? matches room-code) err-room-not-found))
      (player-2 (unwrap! (get player-2 game) err-invalid-status))
      (amount (get stake-amount game))
      (now stacks-block-time)
    )
    (try! (assert-active))
    (asserts! (is-eq (get status game) status-both-staked) err-invalid-status)
    (asserts! (is-eq tx-sender winner) err-not-winner)
    (asserts! (or (is-eq winner (get player-1 game)) (is-eq winner player-2)) err-invalid-result)
    (asserts! (or (is-eq reason reason-score) (is-eq reason reason-forfeit) (is-eq reason reason-disconnect-timeout)) err-invalid-result)
    (asserts! (verify-result-proof room-code (get player-1 game) player-2 winner score-1 score-2 reason signature) err-invalid-signature)
    (map-set matches room-code (merge game {
      winner: (some winner),
      status: status-completed,
      completed-at: now
    }))
    (try! (transfer-from-contract (* amount u2) winner))
    (print {
      event: "prize-claimed",
      room-code: room-code,
      winner: winner,
      amount: (* amount u2),
      timestamp: now
    })
    (ok true)
  )
)

(define-public (claim-refund (room-code (string-ascii 12)))
  (let (
      (game (unwrap! (map-get? matches room-code) err-room-not-found))
      (amount (get stake-amount game))
      (now stacks-block-time)
    )
    (try! (assert-active))
    (asserts! (is-eq (get status game) status-player-1-staked) err-invalid-status)
    (asserts! (is-eq tx-sender (get player-1 game)) err-not-participant)
    (asserts! (> now (+ (get created-at game) join-timeout-seconds)) err-timeout-not-reached)
    (map-set matches room-code (merge game {status: status-refunded, completed-at: now}))
    (try! (transfer-from-contract amount tx-sender))
    (print {event: "match-refunded", room-code: room-code, player: tx-sender, amount: amount, timestamp: now})
    (ok true)
  )
)

(define-public (claim-expired-match-refund (room-code (string-ascii 12)))
  (let (
      (game (unwrap! (map-get? matches room-code) err-room-not-found))
      (player-2 (unwrap! (get player-2 game) err-invalid-status))
      (amount (get stake-amount game))
      (now stacks-block-time)
    )
    (try! (assert-active))
    (asserts! (is-eq (get status game) status-both-staked) err-invalid-status)
    (asserts! (or (is-eq tx-sender (get player-1 game)) (is-eq tx-sender player-2)) err-not-participant)
    (asserts! (> now (+ (get created-at game) claim-timeout-seconds)) err-timeout-not-reached)
    (map-set matches room-code (merge game {status: status-refunded, completed-at: now}))
    (try! (transfer-from-contract amount (get player-1 game)))
    (try! (transfer-from-contract amount player-2))
    (print {
      event: "expired-match-refunded",
      room-code: room-code,
      player-1: (get player-1 game),
      player-2: player-2,
      amount-each: amount,
      timestamp: now
    })
    (ok true)
  )
)

(define-public (claim-abandoned-match-refund
    (room-code (string-ascii 12))
    (signature (buff 65)))
  (let (
      (game (unwrap! (map-get? matches room-code) err-room-not-found))
      (player-2 (unwrap! (get player-2 game) err-invalid-status))
      (amount (get stake-amount game))
      (now stacks-block-time)
    )
    (try! (assert-active))
    (asserts! (is-eq (get status game) status-both-staked) err-invalid-status)
    (asserts! (or (is-eq tx-sender (get player-1 game)) (is-eq tx-sender player-2)) err-not-participant)
    (asserts! (verify-abandoned-proof room-code (get player-1 game) player-2 signature) err-invalid-signature)
    (map-set matches room-code (merge game {status: status-refunded, completed-at: now}))
    (try! (transfer-from-contract amount (get player-1 game)))
    (try! (transfer-from-contract amount player-2))
    (print {
      event: "abandoned-match-refunded",
      room-code: room-code,
      player-1: (get player-1 game),
      player-2: player-2,
      amount-each: amount,
      timestamp: now
    })
    (ok true)
  )
)

(define-public (gg
    (room-code (string-ascii 12))
    (winner principal)
    (score-1 uint)
    (score-2 uint)
    (reason uint)
    (signature (buff 65)))
  (let (
      (game (unwrap! (map-get? matches room-code) err-room-not-found))
      (player-2 (unwrap! (get player-2 game) err-invalid-status))
      (key {room-code: room-code, player: tx-sender})
      (stats (default-to (default-engagement) (map-get? engagement tx-sender)))
    )
    (try! (assert-active))
    (asserts! (or (is-eq (get status game) status-both-staked) (is-eq (get status game) status-completed)) err-invalid-status)
    (asserts! (or (is-eq tx-sender (get player-1 game)) (is-eq tx-sender player-2)) err-not-participant)
    (asserts! (is-none (map-get? gg-sent key)) err-already-sent)
    (asserts! (verify-result-proof room-code (get player-1 game) player-2 winner score-1 score-2 reason signature) err-invalid-signature)
    (map-set gg-sent key true)
    (map-set engagement tx-sender (merge stats {gg-count: (+ (get gg-count stats) u1)}))
    (print {event: "gg-sent", room-code: room-code, player: tx-sender, total: (+ (get gg-count stats) u1)})
    (ok true)
  )
)

(define-public (report-match
    (room-code (string-ascii 12))
    (winner principal)
    (score-1 uint)
    (score-2 uint)
    (reason uint)
    (signature (buff 65)))
  (let (
      (game (unwrap! (map-get? matches room-code) err-room-not-found))
      (player-2 (unwrap! (get player-2 game) err-invalid-status))
    )
    (try! (assert-active))
    (asserts! (or (is-eq (get status game) status-both-staked) (is-eq (get status game) status-completed)) err-invalid-status)
    (asserts! (or (is-eq tx-sender (get player-1 game)) (is-eq tx-sender player-2)) err-not-participant)
    (asserts! (is-none (map-get? match-scores room-code)) err-already-reported)
    (asserts! (verify-result-proof room-code (get player-1 game) player-2 winner score-1 score-2 reason signature) err-invalid-signature)
    (map-set match-scores room-code {
      score-1: score-1,
      score-2: score-2,
      reporter: tx-sender,
      reported-at: stacks-block-time
    })
    (print {event: "match-reported", room-code: room-code, reporter: tx-sender, score-1: score-1, score-2: score-2})
    (ok true)
  )
)

(define-public (check-in)
  (let (
      (stats (default-to (default-engagement) (map-get? engagement tx-sender)))
      (last (get last-check-in stats))
      (now stacks-block-time)
      (next-streak (if (or (is-eq last u0) (> now (+ last two-days-seconds))) u1 (+ (get streak stats) u1)))
    )
    (try! (assert-active))
    (asserts! (or (is-eq last u0) (>= now (+ last one-day-seconds))) err-not-eligible)
    (map-set engagement tx-sender (merge stats {last-check-in: now, streak: next-streak}))
    (print {event: "player-check-in", player: tx-sender, streak: next-streak, timestamp: now})
    (ok next-streak)
  )
)

(define-public (claim-daily-reward)
  (let (
      (stats (default-to (default-engagement) (map-get? engagement tx-sender)))
      (last (get last-reward-claim stats))
      (now stacks-block-time)
      (total (+ (get total-claims stats) u1))
    )
    (try! (assert-active))
    (asserts! (or (is-eq last u0) (>= now (+ last one-day-seconds))) err-not-eligible)
    (map-set engagement tx-sender (merge stats {last-reward-claim: now, total-claims: total}))
    (print {event: "daily-reward-claimed", player: tx-sender, total: total, timestamp: now})
    (ok total)
  )
)

(define-public (practice-mode)
  (let (
      (stats (default-to (default-engagement) (map-get? engagement tx-sender)))
      (total (+ (get practice-count stats) u1))
    )
    (try! (assert-active))
    (map-set engagement tx-sender (merge stats {practice-count: total}))
    (print {event: "practice-session", player: tx-sender, total: total, timestamp: stacks-block-time})
    (ok total)
  )
)

(define-public (create-challenge (room-code (string-ascii 12)) (amount uint))
  (let ((now stacks-block-time))
    (try! (assert-active))
    (try! (assert-room-code room-code))
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (is-none (map-get? challenges room-code)) err-challenge-exists)
    (map-set challenges room-code {
      creator: tx-sender,
      amount: amount,
      created-at: now,
      expires-at: (+ now challenge-timeout-seconds),
      acceptor: none,
      accepted: false
    })
    (print {event: "challenge-created", room-code: room-code, creator: tx-sender, amount: amount, timestamp: now})
    (ok true)
  )
)

(define-public (accept-challenge (room-code (string-ascii 12)))
  (let (
      (challenge (unwrap! (map-get? challenges room-code) err-challenge-not-found))
      (now stacks-block-time)
    )
    (try! (assert-active))
    (asserts! (not (get accepted challenge)) err-challenge-accepted)
    (asserts! (not (is-eq tx-sender (get creator challenge))) err-same-player)
    (asserts! (<= now (get expires-at challenge)) err-challenge-expired)
    (map-set challenges room-code (merge challenge {acceptor: (some tx-sender), accepted: true}))
    (print {event: "challenge-accepted", room-code: room-code, acceptor: tx-sender, timestamp: now})
    (ok true)
  )
)

(define-public (set-backend-oracle (oracle (buff 33)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (is-eq oracle 0x000000000000000000000000000000000000000000000000000000000000000000)) err-invalid-oracle)
    (var-set backend-oracle oracle)
    (print {event: "backend-oracle-updated", oracle: oracle})
    (ok true)
  )
)

(define-public (set-paused (value bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set paused value)
    (print {event: "pause-updated", paused: value})
    (ok true)
  )
)

(define-read-only (get-match (room-code (string-ascii 12)))
  (map-get? matches room-code)
)

(define-read-only (get-match-status (room-code (string-ascii 12)))
  (match (map-get? matches room-code) value (get status value) status-not-created)
)

(define-read-only (is-room-code-available (room-code (string-ascii 12)))
  (is-none (map-get? matches room-code))
)

(define-read-only (get-engagement (player principal))
  (default-to (default-engagement) (map-get? engagement player))
)

(define-read-only (get-match-score (room-code (string-ascii 12)))
  (map-get? match-scores room-code)
)

(define-read-only (has-sent-gg (room-code (string-ascii 12)) (player principal))
  (default-to false (map-get? gg-sent {room-code: room-code, player: player}))
)

(define-read-only (get-challenge (room-code (string-ascii 12)))
  (map-get? challenges room-code)
)

(define-read-only (get-backend-oracle)
  (var-get backend-oracle)
)

(define-read-only (is-paused)
  (var-get paused)
)
