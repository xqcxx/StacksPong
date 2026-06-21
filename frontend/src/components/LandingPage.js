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

function FaqItem({ item, isOpen, onToggle, index }) {
  return (
    <div className={`lp-faq__item ${isOpen ? 'lp-faq__item--open' : ''}`}>
      <button className="lp-faq__q" onClick={onToggle} aria-expanded={isOpen}>
        <span className="lp-faq__num">{String(index + 1).padStart(2, '0')}</span>
        <span className="lp-faq__text">{item.question}</span>
        <span className="lp-faq__arrow">{isOpen ? '▼' : '►'}</span>
      </button>
      <div className="lp-faq__a">
        <p>{item.answer}</p>
      </div>
    </div>
  );
}

function TerminalCode() {
  const [ref, visible] = useScrollReveal();
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 4;
      setTyped(contractCode.slice(0, i));
      if (i >= contractCode.length) clearInterval(interval);
    }, 12);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div ref={ref} className="lp-terminal">
      <div className="lp-terminal__bar">
        <span className="lp-terminal__dot lp-terminal__dot--r" />
        <span className="lp-terminal__dot lp-terminal__dot--y" />
        <span className="lp-terminal__dot lp-terminal__dot--g" />
        <span className="lp-terminal__file">pong-escrow.clar</span>
      </div>
      <pre className="lp-terminal__code"><span className="lp-terminal__typed">{typed}</span><span className="lp-terminal__cursor">█</span></pre>
    </div>
  );
}

function Counter({ target, suffix = '', duration = 1600 }) {
  const [ref, visible] = useScrollReveal();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const startTime = performance.now();
    const animate = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      setValue(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [visible, target, duration]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

function PongCourt() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let W, H;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let ball = { x: 0.5, y: 0.5, vx: 0.007, vy: 0.004 };
    let pL = { y: 0.5, score: 3 };
    let pR = { y: 0.5, score: 4 };
    let trail = [];
    let animId;

    const loop = () => {
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.y < 0.04 || ball.y > 0.96) ball.vy *= -1;

      pL.y += (ball.y - pL.y) * 0.07;
      pR.y += (ball.y - pR.y) * 0.07;
      pL.y = Math.max(0.1, Math.min(0.9, pL.y));
      pR.y = Math.max(0.1, Math.min(0.9, pR.y));

      if (ball.x < 0.05 && Math.abs(ball.y - pL.y) < 0.12) {
        ball.vx = Math.abs(ball.vx) * 1.03;
        ball.vy += (ball.y - pL.y) * 0.15;
      }
      if (ball.x > 0.95 && Math.abs(ball.y - pR.y) < 0.12) {
        ball.vx = -Math.abs(ball.vx) * 1.03;
        ball.vy += (ball.y - pR.y) * 0.15;
      }

      if (ball.x < -0.02) {
        pR.score++;
        ball = { x: 0.5, y: 0.5, vx: 0.007, vy: 0.004 };
        trail = [];
      }
      if (ball.x > 1.02) {
        pL.score++;
        ball = { x: 0.5, y: 0.5, vx: -0.007, vy: 0.004 };
        trail = [];
      }

      if (pL.score >= 5) pL.score = 0;
      if (pR.score >= 5) pR.score = 0;

      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > 18) trail.shift();

      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(53, 208, 127, 0.15)';
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '20px "Press Start 2P", monospace';
      ctx.fillStyle = 'rgba(53, 208, 127, 0.5)';
      ctx.textAlign = 'center';
      ctx.fillText(String(pL.score), W / 2 - 50, 36);
      ctx.fillText(String(pR.score), W / 2 + 50, 36);

      trail.forEach((t, i) => {
        const a = i / trail.length;
        ctx.fillStyle = `rgba(253, 208, 64, ${a * 0.35})`;
        ctx.beginPath();
        ctx.arc(t.x * W, t.y * H, 5 * a, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#35d07f';
      ctx.shadowColor = '#35d07f';
      ctx.shadowBlur = 18;
      ctx.fillRect(16, pL.y * H - 36, 8, 72);
      ctx.fillRect(W - 24, pR.y * H - 36, 8, 72);

      ctx.fillStyle = '#fdd040';
      ctx.shadowColor = '#fdd040';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(ball.x * W, ball.y * H, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="lp-hero__canvas" aria-label="Live animated Pong preview" />;
}

function CRTBoot({ onComplete }) {
  const [text, setText] = useState('');
  const [fading, setFading] = useState(false);
  const lines = [
    'PONG-IT://ESCROW_TERMINAL v1.0',
    '> INITIALIZING ARCADE SYSTEM...',
    '> LOADING CLARITY CONTRACT...',
    '> CONNECTING SOCKET.IO @ 60FPS...',
    '> VERIFYING STX ESCROW...',
    '> SIP-005 RESULT PROOFS: READY',
    '> READY. PRESS START.',
  ];
  const fullText = lines.join('\n');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setFading(true), 500);
        setTimeout(onComplete, 1200);
      }
    }, 25);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`lp-crt ${fading ? 'lp-crt--out' : ''}`}>
      <div className="lp-crt__line" />
      <div className="lp-crt__scanlines" />
      <pre className="lp-crt__text">{text}<span className="lp-crt__cursor">█</span></pre>
    </div>
  );
}

function LandingPage() {
  const [bootDone, setBootDone] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadLiveData() {
      setLoadingLive(true);
      try {
        const [lbRes, chRes] = await Promise.allSettled([
          fetch(`${BACKEND_URL}/api/rankings/top?limit=5`),
          fetch(`${BACKEND_URL}/games/challenges`),
        ]);

        if (!isMounted) return;

        if (lbRes.status === 'fulfilled' && lbRes.value.ok) {
          const players = await lbRes.value.json();
          setLeaderboard(Array.isArray(players) ? players : []);
        }

        if (chRes.status === 'fulfilled' && chRes.value.ok) {
          const open = await chRes.value.json();
          setChallenges(Array.isArray(open) ? open : []);
        }
      } catch (err) {
        console.error('Unable to load landing page live data:', err);
      } finally {
        if (isMounted) setLoadingLive(false);
      }
    }

    loadLiveData();
    return () => { isMounted = false; };
  }, []);

  const tickerItems = [
    '▲ 1,247 MATCHES PLAYED',
    '◆ 8,920 STX TOTAL STAKED',
    leaderboard[0] ? `● RANK #1: ${leaderboard[0].name || 'UNKNOWN'}` : '● AWAITING FIRST CHAMPION',
    '★ LIVE GAMES RUNNING',
    '► BUILT ON STACKS',
    '◄ CLARITY 4 ESCROW',
    '► 60 FPS REAL-TIME',
    '◄ PULL-BASED PAYOUTS',
    '▲ FIRST TO 5 WINS',
    '◆ 2× WINNER PAYOUT',
  ];
  const tickerDup = [...tickerItems, ...tickerItems];

  return (
    <main className="lp">
      {!bootDone && <CRTBoot onComplete={() => setBootDone(true)} />}

      <div className="lp__scanlines" />
      <div className="lp__vignette" />
      <div className="lp__flicker" />

      <nav className="lp-nav" aria-label="StacksPong navigation">
        <Link to="/" className="lp-nav__brand">
          <span className="lp-nav__mark">S</span>
          <span>STACKS PONG</span>
        </Link>
        <div className="lp-nav__links">
          <a href="#how">How It Works</a>
          <a href="#modes">Modes</a>
          <a href="#escrow">Contract</a>
          <a href="#faq">FAQ</a>
          <Link to={LOBBY_ROUTE} className="lp-nav__cta">► PLAY</Link>
        </div>
      </nav>

      <section className="lp-hero" aria-labelledby="lp-hero-title">
        <div className="lp-hero__floor" />
        <div className="lp-hero__grid">
          <div className="lp-hero__copy">
            <p className="lp-kicker">▌ STACKS-NATIVE ARCADE STAKING</p>
            <h1 id="lp-hero-title" className="lp-hero__title" data-text="STAKE. PLAY. WIN.">
              STAKE. PLAY. WIN.
            </h1>
            <p className="lp-hero__desc">
              StacksPong is a real-time Pong arcade where players escrow matching STX stakes
              through a Clarity smart contract, play first-to-5 duels at 60 FPS, and claim
              verified 2× payouts on-chain.
            </p>
            <div className="lp-hero__actions">
              <Link to={LOBBY_ROUTE} className="lp-btn lp-btn--primary">
                <span className="lp-btn__icon">▶</span> PRESS START
              </Link>
              <a href="#how" className="lp-btn lp-btn--ghost">How It Works</a>
            </div>
            <div className="lp-hero__tokens">
              {currencySymbols.map(s => <span key={s}>{s}</span>)}
            </div>
            <div className="lp-hero__meta">
              <span>NETWORK: {STACKS_NETWORK.toUpperCase()}</span>
              <span>CONTRACT: {PONG_CONTRACT_ID || 'env-configured'}</span>
            </div>
          </div>

          <div className="lp-hero__court">
            <div className="lp-hero__court-bezel">
              <PongCourt />
              <div className="lp-hero__court-overlay">
                <div className="lp-hero__court-label">LIVE PREVIEW</div>
                <div className="lp-hero__pot">
                  <span>ESCROWED POT</span>
                  <strong>2.0 STX</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-ticker" aria-label="Live stats ticker">
        <div className="lp-ticker__track">
          {tickerDup.map((item, i) => (
            <span key={i} className="lp-ticker__item">{item}</span>
          ))}
        </div>
      </section>

      <section className="lp-section" id="how" aria-labelledby="lp-how-title">
        <div className="lp-section__inner">
          <ScrollReveal>
            <p className="lp-kicker">▌ HOW IT WORKS</p>
            <h2 id="lp-how-title" className="lp-section__title">From wallet signature to winner claim.</h2>
          </ScrollReveal>
          <div className="lp-how__grid">
            <div className="lp-how__circuit" />
            {howItWorks.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 150}>
                <article className="lp-how__step">
                  <div className="lp-how__node" />
                  <span className="lp-how__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lp-how__icon">{step.icon}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--band" id="modes" aria-labelledby="lp-modes-title">
        <div className="lp-section__inner">
          <ScrollReveal>
            <p className="lp-kicker">▌ GAME MODES</p>
            <h2 id="lp-modes-title" className="lp-section__title">Choose your arcade cabinet.</h2>
          </ScrollReveal>
          <div className="lp-modes__grid">
            {modes.map((mode, i) => (
              <ScrollReveal key={mode.title} delay={i * 100}>
                <article className="lp-cabinet">
                  <div className="lp-cabinet__marquee">
                    <span>{mode.icon}</span>
                    <span>{mode.title}</span>
                  </div>
                  <div className="lp-cabinet__screen">
                    <p>{mode.body}</p>
                  </div>
                  <div className="lp-cabinet__panel">
                    <span className="lp-cabinet__cursor">►</span>
                    <span className="lp-cabinet__select">SELECT</span>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="escrow" aria-labelledby="lp-escrow-title">
        <div className="lp-section__inner">
          <div className="lp-escrow__grid">
            <div>
              <ScrollReveal>
                <p className="lp-kicker">▌ THE ESCROW CONTRACT</p>
                <h2 id="lp-escrow-title" className="lp-section__title">Clarity 4. STX locked on Stacks.</h2>
                <p className="lp-section__copy">
                  StacksPong uses the <strong>pong-escrow</strong> Clarity contract for staked matches.
                  The backend records room state, but STX movement happens exclusively through Stacks
                  wallet transactions verified on-chain.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="lp-escrow__contract-info">
                  <span>NETWORK</span>
                  <strong>{STACKS_NETWORK.toUpperCase()}</strong>
                  {contractHref ? (
                    <a href={contractHref} target="_blank" rel="noopener noreferrer">
                      {PONG_CONTRACT_ID} ↗
                    </a>
                  ) : (
                    <strong>{PONG_CONTRACT_ID || 'Configured by environment'}</strong>
                  )}
                </div>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={150}>
              <TerminalCode />
            </ScrollReveal>
          </div>

          <ScrollReveal delay={200}>
            <div className="lp-states">
              <h3 className="lp-states__title">MATCH LIFECYCLE</h3>
              <div className="lp-states__flow">
                {stateMachine.slice(0, 4).map((s, i) => (
                  <React.Fragment key={s.id}>
                    <div className={`lp-states__node lp-states__node--${s.id.toLowerCase()}`}>
                      <span className="lp-states__dot" />
                      <span>{s.label}</span>
                    </div>
                    {i < 3 && <span className="lp-states__arrow">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="lp-states__branch">
                <span className="lp-states__arrow lp-states__arrow--down">↓</span>
                <div className="lp-states__node lp-states__node--refunded">
                  <span className="lp-states__dot" />
                  <span>Refunded</span>
                </div>
                <p className="lp-states__note">Timeout · Abandonment · Expired claim</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
