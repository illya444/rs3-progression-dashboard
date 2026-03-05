CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE player_snapshots (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id),
  total_level INT,
  total_xp BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skill_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_id INT REFERENCES player_snapshots(id),
  skill TEXT,
  level INT,
  xp BIGINT
);
