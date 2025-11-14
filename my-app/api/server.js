const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'leaderboard_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',  
  
});

app.use(cors());
app.use(express.json());


//enpoint for todays leaderboard
app.get('/api/leaderboard/current', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        username, 
        score, 
        rank 
      FROM daily_scores
      WHERE date = CURRENT_DATE
      ORDER BY rank ASC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching current leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
    
});

app.get('/api/leaderboard/weekly/avg', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        username, 
        AVG(score) as avg_score,
        COUNT(*) as days_played
      FROM daily_scores
      WHERE week_num = EXTRACT(WEEK FROM CURRENT_DATE)
      GROUP BY username
      ORDER BY avg_score DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching weekly leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/leaderboard/weekly/total', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        username, 
        AVG(score) as avg_score,
        COUNT(*) as days_played
      FROM daily_scores
      WHERE week_num = EXTRACT(WEEK FROM CURRENT_DATE)
      GROUP BY username
      ORDER BY SUM(score) DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching weekly leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/leaderboard/monthly/avg', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        username, 
        AVG(score) as avg_score,
        COUNT(*) as days_played
      FROM daily_scores
      WHERE month_num = EXTRACT(MONTH FROM CURRENT_DATE)
      GROUP BY username
      ORDER BY avg_score DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching monthly leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/leaderboard/monthly/total', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        username, 
        AVG(score) as avg_score,
        COUNT(*) as days_played
      FROM daily_scores
      WHERE month_num = EXTRACT(MONTH FROM CURRENT_DATE)
      GROUP BY username
      ORDER BY SUM(score) DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching monthly leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * 
 * {
  "date": "12.11.2025.45",
  "username": "mikkelg",
  "score": 39928,
  "rank": 2,
  "week_num": 45,
  "month_num": 11
}
 */

// TODO ADD API AUTHENTICATION

app.post('/api/leaderboard', async (req, res) => {
  const { date, username, score, rank, day_num, week_num, month_num, year_num } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO daily_scores (date, username, score, rank, day_num, week_num, month_num, year_num)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
    
      [date, username, score, rank, day_num, week_num, month_num, year_num]
    );
    res.status(200).json({ message: 'Score inserted/updated successfully' });
  } catch (err) {
    console.error('Error inserting/updating score:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
