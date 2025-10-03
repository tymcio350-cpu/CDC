// backend/src/index.js
// Worker z weryfikacją Telegram.WebApp.initData (HMAC-SHA256)
// Binding D1: env.DB
export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // prosty JSON responder z CORS
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });

    try {
      // helper: verify initData using bot token (env.BOT_TOKEN)
      async function verifyTelegramInitData(initData, botToken) {
        if (!initData || !botToken) return false;
        const params = Object.fromEntries(new URLSearchParams(initData));
        const hash = params.hash;
        if (!hash) return false;

        // build data_check_string
        const keys = Object.keys(params).filter(k => k !== 'hash').sort();
        const data_check_arr = keys.map(k => `${k}=${params[k]}`);
        const data_check_string = data_check_arr.join('\n');

        // secret = sha256(botToken)
        const enc = new TextEncoder();
        const botTokenBytes = enc.encode(botToken);
        const secretKeyBuf = await crypto.subtle.digest('SHA-256', botTokenBytes);

        // import HMAC key from secretKeyBuf
        const key = await crypto.subtle.importKey('raw', secretKeyBuf, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data_check_string));
        const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('');
        return hex === hash;
      }

      // POST /save { initData, user, state }
      if (url.pathname === '/save' && req.method === 'POST') {
        const body = await req.json().catch(()=>({}));
        const { initData, user, state } = body;
        if (!initData) return json({ error: 'no initData' }, 400);
        const ok = await verifyTelegramInitData(initData, env.BOT_TOKEN);
        if (!ok) return json({ error: 'invalid initData' }, 403);

        const u = user || (new URLSearchParams(initData).get('user') ? JSON.parse(new URLSearchParams(initData).get('user')) : null);
        if (!u?.id) return json({ error: 'no user' }, 400);

        const userId = String(u.id);
        const stateStr = typeof state === 'string' ? state : JSON.stringify(state ?? {});
        await env.DB.prepare(
          `INSERT INTO game_states (user_id, state, updated_at)
           VALUES (?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(user_id) DO UPDATE SET state=excluded.state, updated_at=CURRENT_TIMESTAMP`
        ).bind(userId, stateStr).run();

        return json({ ok: true });
      }

      // POST /load { initData, user? } -> { state }
      if (url.pathname === '/load' && req.method === 'POST') {
        const body = await req.json().catch(()=>({}));
        const { initData, user } = body;
        if (!initData) return json({ error: 'no initData' }, 400);
        const ok = await verifyTelegramInitData(initData, env.BOT_TOKEN);
        if (!ok) return json({ error: 'invalid initData' }, 403);

        const u = user || (new URLSearchParams(initData).get('user') ? JSON.parse(new URLSearchParams(initData).get('user')) : null);
        if (!u?.id) return json({ error: 'no user' }, 400);

        const userId = String(u.id);
        const row = await env.DB.prepare('SELECT state FROM game_states WHERE user_id = ?').bind(userId).first();
        return json({ state: row?.state ?? null });
      }

      return new Response('Not found', { status: 404 });
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  }
};
