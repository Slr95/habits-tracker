CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  goal INTEGER NOT NULL DEFAULT 31,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_logs (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT daily_logs_habit_date_unique UNIQUE (habit_id, log_date)
);

CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  mood SMALLINT,
  motivation SMALLINT,
  CONSTRAINT daily_metrics_mood_range CHECK (mood IS NULL OR (mood >= 1 AND mood <= 5)),
  CONSTRAINT daily_metrics_motivation_range CHECK (motivation IS NULL OR (motivation >= 1 AND motivation <= 5))
);

CREATE INDEX IF NOT EXISTS daily_logs_date_idx ON daily_logs (log_date);
CREATE INDEX IF NOT EXISTS daily_metrics_date_idx ON daily_metrics (metric_date);

INSERT INTO habits (name, emoji, goal, sort_order)
SELECT seed.name, seed.emoji, seed.goal, seed.sort_order
FROM (
  VALUES
    ('Wake up at 06:00', '🌅', 31, 1),
    ('Meditation', '🙏', 31, 2),
    ('GYM', '💪', 31, 3),
    ('Cold Shower', '🚿', 31, 4),
    ('Work', '💻', 31, 5),
    ('Read 10 pages', '📖', 31, 6),
    ('Learn a skill', '📝', 31, 7),
    ('No sugar', '🍬', 31, 8),
    ('No alcohol', '🍺', 31, 9),
    ('1H social media', '📱', 31, 10),
    ('Planning', '📋', 31, 11),
    ('Sleep before 11:00', '🌙', 31, 12)
) AS seed(name, emoji, goal, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM habits existing WHERE existing.name = seed.name
);
