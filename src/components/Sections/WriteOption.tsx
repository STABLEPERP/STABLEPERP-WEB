import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useStableperpProgram } from '../../hooks/useStableperpProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { PayoffChart } from './PayoffChart';
import { getOrCreateATAInstruction } from '../../utils/token';

interface WriteOptionProps {
  market: any | null;
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  backgroundColor: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#FFF',
  fontFamily: "'Space Mono', monospace",
  fontSize: '0.875rem',
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

export const WriteOption: FC<WriteOptionProps> = ({ market }) => {
  const [qty, setQty] = useState('');
  const [strike, setStrike] = useState('');
  const [expiry, setExpiry] = useState('');
  const [premium, setPremium] = useState('');
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const { connection } = useConnection();
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
      if (!market) throw new Error("No market selected.");

      const marketPubkey = new PublicKey(market.id);
      const optionMint = new PublicKey(market.optionMint);
      const underlyingMint = new PublicKey(market.underlyingMint);
      
      const [writerPosition] = PublicKey.findProgramAddressSync(
        [Buffer.from('writer'), market.toBuffer(), publicKey.toBuffer()],
        program.programId
      );
      
      const [escrowOptionVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), writerPosition.toBuffer()],
        program.programId
      );

      // Create ATAs if they don't exist
      const { ata: writerUnderlyingAta, instruction: createWriterUnderlyingAtaIx } = await getOrCreateATAInstruction(
        connection,
        publicKey,
        underlyingMint,
        publicKey // owner is the writer
      );

      const { ata: collateralVault, instruction: createCollateralVaultIx } = await getOrCreateATAInstruction(
        connection,
        publicKey,
        underlyingMint,
        marketPubkey // owner is the market PDA
      );

      // We should check if the option mint exists, but we assume MarketList provided it correctly

      const transaction = new anchor.web3.Transaction();
      if (createWriterUnderlyingAtaIx) transaction.add(createWriterUnderlyingAtaIx);
      if (createCollateralVaultIx) transaction.add(createCollateralVaultIx);

      const writeOptionIx = await program.methods.writeOption(
        new anchor.BN(quantity), 
        new anchor.BN(premiumPrice)
      ).accounts({
        market: marketPubkey,
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
      }).instruction();

      transaction.add(writeOptionIx);

      const signature = await program.provider.sendAndConfirm!(transaction, []);
      alert(`Transaction successful! TX: ${signature}`);
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
          <span style={{ color: '#FFF', fontSize: '0.85rem' }}>{market ? market.symbol : '-'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Strike</span>
          <span style={{ color: '#FFF', fontSize: '0.85rem' }}>{market ? `$${market.strike}` : '-'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Available Balance</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.85rem' }}>-</span>
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

      <PayoffChart 
        type="write" 
        strike={parseFloat(strike) || 0} 
        premium={parseFloat(premium) || 0} 
        quantity={parseFloat(qty) || 0} 
      />

      <button type="submit" disabled={loading} style={{
        width: '100%',
        padding: '0.625rem 1rem',
        backgroundColor: loading ? 'rgba(94, 234, 212, 0.05)' : 'rgba(94, 234, 212, 0.1)',
        color: '#5EEAD4',
        border: '1px solid #5EEAD4',
        borderRadius: '8px',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 'bold',
        fontSize: '0.875rem',
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
