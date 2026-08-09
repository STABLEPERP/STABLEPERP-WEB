import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { HermesClient } from '@pythnetwork/hermes-client';

export interface Asset {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface AssetListProps {
  onSelectAsset?: (asset: Asset) => void;
  selectedAssetId?: string;
  onPricesUpdate?: (prices: Record<string, Asset>) => void;
}

const TRACKED_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT',
  'JUPUSDT', 'JTOUSDT', 'PYTHUSDT',
  'WIFUSDT', 'BONKUSDT', 'RAYUSDT',
  'RENDERUSDT',
];

const PYTH_SYMBOLS = [
  { symbol: 'TSLA', feedId: '09db3fec44a861ec3b246a47a1188047913e2bb97f50a3cc4600109153099ea6' },
  { symbol: 'AAPL', feedId: '49f6b65cb1db6fcbc7046ae9b5fce2cf20ee2be6ad71a3915bcbf09a9f4c39f0' },
  { symbol: 'NVDA', feedId: '9c3dcbd82531ed7dfcb2e76f6de48a865b1cb3f9ebba0f5ddc31f4ff68be7902' },
  { symbol: 'MSFT', feedId: 'd0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1' },
  { symbol: 'AMZN', feedId: 'b5d0e0fa58a1f8b81498ae670ce93c872d14434b72c364885d4fa1b257cbb07a' },
  { symbol: 'GOOGL', feedId: '07d24bb76843496a45bce0add8b51555f2ea02098cb04f4c6d61f7b5720836b4' },
  { symbol: 'META', feedId: '399f1e8f1c4a517859963b56f104727a7a3c7f0f8fee56d34fa1f72e5a4b78ef' },
  { symbol: 'NFLX', feedId: 'f3ae7810a11854aed92499250f89edd22409075dce2c17305fc33653522424c6' },
  { symbol: 'AMD',  feedId: '3622e381dbca2efd1859253763b1adc63f7f9abb8e76da1aa8e638a57ccde93e' },
  { symbol: 'COIN', feedId: '5c3bd92f2eed33779040caea9f82fac705f5121d26251f8f5e17ec35b9559cd4' },
  { symbol: 'SPY',  feedId: '5374a7d76a45ae2443cef351d10482b7bcc6ef5a928e75030d63b5fb3abe7cb5' },
  { symbol: 'QQQ',  feedId: '0eda5e8f3e5881e7e64971b02359250f9d70977e63940c4c9c0d77f54195f13e' },
  { symbol: 'GME',  feedId: '6f9cd89ef1b7fd39f667101a91ad578b6c6ace4579d5f7f285a4b06aa4504be6' },
];

const buildInitialMap = (): Record<string, Asset> => {
  const map: Record<string, Asset> = {};
  TRACKED_SYMBOLS.forEach((sym) => {
    const base = sym.replace('USDT', '');
    map[base] = { id: base, symbol: base, price: 0, change24h: 0, volume24h: 0 };
  });
  PYTH_SYMBOLS.forEach((sym) => {
    map[sym.symbol] = { id: sym.symbol, symbol: sym.symbol, price: 0, change24h: 0, volume24h: 0 };
  });
  return map;
};

export const AssetList: FC<AssetListProps> = ({ onSelectAsset, selectedAssetId, onPricesUpdate }) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'stocks'>('stocks');
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>(buildInitialMap);
  const hasAutoSelected = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const hermesRef = useRef(new HermesClient("https://hermes.pyth.network"));

  useEffect(() => {
    // Subscribe to Binance individual symbol miniTicker streams
    const streams = TRACKED_SYMBOLS.map((s) => `${s.toLowerCase()}@miniTicker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const d = msg.data;
        if (!d) return;

        const base = (d.s as string).replace('USDT', '');
        const close = parseFloat(d.c);
        const open = parseFloat(d.o);
        const change24h = open > 0 ? ((close - open) / open) * 100 : 0;
        
        setAssetMap((prev) => ({
          ...prev,
          [base]: {
            id: base,
            symbol: base,
            price: close,
            change24h,
            volume24h: parseFloat(d.q),
          },
        }));
      };

      ws.onerror = () => ws.close();
      ws.onclose = () => {
        // Reconnect after 3s if not intentionally closed
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  }, []);

  // Poll Pyth for US Stocks
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchPyth() {
      try {
        const feedIds = PYTH_SYMBOLS.map(p => p.feedId);
        const parsedData = await hermesRef.current.getLatestPriceUpdates(feedIds);
        
        if (parsedData && parsedData.parsed) {
          setAssetMap(prev => {
            const next = { ...prev };
            parsedData.parsed.forEach((feed: any) => {
              const symInfo = PYTH_SYMBOLS.find(p => p.feedId === feed.id);
              if (symInfo) {
                const price = feed.price.price * (10 ** feed.price.expo);
                next[symInfo.symbol] = {
                  ...next[symInfo.symbol],
                  price,
                  change24h: 0, // Not available easily without historical
                };
              }
            });
            return next;
          });
        }
      } catch (e) {
        console.error('Pyth fetch error in AssetList', e);
      }
    }

    fetchPyth();
    interval = setInterval(fetchPyth, 5000);

    return () => clearInterval(interval);
  }, []);

  // Notify parent of price updates safely outside the reducer
  useEffect(() => {
    if (onPricesUpdate) {
      onPricesUpdate(assetMap);
    }
  }, [assetMap, onPricesUpdate]);

  // Auto-select first asset on load
  useEffect(() => {
    if (hasAutoSelected.current || !onSelectAsset || selectedAssetId) return;
    const first = Object.values(assetMap).find((a) => {
      if (a.price <= 0) return false;
      const isStock = PYTH_SYMBOLS.some(p => p.symbol === a.symbol);
      return activeTab === 'stocks' ? isStock : !isStock;
    });
    if (first) {
      hasAutoSelected.current = true;
      onSelectAsset(first);
    }
  }, [assetMap, onSelectAsset, selectedAssetId, activeTab]);

  const handleTabChange = (tab: 'crypto' | 'stocks') => {
    setActiveTab(tab);
    if (onSelectAsset) {
      const firstInTab = Object.values(assetMap).find(a => {
        const isStock = PYTH_SYMBOLS.some(p => p.symbol === a.symbol);
        return tab === 'stocks' ? isStock : !isStock;
      });
      if (firstInTab) {
        onSelectAsset(firstInTab);
      }
    }
  };

  const assets = Object.values(assetMap).filter(asset => {
    const isStock = PYTH_SYMBOLS.some(p => p.symbol === asset.symbol);
    return activeTab === 'stocks' ? isStock : !isStock;
  });

  const formatVolume = (v: number) => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '0.5rem' }}>
        <button 
          onClick={() => handleTabChange('crypto')}
          style={{ flex: 1, padding: '0.5rem', backgroundColor: 'transparent', color: activeTab === 'crypto' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: activeTab === 'crypto' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
          CRYPTO
        </button>
        <button 
          onClick={() => handleTabChange('stocks')}
          style={{ flex: 1, padding: '0.5rem', backgroundColor: 'transparent', color: activeTab === 'stocks' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: activeTab === 'stocks' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
          US STOCKS
        </button>
      </div>
      {assets.map((asset) => {
        const isSelected = selectedAssetId === asset.id;
        const isPositive = asset.change24h >= 0;
        return (
          <div
            key={asset.id}
            onClick={() => onSelectAsset && onSelectAsset(asset)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: isSelected ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
              border: isSelected ? '1px solid rgba(94, 234, 212, 0.2)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', color: '#FFF', fontSize: '0.875rem' }}>
                {asset.symbol}{PYTH_SYMBOLS.some(p => p.symbol === asset.symbol) ? '' : '/USDT'}
              </div>
              <div style={{ color: '#A3A3A3', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                {asset.volume24h > 0 ? formatVolume(asset.volume24h) : '—'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#FFF', fontSize: '0.875rem' }}>
                {asset.price > 0
                  ? `$${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.price < 0.01 ? 6 : 2 })}`
                  : '—'}
              </div>
              <div style={{ color: isPositive ? '#5EEAD4' : '#F87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                {asset.change24h !== 0 ? `${isPositive ? '+' : ''}${asset.change24h.toFixed(2)}%` : '—'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

