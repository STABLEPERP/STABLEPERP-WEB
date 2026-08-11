import { useState } from 'react';
import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { useNetwork } from '../contexts/NetworkContext';
import './Navbar.css';

interface NavbarProps {
  variant?: 'landing' | 'terminal';
}

export const Navbar: FC<NavbarProps> = ({ variant = 'landing' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isTerminal = variant === 'terminal';
  const { network, setNetwork } = isTerminal ? useNetwork() : { network: 'devnet', setNetwork: () => {} };

  return (
    <>
      <nav className={`navbar-container ${isTerminal ? 'navbar-terminal' : 'navbar-landing'}`}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="Stableperp Logo" style={{ height: '32px' }} />
          STABLEPERP {isTerminal && <span className="navbar-badge">TERMINAL</span>}
        </div>
      </Link>
      {!isTerminal && (
        <div className="navbar-links">
          <a href="#vision" style={{ color: '#FFF', textDecoration: 'none' }}>Vision</a>
          <a href="#infrastructure" style={{ color: '#FFF', textDecoration: 'none' }}>Infrastructure</a>
          <a href="#markets" style={{ color: '#FFF', textDecoration: 'none' }}>Markets</a>
          <a href="#roadmap" style={{ color: '#A3A3A3', textDecoration: 'none' }}>Roadmap</a>
        </div>
      )}
      <div className="navbar-actions">
        {isTerminal && (
          <div style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            borderRadius: '8px', 
            padding: '0.25rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span 
              onClick={() => setNetwork('mainnet-beta')}
              style={{ 
                padding: '0.25rem 0.75rem', 
                fontSize: '0.75rem', 
                fontFamily: "'Space Mono', monospace", 
                color: network === 'mainnet-beta' ? '#5EEAD4' : '#A3A3A3', 
                backgroundColor: network === 'mainnet-beta' ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer' 
              }}>
              Mainnet
            </span>
            <span 
              onClick={() => setNetwork('devnet')}
              style={{ 
                padding: '0.25rem 0.75rem', 
                fontSize: '0.75rem', 
                fontFamily: "'Space Mono', monospace", 
                color: network === 'devnet' ? '#5EEAD4' : '#A3A3A3', 
                backgroundColor: network === 'devnet' ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer' 
              }}>
              Devnet
            </span>
          </div>
        )}
        <WalletMultiButton className="wallet-adapter-button" style={{ backgroundColor: '#5EEAD4', color: '#0A0A0A', fontFamily: "'Space Mono', monospace", borderRadius: '8px', height: '36px', padding: '0 1rem', fontWeight: 'bold', fontSize: '0.875rem' }} />
        {!isTerminal && (
          <button 
            className="hamburger-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
    </nav>
    
    {!isTerminal && isMobileMenuOpen && (
      <div className="mobile-menu-overlay">
        <div className="mobile-menu-content">
          <a href="#" onClick={() => setIsMobileMenuOpen(false)}>Markets</a>
          <a href="#" onClick={() => setIsMobileMenuOpen(false)}>Portfolio</a>
          <a href="#" onClick={() => setIsMobileMenuOpen(false)}>Docs</a>
        </div>
      </div>
    )}
    </>
  );
};
