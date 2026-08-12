import { Routes, Route, Link } from 'react-router-dom';
import { SilkBackground } from './components/SilkBackground';
import { Navbar } from './components/Navbar';
import { Terminal } from './pages/Terminal';
import { Docs } from './pages/Docs';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
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
        <div id="infrastructure" className="section-title animate-fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>CORE INFRASTRUCTURE</div>
        <div className="feature-cards">
          <div className="feature-card animate-fade-up delay-100">
            <h3 className="feature-title">100% Fully Collateralized</h3>
            <p className="feature-desc">Every single options contract is mathematically secured by 1:1 USDC reserves locked in immutable on-chain smart contracts. Payouts are mathematically guaranteed without relying on centralized intermediaries. Insolvency is cryptographically impossible.</p>
          </div>
          <div className="feature-card animate-fade-up delay-200">
            <h3 className="feature-title">Sub-Second Oracle Pricing</h3>
            <p className="feature-desc">Powered by Pyth Network's low-latency pull oracles, Stableperp achieves millisecond-level price resolution. This ensures lightning-fast execution and total immunity against stale pricing, flash-loan attacks, and local market manipulation.</p>
          </div>
          <div className="feature-card animate-fade-up delay-300">
            <h3 className="feature-title">Permissionless Capital Efficiency</h3>
            <p className="feature-desc">Liquidity provision is democratized. Anyone can act as a market maker by writing covered calls or cash-secured puts. Earn sustainable, organic yield derived directly from option premiums paid by institutional and retail traders alike.</p>
          </div>
        </div>

        <div id="markets" className="section-title animate-fade-up" style={{ textAlign: 'center', marginTop: '6rem', marginBottom: '3rem' }}>SUPPORTED MARKETS</div>
        <div className="glass-panel animate-fade-up delay-100" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-heading" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Trade Anything. Settle in USDC.</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px' }}>
            {['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'JUP & WIF', 'Tesla (TSLA)', 'Apple (AAPL)', 'Nvidia (NVDA)', 'S&P 500 (SPY)', 'Nasdaq (QQQ)'].map(market => (
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
        <div style={{ display: 'flex', gap: '2rem', fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/docs" style={{ color: '#A3A3A3', textDecoration: 'none' }}>Documentation</Link>
          <Link to="/terms" style={{ color: '#A3A3A3', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link to="/privacy" style={{ color: '#A3A3A3', textDecoration: 'none' }}>Privacy Policy</Link>
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
      <Route path="/docs" element={<><Navbar variant="landing" /><Docs /></>} />
      <Route path="/terms" element={<><Navbar variant="landing" /><Terms /></>} />
      <Route path="/privacy" element={<><Navbar variant="landing" /><Privacy /></>} />
    </Routes>
  );
}

export default App;
