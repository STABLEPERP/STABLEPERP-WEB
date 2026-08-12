/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

/* =============================================================================
   STABLEPERP — landing page in the Hyperliquid (hyperfoundation.org) design
   language, themed for Stableperp. Signature: interactive isometric
   "The Stableperp Stack". Self-contained single file, no external assets.
============================================================================= */

const MINT = "#97FCE4";
const INK = "#0A2622";
const FOREST = "#0A2320";
const FOREST2 = "#061C19";
const CREAM = "#E9F7F0";
const CREAM2 = "#F2FBF7";
const ON_DARK = "#E8F7F1";
const MUT_DARK = "rgba(232,247,241,0.60)";
const MUT_INK = "rgba(10,38,34,0.62)";

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

const Wordmark = ({ color = INK, size = 22 }: any) => (
  <span style={{ fontFamily: SERIF, fontSize: size, color, letterSpacing: "-0.01em" }}>
    Stable<i>perp</i>
  </span>
);

function Logo({ size = 26, glow = true }: any) {
  return (
    <img 
      src="/logo.png" 
      alt="Stableperp Logo" 
      style={{ 
        height: size, 
        width: 'auto', 
        display: "block", 
        filter: glow ? "drop-shadow(0 0 5px rgba(94,234,212,0.6))" : "none" 
      }} 
    />
  );
}

/* ---------- high-quality animated topographic background (canvas) ---------- */
function AnimatedContours({ color = INK, lines = 9, baseAlpha = 0.11 }: any) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0, W = 0, H = 0;
    const ctx = (canvas as any).getContext("2d");
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = (canvas as any).clientWidth; H = (canvas as any).clientHeight;
      (canvas as any).width = Math.max(1, W * dpr); (canvas as any).height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.46;
      const R = Math.max(W, H);
      const step = R / (lines * 1.5);
      for (let i = 0; i < lines; i++) {
        const rBase = step * 0.4 + i * step;
        const amp = step * 0.32;
        const drift = t * 0.00022 * (1 + i * 0.05) + i * 0.55;
        ctx.beginPath();
        for (let a = 0; a <= 360; a += 3) {
          const th = (a * Math.PI) / 180;
          const r = rBase + amp * Math.sin(3 * th + drift) + amp * 0.35 * Math.cos(2 * th - drift * 0.7);
          const x = cx + r * Math.cos(th);
          const y = cy + r * 0.6 * Math.sin(th);
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = Math.max(0.035, baseAlpha - i * 0.006);
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    if (reduce) draw(0);
    else raf = requestAnimationFrame(draw);

    const vis = () => {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
      else if (!reduce && !raf) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [color, lines, baseAlpha]);

  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ---------- concentric-circle feature icon ---------- */
const Concentric = ({ variant = 0 }: any) => (
  <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
    {variant === 1 ? (
      <>
        <ellipse cx="26" cy="26" rx="24" ry="14" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.5" />
        <ellipse cx="26" cy="26" rx="14" ry="9" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.7" />
        <circle cx="26" cy="26" r="4" fill={INK} opacity="0.8" />
      </>
    ) : variant === 2 ? (
      <>
        <path d="M26 6 C10 6 4 20 4 26 C4 32 10 46 26 46 C42 46 48 32 48 26 C48 20 42 6 26 6Z" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.5" />
        <circle cx="26" cy="26" r="10" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.7" />
        <circle cx="26" cy="26" r="3.5" fill={INK} opacity="0.8" />
      </>
    ) : (
      <>
        <circle cx="26" cy="26" r="22" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.45" />
        <circle cx="26" cy="26" r="14" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.65" />
        <circle cx="26" cy="26" r="6" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.85" />
      </>
    )}
  </svg>
);

/* ================= interactive isometric stack ================= */
const TILE = 54, TILEH = 27;
const iso = (gx: number, gy: number, gz: number) => ({ x: (gx - gy) * TILE, y: (gx + gy) * TILEH - gz });

const STACK = [
  { id: "options", label: "Options", gx: 0, gy: 0, h: 150, flag: true, desc: "The flagship. Buy and write calls and puts on real US stocks, fully collateralized and cash-settled in USDC." },
  { id: "perps", label: "Perps", gx: 1, gy: 0, h: 124, flag: true, desc: "Crypto perpetuals, oracle-priced and USDC-margined. The next market coming online after launch." },
  { id: "oracles", label: "Oracles", gx: 2, gy: 0, h: 96, desc: "Live equity and crypto prices from Pyth, pulled onchain for pricing and settlement." },
  { id: "vault", label: "Vault", gx: 3, gy: 0, h: 110, desc: "Shared USDC liquidity that underwrites open interest. Markets unlock automatically as the vault grows." },
  { id: "collateral", label: "Collateral", gx: 0, gy: 1, h: 80, desc: "Every position is backed. Writer collateral is bounded and locked onchain, never undercollateralized." },
  { id: "settlement", label: "Settlement", gx: 1, gy: 1, h: 100, desc: "European, cash-settled at US-market-close timestamps. No custody, no counterparty risk." },
  { id: "factory", label: "Factory", gx: 2, gy: 1, h: 90, desc: "Market creation with a curated underlying allowlist and clean active / expired / settled lifecycle." },
  { id: "corp", label: "Corp. Actions", gx: 3, gy: 1, h: 68, desc: "Splits and dividends adjust strikes automatically so every contract stays honest." },
  { id: "positions", label: "Positions", gx: 0, gy: 2, h: 84, desc: "Open interest, net delta and P/L, tracked live per wallet." },
  { id: "copilot", label: "Copilot / MCP", gx: 1, gy: 2, h: 116, desc: "An AI layer and MCP server so agents can quote, write and exercise options autonomously." },
  { id: "more", label: "And More", gx: 2, gy: 2, h: 80, desc: "Structured products, more underlyings, and tools we haven't shipped yet." },
];

function Box({ item, selected, hovered, onSel, onHov }: any) {
  const { gx, gy, h, label, flag } = item;
  const top = -h, base = 0;
  const A = iso(gx, gy, top), B = iso(gx + 1, gy, top), C = iso(gx + 1, gy + 1, top), D = iso(gx, gy + 1, top);
  const B2 = iso(gx + 1, gy, base), C2 = iso(gx + 1, gy + 1, base), D2 = iso(gx, gy + 1, base);
  const active = selected || hovered;
  const topC = flag ? MINT : active ? "#3E7D6E" : "#245045";
  const rightC = flag ? "#5FD9BE" : active ? "#2C5F53" : "#1B3E36";
  const leftC = flag ? "#37B79A" : active ? "#204A41" : "#132E28";
  const poly = (pts: any, fill: any) => <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill={fill} stroke={active ? MINT : "rgba(151,252,228,0.22)"} strokeWidth={active ? 1.4 : 0.8} />;
  const rf = [B, C, C2, B2], lf = [D, C, C2, D2];
  const lc = { x: (B.x + C.x + C2.x + B2.x) / 4, y: (B.y + C.y + C2.y + B2.y) / 4 };
  return (
    <g style={{ cursor: "pointer" }} onClick={() => onSel(item.id)}
      onMouseEnter={() => onHov(item.id)} onMouseLeave={() => onHov(null)}
      tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onSel(item.id)}>
      {poly(lf, leftC)}{poly(rf, rightC)}{poly([A, B, C, D], topC)}
      <text x={lc.x} y={lc.y} transform={`rotate(-90 ${lc.x} ${lc.y})`} textAnchor="middle"
        fontFamily={MONO} fontSize="9.5" fill={flag ? INK : ON_DARK} opacity={flag ? 0.9 : 0.85}
        style={{ pointerEvents: "none", letterSpacing: "0.04em" }}>{label}</text>
    </g>
  );
}

function StableperpStack() {
  const [sel, setSel] = useState("options");
  const [hov, setHov] = useState<string | null>(null);
  const cur = STACK.find((s) => s.id === sel);
  // base platform
  const pad = 0.28;
  const bp = [iso(-pad, -pad, 0), iso(3 + 1 + pad, -pad, 0), iso(3 + 1 + pad, 2 + 1 + pad, 0), iso(-pad, 2 + 1 + pad, 0)];
  const bpB = [iso(3 + 1 + pad, -pad, -26), iso(3 + 1 + pad, 2 + 1 + pad, -26), iso(-pad, 2 + 1 + pad, -26)];
  return (
    <div>
      <svg viewBox="0 0 476 410" width="100%" style={{ display: "block", maxWidth: 600, margin: "0 auto" }}>
        <g transform="translate(210, 164)">
          {/* base platform */}
          <polygon points={`${bp[1].x},${bp[1].y} ${bpB[0].x},${bpB[0].y} ${bpB[1].x},${bpB[1].y} ${bp[2].x},${bp[2].y}`} fill="#0C2A25" stroke="rgba(151,252,228,0.15)" />
          <polygon points={`${bp[3].x},${bp[3].y} ${bp[2].x},${bp[2].y} ${bpB[1].x},${bpB[1].y} ${bpB[2].x},${bpB[2].y}`} fill="#081F1B" stroke="rgba(151,252,228,0.15)" />
          <polygon points={bp.map((p) => `${p.x},${p.y}`).join(" ")} fill="#0F332C" stroke="rgba(151,252,228,0.2)" />
          <text x={(bp[2].x + bp[3].x) / 2} y={(bp[2].y + bp[3].y) / 2 + 14} textAnchor="middle" fontFamily={MONO} fontSize="10" fill={MUT_DARK} letterSpacing="0.2em">SOLANA</text>
          {/* blocks back-to-front */}
          {[...STACK].sort((a, b) => a.gx + a.gy - (b.gx + b.gy)).map((it) => (
            <Box key={it.id} item={it} selected={sel === it.id} hovered={hov === it.id} onSel={setSel} onHov={setHov} />
          ))}
        </g>
      </svg>

      {/* caption */}
      <div style={{ maxWidth: 640, margin: "8px auto 0", textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.2em", color: MINT, marginBottom: 8 }}>
          {cur.flag ? "FLAGSHIP" : "LAYER"} · {cur.label.toUpperCase()}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.55, color: ON_DARK, margin: 0 }}>{cur.desc}</p>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT_DARK, marginTop: 14 }}>tap any layer to explore the stack</div>
      </div>
    </div>
  );
}

/* ---------- phone mockup (mini terminal) ---------- */
function Phone() {
  const rows = [["17.13", "225", "17.45"], ["13.86", "230", "21.16"], ["11.06", "235", "25.34"], ["8.70", "240", "29.95"]];
  return (
    <div style={{ width: 300, margin: "0 auto", borderRadius: 40, border: "10px solid #0A2320", background: "#0A0A0A", padding: "14px 12px 18px", boxShadow: "0 30px 60px rgba(10,35,32,0.35)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: MINT, letterSpacing: "0.15em" }}>STABLEPERP</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: MINT, border: `1px solid ${MINT}55`, borderRadius: 4, padding: "2px 5px" }}>MAINNET</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 18, color: "#fff", fontWeight: 700 }}>NVDA</span>
        <span style={{ fontFamily: MONO, fontSize: 15, color: MINT }}>$223.96</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ color: MINT }}>CALLS</span><span style={{ textAlign: "center" }}>STRIKE</span><span style={{ textAlign: "right" }}>PUTS</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontFamily: MONO, fontSize: 12, padding: "8px 0", background: i === 0 ? "rgba(151,252,228,0.07)" : "transparent" }}>
          <span style={{ color: MINT }}>{r[0]}</span>
          <span style={{ textAlign: "center", color: i === 0 ? MINT : "#fff", fontWeight: 700 }}>{r[1]}</span>
          <span style={{ textAlign: "right", color: "rgba(255,255,255,0.8)" }}>{r[2]}</span>
        </div>
      ))}
      <div style={{ marginTop: 12, textAlign: "center", background: MINT, color: INK, borderRadius: 999, padding: "10px 0", fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>
        Buy 1 NVDA 225 Call
      </div>
    </div>
  );
}

const Pill = ({ children, filled, to = "#" }: any) => (
  <Link to={to} style={{
    fontFamily: SANS, fontSize: 16, textDecoration: "none", padding: "15px 34px", borderRadius: 999,
    background: filled ? MINT : "transparent", color: INK,
    border: `1.5px solid ${filled ? MINT : "rgba(10,38,34,0.25)"}`, display: "inline-block", fontWeight: 500,
  }}>{children}</Link>
);

export default function StableperpLanding() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Use setTimeout to ensure the DOM has finished rendering
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div style={{ background: CREAM, color: INK, fontFamily: SANS }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes sp-enter {
          0%   { opacity: 0; transform: scale(0.4); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes sp-elastic {
          0%, 100% { transform: rotate(-15deg) scaleX(1.08) scaleY(0.92); }
          25%      { transform: rotate(0deg)   scaleX(1)    scaleY(1); }
          50%      { transform: rotate(15deg)  scaleX(1.08) scaleY(0.92); }
          75%      { transform: rotate(0deg)   scaleX(1)    scaleY(1); }
        }
        .sp-enter   { display:inline-block; transform-origin:center; animation: sp-enter 1s cubic-bezier(.2,.8,.3,1.2) both; }
        .sp-elastic { display:inline-block; transform-origin:50% 55%; animation: sp-elastic 2.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .sp-enter, .sp-elastic { animation: none; } }
      `}</style>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", background: CREAM, padding: "120px 20px 130px" }}>
        <AnimatedContours />
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
            <span className="sp-enter"><span className="sp-elastic">
              <Logo size={112} glow />
            </span></span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 19, lineHeight: 1.5, color: INK, margin: "0 0 8px" }}>
            No brokers. No settlement delays.<br />No market hours to wait for.
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(58px, 11vw, 128px)", fontWeight: 400, letterSpacing: "-0.02em", margin: "10px 0 0", lineHeight: 1 }}>
            Onchain first.
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 18, color: MUT_INK, maxWidth: 540, margin: "26px auto 0", lineHeight: 1.6 }}>
            Options on real US stocks, priced by Pyth and settled in USDC. Built on Solana.
          </p>
        </div>
      </section>

      {/* OWNERSHIP */}
      <section id="ownership" style={{ background: CREAM2, padding: "110px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 400, lineHeight: 1.28, maxWidth: 900, margin: "0 auto", color: MUT_INK, letterSpacing: "-0.01em" }}>
          Anyone can own and govern <span style={{ color: INK }}>Stableperp</span> through{" "}
          <span style={{ color: INK }}>$SPERP</span>, the protocol&rsquo;s native token.
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 17, color: INK, marginTop: 30 }}>Own a piece of Stableperp today.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
          <Pill filled to="/terminal">Start Trading</Pill>
          <Pill to="/docs">Start Building</Pill>
        </div>
      </section>

      {/* FLAGSHIP */}
      <section id="flagship" style={{ background: CREAM, padding: "110px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: SANS, fontSize: 17, color: MUT_INK, margin: 0 }}>The Flagship Application:</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 6vw, 62px)", fontWeight: 400, letterSpacing: "-0.02em", margin: "14px 0 54px" }}>
            The Premier Onchain <span style={{ fontStyle: "italic" }}>Options</span> Venue
          </h2>
          <Phone />
        </div>

        <div style={{ maxWidth: 780, margin: "70px auto 0" }}>
          {[
            [0, "Low fees", "Zero gas and cheap fills on every trade, priced onchain."],
            [1, "Transparent", "Fully onchain. Pricing, collateral and settlement are all verifiable on Solana."],
            [2, "Real US equities", "Calls and puts on NVDA, TSLA, AAPL and more, priced live by Pyth."],
          ].map(([v, t, d], i) => (
            <div key={t} style={{ display: "flex", gap: 26, alignItems: "flex-start", padding: "30px 0", borderTop: i === 0 ? "none" : "1px solid rgba(10,38,34,0.12)" }}>
              <div style={{ flexShrink: 0 }}><Concentric variant={v} /></div>
              <div>
                <h3 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 400, margin: "2px 0 8px" }}>{t}</h3>
                <p style={{ fontFamily: SANS, fontSize: 16.5, lineHeight: 1.55, color: MUT_INK, margin: 0 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STACK (dark) */}
      <section id="stack" style={{ background: FOREST, color: ON_DARK, padding: "100px 20px 110px" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(34px, 6vw, 62px)", fontWeight: 400, textAlign: "center", letterSpacing: "-0.01em", margin: "0 0 20px" }}>
          The Stable<span style={{ fontStyle: "italic" }}>perp</span> Stack
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 17, color: MUT_DARK, textAlign: "center", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Options and perps are the flagship markets. But they are just the tip of the iceberg.
        </p>

        <StableperpStack />

        {/* stats */}
        <div style={{ maxWidth: 860, margin: "70px auto 0", border: "1px solid rgba(151,252,228,0.18)", borderRadius: 22, padding: "34px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 30 }}>
          {[["Block time", "0.4s"], ["Underlyings", "20+ US stocks"], ["Oracle", "Pyth"], ["Settlement", "USDC"]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUT_DARK, letterSpacing: "0.08em", marginBottom: 10 }}>{l}</div>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: ON_DARK }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: FOREST2, color: MUT_DARK, padding: "44px 22px", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={24} glow />
          <Wordmark color={ON_DARK} size={20} />
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em" }}>$SPERP · CA SOON</span>
        <span style={{ fontFamily: SANS, fontSize: 12, maxWidth: 360, textAlign: "right", lineHeight: 1.5 }}>
          Derivatives involve risk. Access is restricted by jurisdiction. Nothing here is financial advice.
        </span>
      </footer>
    </div>
  );
}
