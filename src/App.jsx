// src/App.jsx
import React, { useEffect, useState } from "react";
import Shop from "./Shop";
import Quests from "./Quests";
import FortuneWheel from "./FortuneWheel";
import Clicker from "./Clicker";

const DINO_DEFS = [
  { id: "velociraptor", name: "Velociraptor", cost: 50, meatPerSec: 1, rarity: "common" },
  { id: "pteranodon", name: "Pteranodon", cost: 150, meatPerSec: 3, rarity: "common" },
  { id: "triceratops", name: "Triceratops", cost: 300, meatPerSec: 8, rarity: "uncommon" },
  { id: "ankylosaurus", name: "Ankylosaurus", cost: 800, meatPerSec: 20, rarity: "uncommon" },
  { id: "allosaurus", name: "Allosaurus", cost: 1200, meatPerSec: 45, rarity: "uncommon" },
  { id: "mega_velociraptor", name: "Mega Velociraptor", cost: 250, meatPerSec: 4, rarity: "rare" },
  { id: "ultra_velociraptor", name: "Ultra Velociraptor", cost: 1250, meatPerSec: 16, rarity: "epic" },
  { id: "giga_velociraptor", name: "Giga Velociraptor", cost: 6250, meatPerSec: 64, rarity: "epic" },
  { id: "mythic_velociraptor", name: "Mythic Velociraptor", cost: 31250, meatPerSec: 256, rarity: "mythic" },
  { id: "mega_triceratops", name: "Mega Triceratops", cost: 1500, meatPerSec: 32, rarity: "rare" },
  { id: "ultra_triceratops", name: "Ultra Triceratops", cost: 7500, meatPerSec: 128, rarity: "epic" },
  { id: "giga_triceratops", name: "Giga Triceratops", cost: 37500, meatPerSec: 512, rarity: "mythic" },
  { id: "mythic_triceratops", name: "Mythic Triceratops", cost: 187500, meatPerSec: 2048, rarity: "mythic" },
  { id: "mega_trex", name: "Mega T-Rex", cost: 10000, meatPerSec: 240, rarity: "epic" },
  { id: "ultra_trex", name: "Ultra T-Rex", cost: 50000, meatPerSec: 960, rarity: "mythic" },
  { id: "giga_trex", name: "Giga T-Rex", cost: 250000, meatPerSec: 3840, rarity: "mythic" },
  { id: "mythic_trex", name: "Mythic T-Rex", cost: 1250000, meatPerSec: 15360, rarity: "mythic" },
  { id: "diplodocus", name: "Diplodocus", cost: 5000, meatPerSec: 120, rarity: "rare" },
  { id: "baryonyx", name: "Baryonyx", cost: 9000, meatPerSec: 350, rarity: "legendary" },
  { id: "mega_spino", name: "Mega Spinozaur", cost: 60000, meatPerSec: 2000, rarity: "mythic" },
  { id: "ultra_spino", name: "Ultra Spinozaur", cost: 300000, meatPerSec: 8000, rarity: "mythic" },
  { id: "giga_spino", name: "Giga Spinozaur", cost: 1500000, meatPerSec: 32000, rarity: "mythic" },
  { id: "mythic_spino", name: "Mythic Spinozaur", cost: 7500000, meatPerSec: 128000, rarity: "mythic" }
];

const FERN_DINOS = [
  { id: "unique_shadow_raptor", name: "Cieniowy Raptor", baseFernsCost: 3, meatPerSec: 12, rarity: "unique" },
  { id: "unique_crystal_triceratops", name: "Kryształowy Triceratops", baseFernsCost: 5, meatPerSec: 60, rarity: "unique" },
  { id: "unique_obsidian_trex", name: "Obsydianowy T-Rex", baseFernsCost: 8, meatPerSec: 300, rarity: "unique" }
];

const QUEST_TEMPLATES = [
  {
    id: "q_clicks",
    title: "Kliknij {target} razy",
    type: "clicks",
    baseTarget: 200,
    baseReward: { meat: 500 },
    targetGrowth: 1.5,
    rewardGrowth: 1.4
  },
  {
    id: "q_meat",
    title: "Zdobądź {target} mięsa",
    type: "meat",
    baseTarget: 50000,
    baseReward: { meat: 2500 },
    targetGrowth: 1.6,
    rewardGrowth: 1.5
  },
  {
    id: "q_buy",
    title: "Kup {target} dinozaurów",
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
    titleTemplate: "Zaobserwuj nas na TikTok",
    title: "Zaobserwuj nas na TikTok",
    type: "social",
    level: 1,
    target: 1,
    progress: 0,
    reward: { ferns: 1 },
    link: "https://www.tiktok.com/@example"
  },
  {
    id: "social_youtube",
    titleTemplate: "Zasubskrybuj nasz kanał YouTube",
    title: "Zasubskrybuj nasz kanał YouTube",
    type: "social",
    level: 1,
    target: 1,
    progress: 0,
    reward: { meat: 1000 },
    link: "https://www.youtube.com/channel/UCexample"
  },
  {
    id: "social_x",
    titleTemplate: "Zaobserwuj nas na X (Twitter)",
    title: "Zaobserwuj nas na X",
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

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }, [state]);

  // production tick - naliczanie mięsa co sekundę
  useEffect(() => {
    const id = setInterval(() => {
      let gain = 0;
      const allDefs = [...DINO_DEFS, ...FERN_DINOS];
      for (const d of allDefs) {
        const cnt = (state.owned && state.owned[d.id]) || 0;
        if (cnt > 0) gain += cnt * (d.meatPerSec || 0);
      }
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
  };

  const buyClickUpgrade = () => {
    const base = 100;
    const price = Math.floor(base * Math.pow(1.8, clickUpgrades));
    if (meat < price) return;
    setState(s => ({ ...s, meat: s.meat - price, clickUpgrades: s.clickUpgrades + 1, clickPower: Math.floor(s.clickPower * 1.6) + 1 }));
  };

  const getPrice = (baseCost, ownedCount) => {
    // reuse price calc from previous Shop logic (simple growth)
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

  // buyDino: przyznaje +1 freeSpin co każde 10 zakupów (10, 20, 30, ...)
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

      // jeśli osiągnięto wielokrotność 10 zakupów -> przyznaj jeden darmowy spin
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
  };

  const claimQuest = (questId) => {
    const qBefore = state.quests.find(x => x.id === questId);
    setState(s => {
      const q = s.quests.find(x => x.id === questId);
      if (!q) return s;

      // Invite milestone quests (invite-1, invite-5, invite-10) - jeśli używasz, zachowaj logikę powyżej
      if (questId.startsWith("invite-")) {
        const success = (s.referralStats && s.referralStats.successfulInvites) || 0;
        if (success < q.target) return s; // not ready
        let next = { ...s };
        if (q.reward.meat) next.meat = next.meat + q.reward.meat;
        if (q.reward.ferns) next.ferns = next.ferns + q.reward.ferns;
        if (q.reward.fortunePoints) next.fortunePoints = (next.fortunePoints || 0) + q.reward.fortunePoints;
        next.quests = s.quests.map(qq => qq.id === questId ? { ...qq, progress: qq.target } : qq);
        return next;
      }

      // Social follow quests
      if (q.type === "social") {
        if (q.progress >= q.target) return s;
        let next = { ...s };
        if (q.reward.meat) next.meat = next.meat + q.reward.meat;
        if (q.reward.ferns) next.ferns = next.ferns + q.reward.ferns;
        if (q.reward.fortunePoints) next.fortunePoints = (next.fortunePoints||0) + q.reward.fortunePoints;
        next.quests = s.quests.map(qq => qq.id === questId ? { ...qq, progress: qq.target } : qq);
        return next;
      }

      // Default behaviour for regular quests: award and evolve to next level
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

    // jeśli chcesz: tu możesz dodać efekt po-zaktualizacyjny (np. powiadomienie) używając qBefore
    // ale nie robimy side-effectów dalej, żeby zachować czysty setState.
  };

  const consumeFreeSpin = () => setState(s => ({ ...s, freeSpins: Math.max(0, (s.freeSpins||0) - 1) }));
  const consumePoint = () => setState(s => ({ ...s, fortunePoints: Math.max(0, (s.fortunePoints||0) - 1) }));

  const handleWheelAward = (reward) => {
    setState(s => {
      let next = { ...s };
      if (reward.type === "meat") next.meat = (next.meat || 0) + (reward.amount || 0);
      if (reward.type === "ferns") next.ferns = (next.ferns || 0) + (reward.amount || 0);
      if (reward.type === "freeSpin") next.freeSpins = (next.freeSpins || 0) + (reward.amount || 0);
      if (reward.type === "fortunePoint") next.fortunePoints = Math.max(0, (next.fortunePoints||0) + (reward.amount || 0));
      return next;
    });
  };

  const productionPerSec = Object.entries(owned || {}).reduce((acc, [id, cnt]) => {
    const def = DINO_DEFS.find(d => d.id === id) || FERN_DINOS.find(d => d.id === id);
    return acc + (def ? def.meatPerSec * cnt : 0);
  }, 0);

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

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 800 }}>🍖 {fmt(meat)}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>🌿 {ferns} • 🎯 {fortunePoints}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>Free: {freeSpins}</div>
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
              meat={meat}
              fmt={fmt}
              primaryDinoId={null}
            />
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <div style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                Produkcja: <strong>{fmt(productionPerSec)}/s</strong>
              </div>
            </div>
          </div>
        )}

        {view === "shop" && (
          <section>
            <h3 style={{ marginBottom: 8 }}>Sklep</h3>
            <Shop dinos={DINO_DEFS} fernDinos={FERN_DINOS} owned={owned} meat={meat} ferns={ferns} buyDino={buyDino} buyUniqueDino={buyUniqueDino} />
            <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>Produkcja: <strong>{fmt(productionPerSec)}/s</strong></div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>Ulepszenia kliku: <strong>{clickUpgrades}</strong></div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>Zakupy: <strong>{totalPurchases}</strong></div>
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
            <FortuneWheel
              fortunePoints={fortunePoints}
              freeSpins={freeSpins}
              productionPerSec={productionPerSec}
              onConsume={(type) => {
                if (type === 'freeSpin') consumeFreeSpin();
                else if (type === 'point') consumePoint();
              }}
              onAward={(reward) => handleWheelAward(reward)}
              rotateBadges={true}
            />
          </section>
        )}
      </main>
    </div>
  );
}
