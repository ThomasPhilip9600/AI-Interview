const express = require('express');
const router = express.Router();
const multer = require('multer');
const interviewController = require('../controllers/interviewController');

// Set up multer for handling multipart/form-data (video uploads)
// In a real production setup, we might stream directly to MinIO, but this saves locally first.
const upload = multer({ dest: 'uploads/' });

// Fetch available interview templates
router.get('/templates', interviewController.getTemplates);

// Fetch a specific template with its questions
router.get('/templates/:id', interviewController.getTemplateDetails);

// Fetch attempts for the current user
router.get('/my-attempts', interviewController.getMyAttempts);

// Start an interview (checks entitlement, creates attempt row)
router.post('/:templateId/start', interviewController.startInterview);

// Fetch details of a specific attempt (including its questions)
router.get('/attempts/:attemptId', interviewController.getAttemptDetails);

// Upload video chunk (saves to MinIO, creates answer row)
router.post('/attempts/:attemptId/answers', upload.single('video'), interviewController.uploadAnswer);

// Triggers processing (transcription + AI evaluation) for a specific answer
// This can be triggered right after upload or in the background
router.post('/answers/:answerId/evaluate', interviewController.evaluateAnswerProcess);

// Soft delete an answer (triggers 30-day purge logic)
router.patch('/answers/:id/delete', interviewController.deleteAnswer);

// Complete the interview (aggregates scores, finalizes attempt)
router.post('/attempts/:attemptId/complete', interviewController.completeInterview);

// Get the final report for an attempt
router.get('/attempts/:attemptId/report', interviewController.getAttemptReport);

// ADMIN: Create a new template
router.post('/admin/templates', interviewController.createTemplate);

// ADMIN: Add questions to a template
router.post('/admin/questions', interviewController.addQuestion);

module.exports = router;
