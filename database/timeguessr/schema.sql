CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  username VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  rank INTEGER NOT NULL,  -- position in that day's leaderboard
  week_num INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, username)  -- prevent duplicate entries per day
);
