import type { FC } from 'react';
import { SilkBackground } from '../components/SilkBackground';
import { Link } from 'react-router-dom';

export const Docs: FC = () => {
  return (
    <>
      <SilkBackground color="#5EEAD4" speed={1.0} intensity={0.25} scale={2.0} />
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '8rem 2rem 4rem',
        color: '#FFF',
        fontFamily: "'Space Mono', monospace",
        lineHeight: '1.8'
      }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px' }}>
          <h1 style={{ color: '#5EEAD4', fontSize: '2.5rem', marginBottom: '1rem', textShadow: '0 0 20px rgba(94,234,212,0.3)' }}>
            Stableperp Documentation
          </h1>
          <p style={{ color: '#A3A3A3', marginBottom: '3rem', fontSize: '1.1rem' }}>
            Learn how to trade options, provide liquidity, and integrate with the Stableperp protocol.
          </p>

          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#FFF' }}>
            Overview
          </h2>
          <p style={{ marginBottom: '2rem' }}>
            Stableperp is a decentralized derivatives protocol built on Solana. It allows users to trade fully-collateralized call and put options on various assets (Crypto and US Stocks) settled entirely in USDC.
          </p>

          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#FFF' }}>
            Trading Options (Buying)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            As an option buyer, you pay a premium upfront to secure the right (but not the obligation) to buy or sell the underlying asset at a specific <strong>Strike Price</strong> before the <strong>Expiry</strong>.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: '#D4D4D4' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Call Option:</strong> You profit if the asset price rises above the strike price.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Put Option:</strong> You profit if the asset price falls below the strike price.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Max Loss:</strong> Limited to the premium paid.</li>
          </ul>

          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#FFF' }}>
            Writing Options (Providing Liquidity)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Users can "Write" options to earn the premium paid by buyers. Writing an option requires fully locking up USDC collateral in an escrow vault until expiry or exercise.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: '#D4D4D4' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Covered Calls:</strong> You lock USDC equivalent to the payout if the strike is breached.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Cash-Secured Puts:</strong> You lock USDC equivalent to the strike price.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Profit:</strong> You keep the premium if the option expires out-of-the-money.</li>
          </ul>

          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#FFF' }}>
            Settlement & Oracles
          </h2>
          <p style={{ marginBottom: '2rem' }}>
            All markets are settled in <strong>USDC</strong>. The protocol uses the <strong>Pyth Network</strong> as a decentralized oracle to determine the mark price of assets for accurate settlement and payoff calculations.
          </p>

          <div style={{ marginTop: '4rem', textAlign: 'center' }}>
            <Link to="/terminal">
              <button className="hero-btn" style={{ fontSize: '1rem', padding: '1rem 2rem' }}>
                OPEN TERMINAL
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
