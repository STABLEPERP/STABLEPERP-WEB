import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useStableperpProgram } from '../../hooks/useStableperpProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

import { getOrCreateATAInstruction } from '../../utils/token';
import { TxModal } from '../common/TxModal';

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
  const [premium, setPremium] = useState('');
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
  const [underlyingBalance, setUnderlyingBalance] = useState<number | null>(null);

  // Fetch Underlying Balance
  useEffect(() => {
    async function fetchBalance() {
      if (!publicKey || !market || !market.underlyingMint) {
        setUnderlyingBalance(null);
        return;
      }
      try {
        const { getAssociatedTokenAddressSync } = await import('@solana/spl-token');
        const underlyingAta = getAssociatedTokenAddressSync(new PublicKey(market.underlyingMint), publicKey);
        const bal = await connection.getTokenAccountBalance(underlyingAta);
        setUnderlyingBalance(bal.value.uiAmount);
      } catch (e) {
        setUnderlyingBalance(0);
      }
    }
    fetchBalance();
  }, [publicKey, market, connection]);

  const handleWrite = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(qty) * 10 ** 9;
    const premiumPrice = parseFloat(premium) * 10 ** 6;
    
    if (isNaN(quantity) || quantity <= 0 || isNaN(premiumPrice) || premiumPrice <= 0) {
      setModalState({ isOpen: true, type: 'error', title: 'Invalid Input', message: 'Please enter a valid quantity and premium.' });
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
      const underlyingMint = new PublicKey(market.underlyingMint || PublicKey.unique().toBase58());
      
      const [writerPosition] = PublicKey.findProgramAddressSync(
        [Buffer.from('writer'), marketPubkey.toBuffer(), publicKey.toBuffer()],
        program.programId
      );
      
      // escrowOptionVault is an ATA owned by the writerPosition PDA

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

      const { ata: escrowOptionVault, instruction: createEscrowOptionVaultIx } = await getOrCreateATAInstruction(
        connection,
        publicKey,
        optionMint,
        writerPosition // owner is the writerPosition PDA
      );

      // We should check if the option mint exists, but we assume MarketList provided it correctly

      const transaction = new anchor.web3.Transaction();
      if (createWriterUnderlyingAtaIx) transaction.add(createWriterUnderlyingAtaIx);
      if (createCollateralVaultIx) transaction.add(createCollateralVaultIx);
      if (createEscrowOptionVaultIx) transaction.add(createEscrowOptionVaultIx);

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
      console.log('✅ Transaction successful! TX Signature:', signature);
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        title: 'Transaction Successful', 
        message: 'Your option has been successfully written and the market pool has been funded!', 
        txSignature: signature 
      });
      setQty('');
      setPremium('');
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

      let errorMessage = 'Transaction failed! Please ensure you have sufficient Collateral (Asset) and Solana for gas fees.';
      const errString = (err.message || '') + JSON.stringify(err);
      
      if (errString.includes('0x1')) {
          errorMessage = 'Insufficient Token Balance! You do not have enough of the required collateral asset in your wallet to complete this transaction.';
      } else if (errString.includes('0xbbf') || errString.includes('AccountOwnedByWrongProgram')) {
          errorMessage = 'Account Owned By Wrong Program (0xbbf). This usually means the market data is outdated. Please refresh the page.';
      } else if (errString.includes('User rejected')) {
          errorMessage = 'Transaction was rejected by the user.';
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
          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Available Underlying Balance</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.85rem' }}>
            {underlyingBalance !== null ? `${underlyingBalance.toLocaleString()} ${market?.symbol?.split('/')[0] || 'Token'}` : '-'}
          </span>
        </div>
      </div>

      <label style={labelStyle}>Quantity to Lock</label>
      <input type="number" step="0.01" placeholder="0.00" style={inputStyle} value={qty} onChange={(e) => setQty(e.target.value)} />

      <label style={labelStyle}>Target Strike Price (USDC)</label>
      <div style={{ ...inputStyle, backgroundColor: 'rgba(255,255,255,0.05)', color: '#A3A3A3', cursor: 'not-allowed' }}>
        {market ? `$${market.strike}` : 'Select a market first'}
      </div>

      <label style={labelStyle}>Expiry Date</label>
      <div style={{ ...inputStyle, backgroundColor: 'rgba(255,255,255,0.05)', color: '#A3A3A3', cursor: 'not-allowed' }}>
        {market ? market.expiry : 'Select a market first'}
      </div>

      <label style={labelStyle}>Premium Price (USDC)</label>
      <input type="number" step="0.01" placeholder="0.00" style={inputStyle} value={premium} onChange={(e) => setPremium(e.target.value)} />

      <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Collateral Required</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>{(parseFloat(qty) || 0).toFixed(2)} {market?.symbol?.split('/')[0] || 'Token'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#5EEAD4', fontSize: '0.9rem', fontWeight: 'bold' }}>Total Premium Revenue</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.9rem', fontWeight: 'bold' }}>${((parseFloat(qty) || 0) * (parseFloat(premium) || 0)).toFixed(2)} USDC</span>
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
        {loading ? 'WAITING FOR WALLET...' : 'MINT OPTION'}
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
