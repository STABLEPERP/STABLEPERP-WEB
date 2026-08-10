import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useStableperpProgram } from '../../hooks/useStableperpProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

import { getOrCreateATAInstruction } from '../../utils/token';
import { TxModal } from '../common/TxModal';

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
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'info'; title: string; message: string; txSignature?: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });
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
  const quantity = (parseFloat(qty) * 10 ** 9) || 0;
  const totalCost = (quantity / 10 ** 9) * premiumPerOption;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setModalState({ isOpen: true, type: 'error', title: 'Invalid Input', message: 'Please enter a valid quantity.' });
      return;
    }
    if (!publicKey || !program) {
      setModalState({ isOpen: true, type: 'error', title: 'Wallet Not Connected', message: 'Please connect your wallet first.' });
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
        setModalState({ 
          isOpen: true, 
          type: 'info', 
          title: 'Pool Not Initialized', 
          message: "Writer Position not initialized!\n\nFor this devnet testing phase, the buyer buys from their own writer pool. Please go to the 'Write Option' tab and write an option first to initialize your pool." 
        });
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
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        title: 'Transaction Successful', 
        message: 'Your option has been successfully purchased!', 
        txSignature: signature 
      });
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

      let errorMessage = 'Transaction failed! Please ensure you have sufficient USDC balance and Solana for gas fees.';
      const errString = (err.message || '') + JSON.stringify(err);
      
      if (errString.includes('0x1')) {
          errorMessage = 'Insufficient Token Balance! You do not have enough USDC in your wallet to purchase this option.';
      } else if (errString.includes('0xbbf') || errString.includes('AccountOwnedByWrongProgram')) {
          errorMessage = 'Account Owned By Wrong Program (0xbbf). This usually means the market data is outdated. Please refresh the page.';
      } else if (errString.includes('User rejected')) {
          errorMessage = 'Transaction was rejected by the user.';
      } else if (errString.includes('InsufficientOptions') || errString.includes('6015')) {
          errorMessage = 'Insufficient Options! The writer does not have enough options available to fill your requested quantity.';
      } else if (errString.includes('CannotTradeWithSelf') || errString.includes('6010')) {
          errorMessage = 'Wash Trading Blocked! You cannot buy an option from your own writer pool.';
      }

      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: 'Transaction Failed', 
        message: errorMessage 
      });
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
      <TxModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        txSignature={modalState.txSignature}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </form>
  );
};
