const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = 8080;
const { Pool } = require('pg');


const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});


app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
    res.json({ status: 'test' });
});

app.get('/api/todays', async (req, res) => {
        
    try {
        const result = await pool.query(
                `SELECT
                    username,
                    score,
                    rank
                FROM daily_scores
                WHERE date = CURRENT_DATE
                ORDER BY rank ASC;`
                        )
        res.json(result.rows);
    } 
      catch (err) {
        console.error('Error fetching today\'s scores:', err); 
        res.status(500).json({ error: 'Internal server error' });
    }
    });


app.get('/api/weekly-scores', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                username,
                ROUND(AVG(score)) as avg_score,
                SUM(score) as total_score,
                COUNT(rank) FILTER (WHERE rank = 1) AS first_places,
                COUNT(*) as days_played,
                ROW_NUMBER() OVER (ORDER BY AVG(score) DESC) as avg_rank,
                ROW_NUMBER() OVER (ORDER BY SUM(score) DESC) as total_rank,
                ROW_NUMBER() OVER (ORDER BY COUNT(rank) FILTER (WHERE rank = 1) DESC) as first_place_rank
            FROM daily_scores
            WHERE week_num = EXTRACT(WEEK FROM CURRENT_DATE)
            GROUP BY username;`
        )
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching weekly scores:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/monthly-scores', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                username,
                ROUND(AVG(score)) as avg_score,
                SUM(score) as total_score,
                COUNT(rank) FILTER (WHERE rank = 1) AS first_places,
                COUNT(*) as days_played,
                ROW_NUMBER() OVER (ORDER BY AVG(score) DESC) as avg_rank,
                ROW_NUMBER() OVER (ORDER BY SUM(score) DESC) as total_rank,
                ROW_NUMBER() OVER (ORDER BY COUNT(rank) FILTER (WHERE rank = 1) DESC) as first_place_rank
            FROM daily_scores
            WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
            GROUP BY username;`
        )
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching monthly scores:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});

app.post('/api/submit-score', async (req, res) => {
    const { date, username, score, rank, week_num} = req.body;
    const insertQuery = `
        INSERT INTO daily_scores
        (id, "date", username, score, "rank", week_num, created_at)
        VALUES(nextval('daily_scores_id_seq'::regclass), '${date}', '${username}', ${score}, ${rank}, ${week_num}, now());
    `;
    try {
        await pool.query(insertQuery);
        res.status(200).json({ message: 'Score submitted successfully' });
    } catch (err) {
        console.error('Error submitting score:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});