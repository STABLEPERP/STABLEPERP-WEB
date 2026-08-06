import { useState } from 'react';
import { MarketList } from '../components/Sections/MarketList';
import { WriteOption } from '../components/Sections/WriteOption';
import { BuyOption } from '../components/Sections/BuyOption';
import { LightweightChart } from '../components/LightweightChart';

export function Terminal() {
  const [orderTab, setOrderTab] = useState<'buy' | 'write'>('buy');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr 350px',
      gridTemplateRows: '1fr 300px',
      height: 'calc(100vh - 70px)',
      marginTop: '70px',
      gap: '1rem',
      padding: '0 1.5rem 1.5rem 1.5rem',
      boxSizing: 'border-box',
      fontFamily: "'Space Mono', monospace"
    }}>
      {/* LEFT SIDEBAR: MARKETS */}
      <div style={{
        gridRow: '1 / 3',
        backgroundColor: 'rgba(20, 20, 20, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#A3A3A3', letterSpacing: '0.1em' }}>MARKETS</div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <MarketList />
        </div>
      </div>

      {/* CENTER TOP: CHART & HEADER */}
      <div style={{
        gridRow: '1',
        backgroundColor: 'rgba(20, 20, 20, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF' }}>AAPLx</span>
            <span style={{ fontSize: '0.875rem', color: '#A3A3A3', marginLeft: '0.5rem' }}>Apple Inc.</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FFF' }}>$185.92</div>
            <div style={{ fontSize: '0.875rem', color: '#5EEAD4' }}>+1.24%</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '1rem', minHeight: 0 }}>
          <LightweightChart />
        </div>
      </div>

      {/* CENTER BOTTOM: OPTION CHAIN / POSITIONS */}
      <div style={{
        gridRow: '2',
        backgroundColor: 'rgba(20, 20, 20, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#A3A3A3', letterSpacing: '0.1em', marginBottom: '1rem' }}>POSITIONS & OPTION CHAIN</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
          No open positions. Click a strike in the chain to build a trade.
        </div>
      </div>

      {/* RIGHT SIDEBAR: ORDER ENTRY */}
      <div style={{
        gridRow: '1 / 3',
        backgroundColor: 'rgba(20, 20, 20, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button 
            onClick={() => setOrderTab('buy')}
            style={{ flex: 1, padding: '1rem', backgroundColor: orderTab === 'buy' ? 'rgba(94, 234, 212, 0.1)' : 'transparent', color: orderTab === 'buy' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: orderTab === 'buy' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}
          >
            Buy Option
          </button>
          <button 
            onClick={() => setOrderTab('write')}
            style={{ flex: 1, padding: '1rem', backgroundColor: orderTab === 'write' ? 'rgba(94, 234, 212, 0.1)' : 'transparent', color: orderTab === 'write' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: orderTab === 'write' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}
          >
            Write Option
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {orderTab === 'buy' ? <BuyOption /> : <WriteOption />}
        </div>
      </div>
    </div>
  );
}
