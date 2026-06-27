const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start background jobs
require('./jobs/purge');

// Routes
app.use('/api/ai-interviews', require('./routes/interviews'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const db = require('./config/db');

// Fallback to ensure new columns exist in case migrations failed
db.query("ALTER TABLE interview_attempts ADD COLUMN self_intro_duration INT DEFAULT 0").catch(() => {});
db.query("ALTER TABLE interview_answers MODIFY COLUMN question_id CHAR(36) NULL").catch(() => {});
db.query("ALTER TABLE interview_answers ADD COLUMN behavioral_metrics_json JSON NULL").catch(() => {});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
