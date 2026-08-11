import { Routes, Route, Link } from 'react-router-dom';
import { SilkBackground } from './components/SilkBackground';
import { Navbar } from './components/Navbar';
import { Terminal } from './pages/Terminal';
import './index.css';


function Landing() {
  return (
    <>
      <SilkBackground color="#5EEAD4" speed={1.0} intensity={0.25} scale={2.0} />
      <main className="hero-container">
        <div className="hero-label animate-fade-up">OPTIONS · PERPS · SETTLED IN USDC</div>
        <h1 className="hero-title animate-fade-up delay-100">
          Options on <br />
          <span style={{ color: '#5EEAD4', fontStyle: 'italic', textShadow: '0 0 30px rgba(94,234,212,0.3)' }}>tokenized stocks.</span><br />
          On-chain derivatives,<br />
          24/7.
        </h1>
        <p className="hero-subtitle animate-fade-up delay-200">
          Buy calls and puts, long or short any market, or write them to earn premium. Fully collateralized, oracle-priced, and open 24/7 on Solana.
        </p>
        <Link to="/terminal" style={{ textDecoration: 'none' }}>
          <button className="hero-btn animate-fade-up delay-300">
            START TRADING
          </button>
        </Link>
      </main>

      <section className="content-section">
        <div id="vision" className="section-grid">
          <div className="glass-panel animate-fade-up delay-100">
            <div className="section-title">THE VISION</div>
            <h2 className="section-heading">Institutional-Grade Derivatives for Everyone.</h2>
            <p className="section-text">
              Stableperp bridges the gap between traditional finance and decentralized execution. While it started as a concept rooted in community culture, our architecture is built for serious capital. We believe that robust, highly-liquid synthetic markets should not be gated by centralized entities.
            </p>
          </div>
          <div className="glass-panel animate-fade-up delay-200">
            <div className="section-title">THE MISSION</div>
            <h2 className="section-heading">Transparent, Fully Collateralized On-Chain Markets.</h2>
            <p className="section-text">
              No hidden insolvency risks, no opaque order routing. By strictly collateralizing every contract in USDC and utilizing high-fidelity Oracle data, we ensure that every participant—whether hedging a portfolio or providing liquidity—can operate with mathematical certainty and zero counterparty risk.
            </p>
          </div>
        </div>

        <div id="infrastructure" className="section-title animate-fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>CORE INFRASTRUCTURE</div>
        <div className="feature-cards">
          <div className="feature-card animate-fade-up delay-100">
            <h3 className="feature-title">100% Collateralized</h3>
            <p className="feature-desc">Every position is mathematically secured by USDC locked in programmatic vaults. If you write an option, the payout is guaranteed. Insolvency is impossible by design.</p>
          </div>
          <div className="feature-card animate-fade-up delay-200">
            <h3 className="feature-title">High-Fidelity Oracles</h3>
            <p className="feature-desc">Integrated with leading Oracle networks (Pyth/Switchboard) to ensure split-second accuracy for settlement and pricing, immune to local market manipulation.</p>
          </div>
          <div className="feature-card animate-fade-up delay-300">
            <h3 className="feature-title">Permissionless Yield</h3>
            <p className="feature-desc">Liquidity isn't monopolized by market makers. Anyone can step in to write options, provide liquidity, and capture real yields from market premiums directly on-chain.</p>
          </div>
        </div>

        <div id="markets" className="section-title animate-fade-up" style={{ textAlign: 'center', marginTop: '6rem', marginBottom: '3rem' }}>SUPPORTED MARKETS</div>
        <div className="glass-panel animate-fade-up delay-100" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-heading" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Trade Anything. Settle in USDC.</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px' }}>
            {['Tokenized Equities (AAPL, TSLA)', 'Crypto Majors (BTC, SOL)', 'Foreign Exchange (EUR, JPY)', 'Commodities (GLD, SLV)'].map(market => (
              <span key={market} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'rgba(94, 234, 212, 0.1)', color: '#5EEAD4', border: '1px solid rgba(94, 234, 212, 0.3)', borderRadius: '30px', fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(94, 234, 212, 0.2)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(94, 234, 212, 0.1)'}>
                {market}
              </span>
            ))}
          </div>
          <p className="section-text" style={{ marginTop: '2rem', textAlign: 'center', maxWidth: '700px' }}>
            Our dynamic Oracle architecture allows us to list any asset that has reliable price feeds. New markets are added continuously without fragmenting liquidity.
          </p>
        </div>

        <div id="roadmap" className="section-title animate-fade-up" style={{ textAlign: 'center', marginTop: '6rem', marginBottom: '3rem' }}>ROADMAP</div>
        <div className="feature-cards">
          <div className="feature-card animate-fade-up delay-100">
            <h3 className="feature-title" style={{ color: '#5EEAD4' }}>PHASE I: Genesis</h3>
            <p className="feature-desc">
              - Core Options Protocol on Devnet<br/>
              - Pro-Trading Terminal UI<br/>
              - Devnet Faucet & Testing<br/>
              - Mainnet Beta Launch
            </p>
          </div>
          <div className="feature-card animate-fade-up delay-200">
            <h3 className="feature-title" style={{ color: '#5EEAD4' }}>PHASE II: Expansion</h3>
            <p className="feature-desc">
              - Perpetual Futures (Perps) Integration<br/>
              - Shared Liquidity Pools (LP)<br/>
              - Forex & Commodities Markets<br/>
              - Mobile Optimized Interface
            </p>
          </div>
          <div className="feature-card animate-fade-up delay-300">
            <h3 className="feature-title" style={{ color: '#5EEAD4' }}>PHASE III: Decentralization</h3>
            <p className="feature-desc">
              - DAO Governance (SPL Token)<br/>
              - Cross-chain Margin Accounts<br/>
              - Vault Strategy Automation<br/>
              - Institutional API Access
            </p>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '4rem 10vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 2, backgroundColor: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 'bold', fontSize: '1.2rem', color: '#5EEAD4' }}>
          STABLEPERP
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontFamily: "'Space Mono', monospace", fontSize: '0.85rem' }}>
          <a href="#" style={{ color: '#A3A3A3', textDecoration: 'none' }}>Documentation</a>
          <a href="#" style={{ color: '#A3A3A3', textDecoration: 'none' }}>Terms & Conditions</a>
          <a href="#" style={{ color: '#A3A3A3', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#A3A3A3', textDecoration: 'none' }}>GitHub</a>
        </div>
        <div style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>
          © 2026 Stableperp Protocol. Built on Solana.
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<><Navbar variant="landing" /><Landing /></>} />
      <Route path="/terminal" element={<><Navbar variant="terminal" /><Terminal /></>} />
    </Routes>
  );
}

export default App;
