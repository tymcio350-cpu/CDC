
import React, { useState, useEffect } from 'react';
import './Quests.css'; // obok tego pliku dodaj Quests.css (jeśli już masz, zostaw)

// Props:
// quests = []                 // array of quest objects (id, title, type, target, progress, reward, link?)
// claimQuest(questId)         // function to claim/mark quest completed
// userReferralCode            // string referral code to build reflink
// referralStats               // { successfulInvites, pendingInvites }
// onCopyReferral(link)        // optional callback when referral link is copied
export default function Quests({
  quests = [],
  claimQuest,
  userReferralCode = '',
  referralStats = { successfulInvites: 0, pendingInvites: 0 },
  onCopyReferral
}) {
  const [copied, setCopied] = useState(false);
  const referralLink = userReferralCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${userReferralCode}` : '';
  const successful = referralStats.successfulInvites || 0;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copyReferral = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      if (onCopyReferral) onCopyReferral(referralLink);
    } catch (e) {
      // fallback
      try {
        const el = document.createElement('textarea');
        el.value = referralLink;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        if (onCopyReferral) onCopyReferral(referralLink);
      } catch (err) {
        console.warn('Copy failed', err);
      }
    }
  };

  // Social links: example links provided as requested
  const SOCIAL_LINKS = [
    { id: 'social_tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@example' },
    { id: 'social_youtube', label: 'YouTube', url: 'https://www.youtube.com/channel/UCexample' },
    { id: 'social_x', label: 'X (Twitter)', url: 'https://x.com/example' }
  ];

  const socialQuests = quests.filter(q => q.type === 'social');

  return (
    <div className="q-root">
      <div className="q-bg" aria-hidden />

      <div className="q-container">
        <div className="q-card q-header">
          <div className="q-logo">Q</div>
          <div>
            <h1 className="q-title">Quests &amp; Invites</h1>
            <p className="q-sub">Complete quests, invite friends or follow us on socials to earn rewards.</p>
          </div>
        </div>

        <div className="q-main">
          <section className="q-section">
            <h2 className="q-section-title">Active Quests</h2>

            <div className="q-list">
              {quests && quests.length > 0 ? quests
                // show non-social quests in the main list (socials will be in a separate section)
                .filter(q => q.type !== 'social' && !q.id.startsWith('invite-'))
                .map(q => {
                  const pct = Math.min(100, Math.round((q.progress / q.target) * 100 || 0));
                  return (
                    <article className="q-item" key={q.id}>
                      <div className="q-item-top">
                        <div className="q-item-left">
                          <div className="q-item-title">{q.titleTemplate ? q.titleTemplate.replace('{target}', q.target) : q.title}</div>
                          <div className="q-item-meta">Level {q.level || 1} • {Math.floor(q.progress)}/{q.target}</div>
                        </div>
                        <div className="q-item-reward">
                          <div className="q-reward-label">Reward</div>
                          <div className="q-reward-value">
                            {q.reward?.meat ? `🍖 ${q.reward.meat}` : ''}{q.reward?.fortunePoints ? ` 🎯 ${q.reward.fortunePoints}` : ''}{q.reward?.ferns ? ` 🌿 ${q.reward.ferns}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="q-progress-wrap">
                        <div className="q-progress-bar">
                          <div className="q-progress-fill" style={{ width: pct + '%' }} />
                        </div>

                        <div className="q-progress-actions">
                          <div className="q-pct">{pct}%</div>
                          <button
                            className={`q-btn ${q.progress >= q.target ? 'q-btn-primary' : 'q-btn-disabled'}`}
                            onClick={() => claimQuest && claimQuest(q.id)}
                            disabled={q.progress < q.target}
                          >
                            {q.progress >= q.target ? 'Claim & Evolve' : 'In Progress'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }) : (
                  <div className="q-empty">No quests yet — invite friends to unlock new quests!</div>
                )}
            </div>
          </section>

          <section className="q-section">
            <h2 className="q-section-title">Invite Friends</h2>

            <div className="q-card q-ref">
              <div className="q-ref-top">
                <div className="q-ref-left">
                  <div className="q-small-label">Your referral link</div>
                  <div className="q-ref-inputs">
                    <input className="q-input" value={referralLink} readOnly aria-label="Referral link" />
                    <button className="q-btn q-btn-primary" onClick={copyReferral}>{copied ? 'Copied!' : 'Copy'}</button>
                  </div>

                  <div className="q-share-grid">
                    <a className="q-share" href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join me!')}`} target="_blank" rel="noreferrer">Telegram</a>
                    <a className="q-share" href={`https://wa.me/?text=${encodeURIComponent('Join me: ' + referralLink)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                  </div>
                </div>

                <div className="q-ref-count">
                  <div className="q-small-label">Successful</div>
                  <div className="q-count">{successful}</div>
                  <div className="q-small-muted">invites</div>
                </div>
              </div>

              <div className="q-milestones">
                <div className="q-small-muted">Invite milestones</div>
                <div className="q-m-list">
                  {[
                    { id: 'invite-1', title: 'Invite 1 friend', target: 1, reward: 'Small Pack' },
                    { id: 'invite-5', title: 'Invite 5 friends', target: 5, reward: 'Medium Pack' },
                    { id: 'invite-10', title: 'Invite 10 friends', target: 10, reward: 'Big Pack' }
                  ].map(iq => {
                    const progress = Math.min(successful, iq.target);
                    const pct = Math.round((progress / iq.target) * 100 || 0);
                    const completed = progress >= iq.target;
                    return (
                      <div className="q-m-item" key={iq.id}>
                        <div className="q-m-left">
                          <div className="q-m-title">{iq.title}</div>
                          <div className="q-m-meta">{progress}/{iq.target}</div>
                          <div className="q-m-bar"><div className="q-m-fill" style={{ width: pct + '%' }} /></div>
                        </div>
                        <div className="q-m-right">
                          <div className="q-m-reward">{iq.reward}</div>
                          <button className={`q-btn ${completed ? 'q-btn-primary' : 'q-btn-disabled'}`} onClick={() => claimQuest && claimQuest(iq.id)} disabled={!completed}>
                            {completed ? 'Claim' : 'Locked'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="q-note">Rewards are credited after the referred user completes the required step (e.g. email verification or first purchase).</div>
            </div>
          </section>

          <section className="q-section">
            <h2 className="q-section-title">Follow Us (Social Tasks)</h2>

            <div className="q-card q-social">
              <div className="q-social-list">
                {SOCIAL_LINKS.map(s => {
                  const q = socialQuests.find(x => x.id === s.id) || {};
                  const completed = (q.progress || 0) >= (q.target || 1);
                  return (
                    <div className="q-social-item" key={s.id}>
                      <div className="q-social-left">
                        <div className="q-social-title">{s.label}</div>
                        <a className="q-social-link" href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
                      </div>
                      <div className="q-social-right">
                        <button className={`q-btn ${completed ? 'q-btn-primary' : 'q-btn-outline'}`} onClick={() => {
                          // Open the link in a new tab and let user confirm they followed
                          window.open(s.url, "_blank", "noopener");
                        }}>Open</button>
                        <button className={`q-btn ${completed ? 'q-btn-primary' : 'q-btn-disabled'}`} onClick={() => claimQuest && claimQuest(s.id)} disabled={completed} style={{ marginLeft: 8 }}>
                          {completed ? 'Done' : "I've followed"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="q-small-muted" style={{ marginTop: 8 }}>Example links included — replace with your real social pages in the code when ready.</div>
            </div>
          </section>
        </div>

        <footer className="q-footer">Made for mobile — test on phone or device emulator.</footer>
      </div>
    </div>
  );
}
