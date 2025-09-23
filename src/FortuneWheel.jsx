// src/FortuneWheel.jsx
import React, { useState, useRef, useMemo, useEffect } from "react";

export default function FortuneWheel({
  fortunePoints = 0,
  freeSpins = 0,
  productionPerSec = 0,
  onConsume = () => {},
  onAward = () => {},
  spinTrigger = 0,
  consumeOnExternalSpin = false,
  // parametry wizualne:
  wheelSize = 300,
  // podaj badgeDistance (px) lub badgeDistancePercent (0..1). Domyślnie bliżej środka: 0.40 (40% promienia).
  badgeDistance = null,
  badgeDistancePercent = 0.40
}) {
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef(null);
  const [lastReward, setLastReward] = useState(null);
  const prevSpinTrigger = useRef(spinTrigger);

  function fmt(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
    return Math.floor(n).toString();
  }

  const meat30 = Math.max(0, Math.floor(productionPerSec * 60 * 30)); // 30 minutes
  const meat60 = Math.max(0, Math.floor(productionPerSec * 60 * 60)); // 60 minutes

  const segments = useMemo(() => ([
    { id: "meat_60", icon: "🍖", value: meat60, reward: { type: "meat", amount: meat60 } },
    { id: "ferns_1", icon: "🌿", value: 1, reward: { type: "ferns", amount: 1 } },
    { id: "point_1", icon: "🎯", value: 1, reward: { type: "fortunePoint", amount: 1 } },
    { id: "meat_30", icon: "🍖", value: meat30, reward: { type: "meat", amount: meat30 } },
    { id: "free_spin", icon: "🎟️", value: 1, reward: { type: "freeSpin", amount: 1 } },
    { id: "small_pack", icon: "🎁", value: 250, reward: { type: "meat", amount: 250 } }
  ]), [meat30, meat60]);

  const segCount = segments.length;
  const canSpin = freeSpins > 0 || fortunePoints > 0;

  function spin(consume = true) {
    if (spinning) return;
    if (consume && !canSpin) {
      alert("Brak punktów ani darmowych spinów.");
      return;
    }
    if (consume) {
      const consumeType = freeSpins > 0 ? "freeSpin" : "point";
      try { onConsume(consumeType); } catch (e) {}
    }

    setSpinning(true);
    const chosen = Math.floor(Math.random() * segCount);
    const baseRot = 360 * (6 + Math.floor(Math.random() * 6));
    const segmentAngle = 360 / segCount;
    const targetAngle = baseRot + (chosen * segmentAngle) + (segmentAngle / 2);
    const final = targetAngle;

    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 4s cubic-bezier(.2,.9,.2,1)";
      wheelRef.current.style.transform = `rotate(${final}deg)`;
    }

    setTimeout(() => {
      setSpinning(false);
      const reward = segments[chosen].reward;
      const s = segments[chosen];
      setLastReward(`${s.icon} ${s.value && typeof s.value === 'number' ? (s.value >= 1000 ? fmt(s.value) : s.value) : ''}`);
      try { onAward(reward); } catch (e) {}
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = "none";
        }
      }, 300);
    }, 4200);
  }

  useEffect(() => {
    if (prevSpinTrigger.current !== spinTrigger) {
      prevSpinTrigger.current = spinTrigger;
      spin(consumeOnExternalSpin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinTrigger]);

  // obliczenia dystansu badge'ów: px jeśli podano, w przeciwnym razie procent promienia
  const radius = wheelSize / 2;
  const badgeRad = (badgeDistance !== null && typeof badgeDistance === "number")
    ? badgeDistance
    : Math.max(12, Math.round(radius * (typeof badgeDistancePercent === "number" ? badgeDistancePercent : 0.40)));

  return (
    <div style={{ padding: 12, borderRadius: 12, background: "linear-gradient(180deg,#0f172a,#071033)", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 800 }}>Fortune Wheel</div>
        <div style={{ fontSize: 12, color: "#9CA3AF" }}>Points: <strong>{fortunePoints}</strong> • Free: <strong>{freeSpins}</strong></div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ width: wheelSize, height: wheelSize, position: "relative" }}>
          <div
            ref={wheelRef}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              position: "absolute",
              left: 0,
              top: 0,
              boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
              background: "conic-gradient(from 90deg, #f97316 0deg 60deg, #06b6d4 60deg 120deg, #7c3aed 120deg 180deg, #f59e0b 180deg 240deg, #10b981 240deg 300deg, #ef4444 300deg 360deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "visible"
            }}
          >
            <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#061427", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
              🎡
            </div>

            <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, pointerEvents: "none" }}>
              {segments.map((s, i) => {
                const segmentAngle = 360 / segCount;
                const angle = (i + 0.5) * segmentAngle - 90;
                const formatted = (s.value && typeof s.value === 'number') ? (s.value >= 1000 ? fmt(s.value) : s.value) : '';
                return (
                  <div
                    key={s.id}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      transform: `rotate(${angle}deg) translate(${badgeRad}px)`,
                      transformOrigin: "0 0",
                      width: 80,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none"
                    }}
                  >
                    <div style={{
                      minWidth: 64,
                      height: 34,
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.38)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      color: "white",
                      fontWeight: 800,
                      transform: `rotate(0deg)`
                    }}>
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      <span style={{ fontSize: 12 }}>{formatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            position: "absolute",
            left: "50%",
            top: -8,
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "18px solid #f8fafc",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
            zIndex: 20
          }} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => spin(true)} disabled={!canSpin || spinning} style={{ padding: "10px 14px", borderRadius: 10, background: canSpin ? "#06b6d4" : "#94A3B8", border: "none", color: "#04232b", fontWeight: 800 }}>
            Spin
          </button>
          <button onClick={() => { setLastReward(null); if (wheelRef.current) { wheelRef.current.style.transform = "rotate(0deg)"; wheelRef.current.style.transition = "none"; } }} style={{ padding: "10px 14px", borderRadius: 10, background: "#7c3aed", border: "none", color: "white", fontWeight: 800 }}>
            Reset
          </button>
        </div>

        {lastReward && <div style={{ marginTop: 8, fontSize: 13 }}>Last: <strong>{lastReward}</strong></div>}
        <div style={{ marginTop: 8, fontSize: 12, color: "#9CA3AF" }}>Spin consumes free spins first, then fortune points.</div>
      </div>
    </div>
  );
}
