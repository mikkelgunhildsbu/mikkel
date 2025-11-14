const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

let counter = 0;

app.use(cors());
app.use(express.json());

// Get current counter value
app.get('/api/counter', (req, res) => {
  res.json({ value: counter });
});

// Increment counter
app.post('/api/counter/increment', (req, res) => {
  counter++;
  res.json({ value: counter });
});

// Decrement counter
app.post('/api/counter/decrement', (req, res) => {
  counter--;
  res.json({ value: counter });
});

// Reset counter
app.post('/api/counter/reset', (req, res) => {
  counter = 0;
  res.json({ value: counter });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
