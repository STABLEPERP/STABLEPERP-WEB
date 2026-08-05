import { useState } from 'react';
import type { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useStableperpProgram } from '../../hooks/useStableperpProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { PayoffChart } from './PayoffChart';

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

export const BuyOption: FC = () => {
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const program = useStableperpProgram();

  const premiumPerOption = 5.00;
  const quantity = parseFloat(qty) || 0;
  const networkFee = 0.01;
  const totalCost = (quantity * premiumPerOption) + (quantity > 0 ? networkFee : 0);

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert('Please enter a valid quantity.');
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
      const quoteMint = PublicKey.unique();
      const writerPosition = PublicKey.unique();
      
      const [escrowOptionVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), writerPosition.toBuffer()],
        program.programId
      );

      // Dummy accounts just for compilation
      const writerQuoteAta = PublicKey.unique();
      const buyerOptionAta = PublicKey.unique();
      const buyerQuoteAta = PublicKey.unique();

      // Call the program method
      const tx = await program.methods.buyOption(
        new anchor.BN(quantity)
      ).accounts({
        market,
        writerPosition,
        escrowOptionVault,
        writerQuoteAta,
        buyerOptionAta,
        buyerQuoteAta,
        optionMint,
        quoteMint,
        buyer: publicKey,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
        systemProgram: SystemProgram.programId,
      }).rpc();

      alert(`Transaction successful! TX: ${tx}`);
      setQty('');
    } catch (err: any) {
      console.error(err);
      alert(`Transaction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleTrade} style={{ fontFamily: "'Space Mono', monospace" }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Selected Market</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.85rem' }}>MKT-001 (AAPLx CALL)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Available USDC</span>
          <span style={{ color: '#FFF', fontSize: '0.85rem' }}>1,500.00 USDC</span>
        </div>
      </div>

      <label style={labelStyle}>Quantity to Buy</label>
      <input type="number" step="1" placeholder="0" style={inputStyle} value={qty} onChange={(e) => setQty(e.target.value)} />

      <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Premium per Option</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>${premiumPerOption.toFixed(2)} USDC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Network Fee</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>${(quantity > 0 ? networkFee : 0).toFixed(2)} USDC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#5EEAD4', fontSize: '0.9rem', fontWeight: 'bold' }}>Total Cost</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.9rem', fontWeight: 'bold' }}>${totalCost.toFixed(2)} USDC</span>
        </div>
      </div>

      <PayoffChart 
        type="buy" 
        strike={100} 
        premium={premiumPerOption} 
        quantity={quantity} 
      />

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
        {loading ? 'WAITING FOR WALLET...' : 'EXECUTE TRADE'}
      </button>
    </form>
  );
};
