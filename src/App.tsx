import { SilkBackground } from './components/SilkBackground';
import { Navbar } from './components/Navbar';
import { MarketList } from './components/Sections/MarketList';
import { WriteOption } from './components/Sections/WriteOption';
import { BuyOption } from './components/Sections/BuyOption';
import './index.css';

const glassCardStyle = {
  padding: '2rem',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  color: '#A3A3A3',
  fontFamily: "'Space Mono', monospace",
  backgroundColor: 'rgba(20, 20, 20, 0.4)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
};

const sectionTitleStyle = {
  fontFamily: "'Space Mono', monospace",
  color: '#5EEAD4',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  paddingBottom: '1rem',
  marginBottom: '2rem',
  fontSize: '1.5rem',
  fontWeight: 'normal',
};

function App() {
  return (
    <>
      <Navbar />
      <SilkBackground color="#5EEAD4" speed={1.0} intensity={0.25} scale={2.0} />
      
      <main className="hero-container">
        <div className="hero-label">OPTIONS · PERPS · SETTLED IN USDC</div>
        <h1 className="hero-title">
          Options on <br />
          <span style={{ color: '#5EEAD4', fontStyle: 'italic' }}>tokenized stocks.</span><br />
          On-chain derivatives,<br />
          24/7.
        </h1>
        <p className="hero-subtitle">
          Buy calls and puts, long or short any market, or write them to earn premium. Fully collateralized, oracle-priced, and open 24/7 on Solana.
        </p>
        <button style={{
          backgroundColor: '#5EEAD4',
          color: '#0A0A0A',
          border: 'none',
          padding: '1rem 3rem',
          fontFamily: "'Space Mono', monospace",
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: 'pointer',
          letterSpacing: '0.1em'
        }}>
          START TRADING
        </button>
      </main>

      {/* Sections for M2 */}
      <section style={{ 
        padding: '4rem 2rem', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4rem',
        position: 'relative', // so it sits above the fixed background
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <h2 style={sectionTitleStyle}>MARKETS</h2>
          <div style={glassCardStyle}>
            <MarketList />
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
             <h2 style={sectionTitleStyle}>WRITE OPTION</h2>
             <div style={glassCardStyle}>
                <WriteOption />
             </div>
          </div>
          <div style={{ flex: '1 1 400px' }}>
             <h2 style={sectionTitleStyle}>BUY OPTION</h2>
             <div style={glassCardStyle}>
                <BuyOption />
             </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
