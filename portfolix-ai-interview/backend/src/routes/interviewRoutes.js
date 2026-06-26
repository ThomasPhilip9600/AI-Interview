const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const Answer = require('../models/Answer');
const User = require('../models/User');
const EvaluationController = require('../controllers/evaluation');

// Configure Multer for temporary storage
const TEMP_DIR = path.join(__dirname, '..', '..', 'uploads', 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// --- QUESTIONS ---
// Get all available questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.getAll();
    return res.status(200).json(questions);
  } catch (error) {
    console.error('Routes: Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions.' });
  }
});

// --- ATTEMPTS ---
// Start a new attempt
router.post('/attempts', async (req, res) => {
  const { category, email } = req.body;
  
  if (!category) {
    return res.status(400).json({ error: 'Category is required to start an attempt.' });
  }

  try {
    // Locate or create user
    const userEmail = email || 'student@portfolix.ai';
    let user = await User.findByEmail(userEmail);
    
    // If not found, use default user ID 1
    const userId = user ? user.id : 1;

    const attemptId = await Attempt.create({ userId, category });
    console.log(`Routes: Started attempt ID ${attemptId} for user ${userId} in ${category}`);
    
    return res.status(201).json({
      attemptId,
      user_id: userId,
      category,
      status: 'started'
    });
  } catch (error) {
    console.error('Routes: Error starting attempt:', error);
    return res.status(500).json({ error: 'Failed to start interview attempt.' });
  }
});

// Submit an answer for a specific question in an attempt
router.post('/attempts/:attemptId/answers', upload.single('video'), EvaluationController.submitAnswer);

// Complete an attempt
router.post('/attempts/:attemptId/complete', async (req, res) => {
  const { attemptId } = req.params;

  try {
    const attempt = await Attempt.findById(parseInt(attemptId));
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    await Attempt.updateStatus(parseInt(attemptId), 'completed');
    console.log(`Routes: Completed attempt ID ${attemptId}`);

    return res.status(200).json({ message: 'Attempt marked as completed successfully.' });
  } catch (error) {
    console.error('Routes: Error completing attempt:', error);
    return res.status(500).json({ error: 'Failed to complete interview attempt.' });
  }
});

// Get historical list of all completed attempts and cumulative analytics
router.get('/attempts/history', async (req, res) => {
  try {
    const history = await Attempt.getHistory();
    return res.status(200).json(history);
  } catch (error) {
    console.error('Routes: Error loading history:', error);
    return res.status(500).json({ error: 'Failed to retrieve attempt history.' });
  }
});

// Get detailed report (all questions/answers evaluated) for an attempt
router.get('/attempts/:attemptId/report', async (req, res) => {
  const { attemptId } = req.params;

  try {
    const attempt = await Attempt.findById(parseInt(attemptId));
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found.' });
    }

    const answers = await Answer.findByAttemptId(parseInt(attemptId));

    // Calculate aggregated overall score for the attempt
    let totalScore = 0;
    let avgAnswer = 0;
    let avgSpeech = 0;
    let avgBody = 0;

    if (answers.length > 0) {
      answers.forEach(ans => {
        avgAnswer += ans.answer_score || 0;
        avgSpeech += (ans.speech_score || 0) * 10;
        avgBody += (ans.body_language_score || 0) * 10;
      });

      avgAnswer = Math.round(avgAnswer / answers.length);
      avgSpeech = Math.round(avgSpeech / answers.length);
      avgBody = Math.round(avgBody / answers.length);

      // Weighted score: 50% answer quality, 20% speech structure, 30% body posture
      totalScore = Math.round((avgAnswer * 0.5) + (avgSpeech * 0.2) + (avgBody * 0.3));
    }

    return res.status(200).json({
      attempt,
      answers,
      summary: {
        overall_score: totalScore,
        avg_answer_score: avgAnswer,
        avg_speech_score: Math.round(avgSpeech / 10),
        avg_body_language_score: Math.round(avgBody / 10),
        questions_answered: answers.length
      }
    });
  } catch (error) {
    console.error('Routes: Error retrieving attempt report:', error);
    return res.status(500).json({ error: 'Failed to retrieve report.' });
  }
});

module.exports = router;
