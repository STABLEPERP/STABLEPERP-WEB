import type { FC } from 'react';

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
  return (
    <div style={{ fontFamily: "'Space Mono', monospace" }}>
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
      <input type="number" placeholder="0.00" style={inputStyle} />

      <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Premium per Option</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>$5.00 USDC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Network Fee</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>$0.01 USDC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#5EEAD4', fontSize: '0.9rem', fontWeight: 'bold' }}>Total Cost</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.9rem', fontWeight: 'bold' }}>$0.00 USDC</span>
        </div>
      </div>

      <button style={{
        width: '100%',
        padding: '1rem',
        backgroundColor: 'rgba(94, 234, 212, 0.1)',
        color: '#5EEAD4',
        border: '1px solid #5EEAD4',
        borderRadius: '8px',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#5EEAD4';
        e.currentTarget.style.color = '#0A0A0A';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(94, 234, 212, 0.1)';
        e.currentTarget.style.color = '#5EEAD4';
      }}
      >
        EXECUTE TRADE
      </button>
    </div>
  );
};
