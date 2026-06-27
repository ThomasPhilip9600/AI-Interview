const db = require('../config/db');
const { getUserId } = require('../utils/getUser');
const entitlementService = require('../services/entitlement');
const storageService = require('../services/storage');
const aiService = require('../services/ai');
const fs = require('fs');

exports.getTemplates = async (req, res) => {
  try {
    const [templates] = await db.query("SELECT * FROM interview_templates WHERE status = 'PUBLISHED'");
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTemplateDetails = async (req, res) => {
  try {
    const [templates] = await db.query("SELECT * FROM interview_templates WHERE id = ?", [req.params.id]);
    if (templates.length === 0) return res.status(404).json({ error: "Template not found" });
    
    const [questions] = await db.query("SELECT * FROM interview_questions WHERE template_id = ? ORDER BY order_index ASC", [req.params.id]);
    res.json({ template: templates[0], questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyAttempts = async (req, res) => {
  try {
    const userId = getUserId(req);
    const [attempts] = await db.query(
      "SELECT a.*, t.title as template_title FROM interview_attempts a JOIN interview_templates t ON a.template_id = t.id WHERE a.user_id = ? ORDER BY a.started_at DESC", 
      [userId]
    );
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.startInterview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const templateId = req.params.templateId;
    const { difficulty = 'Beginner', selfIntroDuration = 0 } = req.body;

    // Entitlement check removed as requested by user
    // const accessCheck = await entitlementService.canStartInterview(userId);
    // if (!accessCheck.allowed) {
    //   return res.status(403).json({ error: "Payment or subscription required", reason: accessCheck.reason });
    // }
    // await entitlementService.consumeEntitlement(userId, accessCheck.reason);

    const { v4: uuidv4 } = require('uuid');
    const attemptId = uuidv4();
    
    await db.query(
      "INSERT INTO interview_attempts (id, user_id, template_id, status, difficulty, self_intro_duration) VALUES (?, ?, ?, 'IN_PROGRESS', ?, ?)",
      [attemptId, userId, templateId, difficulty, selfIntroDuration]
    );

    res.json({ success: true, attemptId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const [attempts] = await db.query("SELECT * FROM interview_attempts WHERE id = ?", [attemptId]);
    
    if (attempts.length === 0) {
      return res.status(404).json({ error: "Attempt not found" });
    }
    
    const attempt = attempts[0];
    const [questions] = await db.query(
      "SELECT * FROM interview_questions WHERE template_id = ? ORDER BY order_index ASC", 
      [attempt.template_id]
    );
    
    if (attempt.self_intro_duration && attempt.self_intro_duration > 0) {
      questions.unshift({
        id: 'self-intro',
        template_id: attempt.template_id,
        question_text: "Please take a moment to introduce yourself.",
        ideal_answer: "A good self-introduction should highlight your background, relevant skills, and why you are a fit for this role.",
        preparation_time: 10,
        answer_time_limit: attempt.self_intro_duration * 60,
        order_index: -1
      });
    }
    
    res.json({ attempt, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  exports.uploadAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, durationSec, hasSpoken, behavioralMetrics, frontendTranscript } = req.body;
    
    const effectiveDuration = parseInt(durationSec, 10);
    
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" });
    }

    // Upload to MinIO
    const mimeType = req.file.mimetype;
    const objectKey = await storageService.uploadFile(req.file.path, req.file.originalname, mimeType);
    
    // Remove local file
    fs.unlinkSync(req.file.path);

    const { v4: uuidv4 } = require('uuid');
    const answerId = uuidv4();

    const dbQuestionId = questionId === 'self-intro' ? null : questionId;

    await db.query(
      `INSERT INTO interview_answers (id, attempt_id, question_id, video_url, duration_sec, processing_status, behavioral_metrics_json, transcript) 
       VALUES (?, ?, ?, ?, ?, 'UPLOADED', ?, ?)`,
      [answerId, attemptId, dbQuestionId, objectKey, effectiveDuration, behavioralMetrics || null, frontendTranscript || null]
    );

    res.json({ success: true, answerId, objectKey });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.evaluateAnswerProcess = async (req, res) => {
  try {
    const { answerId } = req.params;
    
    // 1. Fetch answer & question details
    const [answers] = await db.query(
      "SELECT a.*, q.question_text, q.ideal_answer, q.scoring_rubric FROM interview_answers a LEFT JOIN interview_questions q ON a.question_id = q.id WHERE a.id = ?",
      [answerId]
    );
    if (answers.length === 0) return res.status(404).json({ error: "Answer not found" });
    const answer = answers[0];

    // 2. Delegate to Scoring Service
    await db.query("UPDATE interview_answers SET processing_status = 'EVALUATING' WHERE id = ?", [answerId]);
    
    const scoringService = require('../services/scoringService');

    const questionText = answer.question_text || "Please take a moment to introduce yourself.";
    const rubric = answer.ideal_answer || answer.scoring_rubric || "A concise overview of background and skills, demonstrating strong communication.";

    const { transcript, evalResult, speechResult, postureResult } = await scoringService.processAnswerPipeline(
      answer.video_url, 
      answer.duration_sec, 
      questionText, 
      rubric, 
      answer.behavioral_metrics_json,
      answer.transcript
    );

    // Save Transcript
    await db.query("UPDATE interview_answers SET transcript = ? WHERE id = ?", [transcript, answerId]);

    const { v4: uuidv4 } = require('uuid');

    // 4. Save results to DB
    await db.query(
      `INSERT INTO answer_evaluations (id, answer_id, overall_score, relevance_score, clarity_score, knowledge_score, example_score, communication_score, business_understanding_score, impact_score, what_went_well, what_needs_improvement, missing_keywords, used_keywords, short_feedback, detailed_feedback, refined_answer, hire_readiness) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(), answerId, evalResult.overall_score, evalResult.relevance_score, evalResult.clarity_score, 
        evalResult.knowledge_score, evalResult.example_score, evalResult.communication_score, 
        evalResult.business_understanding_score, evalResult.impact_score, 
        JSON.stringify(evalResult.what_went_well), JSON.stringify(evalResult.what_needs_improvement), 
        JSON.stringify(evalResult.missing_keywords), JSON.stringify(evalResult.used_keywords), 
        evalResult.short_feedback, evalResult.detailed_feedback, evalResult.refined_answer, evalResult.hire_readiness
      ]
    );

    await db.query(
      `INSERT INTO speech_reports (id, answer_id, words_per_minute, filler_word_count, filler_word_breakdown, repeated_words, long_pause_count, pitch_variation, speech_rate_score, filler_score, final_speech_score) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), answerId, speechResult.words_per_minute, speechResult.filler_word_count, speechResult.filler_word_breakdown, speechResult.repeated_words, speechResult.long_pause_count, speechResult.pitch_variation, speechResult.speech_rate_score, speechResult.filler_score, speechResult.final_speech_score]
    );

    await db.query(
      `INSERT INTO posture_reports (id, answer_id, face_centered_score, eye_contact_score, shoulder_alignment_score, head_straight_score, distance_score, stability_score, final_posture_score) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), answerId, postureResult.face_centered_score, postureResult.eye_contact_score, postureResult.shoulder_alignment_score, postureResult.head_straight_score, postureResult.distance_score, postureResult.stability_score, postureResult.final_posture_score]
    );

    await db.query("UPDATE interview_answers SET processing_status = 'EVALUATED' WHERE id = ?", [answerId]);

    res.json({ success: true, status: 'EVALUATED' });
  } catch (err) {
    console.error(err);
    await db.query("UPDATE interview_answers SET processing_status = 'FAILED', processing_error = ? WHERE id = ?", [err.message, req.params.answerId]);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    // Verify ownership
    const [answers] = await db.query(
      "SELECT a.id FROM interview_answers a JOIN interview_attempts att ON a.attempt_id = att.id WHERE a.id = ? AND att.user_id = ?",
      [id, userId]
    );
    if (answers.length === 0) return res.status(404).json({ error: "Answer not found or unauthorized" });

    const deletedAt = new Date();
    const purgeAt = new Date(deletedAt.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    await db.query(
      'UPDATE interview_answers SET is_deleted = TRUE, deleted_at = ?, purge_at = ? WHERE id = ?',
      [deletedAt, purgeAt, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeInterview = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    // Aggregate scores across all evaluated answers
    const [rows] = await db.query(`
      SELECT 
        AVG(e.overall_score) as avg_answer,
        AVG(s.final_speech_score) as avg_speech,
        AVG(p.final_posture_score) as avg_posture
      FROM interview_answers a
      JOIN answer_evaluations e ON a.id = e.answer_id
      JOIN speech_reports s ON a.id = s.answer_id
      JOIN posture_reports p ON a.id = p.answer_id
      WHERE a.attempt_id = ? AND a.processing_status = 'EVALUATED' AND a.is_deleted = FALSE
    `, [attemptId]);

    const stats = rows[0];
    
    let answerScore = stats.avg_answer || 0;
    // speech and posture are out of 10, scale to 100 for percentage calculation
    let speechScore = (stats.avg_speech || 0) * 10;
    let postureScore = (stats.avg_posture || 0) * 10;

    // Weighting: 70% Answer, 15% Speech, 15% Posture
    let finalScore = (answerScore * 0.70) + (speechScore * 0.15) + (postureScore * 0.15);

    await db.query(
      "UPDATE interview_attempts SET status = 'COMPLETED', completed_at = NOW(), final_score = ?, answer_score = ?, speech_score = ?, body_language_score = ? WHERE id = ?",
      [finalScore, answerScore, speechScore, postureScore, attemptId]
    );

    res.json({ success: true, finalScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttemptReport = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = getUserId(req);

    const [attempts] = await db.query("SELECT * FROM interview_attempts WHERE id = ? AND user_id = ?", [attemptId, userId]);
    if (attempts.length === 0) return res.status(404).json({ error: "Attempt not found" });

    const attempt = attempts[0];

    const [answers] = await db.query(
      "SELECT a.*, q.question_text, q.order_index FROM interview_answers a LEFT JOIN interview_questions q ON a.question_id = q.id WHERE a.attempt_id = ? AND a.is_deleted = FALSE ORDER BY COALESCE(q.order_index, -1) ASC", 
      [attemptId]
    );

    // Provide default text for self-intro
    answers.forEach(a => {
      if (!a.question_id) {
        a.question_text = "Please take a moment to introduce yourself.";
        a.order_index = -1;
      }
    });

    // Resolve presigned URLs for playback and attach evaluations
    for (let answer of answers) {
      if (answer.video_url) {
        answer.presigned_video_url = await storageService.getPresignedUrl(answer.video_url);
      }
      
      const [evals] = await db.query("SELECT * FROM answer_evaluations WHERE answer_id = ?", [answer.id]);
      const [speech] = await db.query("SELECT * FROM speech_reports WHERE answer_id = ?", [answer.id]);
      const [posture] = await db.query("SELECT * FROM posture_reports WHERE answer_id = ?", [answer.id]);

      answer.evaluation = evals[0] || null;
      answer.speech = speech[0] || null;
      answer.posture = posture[0] || null;
    }

    res.json({ attempt, answers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { title, category, target_role, difficulty, description } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    
    await db.query(
      `INSERT INTO interview_templates (id, title, category, target_role, difficulty, description, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
      [id, title, category, target_role, difficulty, description]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { template_id, question_text, preparation_time, answer_time_limit, order_index } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();

    await db.query(
      `INSERT INTO interview_questions (id, template_id, question_text, preparation_time, answer_time_limit, order_index) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, template_id, question_text, preparation_time, answer_time_limit, order_index]
    );
    
    // Update total questions count in template
    await db.query(
      `UPDATE interview_templates SET total_questions = total_questions + 1 WHERE id = ?`,
      [template_id]
    );

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
