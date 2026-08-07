import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';

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

const buildInitialMap = (): Record<string, Asset> => {
  const map: Record<string, Asset> = {};
  TRACKED_SYMBOLS.forEach((sym) => {
    const base = sym.replace('USDT', '');
    map[base] = { id: base, symbol: base, price: 0, change24h: 0, volume24h: 0 };
  });
  return map;
};

export const AssetList: FC<AssetListProps> = ({ onSelectAsset, selectedAssetId, onPricesUpdate }) => {
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>(buildInitialMap);
  const hasAutoSelected = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);

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
        
        setAssetMap((prev) => {
          const updated = {
            ...prev,
            [base]: {
              id: base,
              symbol: base,
              price: close,
              change24h,
              volume24h: parseFloat(d.q),
            },
          };
          
          if (onPricesUpdate) {
            onPricesUpdate(updated);
          }
          
          return updated;
        });
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

  // Auto-select first asset once prices are available
  useEffect(() => {
    if (hasAutoSelected.current || !onSelectAsset || selectedAssetId) return;
    const first = Object.values(assetMap).find((a) => a.price > 0);
    if (first) {
      hasAutoSelected.current = true;
      onSelectAsset(first);
    }
  }, [assetMap, onSelectAsset, selectedAssetId]);

  const assets = Object.values(assetMap);

  const formatVolume = (v: number) => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
              <div style={{ fontWeight: 'bold', color: '#FFF', fontSize: '0.875rem' }}>{asset.symbol}/USDT</div>
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

