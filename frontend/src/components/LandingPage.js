import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';
import { BACKEND_URL, LOBBY_ROUTE } from '../constants';
import { CURRENCIES } from '../config/currencies';
import { BLOCK_EXPLORER_URL, PONG_CONTRACT_ID, STACKS_NETWORK } from '../config/env';
import '../styles/LandingPage.css';

const currencySymbols = Object.values(CURRENCIES).map(c => c.symbol);

const howItWorks = [
  {
    title: 'Connect Wallet',
    body: 'Use Stacks Connect to link your wallet. Sign a message to prove ownership — no STX moved.',
    icon: '🔌',
  },
  {
    title: 'Stake STX',
    body: 'Create a room and escrow STX into the Clarity contract. Share your 6-character code with a friend.',
    icon: '💎',
  },
  {
    title: 'Play First-to-5',
    body: '60 FPS server-authoritative Pong. Mouse, keyboard, or touch controls. Backend tracks every frame.',
    icon: '🎮',
  },
  {
    title: 'Claim 2× Pot',
    body: 'Winner claims the full 2× STX pot. Backend signs the result, contract verifies the SIP-005 proof.',
    icon: '🏆',
  },
];

const modes = [
  {
    title: 'Staked Match',
    body: 'Create a private room, escrow STX, and invite an opponent to match your stake before play starts.',
    icon: '⚔',
  },
  {
    title: 'Public Challenge',
    body: 'Publish a staked room on the challenge board. Anyone in the lobby can accept and match your stake.',
    icon: '📢',
  },
  {
    title: 'Join Room',
    body: 'Enter a 6-character code to join a friend\u2019s private or staked match instantly.',
    icon: '🔗',
  },
  {
    title: 'Watch Live',
    body: 'Spectate active matches in real-time. See the paddles, score, and escrowed stakes live.',
    icon: '👁',
  },
  {
    title: 'Practice & Check-In',
    body: 'Log practice sessions, daily check-ins, and claim rewards as on-chain engagement events.',
    icon: '🎯',
  },
];

const safeguards = [
  {
    title: 'Contract-Controlled Escrow',
    body: 'STX held by the Clarity contract during waiting, active, refundable, and claimable states. Not even the backend can move funds.',
    icon: '🛡',
  },
  {
    title: 'Join Timeout Refund',
    body: 'If player two never joins, player one can refund the unmatched stake after the 10-minute timeout.',
    icon: '⏱',
  },
  {
    title: 'Abandoned Match Recovery',
    body: 'If a staked match is abandoned, both players can refund their stakes with backend authorization.',
    icon: '🔄',
  },
  {
    title: 'Signed Result Proofs',
    body: 'Prize claims require the winning Stacks wallet and a backend-signed SIP-005 result proof verified on-chain.',
    icon: '✍',
  },
];

const contractCode = `;; pong-escrow.clar — StacksPong escrow

(define-public (stake-as-player-1
    (room-code (string-ascii 12)) (amount uint))
  ;; Player 1 locks STX into escrow
)

(define-public (stake-as-player-2
    (room-code (string-ascii 12)))
  ;; Player 2 matches the stake
)

(define-public (claim-prize
    (room-code) (winner) (score-1)
    (score-2) (reason) (signature (buff 65)))
  ;; Winner claims the full 2x pot
)

(define-public (claim-refund
    (room-code (string-ascii 12)))
  ;; Refund unmatched stake after 10-min
)

(define-public (claim-abandoned-match-refund
    (room-code) (signature (buff 65)))
  ;; Refund both players on abandonment
)`;

const stateMachine = [
  { id: 'NOT_CREATED', label: 'Not Created', next: 'P1_STAKED' },
  { id: 'P1_STAKED', label: 'Player 1 Staked', next: 'BOTH_STAKED' },
  { id: 'BOTH_STAKED', label: 'Both Staked', next: 'COMPLETED' },
  { id: 'COMPLETED', label: 'Completed', next: null },
  { id: 'REFUNDED', label: 'Refunded', next: null },
];

const dashboardStats = [
  { label: 'Total Games', value: 247, suffix: '' },
  { label: 'Win Rate', value: 64, suffix: '%' },
  { label: 'STX Won', value: 1840, suffix: '' },
  { label: 'Claimable', value: 320, suffix: '' },
];

const dashboardItems = [
  { title: 'Game History', body: 'Filter by win, loss, casual, or staked matches with Load More pagination and payout details.' },
  { title: 'Claimable Wins', body: 'View claimable prizes with claimed transaction links and block explorer URLs.' },
  { title: 'Pending Stakes', body: 'Track refund countdowns and recover active staked matches from one panel.' },
  { title: 'Leaderboard & ELO', body: 'Competitive ELO ranking with live leaderboard updates over WebSocket.' },
];

const faqs = [
  {
    question: 'Which wallets are supported?',
    answer: 'StacksPong uses Stacks Connect, so any Stacks-compatible wallet that can sign messages and submit contract calls works.',
  },
  {
    question: 'Which token can I stake?',
    answer: 'This version supports STX staking only. Both players must stake the same STX amount for a staked match.',
  },
  {
    question: 'What if nobody joins my match?',
    answer: 'Your stake remains in escrow until the 10-minute join timeout passes, then you can refund from Pending Stakes.',
  },
  {
    question: 'What happens on disconnect?',
    answer: 'Staked matches track reconnect windows. If they expire and the backend marks the match abandoned, both players recover their stakes.',
  },
  {
    question: 'How does claiming work?',
    answer: 'The winner claims the 2× STX pot using the winning wallet after the backend signs the match result proof. The contract verifies the signature on-chain.',
  },
  {
    question: 'Why is a wallet signature required?',
    answer: 'Wallet signatures prove account ownership for username and session flows. They do not move STX by themselves.',
  },
];

const contractHref = PONG_CONTRACT_ID && BLOCK_EXPLORER_URL
  ? `${BLOCK_EXPLORER_URL}/address/${PONG_CONTRACT_ID}?chain=${STACKS_NETWORK}`
  : null;

function ScrollReveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`lp-reveal ${visible ? 'lp-reveal--in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function LandingPage() {
  return (
    <main className="lp">
      <div className="lp__scanlines" />
      <div className="lp__vignette" />
    </main>
  );
}

export default LandingPage;
