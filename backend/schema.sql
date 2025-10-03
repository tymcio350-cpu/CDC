-- backend/schema.sql
-- Tworzy tabele potrzebne dla zapisu stanu gry i (opcjonalnie) referrals.

CREATE TABLE IF NOT EXISTS game_states (
  user_id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_states_updated_at ON game_states(updated_at);

CREATE TABLE IF NOT EXISTS referrals (
  user_id TEXT PRIMARY KEY,
  ref TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_ref ON referrals(ref);