import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface Market {
  id: string;
  symbol: string;
  strike: number;
  expiry: string;
  totalLiquidity: number;
  premiumAsk: number;
}

export const MarketList: FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    fetch(`${API_URL}/markets`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMarkets(data.data);
        }
      })
      .catch((err) => console.error('Error fetching markets:', err))
      .finally(() => setLoading(false));
  }, []);

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
          ) : markets.length === 0 ? (
            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No active markets found.</td></tr>
          ) : (
            markets.map((mkt) => {
              const isCall = true; // Placeholder for type since it's missing in simple schema
              return (
                <tr key={mkt.id} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  color: '#E5E5E5',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '1rem', color: '#5EEAD4' }}>{mkt.id.slice(0,8)}...</td>
                  <td style={{ padding: '1rem' }}>{mkt.symbol}</td>
                  <td style={{ padding: '1rem' }}>${mkt.strike}</td>
                  <td style={{ padding: '1rem' }}>{new Date(mkt.expiry).toLocaleDateString()}</td>
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
