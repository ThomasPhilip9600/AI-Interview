const path = require('path');
const fs = require('fs');
const StorageService = require('../services/storageService');
const MediaService = require('../services/mediaService');
const SpeechService = require('../services/speechService');
const LLMService = require('../services/llmService');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Attempt = require('../models/Attempt');

class EvaluationController {
  /**
   * Processes a single recorded interview answer.
   * Handles WebM upload, audio isolation, Whisper transcription, and LLM rating.
   */
  static async submitAnswer(req, res) {
    const { attemptId } = req.params;
    const { questionId, postureData } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: 'No video recording file provided.' });
    }

    if (!questionId) {
      // Clean up temp file
      if (fs.existsSync(videoFile.path)) {
        fs.unlinkSync(videoFile.path);
      }
      return res.status(400).json({ error: 'Missing questionId.' });
    }

    try {
      console.log(`EvaluationController: Received submission for attempt ${attemptId}, question ${questionId}`);
      
      // Parse posture data sent from frontend
      let parsedPosture = { score: 8, metrics: {} };
      if (postureData) {
        try {
          parsedPosture = typeof postureData === 'string' ? JSON.parse(postureData) : postureData;
        } catch (e) {
          console.warn('EvaluationController: Failed to parse postureData, using defaults. Error:', e.message);
        }
      }

      // 1. Fetch Question details
      const questionsList = await Question.getAll();
      const question = questionsList.find(q => q.id === parseInt(questionId));
      if (!question) {
        throw new Error(`Question with ID ${questionId} not found in database.`);
      }

      // 2. Upload video
      console.log('EvaluationController: Uploading video...');
      const videoUrl = await StorageService.uploadFile(videoFile);
      console.log(`EvaluationController: Video uploaded. URL: ${videoUrl}`);

      // 3. Extract audio
      console.log('EvaluationController: Isolation audio stream...');
      const audioUrl = await MediaService.extractAudio(videoUrl);
      console.log(`EvaluationController: Audio extracted. URL/Path: ${audioUrl || 'N/A'}`);

      // 4. Speech to text transcription
      console.log('EvaluationController: Running Whisper transcription...');
      const transcript = await SpeechService.transcribeAudio(audioUrl, parseInt(questionId));
      console.log(`EvaluationController: Transcription complete: "${transcript.substring(0, 100)}..."`);

      // 5. LLM Evaluation using prompts/rubrics
      console.log('EvaluationController: Orchestrating LLM scoring and feedback...');
      const llmResult = await LLMService.evaluateAnswer(transcript, question);

      // Overwrite body language score with MediaPipe score if available from client
      const bodyLanguageScore = parsedPosture.score !== undefined 
        ? Math.round(parsedPosture.score) 
        : (llmResult.body_language_score || 8);

      // Assemble final evaluation data JSON column content
      const evaluationData = {
        ai_feedback: llmResult.ai_feedback,
        refined_answer: llmResult.refined_answer,
        detailed_posture_metrics: parsedPosture.metrics || {}
      };

      // 6. Save answer entry to SQL relational database
      console.log('EvaluationController: Saving evaluation records to database...');
      const answerId = await Answer.create({
        attemptId: parseInt(attemptId),
        questionId: parseInt(questionId),
        videoUrl,
        audioUrl,
        transcript,
        answerScore: llmResult.answer_score,
        speechScore: llmResult.speech_score,
        bodyLanguageScore,
        evaluationData
      });

      console.log(`EvaluationController: Answer evaluated and saved successfully (ID: ${answerId})`);

      // Return the complete analysis back to user
      return res.status(201).json({
        id: answerId,
        attempt_id: parseInt(attemptId),
        question_id: parseInt(questionId),
        video_url: videoUrl,
        audio_url: audioUrl,
        transcript,
        answer_score: llmResult.answer_score,
        speech_score: llmResult.speech_score,
        body_language_score: bodyLanguageScore,
        evaluation_data: evaluationData
      });

    } catch (error) {
      console.error('EvaluationController: Error processing answer submission:', error);
      return res.status(500).json({ error: 'Server error processing answer. Please try again.', details: error.message });
    }
  }
}

module.exports = EvaluationController;
