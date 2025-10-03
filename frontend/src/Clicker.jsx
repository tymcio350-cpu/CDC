// File: src/Clicker.jsx
import React, { useState } from "react";

const base = import.meta.env.BASE_URL || "/";

function normalizePublicPath(path) {
  if (!path) return null;
  if (/^(https?:|data:)/.test(path)) return path;
  return `${base}${String(path).replace(/^\/+/, "")}`;
}

/**
 * Clicker component
 *
 * - separate dinoFile (main clickable image) and backgroundFile (scene background)
 * - removes default blue focus/active highlight and mobile tap highlight
 * - provides subtle focus boxShadow for accessibility and small press animation
 */
export default function Clicker({
  onTap = () => {},
  clickPower = 1,
  buyClickUpgrade = () => {},
  clickUpgrades = 0,
  clickUpgradePrice = 0,
  meat,
  dinoFile, // główny obraz do klikania
  backgroundFile,
  primaryDinoId,
  productionPerSec = 0,
  fmt,
  overlayEnabled = true,
  overlayOpacity = 0.45,
}) {
  const [isPressed, setIsPressed] = useState(false);
  // tło -> preferuj backgroundFile, potem primaryDinoId -> 'dinos/bg_*.png'
  const fileBg = normalizePublicPath(backgroundFile);
  const dinoBg = primaryDinoId ? normalizePublicPath(`dinos/bg_${primaryDinoId}.png`) : null;
  const finalBg = fileBg || dinoBg || null;

  // główny obraz do klikania -> preferuj dinoFile, potem meat fallback
  const mainImgSrc = normalizePublicPath(dinoFile || meat || "dinos/clicker_meat.png");

  const bgCss = finalBg
    ? overlayEnabled
      ? `linear-gradient(rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${Math.max(0, overlayOpacity * 0.6)})), url("${String(finalBg).replace(/"/g, '\\"')}") center/cover no-repeat`
      : `url("${String(finalBg).replace(/"/g, '\\"')}") center/cover no-repeat`
    : "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.03))";

  const fmtFn = typeof fmt === "function" ? fmt : (n) => {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
    return Math.floor(n).toString();
  };

  const handleBgKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTap();
    }
  };

  // handlers to show subtle press state (for mouse/touch)
  const pressStart = (e) => {
    setIsPressed(true);
    // prevent text selection / drag start
    e.preventDefault?.();
  };
  const pressEnd = () => setIsPressed(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onTap && onTap()}
        onKeyDown={handleBgKey}
        onMouseDown={pressStart}
        onTouchStart={pressStart}
        onMouseUp={pressEnd}
        onTouchEnd={pressEnd}
        onMouseLeave={pressEnd}
        onBlur={pressEnd}
        aria-label="Tap background or meat"
        style={{
          height: "60vh",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bgCss,
          color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
          overflow: "hidden",
          cursor: "pointer",
          userSelect: "none",
          outline: "none", // usuwa domyślną niebieską obwódkę
          WebkitTapHighlightColor: "transparent", // usuwa mobilny highlight (Android)
          // opcjonalny hack dla iOS:
          // @ts-ignore
          WebkitTouchCallout: "none",
          // ensure keyboard users still see focus: we'll rely on :focus-visible in CSS normally,
          // but inline style can't target pseudo-classes — inner clickable will show focus
        }}
      >
        <div style={{ textAlign: "center", padding: 8, width: "100%" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>Tap!</div>
          <div style={{ marginTop: 8 }}>You gain <strong>{clickPower}</strong> meat per tap</div>

          <div style={{ marginTop: 12 }}>
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onTap && onTap(); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onTap && onTap(); } }}
              onMouseDown={pressStart}
              onTouchStart={pressStart}
              onMouseUp={pressEnd}
              onTouchEnd={pressEnd}
              onMouseLeave={pressEnd}
              onBlur={pressEnd}
              aria-label="Tap main image"
              style={{
                width: "36vw",
                maxWidth: 220,
                height: "36vw",
                maxHeight: 220,
                borderRadius: "50%",
                overflow: "hidden",
                display: "inline-block",
                margin: "0 auto",
                boxShadow: isPressed ? "0 4px 12px rgba(0,0,0,0.6) inset" : "0 6px 20px rgba(0,0,0,0.45)",
                transform: isPressed ? "scale(0.975)" : "scale(1)",
                transition: "transform 120ms ease, box-shadow 120ms ease",
                touchAction: "manipulation",
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "4px solid rgba(255,255,255,0.03)",
                outline: "none", // usuwa fokus bezpośrednio na kółku
                WebkitTapHighlightColor: "transparent"
              }}
            >
              <img
                src={mainImgSrc}
                alt="main"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none", userSelect: "none" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={buyClickUpgrade}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "#10B981",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              outline: "none",
            }}
            aria-label={`Buy click upgrade for ${clickUpgradePrice}`}
            title={`Buy click upgrade — Cost: ${clickUpgradePrice}`}
          >
            <span>Buy click upgrade</span>
            <span style={{ fontSize: 14, opacity: 0.95 }}>Cost: <strong>{fmtFn(clickUpgradePrice)}</strong></span>
          </button>

          <div style={{ padding: 8, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
            Upgrades: <strong>{clickUpgrades}</strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ padding: 8, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
            Production: <strong>{fmtFn(productionPerSec)}/s</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
