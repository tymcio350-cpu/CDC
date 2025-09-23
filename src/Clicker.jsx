import React from "react";

// Jeśli wolisz bundling (import obrazka) odkomentuj linię poniżej i użyj meatImg jako src
// import meatImg from "./assets/clicker_meat.png";

export default function Clicker({
  onTap = () => {},
  clickPower = 1,
  buyClickUpgrade = () => {},
  clickUpgrades = 0,
  meat = 0,
  fmt = (n) => n,
  primaryDinoId = null,
  meatSrc = "/dinos/clicker_meat.png" // domyślna ścieżka do obrazka (public/dinos/...)
}) {
  // Jeśli używasz importu z assets: uncomment import wyżej i ustaw meatSrc = meatImg

  // zapobiegaj dwukrotnemu uruchomieniu (touch + click)
  let touchHandled = false;
  const handleTouchStart = (e) => {
    e.preventDefault();
    touchHandled = true;
    onTap && onTap();
    // krótki reset, żeby kolejny gest mógł działać
    setTimeout(() => (touchHandled = false), 300);
  };
  const handleClick = (e) => {
    if (touchHandled) return;
    onTap && onTap();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          height: "60vh",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg,#0b1220,#041026)",
          fontSize: 36,
          fontWeight: 900,
          color: "#fff",
          padding: 12,
        }}
      >
        <div style={{ textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>TAP +{clickPower}</div>

          <img
            src={meatSrc}
            alt="Kliknij tu"
            role="button"
            aria-label="Kliknij tu"
            onTouchStart={handleTouchStart}
            onClick={handleClick}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onTap && onTap(); }}
            style={{
              width: "40vw",
              maxWidth: 220,
              height: "auto",
              padding: 10,
              borderRadius: 9999,
              display: "block",
              margin: "0 auto",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              cursor: "pointer",
            }}
          />

          <div style={{ marginTop: 10, fontSize: 12, color: "#cbd5e1" }}>
            🍖 {fmt(meat)} &nbsp; • &nbsp; Ulepszeń kliku: <strong>{clickUpgrades}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={buyClickUpgrade}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#06b6d4",
            color: "#04232b",
            border: "none",
            fontWeight: 800,
          }}
        >
          Kup ulepszenie
        </button>

        <div style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
          Produkcja: — {/* możesz tam wstawić productionPerSec jeśli chcesz */}
        </div>
      </div>
    </div>
  );
}
