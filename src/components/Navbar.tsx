import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const Navbar: FC = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      position: 'fixed',
      top: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 3rem)',
      maxWidth: '1200px',
      zIndex: 10,
      border: '1px solid rgba(255, 255, 255, 0.05)',
      backgroundColor: 'rgba(20, 20, 20, 0.4)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 'bold', fontSize: '1.2rem', color: '#5EEAD4' }}>
        STABLEPERP
      </div>
      <div style={{ display: 'flex', gap: '2rem', fontFamily: "'Space Mono', monospace", fontSize: '0.9rem' }}>
        <a href="#" style={{ color: '#FFF', textDecoration: 'none' }}>Markets</a>
        <a href="#" style={{ color: '#FFF', textDecoration: 'none' }}>Portfolio</a>
        <a href="#" style={{ color: '#A3A3A3', textDecoration: 'none' }}>Docs</a>
      </div>
      <div>
        <WalletMultiButton style={{ backgroundColor: '#5EEAD4', color: '#0A0A0A', fontFamily: "'Space Mono', monospace", borderRadius: '12px', height: '40px', padding: '0 1.5rem', fontWeight: 'bold' }} />
      </div>
    </nav>
  );
};
