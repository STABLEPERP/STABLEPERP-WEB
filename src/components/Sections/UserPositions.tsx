import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useStableperpProgram } from '../../hooks/useStableperpProgram';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Resolve underlying mint prefix to Binance symbol for live price
const MINT_PREFIX_TO_SYMBOL: Record<string, string> = {
  J9B: 'BTC',
  '7vx': 'ETH',
  Sol: 'SOL',
};

function resolveSymbol(underlyingMint: string): string {
  for (const prefix of Object.keys(MINT_PREFIX_TO_SYMBOL)) {
    if (underlyingMint.startsWith(prefix)) return MINT_PREFIX_TO_SYMBOL[prefix];
  }
  return 'SOL'; // Default fallback
}

interface Position {
  id: string;
  type: 'LONG' | 'SHORT';
  market: string;
  symbol: string; // Underlying e.g. "BTC"
  strike: number;
  size: number;
  premium: number;
  pnl: number | null;
}

export const UserPositions: FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useStableperpProgram();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  // Subscribe to live prices for position symbols
  useEffect(() => {
    const symbols = ['btcusdt', 'ethusdt', 'solusdt', 'jupusdt'];
    const streams = symbols.map((s) => `${s}@miniTicker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const d = msg.data;
        if (!d) return;
        const sym = (d.s as string).replace('USDT', '');
        setPrices((prev) => ({ ...prev, [sym]: parseFloat(d.c) }));
      };

      ws.onerror = () => ws.close();
      ws.onclose = () => setTimeout(connect, 3000);
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    async function fetchPositions() {
      if (!publicKey || !program) return;

      try {
        setLoading(true);

        // 1. Fetch Written (SHORT) Positions
        const writerPositions = await (program as any).account.writerPosition.all([
          {
            memcmp: {
              offset: 40,
              bytes: publicKey.toBase58(),
            },
          },
        ]);

        const markets = await (program as any).account.market.all();
        const marketMap = new Map();
        markets.forEach((m: any) => marketMap.set(m.publicKey.toString(), m.account));

        const formattedWritten: Position[] = writerPositions.map((wp: any) => {
          const mktId = wp.account.market.toString();
          const marketData = marketMap.get(mktId);
          let market = 'Unknown';
          let symbol = 'SOL';
          let strike = 0;

          if (marketData) {
            const underlyingMint = marketData.underlyingMint.toString();
            strike = marketData.strike.toNumber();
            symbol = resolveSymbol(underlyingMint);
            market = `${symbol}/USDC`;
          }

          return {
            id: wp.publicKey.toString(),
            type: 'SHORT',
            market,
            symbol,
            strike,
            size: wp.account.mintedAmount.toNumber() / (10 ** 9),
            premium: wp.account.premiumAsk.toNumber() / (10 ** 6),
            pnl: null, // Calculated reactively from live prices
          };
        });

        // 2. Fetch Long (Bought) Positions via SPL Token
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        const formattedLong: Position[] = [];

        for (const ta of tokenAccounts.value) {
          const accountData = ta.account.data.parsed.info;
          const mint = accountData.mint;
          const amount = accountData.tokenAmount.uiAmount;

          if (amount > 0) {
            const matchingMarket = markets.find(
              (m: any) => m.account.optionMint.toString() === mint,
            );

            if (matchingMarket) {
              const underlyingMint = matchingMarket.account.underlyingMint.toString();
              const strike = matchingMarket.account.strike.toNumber();
              const symbol = resolveSymbol(underlyingMint);
              const market = `${symbol}/USDC`;

                const writer = writerPositions.find((wp: any) => wp.account.market.toString() === matchingMarket.publicKey.toString());
                const premium = writer ? writer.account.premiumAsk.toNumber() / (10 ** 6) : 0;
                
                formattedLong.push({
                  id: ta.pubkey.toString(),
                  type: 'LONG',
                  market,
                  symbol,
                  strike,
                  size: amount,
                  premium,
                pnl: null,
              });
            }
          }
        }

        setPositions([...formattedLong, ...formattedWritten]);
      } catch (err) {
        console.error('Error fetching positions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
    const interval = setInterval(fetchPositions, 15000);
    return () => clearInterval(interval);
  }, [publicKey, program, connection]);

  // Calculate PnL reactively from live WebSocket prices
  const positionsWithPnl = positions.map((pos) => {
    const currentPrice = prices[pos.symbol] ?? null;
    if (currentPrice === null) return { ...pos, pnl: null };

    // LONG: value = max(current - strike, 0) - premium
    // SHORT: value = premium - max(current - strike, 0)
    let pnl: number;
    if (pos.type === 'LONG') {
      pnl = (Math.max(currentPrice - pos.strike, 0) - pos.premium) * pos.size;
    } else {
      pnl = (pos.premium - Math.max(currentPrice - pos.strike, 0)) * pos.size;
    }

    return { ...pos, pnl };
  });

  const formatPnl = (pnl: number | null): string => {
    if (pnl === null) return '—';
    return `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!publicKey) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
        Please connect your wallet to view open positions.
      </div>
    );
  }

  if (loading && positions.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
        Loading positions...
      </div>
    );
  }

  if (positionsWithPnl.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
        No open positions. Click a strike in the chain to build a trade.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: "'Space Mono', monospace" }}>
        <thead>
          <tr style={{ color: '#A3A3A3', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Type</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Market</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Strike</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Size</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Mark Price</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal', textAlign: 'right' }}>Est. PnL</th>
          </tr>
        </thead>
        <tbody>
          {positionsWithPnl.map((pos, idx) => {
            const pnlColor = pos.pnl === null ? '#A3A3A3' : pos.pnl >= 0 ? '#5EEAD4' : '#F87171';
            const markPrice = prices[pos.symbol];
            return (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                  color: '#E5E5E5',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '0.75rem 1rem', color: pos.type === 'LONG' ? '#5EEAD4' : '#F87171', fontWeight: 'bold' }}>
                  {pos.type}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>{pos.market}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${pos.strike.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{pos.size}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#A3A3A3' }}>
                  {markPrice ? `$${markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: pnlColor, fontWeight: 'bold' }}>
                  {formatPnl(pos.pnl)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
