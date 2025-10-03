// src/components/DinoFeeder.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";

/**
 * DinoFeeder - wersja importująca obrazki z src/dinos (webpack import)
 *
 * Wymaga plików w: src/dinos/
 * - dino.png
 * - spin_1.png
 * - spin_2.png
 * - ferns_3.png
 * - ferns_1.png
 * - meat_30.png
 * - meat_60.png
 *
 * Props:
 * - onAward(reward)       : callback({type, amount})
 * - onConsume()           : callback()  <-- parent powinien zdecydować co zużyć (freeSpin czy point)
 * - freeSpins (number)
 * - fortunePoints (number)
 * - productionPerSec (number)
 * - sequenceLength (number) optional
 * - persistKey (string) optional
 */

import dinoImg from "../dinos/dino.png";
import spin1Img from "../dinos/spin_1.png";
import spin2Img from "../dinos/spin_2.png";
import ferns3Img from "../dinos/ferns_3.png";
import ferns1Img from "../dinos/ferns_1.png";
import meat30Img from "../dinos/meat_30.png";
import meat60Img from "../dinos/meat_60.png";

export default function DinoFeeder({
  onAward = () => {},
  onConsume = () => {},
  freeSpins = 0,
  fortunePoints = 0,
  productionPerSec = 0,
  sequenceLength = 50,
  persistKey = "dino:spinIndex"
}) {
  const [spitting, setSpitting] = useState(false);
  const [displayed, setDisplayed] = useState(null);
  const spinIndexRef = useRef(0);

  // init from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(persistKey);
      const n = raw ? parseInt(raw, 10) : 0;
      spinIndexRef.current = Number.isFinite(n) ? Math.max(0, n) : 0;
    } catch (e) {
      spinIndexRef.current = 0;
    }
  }, [persistKey]);

  // persist index whenever changes (safe enough on render)
  useEffect(() => {
    try {
      localStorage.setItem(persistKey, String(spinIndexRef.current));
    } catch (e) {}
  });

  // meat amounts computed from productionPerSec
  const meat30 = Math.max(0, Math.floor(productionPerSec * 60 * 30));
  const meat60 = Math.max(0, Math.floor(productionPerSec * 60 * 60));

  // segments: index order preserved (0..5)
  const segments = useMemo(() => ([
    { id: "spin_1", key: "spin_1", img: spin1Img, reward: { type: "spin", amount: 1 } }, // index 0
    { id: "spin_2", key: "spin_2", img: spin2Img, reward: { type: "spin", amount: 2 } },
    { id: "ferns_3", key: "ferns_3", img: ferns3Img, reward: { type: "ferns", amount: 3 } },
    { id: "ferns_1", key: "ferns_1", img: ferns1Img, reward: { type: "ferns", amount: 1 } },
    { id: "meat_30", key: "meat_30", img: meat30Img, reward: { type: "meat", amount: meat30 } },
    { id: "meat_60", key: "meat_60", img: meat60Img, reward: { type: "meat", amount: meat60 } }
  ]), [meat30, meat60]);

  // deterministic sequence that EXCLUDES spin_1 (index 0) from random picks
  const sequence = useMemo(() => {
    const total = sequenceLength;
    // default distribution for total===50 (only indices 1..5)
    let base = [];
    if (total === 50) {
      base.push(...Array(12).fill(1)); // spin_2
      base.push(...Array(10).fill(2)); // ferns_3
      base.push(...Array(12).fill(3)); // ferns_1
      base.push(...Array(12).fill(4)); // meat_30
      base.push(...Array(4).fill(5));  // meat_60
    } else {
      // even distribution across indices 1..5
      const choices = [1,2,3,4,5];
      for (let i = 0; i < total; i++) base.push(choices[i % choices.length]);
    }

    // if base length mismatched, fallback to simple repeating
    if (base.length !== total) {
      const arr = [];
      const choices = [1,2,3,4,5];
      for (let i = 0; i < total; i++) arr.push(choices[i % choices.length]);
      return arr;
    }

    // deterministic shuffle (permute) with step coprime to total
    const perm = new Array(total);
    const step = (function findStep() {
      const candidates = [13,11,7,3,5];
      for (const s of candidates) if (gcd(s, total) === 1) return s;
      return 1;
    })();
    for (let i = 0; i < total; i++) {
      const idx = (i * step) % total;
      perm[i] = base[idx];
    }
    return perm;
  }, [sequenceLength]);

  function gcd(a,b){ return b === 0 ? a : gcd(b, a % b); }

  function getRewardFromIndex(idx) {
    const chosenIdx = sequence[idx % sequence.length];
    return segments[chosenIdx];
  }

  const dinoImageSrc = dinoImg;

  const displayedFreeSpins = typeof freeSpins === "number" ? freeSpins : 0;
  const displayedPoints = typeof fortunePoints === "number" ? fortunePoints : 0;
  const displayedSpins = displayedFreeSpins + displayedPoints;
  const canFeed = displayedSpins > 0;

  function feed() {
    if (spitting) return;
    if (!canFeed) {
      alert("Brak spinów ani punktów do nakarmienia dinozaura.");
      return;
    }

    // ask parent to consume one spin (parent decides whether to use freeSpin or fortunePoints)
    try { onConsume(); } catch (e) {}

    const idx = spinIndexRef.current;
    const picked = getRewardFromIndex(idx);
    spinIndexRef.current = idx + 1;
    try { localStorage.setItem(persistKey, String(spinIndexRef.current)); } catch (e) {}

    setSpitting(true);
    setDisplayed(null);

    setTimeout(() => {
      setSpitting(false);
      setDisplayed(picked);
      try { onAward(picked.reward); } catch (e) {}
    }, 900);
  }

  function formatAmount(rew) {
    if (!rew) return "";
    const a = rew.amount;
    if (typeof a !== "number") return "";
    return a > 1 ? `x${a}` : `${a}`;
  }

  // styles
  const containerStyle = { display: "flex", alignItems: "center", gap: 20 };
  const dinoStyle = {
    width: 140, height: 140, objectFit: "contain",
    transition: "transform 200ms", transform: spitting ? "translateY(-6px) rotate(-6deg)" : "none",
    boxShadow: "0 6px 18px rgba(0,0,0,0.35)", borderRadius: 12, background: "#071427"
  };
  const boxStyle = {
    width: 180, height: 160, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.12)",
    display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    padding: 8
  };
  const rewardImgStyle = { width: 96, height: 96, objectFit: "contain", marginBottom: 6 };
  const feedBtn = {
    marginTop: 8, padding: "8px 12px", borderRadius: 10, border: "none",
    background: canFeed ? "#06b6d4" : "#334155", color: canFeed ? "#04232b" : "#94a3b8", fontWeight: 800, cursor: canFeed ? "pointer" : "not-allowed"
  };
  const amountStyle = { marginTop: 6, fontSize: 18, fontWeight: 900, color: "#e6eef6" };

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <img src={dinoImageSrc} alt="dino" style={dinoStyle} />
        <button onClick={feed} disabled={!canFeed || spitting} style={feedBtn}>
          {spitting ? "eating..." : `Feed the dinosaur (spin: ${displayedSpins})`}
        </button>
      </div>

      <div style={boxStyle}>
        {displayed ? (
          <>
            {displayed.img ? (
              <img src={displayed.img} alt="" style={rewardImgStyle} />
            ) : (
              <div style={{ fontSize: 36 }}>🎁</div>
            )}

            <div style={amountStyle}>
              {formatAmount(displayed.reward)}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
            Tu pojawi się nagroda
          </div>
        )}
      </div>
    </div>
  );
}
