import React from 'react';
import { Link } from 'react-router-dom';
import { LOBBY_ROUTE } from '../constants';
import { CURRENCIES } from '../config/currencies';
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
