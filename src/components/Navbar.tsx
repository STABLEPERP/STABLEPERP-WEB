import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';

interface NavbarProps {
  variant?: 'landing' | 'terminal';
}

export const Navbar: FC<NavbarProps> = ({ variant = 'landing' }) => {
  const isTerminal = variant === 'terminal';

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      position: 'fixed',
      top: isTerminal ? '0' : '1.5rem',
      left: isTerminal ? '0' : '50%',
      transform: isTerminal ? 'none' : 'translateX(-50%)',
      width: isTerminal ? '100%' : 'calc(100% - 3rem)',
      maxWidth: isTerminal ? 'none' : '1200px',
      zIndex: 10,
      border: isTerminal ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
      borderBottom: isTerminal ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
      backgroundColor: isTerminal ? '#0A0A0A' : 'rgba(20, 20, 20, 0.4)',
      backdropFilter: isTerminal ? 'none' : 'blur(16px)',
      WebkitBackdropFilter: isTerminal ? 'none' : 'blur(16px)',
      borderRadius: isTerminal ? '0' : '24px',
      boxShadow: isTerminal ? 'none' : '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 'bold', fontSize: '1.2rem', color: '#5EEAD4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          STABLEPERP {isTerminal && <span style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(94, 234, 212, 0.1)', borderRadius: '4px', border: '1px solid rgba(94, 234, 212, 0.2)' }}>TERMINAL</span>}
        </div>
      </Link>
      {!isTerminal && (
        <div style={{ display: 'flex', gap: '2rem', fontFamily: "'Space Mono', monospace", fontSize: '0.9rem' }}>
          <a href="#" style={{ color: '#FFF', textDecoration: 'none' }}>Markets</a>
          <a href="#" style={{ color: '#FFF', textDecoration: 'none' }}>Portfolio</a>
          <a href="#" style={{ color: '#A3A3A3', textDecoration: 'none' }}>Docs</a>
        </div>
      )}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isTerminal && (
          <div style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            borderRadius: '8px', 
            padding: '0.25rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontFamily: "'Space Mono', monospace", color: '#A3A3A3', cursor: 'not-allowed' }}>Mainnet</span>
            <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontFamily: "'Space Mono', monospace", color: '#5EEAD4', backgroundColor: 'rgba(94, 234, 212, 0.1)', borderRadius: '4px' }}>Devnet</span>
          </div>
        )}
        <WalletMultiButton style={{ backgroundColor: '#5EEAD4', color: '#0A0A0A', fontFamily: "'Space Mono', monospace", borderRadius: '8px', height: '36px', padding: '0 1rem', fontWeight: 'bold', fontSize: '0.875rem' }} />
      </div>
    </nav>
  );
};
