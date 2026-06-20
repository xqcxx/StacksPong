import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UIConcepts.css';

const concepts = [
  {
    id: 'neon-grid',
    name: 'Neon Grid Arena',
    tag: 'Classic arcade cabinet meets cyber wager room',
    palette: ['#0b0018', '#7c3cff', '#00f5ff', '#fdd040'],
    hero: 'Stake STX. Enter The Grid. Win 2x.',
    copy: 'A high-contrast blacklight arena with glowing lanes, chunky cabinet buttons, and a strong competitive center stage.',
    details: ['CRT glow', 'purple/cyan rails', 'coin-op buttons', 'scoreboard-first layout'],
    className: 'concept-card--neon-grid'
  },
  {
    id: 'terminal-noir',
    name: 'Terminal Noir',
    tag: 'Underground hacker arcade',
    palette: ['#020403', '#35d07f', '#d7ff5f', '#101915'],
    hero: 'Challenge Accepted. Funds Locked.',
    copy: 'A darker command-center look with terminal panels, scanline separators, and contract-status readouts woven into the play CTA.',
    details: ['green phosphor UI', 'contract logs', 'monospace status chips', 'low-glare panels'],
    className: 'concept-card--terminal-noir'
  },
  {
    id: 'tokyo-cabinet',
    name: 'Tokyo Cabinet',
    tag: 'Dense cyberpunk street arcade',
    palette: ['#130014', '#ff2bd6', '#35d0ff', '#ff8a00'],
    hero: 'Paddle Fight In The Neon District.',
    copy: 'A louder, poster-like landing page with stacked signs, diagonal motion, and a social challenge-board feel.',
    details: ['magenta signage', 'angled cards', 'city-light gradients', 'public challenge emphasis'],
    className: 'concept-card--tokyo-cabinet'
  },
  {
    id: 'vector-vault',
    name: 'Vector Vault',
    tag: 'Premium Web3 esport terminal',
    palette: ['#070b18', '#5b7cff', '#fdd040', '#ffffff'],
    hero: 'Skill-Based Pong. Transparent Payouts.',
    copy: 'A cleaner cyber-esport direction for trust: fewer gimmicks, sharper panels, wallet state, stakes, and proof language up front.',
    details: ['premium cards', 'proof badges', 'clean HUD', 'trust-first staking copy'],
    className: 'concept-card--vector-vault'
  },
  {
    id: 'redline-riot',
    name: 'Redline Riot',
    tag: 'Aggressive high-stakes arcade duel',
    palette: ['#120606', '#ff3b3b', '#fdd040', '#1a0b0b'],
    hero: 'First To Five Takes The Pot.',
    copy: 'A more intense arena for competitive players, using red danger energy, warning tape, prize callouts, and versus framing.',
    details: ['duel framing', 'risk/reward cards', 'red alert accents', 'prize-first CTA'],
    className: 'concept-card--redline-riot'
  }
];

function Palette({ colors }) {
  return (
    <div className="concept-palette" aria-label="Color palette">
      {colors.map(color => (
        <span key={color} style={{ backgroundColor: color }} title={color} />
      ))}
    </div>
  );
}

function ConceptPreview({ concept, isActive, onSelect }) {
  return (
    <button
      type="button"
      className={`concept-card ${concept.className} ${isActive ? 'is-active' : ''}`}
      onClick={onSelect}
      aria-pressed={isActive}
    >
      <div className="concept-card__scanline" />
      <div className="concept-card__topline">
        <span>{concept.name}</span>
        <span>0{concepts.indexOf(concept) + 1}</span>
      </div>
      <div className="concept-card__arena">
        <div className="concept-paddle concept-paddle--left" />
        <div className="concept-ball" />
        <div className="concept-paddle concept-paddle--right" />
      </div>
      <h2>{concept.hero}</h2>
      <p>{concept.tag}</p>
      <Palette colors={concept.palette} />
    </button>
  );
}

export default function UIConcepts() {
  const [activeId, setActiveId] = useState(concepts[0].id);
  const navigate = useNavigate();
  const activeConcept = concepts.find(concept => concept.id === activeId) || concepts[0];

  return (
    <main className={`ui-concepts ${activeConcept.className}`}>
      <header className="ui-concepts__header">
        <button type="button" className="ui-concepts__back" onClick={() => navigate('/')}>
          Back Home
        </button>
        <div>
          <p className="ui-concepts__eyebrow">PONG-IT UI Concepts</p>
          <h1>Pick An Arcade Cyberpunk Direction</h1>
          <p className="ui-concepts__intro">
            Five landing-page style choices for the new home screen. Click any card to inspect the direction.
          </p>
        </div>
      </header>

      <section className="ui-concepts__stage" aria-label="Selected concept preview">
        <div className="concept-hero-panel">
          <div className="concept-hero-panel__meta">
            <span>Selected Style</span>
            <strong>{activeConcept.name}</strong>
          </div>
          <h2>{activeConcept.hero}</h2>
          <p>{activeConcept.copy}</p>
          <div className="concept-hero-panel__actions">
            <button type="button">Start Staked Match</button>
            <button type="button">Join Room</button>
          </div>
          <div className="concept-hero-panel__stats">
            <span>2x payout</span>
            <span>60 FPS</span>
            <span>STX escrow</span>
          </div>
        </div>

        <aside className="concept-style-notes">
          <h3>Style Choice</h3>
          <Palette colors={activeConcept.palette} />
          <ul>
            {activeConcept.details.map(detail => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="ui-concepts__grid" aria-label="Available UI concepts">
        {concepts.map(concept => (
          <ConceptPreview
            key={concept.id}
            concept={concept}
            isActive={concept.id === activeId}
            onSelect={() => setActiveId(concept.id)}
          />
        ))}
      </section>
    </main>
  );
}
