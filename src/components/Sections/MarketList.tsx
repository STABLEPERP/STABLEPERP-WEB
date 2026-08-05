import type { FC } from 'react';

// Mock data for display purposes
const MOCK_MARKETS = [
  { id: 'MKT-001', asset: 'AAPLx/USDC', strike: '$150.00', expiry: '2026-09-01', type: 'CALL', premium: '$5.00', liquidity: '1,200', change: '+2.4%' },
  { id: 'MKT-002', asset: 'TSLAx/USDC', strike: '$220.00', expiry: '2026-09-15', type: 'CALL', premium: '$12.50', liquidity: '850', change: '-1.2%' },
  { id: 'MKT-003', asset: 'NVDAx/USDC', strike: '$110.00', expiry: '2026-08-30', type: 'PUT', premium: '$3.20', liquidity: '3,400', change: '+0.5%' },
];

export const MarketList: FC = () => {
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
            <th style={{ padding: '1rem', textAlign: 'right' }}>24H</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_MARKETS.map((mkt, idx) => {
            const isPositive = mkt.change.startsWith('+');
            return (
              <tr key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#E5E5E5',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '1rem', color: '#5EEAD4' }}>{mkt.id}</td>
                <td style={{ padding: '1rem' }}>{mkt.asset}</td>
                <td style={{ padding: '1rem' }}>{mkt.strike}</td>
                <td style={{ padding: '1rem' }}>{mkt.expiry}</td>
                <td style={{ padding: '1rem', color: mkt.type === 'CALL' ? '#5EEAD4' : '#F87171' }}>{mkt.type}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{mkt.premium}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{mkt.liquidity}</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: isPositive ? '#5EEAD4' : '#F87171' }}>{mkt.change}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
