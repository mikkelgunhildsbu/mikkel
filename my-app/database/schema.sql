CREATE TABLE daily_scores (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL, -- dd-mm-yyyy-ww format 
  day_num INTEGER NOT NULL,
  week_num INTEGER NOT NULL,
  month_num INTEGER NOT NULL,
  year_num INTEGER NOT NULL,
  username VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  rank INTEGER NOT NULL,  -- position in that day's leaderboard
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(date, username)  -- prevent duplicate entries per day
);

-- Indexes for fast queries
CREATE INDEX idx_daily_scores_date ON daily_scores(date);
CREATE INDEX idx_daily_scores_username ON daily_scores(username);
CREATE INDEX idx_daily_scores_date_rank ON daily_scores(date, rank);