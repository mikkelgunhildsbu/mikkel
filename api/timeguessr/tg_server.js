const express = require('express');
const cors = require('cors');
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

const now = new Date();
const hours = now.getHours();


app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
    res.json({ status: 'test' });
});

app.get('/api/todays', async (req, res) => {
    if (hours < 17) {
        return res.json({ error: 'Scores are not available yet, check back at 17:00' });
    }
    else {
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
    }
});


app.get('/api/weekly-scores', async (req, res) => {
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
        )

        res.json(result.rows);
        console.log(result);
    } catch (err) {
        console.error('Error fetching weekly scores:', err);
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
        VALUES(nextval('leaderboard_id_seq'::regclass), '${date}', '${username}', ${score}, ${rank}, ${week_num}, now());
    `;
    try {
        await pool.query(insertQuery);
        res.status(200).json({ message: 'Score submitted successfully' });
    } catch (err) {
        console.error('Error submitting score:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});