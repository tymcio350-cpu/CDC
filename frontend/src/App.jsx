// File: src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import Shop from "./Shop";
import Quests from "./Quests";
import DinoFeeder from "./components/DinoFeeder";
import Clicker from "./Clicker";

// DINO_DEFS restored to original list (including mythic entries)
const DINO_DEFS = [
  { id: "velociraptor", name: "Velociraptor", cost: 50, meatPerSec: 10, rarity: "common" },
  { id: "pteranodon", name: "Pteranodon", cost: 150, meatPerSec: 19, rarity: "common" },
  { id: "mega_velociraptor", name: "Mega Velociraptor", cost: 250, meatPerSec: 26, rarity: "rare" },
  { id: "triceratops", name: "Triceratops", cost: 300, meatPerSec: 29, rarity: "uncommon" },
  { id: "ankylosaurus", name: "Ankylosaurus", cost: 800, meatPerSec: 54, rarity: "uncommon" },
  { id: "allosaurus", name: "Allosaurus", cost: 1200, meatPerSec: 69, rarity: "uncommon" },
  { id: "ultra_velociraptor", name: "Ultra Velociraptor", cost: 1250, meatPerSec: 71, rarity: "epic" },
  { id: "mega_triceratops", name: "Mega Triceratops", cost: 1500, meatPerSec: 79, rarity: "rare" },
  { id: "diplodocus", name: "Diplodocus", cost: 5000, meatPerSec: 167, rarity: "rare" },
  { id: "giga_velociraptor", name: "Giga Velociraptor", cost: 6250, meatPerSec: 191, rarity: "epic" },
  { id: "ultra_triceratops", name: "Ultra Triceratops", cost: 7500, meatPerSec: 214, rarity: "epic" },
  { id: "baryonyx", name: "Baryonyx", cost: 9000, meatPerSec: 240, rarity: "legendary" },
  { id: "mega_trex", name: "Mega T-Rex", cost: 10000, meatPerSec: 351, rarity: "epic" },
  { id: "mythic_velociraptor", name: "Mythic Velociraptor", cost: 31250, meatPerSec: 519, rarity: "mythic" },
  { id: "giga_triceratops", name: "Giga Triceratops", cost: 37500, meatPerSec: 581, rarity: "mythic" },
  { id: "ultra_trex", name: "Ultra T-Rex", cost: 50000, meatPerSec: 695, rarity: "mythic" },
  { id: "mega_spino", name: "Mega Spinozaur", cost: 60000, meatPerSec: 961, rarity: "mythic" },
  { id: "mythic_triceratops", name: "Mythic Triceratops", cost: 187500, meatPerSec: 2001, rarity: "mythic" },
  { id: "giga_trex", name: "Giga T-Rex", cost: 250000, meatPerSec: 2049, rarity: "mythic" },
  { id: "ultra_spino", name: "Ultra Spinozaur", cost: 300000, meatPerSec: 3841, rarity: "mythic" },
  { id: "mythic_trex", name: "Mythic T-Rex", cost: 1250000, meatPerSec: 8001, rarity: "mythic" },
  { id: "giga_spino", name: "Giga Spinozaur", cost: 1500000, meatPerSec: 15361, rarity: "mythic" },
  { id: "mythic_spino", name: "Mythic Spinozaur", cost: 7500000, meatPerSec: 32001, rarity: "mythic" }
];

const FERN_DINOS = [
  { id: "unique_shadow_raptor", name: "Cieniowy Raptor", baseFernsCost: 3, incomeMultiplier: 1.2, rarity: "unique" },
  { id: "unique_crystal_triceratops", name: "Kryształowy Triceratops", baseFernsCost: 5, incomeMultiplier: 1.4, rarity: "unique" },
  { id: "unique_obsidian_trex", name: "Obsydianowy T-Rex", baseFernsCost: 8, incomeMultiplier: 1.6, rarity: "unique" }
];

const QUEST_TEMPLATES = [
  {
    id: "q_clicks",
    title: "Tap {target} times",
    type: "clicks",
    baseTarget: 200,
    baseReward: { meat: 500 },
    targetGrowth: 1.5,
    rewardGrowth: 1.4
  },
  {
    id: "q_meat",
    title: "Get {target} meat",
    type: "meat",
    baseTarget: 50000,
    baseReward: { meat: 2500 },
    targetGrowth: 1.6,
    rewardGrowth: 1.5
  },
  {
    id: "q_buy",
    title: "Buy {target} dinos",
    type: "buy",
    baseTarget: 1,
    baseReward: { ferns: 1 },
    targetGrowth: 2.0,
    rewardGrowth: 1.6
  }
];

function computeQuestFromTemplate(template, level = 1) {
  const lvl = Math.max(1, Math.floor(level));
  const target = Math.ceil(template.baseTarget * Math.pow(template.targetGrowth, lvl - 1));
  const reward = {};
  for (const k of Object.keys(template.baseReward)) {
    const base = template.baseReward[k];
    const scaled = Math.floor(base * Math.pow(template.rewardGrowth, lvl - 1));
    reward[k] = Math.max(1, scaled);
  }
  return {
    id: template.id,
    titleTemplate: template.title,
    title: template.title.replace("{target}", target),
    type: template.type,
    level: lvl,
    target,
    progress: 0,
    reward,
  };
}

const SOCIAL_QUESTS = [
  {
    id: "social_tiktok",
    titleTemplate: "Follow us on TikTok",
    title: "Follow us on TikTok",
    type: "social",
    level: 1,
    target: 1,
    progress: 0,
    reward: { ferns: 1 },
    link: "https://www.tiktok.com/@example"
  },
  {
    id: "social_youtube",
    titleTemplate: "Subscribe our Youtube channel",
    title: "Subscribe our Youtube channel",
    type: "social",
    level: 1,
    target: 1,
    progress: 0,
    reward: { meat: 1000 },
    link: "https://www.youtube.com/channel/UCexample"
  },
  {
    id: "social_x",
    titleTemplate: "Follow us on X (Twitter)",
    title: "Follow us on X",
    type: "social",
    level: 1,
    target: 1,
    progress: 0,
    reward: { fortunePoints: 1 },
    link: "https://x.com/example"
  }
];

const DEFAULT_STATE = {
  meat: 100,
  owned: { velociraptor: 1 },
  clickPower: 1,
  clickUpgrades: 0,
  ferns: 0,
  totalPurchases: 0,
  quests: QUEST_TEMPLATES.map(t => computeQuestFromTemplate(t, 1)).concat(SOCIAL_QUESTS),
  fortunePoints: 1,
  freeSpins: 0,
  referralStats: { successfulInvites: 0, pendingInvites: 0 },
  userReferralCode: "ABC123"
};

const STORAGE_KEY = "dinomeat_all_dinos_v1";

function fmt(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return Math.floor(n).toString();
}

// <-- PODMIEŃ NA SWÓJ WORKER URL jeśli inny -->
const WORKER_URL = "https://mygame-worker.cyberdinoclicker.workers.dev";

// autosave config
const AUTO_SAVE_INTERVAL_MS = 50_000; // 50s
const CHECK_INTERVAL_MS = 10_000;     // check every 10s
const MAX_RETRIES = 3;

export default function App() {
  const [view, setView] = useState("clicker");
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.owned) parsed.owned = { velociraptor: 1 };
        if (!parsed.owned.velociraptor) parsed.owned.velociraptor = 1;
        if (!parsed.quests) parsed.quests = QUEST_TEMPLATES.map(t => computeQuestFromTemplate(t, 1)).concat(SOCIAL_QUESTS);
        if (typeof parsed.fortunePoints === "undefined") parsed.fortunePoints = 1;
        if (typeof parsed.freeSpins === "undefined") parsed.freeSpins = 0;
        if (typeof parsed.referralStats === "undefined") parsed.referralStats = { successfulInvites: 0, pendingInvites: 0 };
        if (typeof parsed.userReferralCode === "undefined") parsed.userReferralCode = "ABC123";
        return parsed;
      }
      return DEFAULT_STATE;
    } catch (e) {
      return DEFAULT_STATE;
    }
  });

  const { meat, owned, clickPower, clickUpgrades, ferns, totalPurchases, quests, fortunePoints, freeSpins, referralStats, userReferralCode } = state;

  // click upgrade price (used both in UI and purchase logic)
  const CLICK_UPGRADE_BASE = 100;
  const clickUpgradePrice = Math.floor(CLICK_UPGRADE_BASE * Math.pow(1.8, clickUpgrades || 0));

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }, [state]);

  // production tick - naliczanie mięsa co sekundę
  useEffect(() => {
    const id = setInterval(() => {
      let gain = 0;
      let baseGain = 0;
      for (const d of DINO_DEFS) {
        const cnt = (state.owned && state.owned[d.id]) || 0;
        if (cnt > 0) baseGain += cnt * (d.meatPerSec || 0);
      }
      let fernMultiplier = 1;
      for (const fd of FERN_DINOS) {
        const cnt = (state.owned && state.owned[fd.id]) || 0;
        if (cnt > 0) {
          const per = fd.incomeMultiplier || 1;
          fernMultiplier *= Math.pow(per, cnt);
        }
      }
      gain = baseGain * fernMultiplier;
      if (gain > 0) {
        setState(s => {
          const newQuests = s.quests.map(q => {
            if (q.type !== "meat") return q;
            if (q.progress >= q.target) return q;
            const progressAdded = gain;
            const newProg = Math.min(q.target, q.progress + progressAdded);
            return { ...q, progress: newProg };
          });
          return { ...s, meat: s.meat + gain, quests: newQuests };
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [state.owned]);

  // ----------------------------
  // Autosave / Load integration
  // ----------------------------
  const lastSavedJSONRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const inFlightRef = useRef(false);
  const autosaveTimerRef = useRef(null);

  // read Telegram initData on mount (if available)
  const [telegramUser, setTelegramUser] = useState(null);
  const [initData, setInitData] = useState(null);
  useEffect(() => {
    try {
      const u = window.Telegram?.WebApp?.initDataUnsafe?.user || null;
      const init = window.Telegram?.WebApp?.initData || null;
      if (u) setTelegramUser(u);
      if (init) setInitData(init);
    } catch (e) { /* ignore */ }
  }, []);

  // Load saved state from backend on start (if telegram data present)
  useEffect(() => {
    (async () => {
      if (!telegramUser && !initData) {
        console.log("No Telegram initData/user — skip remote load");
        return;
      }
      try {
        const res = await fetch(`${WORKER_URL}/load`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: telegramUser, initData })
        });
        if (!res.ok) {
          console.warn("Remote load failed:", res.status);
          return;
        }
        const data = await res.json();
        if (data.state) {
          const parsed = typeof data.state === "string" ? JSON.parse(data.state) : data.state;
          // merge loaded state into current, but keep defaults where missing
          setState(prev => ({ ...prev, ...parsed }));
          lastSavedJSONRef.current = JSON.stringify(parsed);
          lastSaveTimeRef.current = Date.now();
          console.log("Loaded remote state");
        }
      } catch (e) {
        console.warn("Load error:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramUser, initData]);

  // save function with retries and backoff
  async function doSave(stateObj, { force = false } = {}) {
    const stateJSON = JSON.stringify(stateObj ?? {});
    if (!force) {
      if (lastSavedJSONRef.current === stateJSON) return; // no change
      if (Date.now() - lastSaveTimeRef.current < AUTO_SAVE_INTERVAL_MS) return; // too soon
    }
    if (inFlightRef.current) return;
    if (!telegramUser && !initData) {
      console.warn("No Telegram initData/user — skipping remote save");
      return;
    }
    inFlightRef.current = true;
    let attempt = 0;
    let ok = false;
    while (attempt < MAX_RETRIES && !ok) {
      attempt++;
      try {
        const res = await fetch(`${WORKER_URL}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: stateObj, user: telegramUser, initData })
        });
        if (res.ok) {
          lastSavedJSONRef.current = stateJSON;
          lastSaveTimeRef.current = Date.now();
          ok = true;
          console.log("Remote save ok");
        } else {
          const txt = await res.text().catch(()=>"");
          console.warn(`Save attempt ${attempt} failed:`, res.status, txt);
        }
      } catch (e) {
        console.warn(`Save attempt ${attempt} error:`, e?.message || e);
      }
      if (!ok) {
        const backoff = 500 * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, backoff));
      }
    }
    if (!ok) {
      console.error("Save failed after retries; backing up to localStorage");
      try { localStorage.setItem("autosave_backup", stateJSON); } catch {}
    }
    inFlightRef.current = false;
  }

  // public function to save immediately (e.g. important action)
  function saveNow() {
    doSave(state, { force: true });
  }

  // start autosave loop (checks every CHECK_INTERVAL_MS)
  useEffect(() => {
    if (autosaveTimerRef.current) return;
    autosaveTimerRef.current = setInterval(() => {
      doSave(state, { force: false });
    }, CHECK_INTERVAL_MS);

    // initial attempt
    doSave(state, { force: false });

    return () => {
      clearInterval(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, telegramUser, initData]);

  // ----------------------------
  // Game actions (call saveNow on important events)
  // ----------------------------
  const handleTap = () => {
    try { if (navigator.vibrate) navigator.vibrate(15); } catch {}
    setState(s => {
      const newMeat = s.meat + s.clickPower;
      const newQuests = s.quests.map(q => {
        if (q.type === "clicks" && q.progress < q.target) {
          const newProg = Math.min(q.target, q.progress + 1);
          return { ...q, progress: newProg };
        }
        if (q.type === "meat" && q.progress < q.target) {
          const newProg = Math.min(q.target, q.progress + s.clickPower);
          return { ...q, progress: newProg };
        }
        return q;
      });
      return { ...s, meat: newMeat, quests: newQuests };
    });
    // immediate save for important action
    setTimeout(() => saveNow(), 120);
  };

  const buyClickUpgrade = () => {
    const price = clickUpgradePrice;
    if (meat < price) return;
    setState(s => ({ ...s, meat: s.meat - price, clickUpgrades: s.clickUpgrades + 1, clickPower: Math.floor(s.clickPower * 1.6) + 1 }));
    setTimeout(() => saveNow(), 120);
  };

  const getPrice = (baseCost, ownedCount) => {
    const PRICE_GROWTH = 1.4;
    const PURCHASE_PRICE_MULT = 77;
    function adjustBaseCost(base) {
      if (base <= 150) return Math.max(1, Math.round(base * 0.05));
      if (base <= 1000) return Math.max(1, Math.round(base * 0.2));
      if (base <= 50000) return Math.round(base);
      if (base <= 500000) return Math.round(base * 3);
      return Math.round(base * 10);
    }
    const adjusted = adjustBaseCost(baseCost);
    const grown = Math.floor(adjusted * Math.pow(PRICE_GROWTH, ownedCount));
    const finalPrice = Math.max(1, Math.floor(grown * PURCHASE_PRICE_MULT));
    return finalPrice;
  };

  const buyDino = (dino) => {
    const cnt = owned[dino.id] || 0;
    const price = getPrice(dino.cost, cnt);
    if (meat < price) return;
    setState(s => {
      const newTotalPurchases = (s.totalPurchases || 0) + 1;
      const newQuests = s.quests.map(q => {
        if (q.type === "buy" && q.progress < q.target) {
          const newProg = Math.min(q.target, q.progress + 1);
          return { ...q, progress: newProg };
        }
        return q;
      });

      const grantFreeSpin = (newTotalPurchases % 10 === 0);

      return {
        ...s,
        meat: s.meat - price,
        owned: { ...s.owned, [dino.id]: (s.owned[dino.id] || 0) + 1 },
        totalPurchases: newTotalPurchases,
        quests: newQuests,
        freeSpins: (s.freeSpins || 0) + (grantFreeSpin ? 1 : 0)
      };
    });
    setTimeout(() => saveNow(), 120);
  };

  const buyUniqueDino = (dino) => {
    const ownedCount = owned[dino.id] || 0;
    const cost = Math.max(1, Math.ceil((dino.baseFernsCost || 1) * Math.pow(1.6, ownedCount)) * 10);
    if (ferns < cost) return;
    setState(s => ({
      ...s,
      ferns: s.ferns - cost,
      owned: { ...s.owned, [dino.id]: (s.owned[dino.id] || 0) + 1 }
    }));
    setTimeout(() => saveNow(), 120);
  };

  const claimQuest = (questId) => {
    const qBefore = state.quests.find(x => x.id === questId);
    setState(s => {
      const q = s.quests.find(x => x.id === questId);
      if (!q) return s;

      if (questId.startsWith("invite-")) {
        const success = (s.referralStats && s.referralStats.successfulInvites) || 0;
        if (success < q.target) return s;
        let next = { ...s };
        if (q.reward.meat) next.meat = next.meat + q.reward.meat;
        if (q.reward.ferns) next.ferns = next.ferns + q.reward.ferns;
        if (q.reward.fortunePoints) next.fortunePoints = (next.fortunePoints||0) + q.reward.fortunePoints;
        next.quests = s.quests.map(qq => qq.id === questId ? { ...qq, progress: qq.target } : qq);
        return next;
      }

      if (q.type === "social") {
        if (q.progress >= q.target) return s;
        let next = { ...s };
        if (q.reward.meat) next.meat = next.meat + q.reward.meat;
        if (q.reward.ferns) next.ferns = next.ferns + q.reward.ferns;
        if (q.reward.fortunePoints) next.fortunePoints = (next.fortunePoints||0) + q.reward.fortunePoints;
        next.quests = s.quests.map(qq => qq.id === questId ? { ...qq, progress: qq.target } : qq);
        return next;
      }

      const tpl = QUEST_TEMPLATES.find(t => t.id === questId);
      if (!tpl) return s;
      let next = { ...s };
      if (q.reward.meat) next.meat = next.meat + q.reward.meat;
      if (q.reward.fortunePoints) next.fortunePoints = (next.fortunePoints||0) + q.reward.fortunePoints;
      if (q.reward.ferns) next.ferns = next.ferns + q.reward.ferns;
      const newLevel = (q.level || 1) + 1;
      const newQuest = computeQuestFromTemplate(tpl, newLevel);
      newQuest.id = tpl.id;
      next.quests = s.quests.map(qq => qq.id === questId ? newQuest : qq);
      return next;
    });
    setTimeout(() => saveNow(), 120);
  };

  const consumeFreeSpin = () => {
    setState(s => ({ ...s, freeSpins: Math.max(0, (s.freeSpins||0) - 1) }));
    setTimeout(() => saveNow(), 120);
  };
  const consumePoint = () => {
    setState(s => ({ ...s, fortunePoints: Math.max(0, (s.fortunePoints||0) - 1) }));
    setTimeout(() => saveNow(), 120);
  };

  const consumeSpin = () => {
    setState(s => {
      if ((s.freeSpins || 0) > 0) return { ...s, freeSpins: s.freeSpins - 1 };
      if ((s.fortunePoints || 0) > 0) return { ...s, fortunePoints: Math.max(0, s.fortunePoints - 1) };
      return s;
    });
    setTimeout(() => saveNow(), 120);
  };

  const handleWheelAward = (reward) => {
    setState(s => {
      let next = { ...s };
      if (!reward) return next;
      if (reward.type === "meat") next.meat = (next.meat || 0) + (reward.amount || 0);
      if (reward.type === "ferns") next.ferns = (next.ferns || 0) + (reward.amount || 0);
      if (reward.type === "freeSpin" || reward.type === "spin") next.freeSpins = (next.freeSpins || 0) + (reward.amount || 0);
      if (reward.type === "fortunePoint") next.fortunePoints = Math.max(0, (next.fortunePoints||0) + (reward.amount || 0));
      return next;
    });
    setTimeout(() => saveNow(), 120);
  };

  const productionPerSecBase = Object.entries(owned || {}).reduce((acc, [id, cnt]) => {
    const def = DINO_DEFS.find(d => d.id === id);
    return acc + (def ? def.meatPerSec * cnt : 0);
  }, 0);
  const fernMultiplierNow = FERN_DINOS.reduce((m, d) => m * Math.pow(d.incomeMultiplier || 1, owned[d.id] || 0), 1);
  const productionPerSec = productionPerSecBase * fernMultiplierNow;

  // === CHANGED: stałe tło sceny, nie zmienia się przy zakupie nowych dino ===
  const lastOwned = Object.keys(owned || {}).filter(id => (owned[id] || 0) > 0).pop() || "velociraptor";
  const dinoFileForClick = `dinos/${lastOwned}.png`;         // klikalny dino (zmienia się)
  const bgFileForScene = `dinos/bg_jungle.png`;              // STAŁE tło (nie zmienia się)
  // ================================================================

  const styles = {
    pageBg: { minHeight: "100vh", background: "linear-gradient(180deg,#081229,#071033)", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" },
    topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px" },
    navBtn: (active) => ({ padding: "8px 10px", borderRadius: 8, border: "none", background: active ? "#0ea5a4" : "transparent", color: active ? "white" : "#9CA3AF", fontWeight: 700 }),
    container: { maxWidth: 900, margin: "0 auto", padding: 12 }
  };

  return (
    <div style={styles.pageBg}>
      <div style={styles.topbar}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("clicker")} style={styles.navBtn(view === "clicker")}>Clicker</button>
          <button onClick={() => setView("shop")} style={styles.navBtn(view === "shop")}>Shop</button>
          <button onClick={() => setView("quests")} style={styles.navBtn(view === "quests")}>Quests</button>
          <button onClick={() => setView("fortune")} style={styles.navBtn(view === "fortune")}>Fortune</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontWeight: 800 }}>🍖 {fmt(meat)}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>🌿 {ferns}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>Spins: {fmt((freeSpins||0) + (fortunePoints||0))}</div>
        </div>
      </div>

      <main style={styles.container}>
        {view === "clicker" && (
          <div style={{ padding: 12 }}>
            <Clicker
              onTap={handleTap}
              clickPower={clickPower}
              buyClickUpgrade={buyClickUpgrade}
              clickUpgrades={clickUpgrades}
              clickUpgradePrice={clickUpgradePrice}
              dinoFile={dinoFileForClick}           // <-- klikalny dino (zmienia się)
              backgroundFile={bgFileForScene}       // <-- STAŁE tło (nie zmienia się)
              productionPerSec={productionPerSec}
              fmt={fmt}
            />
          </div>
        )}

        {view === "shop" && (
          <section>
            <h3 style={{ marginBottom: 8 }}>Shop</h3>
            <Shop dinos={DINO_DEFS} fernDinos={FERN_DINOS} owned={owned} meat={meat} ferns={ferns} buyDino={buyDino} buyUniqueDino={buyUniqueDino} />
            <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>production: <strong>{fmt(productionPerSec)}/s</strong></div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>upgrades click: <strong>{clickUpgrades}</strong></div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>number of dinosaurs purchased: <strong>{totalPurchases}</strong></div>
            </div>
          </section>
        )}

        {view === "quests" && (
          <section style={{ marginTop: 8 }}>
            <Quests
              quests={quests}
              claimQuest={claimQuest}
              userReferralCode={userReferralCode}
              referralStats={referralStats}
              onCopyReferral={(link) => {
                console.log("Referral copied:", link);
              }}
            />
          </section>
        )}

        {view === "fortune" && (
          <section style={{ marginTop: 8 }}>
            <DinoFeeder
              fortunePoints={fortunePoints}
              freeSpins={freeSpins}
              productionPerSec={productionPerSec}
              onConsume={consumeSpin}   // <- teraz zjada najpierw freeSpins, potem fortunePoints
              onAward={(reward) => handleWheelAward(reward)}
              assetBase="/dinos"   // <- używa public/dinos
            />
          </section>
        )}
      </main>
    </div>
  );
}
