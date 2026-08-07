import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useStableperpProgram } from '../../hooks/useStableperpProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { PayoffChart } from './PayoffChart';
import { getOrCreateATAInstruction } from '../../utils/token';

interface BuyOptionProps {
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

export const BuyOption: FC<BuyOptionProps> = ({ market }) => {
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useStableperpProgram();
  const [quoteBalance, setQuoteBalance] = useState<number | null>(null);

  // Fetch Quote Balance
  useEffect(() => {
    async function fetchBalance() {
      if (!publicKey || !market || !market.quoteMint) {
        setQuoteBalance(null);
        return;
      }
      try {
        const { getAssociatedTokenAddressSync } = await import('@solana/spl-token');
        const quoteAta = getAssociatedTokenAddressSync(new PublicKey(market.quoteMint), publicKey);
        const bal = await connection.getTokenAccountBalance(quoteAta);
        setQuoteBalance(bal.value.uiAmount);
      } catch (e) {
        setQuoteBalance(0);
      }
    }
    fetchBalance();
  }, [publicKey, market, connection]);

  const premiumPerOption = market && market.premiumAsk ? market.premiumAsk : 0;
  const quantity = parseFloat(qty) || 0;
  const totalCost = quantity * premiumPerOption;

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
      if (!market) throw new Error("No market selected.");

      const marketPubkey = new PublicKey(market.id || PublicKey.unique().toBase58());
      const optionMint = new PublicKey(market.optionMint || PublicKey.unique().toBase58());
      const quoteMint = new PublicKey(market.quoteMint || PublicKey.unique().toBase58());
      
      // Fallback to current user as writer for local dev testing
      const [writerPosition] = PublicKey.findProgramAddressSync(
        [Buffer.from('writer'), marketPubkey.toBuffer(), publicKey.toBuffer()],
        program.programId
      );
      
      const { getAssociatedTokenAddressSync } = await import('@solana/spl-token');
      const escrowOptionVault = getAssociatedTokenAddressSync(optionMint, writerPosition, true);

      // Check if writer position is initialized before buying
      const writerPosInfo = await connection.getAccountInfo(writerPosition);
      if (!writerPosInfo) {
        alert("Writer Position not initialized!\n\nFor this devnet testing phase, the buyer buys from their own writer pool. Please go to the 'Write Option' tab and write an option first to initialize your pool.");
        setLoading(false);
        return;
      }

      const writerQuoteAta = getAssociatedTokenAddressSync(quoteMint, publicKey);

      // Create ATAs for buyer if they don't exist
      const { ata: buyerOptionAta, instruction: createBuyerOptionAtaIx } = await getOrCreateATAInstruction(
        connection,
        publicKey,
        optionMint,
        publicKey // owner is the buyer
      );

      const { ata: buyerQuoteAta, instruction: createBuyerQuoteAtaIx } = await getOrCreateATAInstruction(
        connection,
        publicKey,
        quoteMint,
        publicKey // owner is the buyer
      );

      const transaction = new anchor.web3.Transaction();
      if (createBuyerOptionAtaIx) transaction.add(createBuyerOptionAtaIx);
      if (createBuyerQuoteAtaIx) transaction.add(createBuyerQuoteAtaIx);

      const buyOptionIx = await program.methods.buyOption(
        new anchor.BN(quantity)
      ).accounts({
        market: marketPubkey,
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
      }).instruction();

      transaction.add(buyOptionIx);

      const signature = await program.provider.sendAndConfirm!(transaction, []);
      console.log('✅ Transaction successful! TX Signature:', signature);
      alert(`Transaction successful!\nTX: ${signature}\n\n(Signature has been printed to console for copying)`);
      setQty('');
    } catch (err: any) {
      console.error('❌ Transaction error details:', err.message || err);
      if (err.logs) {
        console.error('❌ Program Logs:', err.logs);
      } else if (typeof err.getLogs === 'function') {
        try {
          const logs = await err.getLogs();
          console.error('❌ Program Logs:', logs);
        } catch(e) {}
      }
      alert('Transaction failed! Please ensure you have sufficient USDC balance and Solana for gas fees.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleTrade} style={{ fontFamily: "'Space Mono', monospace" }}>
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
          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Available Quote Balance</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.85rem' }}>
            {quoteBalance !== null ? `${quoteBalance.toLocaleString()} USDC` : '-'}
          </span>
        </div>
      </div>

      <label style={labelStyle}>Quantity to Buy</label>
      <input type="number" step="1" placeholder="0" style={inputStyle} value={qty} onChange={(e) => setQty(e.target.value)} />

      <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Premium per Option</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>${premiumPerOption.toFixed(2)} USDC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#5EEAD4', fontSize: '0.9rem', fontWeight: 'bold' }}>Total Premium Cost</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.9rem', fontWeight: 'bold' }}>${totalCost.toFixed(2)} USDC</span>
        </div>
      </div>

      <PayoffChart 
        type="buy" 
        strike={market ? market.strike : 0} 
        premium={premiumPerOption} 
        quantity={quantity} 
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
        {loading ? 'WAITING FOR WALLET...' : 'EXECUTE TRADE'}
      </button>
    </form>
  );
};
