import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import stableperpIdl from '../idl/stableperp.json';

export function useStableperpProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: 'processed',
    });
    
    return new Program(stableperpIdl as unknown as Idl, provider);
  }, [connection, wallet]);

  return program;
}
