require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const interviewRoutes = require('./routes/interviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup uploaded static files serving path
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routing
app.use('/api', interviewRoutes);

// Healthy check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'portfolix-ai-interview-backend' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred.', message: err.message });
});

// Launch Server
app.listen(PORT, () => {
  console.log(`Portfolix AI Interview backend is running on port ${PORT}`);
  console.log(`Access endpoint at http://localhost:${PORT}/health`);
});
