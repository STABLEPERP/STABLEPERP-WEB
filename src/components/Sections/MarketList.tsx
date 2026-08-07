import { useEffect, useState } from 'react';
import type { FC } from 'react';

import { useStableperpProgram } from '../../hooks/useStableperpProgram';

interface Market {
  id: string;
  symbol: string;
  strike: number;
  expiry: string;
  totalLiquidity: number;
  premiumAsk: number;
  underlyingMint: string;
  quoteMint: string;
  optionMint: string;
}

interface MarketListProps {
  onSelectMarket?: (market: Market) => void;
  selectedMarketId?: string;
  filterAssetSymbol?: string;
}

export const MarketList: FC<MarketListProps> = ({ onSelectMarket, selectedMarketId, filterAssetSymbol }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const program = useStableperpProgram();

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true);
        // Fetch all market accounts from the blockchain
        const marketAccounts = await (program as any).account.market.all();
        
        // Fetch all writer positions to calculate liquidity and premium dynamically
        const writerPositions = await (program as any).account.writerPosition.all();
        
        const liquidityMap: Record<string, { totalLiquidity: number, lowestPremium: number }> = {};
        
        for (const wp of writerPositions) {
          const marketId = wp.account.market.toString();
          // Assuming amounts might be large, using parseFloat or keeping it simple.
          // Since minted/filled are u64, toNumber() works for small amounts, or we can use BN logic.
          const available = wp.account.mintedAmount.toNumber() - wp.account.filledAmount.toNumber();
          
          if (available > 0) {
            if (!liquidityMap[marketId]) {
              liquidityMap[marketId] = { totalLiquidity: 0, lowestPremium: Infinity };
            }
            liquidityMap[marketId].totalLiquidity += available;
            
            const premium = wp.account.premiumAsk.toNumber();
            if (premium < liquidityMap[marketId].lowestPremium) {
              liquidityMap[marketId].lowestPremium = premium;
            }
          }
        }

        const formattedMarkets = marketAccounts.map((account: any) => {
          // Decode on-chain data
          const marketId = account.publicKey.toString();
          const underlyingMint = account.account.underlyingMint.toString();
          const strikePrice = account.account.strike.toNumber(); // Assume integer for now
          const expiryTs = account.account.expiryTs.toNumber();
          const date = new Date(expiryTs * 1000).toLocaleDateString('en-GB');

          // Determine symbol manually based on some known Devnet Mints, or just show partial mint address
          const isBTC = underlyingMint.startsWith('J9B'); // Just a dummy check for Devnet
          const isETH = underlyingMint.startsWith('7vx'); 
          // Set everything else to SOL/USDC so it shows up when user clicks SOL in UI
          const symbol = isBTC ? 'BTC/USDC' : isETH ? 'ETH/USDC' : 'SOL/USDC';

          const marketLiquidity = liquidityMap[marketId];
          const totalLiquidity = marketLiquidity ? marketLiquidity.totalLiquidity : 0;
          const premiumAsk = marketLiquidity && marketLiquidity.lowestPremium !== Infinity 
            ? marketLiquidity.lowestPremium 
            : 0;

          return {
            id: marketId,
            symbol: symbol,
            strike: strikePrice,
            expiry: date,
            totalLiquidity,
            premiumAsk,
            underlyingMint: account.account.underlyingMint.toString(),
            quoteMint: account.account.quoteMint.toString(),
            optionMint: account.account.optionMint.toString(),
          };
        });

        setMarkets(formattedMarkets);
      } catch (err) {
        console.error('Error fetching markets from Devnet:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
  }, [program]);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        fontFamily: "'Space Mono', monospace", 
        fontSize: '0.85rem',
        textAlign: 'left'
      }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', color: '#A3A3A3' }}>
            <th style={{ padding: '1rem' }}>MKT ID</th>
            <th style={{ padding: '1rem' }}>ASSET</th>
            <th style={{ padding: '1rem' }}>STRIKE</th>
            <th style={{ padding: '1rem' }}>EXPIRY</th>
            <th style={{ padding: '1rem' }}>TYPE</th>
            <th style={{ padding: '1rem', textAlign: 'right' }}>PREMIUM</th>
            <th style={{ padding: '1rem', textAlign: 'right' }}>LIQ.</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>Loading markets...</td></tr>
          ) : markets.filter(m => !filterAssetSymbol || m.symbol.startsWith(filterAssetSymbol)).length === 0 ? (
            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No active markets found.</td></tr>
          ) : (
            markets
              .filter(m => !filterAssetSymbol || m.symbol.startsWith(filterAssetSymbol))
              .map((mkt) => {
              const isCall = true; // Placeholder for type since it's missing in simple schema
              return (
                <tr 
                  key={mkt.id} 
                  onClick={() => onSelectMarket && onSelectMarket(mkt)}
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: '#E5E5E5',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    backgroundColor: selectedMarketId === mkt.id ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMarketId !== mkt.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMarketId !== mkt.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <td style={{ padding: '1rem', color: '#5EEAD4' }}>{mkt.id.slice(0,4)}...{mkt.id.slice(-4)}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{mkt.symbol}</td>
                  <td style={{ padding: '1rem' }}>${mkt.strike.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{mkt.expiry}</td>
                  <td style={{ padding: '1rem', color: isCall ? '#5EEAD4' : '#F87171' }}>{isCall ? 'CALL' : 'PUT'}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>${mkt.premiumAsk.toFixed(2)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{mkt.totalLiquidity}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
