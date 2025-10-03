import React, { useState, useEffect, useMemo, useRef } from "react";

/**
 * DinoFeeder.jsx
 *
 * Zmiana: z sekwencji usunięto możliwość wylosowania 'spin_1' (1 spin).
 * - Przy karmieniu dino nie wypuści już nagrody spin_1.
 * - Przycisk "" dalej daje free spin i pokazuje feedback ze zdjęciem spin_1.
 *
 * Props:
 * - assetBase (string)
 * - dinoSrc (string)
 * - onAward (fn)
 * - onConsume (fn)
 * - freeSpins (number)
 * - fortunePoints (number)
 * - productionPerSec (number)
 * - sequenceLength (number)
 * - persistKey (string)
 */
export default function DinoFeeder({
  assetBase = "/assets",
  dinoSrc = null,
  onAward = () => {},
  onConsume = () => {},
  freeSpins = 0,
  fortunePoints = 0,
  productionPerSec = 0,
  sequenceLength = 50,
  persistKey = "dino:spinIndex"
}) {
  const [spitting, setSpitting] = useState(false);
  const [displayed, setDisplayed] = useState(null); // displayed reward object (segments[x])
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

  // persist index on change
  useEffect(() => {
    try {
      localStorage.setItem(persistKey, String(spinIndexRef.current));
    } catch (e) {}
  });

  // meat calculations
  const meat30 = Math.max(0, Math.floor(productionPerSec * 60 * 30));
  const meat60 = Math.max(0, Math.floor(productionPerSec * 60 * 60));

  // segments MUST match filenames: spin_1.png, spin_2.png, ferns_3.png, ferns_1.png, meat_30.png, meat_60.png
  // NOTE: segments array is unchanged so filenames/keys stay the same.
  const segments = useMemo(() => ([
    { id: 'spin_1', key: 'spin_1', reward: { type: 'freeSpin', amount: 1 } },  // index 0
    { id: 'spin_2', key: 'spin_2', reward: { type: 'freeSpin', amount: 2 } },  // index 1
    { id: 'ferns_3', key: 'ferns_3', reward: { type: 'ferns', amount: 3 } },  // index 2
    { id: 'ferns_1', key: 'ferns_1', reward: { type: 'ferns', amount: 1 } },  // index 3
    { id: 'meat_30', key: 'meat_30', reward: { type: 'meat', amount: meat30 } }, // index 4
    { id: 'meat_60', key: 'meat_60', reward: { type: 'meat', amount: meat60 } }  // index 5
  ]), [meat30, meat60]);

  // deterministic sequence builder (EXCLUDING index 0 -> spin_1)
  // sequence entries will be in {1,2,3,4,5} only
  const sequence = useMemo(() => {
    const total = sequenceLength;
    // new distribution (no spin_1):
    // spin_2(index1): 12, ferns_3(index2): 10, ferns_1(index3): 12, meat_30(index4): 12, meat_60(index5): 4  => sum 50
    // adjust if sequenceLength differs
    const base = [];
    if (total === 50) {
      base.push(...Array(12).fill(1)); // spin_2
      base.push(...Array(10).fill(2)); // ferns_3
      base.push(...Array(12).fill(3)); // ferns_1
      base.push(...Array(12).fill(4)); // meat_30
      base.push(...Array(4).fill(5));  // meat_60
    } else {
      // when sequenceLength != 50, distribute evenly across indices 1..5
      const choices = [1,2,3,4,5];
      for (let i = 0; i < total; i++) {
        base.push(choices[i % choices.length]);
      }
    }

    // safety
    if (base.length !== total) {
      const arr = [];
      const choices = [1,2,3,4,5];
      for (let i = 0; i < total; i++) arr.push(choices[i % choices.length]);
      return arr;
    }

    // deterministic permutation using step coprime with total (take 13 or fallback)
    const step = (function() {
      // find small number coprime with total
      for (let s of [13,11,7,3]) {
        if (gcd(s, total) === 1) return s;
      }
      return 1;
    })();

    const perm = new Array(total);
    for (let i = 0; i < total; i++) {
      const idx = (i * step) % total;
      perm[i] = base[idx];
    }
    return perm;
  }, [sequenceLength]);

  // gcd helper
  function gcd(a,b){ return b===0? a : gcd(b, a % b); }

  function getRewardFromIndex(idx) {
    const chosenIdx = sequence[idx % sequence.length];
    return segments[chosenIdx];
  }

  // UI helpers
  const dinoImageSrc = dinoSrc || `${assetBase}/dino.png`;
  const rewardImageSrc = displayed ? `${assetBase}/${displayed.key}.png` : null;

  const displayedFreeSpins = typeof freeSpins === 'number' ? freeSpins : 0;
  const displayedPoints = typeof fortunePoints === 'number' ? fortunePoints : 0;
  const displayedSpins = displayedFreeSpins + displayedPoints;
  const canFeed = displayedSpins > 0;

  // feed: consume a spin (free first) then perform spit
  function feed() {
    if (spitting) return;
    if (!canFeed) {
      alert("Brak spinów ani punktów do nakarmienia dinozaura.");
      return;
    }

    // ask parent to consume (parent should be the single source of truth)
    const consumeType = displayedFreeSpins > 0 ? 'freeSpin' : 'point';
    try { onConsume(consumeType); } catch (e) {}

    // proceed with animation and awarding (we assume parent will update state)
    const idx = spinIndexRef.current;
    const picked = getRewardFromIndex(idx);
    spinIndexRef.current = idx + 1;
    try { localStorage.setItem(persistKey, String(spinIndexRef.current)); } catch (e) {}

    setSpitting(true);
    setDisplayed(null);

    // simulate chew/spit timing then show award
    setTimeout(() => {
      setSpitting(false);
      setDisplayed(picked);
      try { onAward(picked.reward); } catch (e) {}
    }, 900);
  }

  // Add Spin: notify parent and show immediate feedback (spin_1 graphic + amount)

  // helper to format amount under image
  function formatAmount(rew) {
    if (!rew) return '';
    const a = rew.amount;
    if (typeof a !== 'number') return '';
    return a > 1 ? `x${a}` : `${a}`;
  }

  // styles (inline for easy drop-in)
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
      {/* dino left */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <img src={dinoImageSrc} alt="dino" style={dinoStyle} />
        <button onClick={feed} disabled={!canFeed || spitting} style={feedBtn}>
          {spitting ? "Żuje..." : `Nakarm dinozaura (spin: ${displayedSpins})`}
        </button>
      </div>

      {/* reward box */}
      <div style={boxStyle}>
        {displayed ? (
          <>
            {rewardImageSrc ? (
              <img src={rewardImageSrc} alt={displayed.key} style={rewardImgStyle} />
            ) : (
              <div style={{ fontSize: 36 }}>🎁</div>
            )}

            {/* duża, czytelna ilość pod zdjęciem */}
            <div style={amountStyle}>
              {formatAmount(displayed.reward)}
            </div>
            {/* NOTE: no raw key label shown */}
          </>
        ) : (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
            The reward will appear here
          </div>
        )}
      </div>
    </div>
  );
}
