import React from 'react';
import { Link } from 'react-router-dom';
import { LOBBY_ROUTE } from '../constants';
import { CURRENCIES } from '../config/currencies';
import { BLOCK_EXPLORER_URL, PONG_CONTRACT_ID, STACKS_NETWORK } from '../config/env';
import '../styles/LandingPage.css';

const currencySymbols = Object.values(CURRENCIES).map(currency => currency.symbol);

const howItWorks = [
  {
    title: 'Connect your Stacks wallet',
    body: 'Use a Stacks wallet to enter the arcade and sign wallet messages that prove account ownership without moving funds.'
  },
  {
    title: 'Create the STX stake',
    body: 'Choose a room and stake STX into the Stacks escrow contract before your opponent joins.'
  },
  {
    title: 'Match the room terms',
    body: 'The opponent joins with the same room code and matches the same STX stake amount.'
  },
  {
    title: 'Play first to 5',
    body: 'Win the Pong match, then claim the 2x STX pot after the backend signs the final result.'
  }
];

const modes = [
  {
    title: 'Staked Match',
    body: 'Create a room, escrow STX, and invite an opponent to match your stake before play starts.'
  },
  {
    title: 'Public Challenge',
    body: 'Publish a staked room on the challenge board so another player can accept it from the lobby.'
  },
  {
    title: 'Join Room',
    body: 'Enter a 6-character room code to join a private match or complete an existing staked room.'
  },
  {
    title: 'Watch Live',
    body: 'Spectate active matches from the lobby when live games are available.'
  },
  {
    title: 'Practice and Check-In',
    body: 'Record practice, check-in, and daily reward actions as on-chain engagement events.'
  }
];

const safeguards = [
  'STX stakes are held by the pong-escrow Clarity contract while a staked match is waiting, active, refundable, or claimable.',
  'If player two never joins, player one can refund the unmatched stake after the 10-minute join timeout.',
  'If an active staked match is abandoned, both players can be refunded with backend authorization.',
  'Prize claims require the winning Stacks wallet and a backend-signed final result.'
];

const dashboardItems = [
  'Game history with win, loss, casual, and staked filters.',
  'Claimable wins with claimed transaction links.',
  'Pending stakes with refund countdowns and active match recovery.',
  'Leaderboard and ELO tracking for competitive play.'
];

const faqs = [
  {
    question: 'Which wallets are supported?',
    answer: 'StacksPong uses Stacks Connect, so players use compatible Stacks wallets that can sign messages and submit contract calls.'
  },
  {
    question: 'Which token can be staked?',
    answer: 'This version supports STX staking only. Both players must stake the same STX amount for a staked match.'
  },
  {
    question: 'What happens if nobody joins?',
    answer: 'The player-one stake remains in escrow until the 10-minute join timeout passes, then it can be refunded from Pending Stakes.'
  },
  {
    question: 'What happens on disconnect?',
    answer: 'Staked matches track reconnect windows. If reconnect windows expire and the backend marks the match abandoned, both players can recover their stakes.'
  },
  {
    question: 'How does claiming work?',
    answer: 'The winner claims the 2x STX pot with the winning wallet after the backend signs the match result.'
  },
  {
    question: 'Why is a wallet signature required?',
    answer: 'Wallet signatures prove account ownership for username and session flows. They do not move STX by themselves.'
  }
];

const contractHref = PONG_CONTRACT_ID && BLOCK_EXPLORER_URL
  ? `${BLOCK_EXPLORER_URL}/address/${PONG_CONTRACT_ID}?chain=${STACKS_NETWORK}`
  : null;

function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <nav className="landing-nav" aria-label="StacksPong website navigation">
          <Link to="/" className="landing-brand">
            <span className="landing-brand-mark">S</span>
            <span>STACKS PONG</span>
          </Link>
          <div className="landing-nav-links">
            <a href="#how-it-works">How it works</a>
            <Link to={LOBBY_ROUTE} className="landing-nav-cta">Play</Link>
          </div>
        </nav>

        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="landing-kicker">Built for Stacks wallets</p>
            <h1 id="landing-title">Stake STX. Play Pong. Win 2x back.</h1>
            <p>
              StacksPong is a real-time Pong arcade where players can escrow matching STX stakes,
              play first-to-5 matches, and claim prizes from verified results.
            </p>
            <div className="landing-actions">
              <Link to={LOBBY_ROUTE} className="landing-button landing-button-primary">Play Now</Link>
              <a href="#how-it-works" className="landing-button landing-button-secondary">See How It Works</a>
            </div>
            <div className="landing-token-strip" aria-label="Supported staking tokens">
              {currencySymbols.map(symbol => <span key={symbol}>{symbol}</span>)}
            </div>
            <div className="landing-network-strip" aria-label="Stacks network and contract">
              <span>Network: {STACKS_NETWORK}</span>
              <span>Contract: {PONG_CONTRACT_ID || 'Configured by environment'}</span>
            </div>
          </div>

          <div className="landing-court" aria-label="StacksPong staked match preview">
            <div className="landing-score">
              <span>YOU 04</span>
              <span>RIVAL 03</span>
            </div>
            <span className="landing-paddle landing-paddle-left"></span>
            <span className="landing-paddle landing-paddle-right"></span>
            <span className="landing-ball"></span>
            <div className="landing-ticket">
              <span>Escrowed pot</span>
              <strong>2.0 STX</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="how-it-works" aria-labelledby="how-title">
        <div className="landing-section-heading">
          <p className="landing-kicker">How it works</p>
          <h2 id="how-title">From wallet signature to winner claim.</h2>
        </div>
        <div className="landing-step-grid">
          {howItWorks.map((item, index) => (
            <article className="landing-step" key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-band" aria-labelledby="modes-title">
        <div className="landing-section-heading">
          <p className="landing-kicker">Game modes</p>
          <h2 id="modes-title">Play, challenge, spectate, and keep your streak alive.</h2>
        </div>
        <div className="landing-mode-grid">
          {modes.map(mode => (
            <article className="landing-mode" key={mode.title}>
              <h3>{mode.title}</h3>
              <p>{mode.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-two-column" id="escrow" aria-labelledby="escrow-title">
        <div>
          <p className="landing-kicker">Escrow and safety</p>
          <h2 id="escrow-title">STX stays in contract-controlled escrow.</h2>
          <p className="landing-section-copy">
            StacksPong uses the pong-escrow Clarity contract for staked matches. The app records room
            state in the backend, but STX movement happens through Stacks wallet transactions.
          </p>
          <div className="landing-contract-panel">
            <span>{STACKS_NETWORK}</span>
            {contractHref ? (
              <a href={contractHref} target="_blank" rel="noopener noreferrer">{PONG_CONTRACT_ID}</a>
            ) : (
              <strong>{PONG_CONTRACT_ID || 'Contract configured by environment'}</strong>
            )}
          </div>
        </div>
        <div className="landing-check-list">
          {safeguards.map(item => <p key={item}>{item}</p>)}
        </div>
      </section>

      <section className="landing-section" aria-labelledby="dashboard-title">
        <div className="landing-section-heading">
          <p className="landing-kicker">Player dashboard</p>
          <h2 id="dashboard-title">Everything a staked player needs after the match.</h2>
        </div>
        <div className="landing-dashboard-grid">
          {dashboardItems.map(item => (
            <article className="landing-dashboard-item" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-band" id="faq" aria-labelledby="faq-title">
        <div className="landing-section-heading">
          <p className="landing-kicker">FAQ</p>
          <h2 id="faq-title">Straight answers before you stake.</h2>
        </div>
        <div className="landing-faq-grid">
          {faqs.map(item => (
            <article className="landing-faq" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-final" aria-labelledby="final-title">
        <p className="landing-kicker">Ready</p>
        <h2 id="final-title">Enter the StacksPong lobby.</h2>
        <p>Create a staked match, join a room, spectate live games, or check the leaderboard.</p>
        <Link to={LOBBY_ROUTE} className="landing-button landing-button-primary">Play Now</Link>
      </section>
    </main>
  );
}

export default LandingPage;
