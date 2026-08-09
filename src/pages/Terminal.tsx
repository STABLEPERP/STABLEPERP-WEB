import { useState } from 'react';
import { MarketList } from '../components/Sections/MarketList';
import { WriteOption } from '../components/Sections/WriteOption';
import { BuyOption } from '../components/Sections/BuyOption';
import { TradingViewChart } from '../components/TradingViewChart';
import { UserPositions } from '../components/Sections/UserPositions';
import { AssetList, type Asset } from '../components/Sections/AssetList';
import { KYCDisclaimer } from '../components/common/KYCDisclaimer';
import './Terminal.css';

export function Terminal() {
  const [orderTab, setOrderTab] = useState<'buy' | 'write'>('buy');
  const [bottomTab, setBottomTab] = useState<'chain' | 'positions'>('chain');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<any | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, Asset>>({});

  const headerAsset = selectedAsset ? (livePrices[selectedAsset.id] || selectedAsset) : null;

  return (
    <div className="terminal-layout">
      {/* LEFT SIDEBAR: MARKETS */}
      <div className="terminal-panel terminal-left">
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#A3A3A3', letterSpacing: '0.1em' }}>MARKETS</div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <AssetList onSelectAsset={setSelectedAsset} selectedAssetId={selectedAsset?.id} onPricesUpdate={setLivePrices} />
        </div>
      </div>

      {/* CENTER TOP: CHART & HEADER */}
      <div className="terminal-panel terminal-center-top">
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF' }}>{headerAsset ? headerAsset.symbol : 'Select Asset'}</span>
            <span style={{ fontSize: '0.875rem', color: '#A3A3A3', marginLeft: '0.5rem' }}>{headerAsset ? 'Perpetual Options' : ''}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FFF' }}>{headerAsset && headerAsset.price > 0 ? `$${headerAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}</div>
            <div style={{ fontSize: '0.875rem', color: headerAsset && headerAsset.change24h >= 0 ? '#5EEAD4' : '#F87171' }}>
              {headerAsset && headerAsset.price > 0 ? `${headerAsset.change24h >= 0 ? '+' : ''}${headerAsset.change24h.toFixed(2)}%` : '-'}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '1rem', minHeight: 0 }}>
          <TradingViewChart symbol={selectedAsset?.symbol ?? 'BTC'} />
        </div>
      </div>

      {/* CENTER BOTTOM: OPTION CHAIN / POSITIONS */}
      <div className="terminal-panel terminal-center-bottom" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '0.5rem' }}>
          <button 
            onClick={() => setBottomTab('chain')}
            style={{ padding: '0.75rem 1rem', backgroundColor: 'transparent', color: bottomTab === 'chain' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: bottomTab === 'chain' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em' }}
          >
            OPTION CHAIN
          </button>
          <button 
            onClick={() => setBottomTab('positions')}
            style={{ padding: '0.75rem 1rem', backgroundColor: 'transparent', color: bottomTab === 'positions' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: bottomTab === 'positions' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em' }}
          >
            OPEN POSITIONS
          </button>
        </div>
        {bottomTab === 'chain' ? (
          <MarketList onSelectMarket={setSelectedMarket} selectedMarketId={selectedMarket?.id} filterAssetSymbol={selectedAsset?.symbol} />
        ) : (
          <UserPositions />
        )}
      </div>

      {/* RIGHT SIDEBAR: ORDER ENTRY */}
      <div className="terminal-panel terminal-right">
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
          {orderTab === 'buy' ? <BuyOption market={selectedMarket} /> : <WriteOption market={selectedMarket} />}
          <KYCDisclaimer />
        </div>
      </div>
    </div>
  );
}
