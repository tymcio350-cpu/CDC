// Shop.jsx - Mobile-optimized but smaller cards (keeps filename)
import React from "react";

const base = import.meta.env.BASE_URL || "/";

function fmt(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return Math.floor(n).toString();
}

function paletteForDino(dino) {
  const id = dino.id || "";
  const rarity = (dino.rarity || "").toLowerCase();
  if (id.startsWith("mega") || rarity === "mega")
    return { bg: "linear-gradient(180deg,#6D28D9,#5B21B6)", accent: "#7C3AED", stroke: "#4C1D95" };
  if (id.startsWith("ultra") || rarity === "ultra")
    return { bg: "linear-gradient(180deg,#059669,#027a56)", accent: "#10B981", stroke: "#046b50" };
  if (id.startsWith("giga") || rarity === "giga")
    return { bg: "linear-gradient(180deg,#F59E0B,#D97706)", accent: "#F59E0B", stroke: "#B45309" };
  if (rarity === "mythic" || id.startsWith("mythic"))
    return { bg: "linear-gradient(180deg,#DC2626,#B91C1C)", accent: "#DC2626", stroke: "#991b1b" };
  if (rarity === "unique") return { bg: "linear-gradient(180deg,#7C3AED,#4C1D95)", accent: "#7C3AED", stroke: "#4C1D95" };
  return { bg: "linear-gradient(180deg,#1D4ED8,#1E40AF)", accent: "#1D4ED8", stroke: "#1e3a8a" };
}

// getPrice function - small version like original (keeps behavior)
function adjustBaseCost(base) {
  if (base <= 150) return Math.max(1, Math.round(base * 0.05));
  if (base <= 1000) return Math.max(1, Math.round(base * 0.2));
  if (base <= 50000) return Math.round(base);
  if (base <= 500000) return Math.round(base * 3);
  return Math.round(base * 10);
}
const PRICE_GROWTH = 1.4;
const PURCHASE_PRICE_MULT = 77;
function getPrice(baseCost, ownedCount) {
  const adjusted = adjustBaseCost(baseCost);
  const grown = Math.floor(adjusted * Math.pow(PRICE_GROWTH, ownedCount));
  const finalPrice = Math.max(1, Math.floor(grown * PURCHASE_PRICE_MULT));
  return finalPrice;
}

export default function Shop({ dinos = [], fernDinos = [], owned = {}, meat = 0, ferns = 0, buyDino = () => {}, buyUniqueDino = () => {} }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 8
        }}
      >
        {dinos.map(dino => {
          const cnt = owned[dino.id] || 0;
          const price = getPrice(dino.cost, cnt);
          const pal = paletteForDino(dino);
          return (
            <div key={dino.id} style={{ padding: 4, borderRadius: 8, background: "transparent" }}>
              <div style={{ background: pal.bg, borderRadius: 8, padding: 6, boxShadow: "0 8px 20px rgba(2,6,23,0.12)", border: `1px solid ${pal.stroke}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <strong style={{ color: "#fff", fontSize: 12 }}>{dino.name}</strong>
                  <small style={{ color: "#fff", opacity: 0.9, fontSize: 10 }}>{(dino.rarity || "").toUpperCase()}</small>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={`${base}dinos/${dino.id}.png`}
                    alt={dino.name}
                    style={{ width: "100%", maxHeight: 90, objectFit: "contain", display: "block" }}
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `${base}dinos/basic.png`;
                    }}
                  />
                </div>

                <div style={{ fontSize: 11, color: "#fff", marginTop: 6 }}>
                  Prod: <strong>{fmt(dino.meatPerSec)}/s</strong>
                </div>

                <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    onClick={() => buyDino(dino)}
                    disabled={meat < price}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: "none",
                      cursor: meat >= price ? "pointer" : "not-allowed",
                      background: meat >= price ? pal.accent : "#94A3B8",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 800
                    }}
                  >
                    Kup {fmt(price)}
                  </button>
                  <div style={{ color: "#fff", fontSize: 11 }}>
                    x<strong>{cnt}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {fernDinos.length > 0 && (
        <div>
          <h4 style={{ marginTop: 8, marginBottom: 6 }}>Unikalne (ferns)</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            {fernDinos.map(d => {
              const cnt = owned[d.id] || 0;
              const raw = Math.ceil((d.baseFernsCost || 1) * Math.pow(1.6, cnt));
              const cost = Math.max(1, raw * 10);
              const pal = paletteForDino(d);
              return (
                <div key={d.id} style={{ padding: 4, borderRadius: 8 }}>
                  <div style={{ background: pal.bg, borderRadius: 8, padding: 6, boxShadow: "0 8px 20px rgba(2,6,23,0.12)", border: `1px solid ${pal.stroke}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <strong style={{ color: "#fff", fontSize: 12 }}>{d.name}</strong>
                      <small style={{ color: "#fff", opacity: 0.9, fontSize: 10 }}>UNIQUE</small>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.04)", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src={`${base}dinos/${d.id}.png`}
                        alt={d.name}
                        style={{ width: "100%", maxHeight: 90, objectFit: "contain" }}
                        onError={e => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `${base}dinos/basic.png`;
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: "#fff", marginTop: 6 }}>Prod: <strong>{fmt(d.meatPerSec)}/s</strong></div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => buyUniqueDino(d)}
                        disabled={ferns < cost}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 8,
                          border: "none",
                          background: ferns >= cost ? pal.accent : "#94A3B8",
                          color: "white",
                          fontSize: 12,
                          fontWeight: 800
                        }}
                      >
                        Kup {cost}🌿
                      </button>
                      <div style={{ color: "#fff", fontSize: 11 }}>
                        x<strong>{cnt}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
