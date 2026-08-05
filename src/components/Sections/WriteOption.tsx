import { useState } from 'react';
import type { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useStableperpProgram } from '../../hooks/useStableperpProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#FFF',
  fontFamily: "'Space Mono', monospace",
  fontSize: '0.9rem',
  outline: 'none',
  marginBottom: '1.5rem',
  boxSizing: 'border-box' as const
};

const labelStyle = {
  display: 'block',
  color: '#A3A3A3',
  fontSize: '0.75rem',
  marginBottom: '0.5rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em'
};

export const WriteOption: FC = () => {
  const [qty, setQty] = useState('');
  const [strike, setStrike] = useState('');
  const [expiry, setExpiry] = useState('');
  const [premium, setPremium] = useState('');
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const program = useStableperpProgram();

  const handleWrite = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(qty);
    const premiumPrice = parseFloat(premium);
    
    if (isNaN(quantity) || quantity <= 0 || isNaN(premiumPrice) || premiumPrice <= 0) {
      alert('Please enter a valid quantity and premium.');
      return;
    }
    if (!publicKey || !program) {
      alert('Please connect your wallet first.');
      return;
    }
    setLoading(true);

    try {
      // Create dummy accounts for the demo
      const market = PublicKey.unique();
      const optionMint = PublicKey.unique();
      const underlyingMint = PublicKey.unique();
      
      const [writerPosition] = PublicKey.findProgramAddressSync(
        [Buffer.from('writer'), market.toBuffer(), publicKey.toBuffer()],
        program.programId
      );
      
      const [escrowOptionVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), writerPosition.toBuffer()],
        program.programId
      );

      // Dummy collateral vault just for compilation
      const collateralVault = PublicKey.unique();
      const writerUnderlyingAta = PublicKey.unique();

      // Call the program method
      const tx = await program.methods.writeOption(
        new anchor.BN(quantity), 
        new anchor.BN(premiumPrice)
      ).accounts({
        market,
        writerPosition,
        collateralVault,
        writerUnderlyingAta,
        optionMint,
        escrowOptionVault,
        writer: publicKey,
        underlyingMint,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
        systemProgram: SystemProgram.programId,
      }).rpc();

      alert(`Transaction successful! TX: ${tx}`);
      setQty('');
      setPremium('');
    } catch (err: any) {
      console.error(err);
      alert(`Transaction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleWrite} style={{ fontFamily: "'Space Mono', monospace" }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Asset</span>
          <span style={{ color: '#FFF', fontSize: '0.85rem' }}>AAPLx</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Available Balance</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.85rem' }}>500.00 AAPLx</span>
        </div>
      </div>

      <label style={labelStyle}>Quantity to Lock</label>
      <input type="number" step="0.01" placeholder="0.00" style={inputStyle} value={qty} onChange={(e) => setQty(e.target.value)} />

      <label style={labelStyle}>Target Strike Price (USDC)</label>
      <input type="number" step="0.01" placeholder="0.00" style={inputStyle} value={strike} onChange={(e) => setStrike(e.target.value)} />

      <label style={labelStyle}>Expiry Date</label>
      <input type="date" style={inputStyle} value={expiry} onChange={(e) => setExpiry(e.target.value)} />

      <label style={labelStyle}>Premium Price (USDC)</label>
      <input type="number" step="0.01" placeholder="0.00" style={inputStyle} value={premium} onChange={(e) => setPremium(e.target.value)} />

      <button type="submit" disabled={loading} style={{
        width: '100%',
        padding: '1rem',
        backgroundColor: loading ? 'rgba(94, 234, 212, 0.05)' : 'rgba(94, 234, 212, 0.1)',
        color: '#5EEAD4',
        border: '1px solid #5EEAD4',
        borderRadius: '8px',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if(!loading) {
          e.currentTarget.style.backgroundColor = '#5EEAD4';
          e.currentTarget.style.color = '#0A0A0A';
        }
      }}
      onMouseLeave={(e) => {
        if(!loading) {
          e.currentTarget.style.backgroundColor = 'rgba(94, 234, 212, 0.1)';
          e.currentTarget.style.color = '#5EEAD4';
        }
      }}
      >
        {loading ? 'WAITING FOR WALLET...' : 'MINT OPTION'}
      </button>
    </form>
  );
};
