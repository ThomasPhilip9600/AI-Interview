const db = require('../config/db');

class Answer {
  static async create({
    attemptId,
    questionId,
    videoUrl,
    audioUrl,
    transcript,
    answerScore,
    speechScore,
    bodyLanguageScore,
    evaluationData
  }) {
    const evaluationDataStr = typeof evaluationData === 'object' 
      ? JSON.stringify(evaluationData) 
      : evaluationData;

    const [result] = await db.query(
      `INSERT INTO interview_answers 
       (attempt_id, question_id, video_url, audio_url, transcript, answer_score, speech_score, body_language_score, evaluation_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attemptId,
        questionId,
        videoUrl,
        audioUrl,
        transcript,
        answerScore,
        speechScore,
        bodyLanguageScore,
        evaluationDataStr
      ]
    );
    return result.insertId;
  }

  static async findByAttemptId(attemptId) {
    const sql = `
      SELECT a.*, q.question_text, q.category, q.difficulty 
      FROM interview_answers a 
      JOIN questions q ON a.question_id = q.id 
      WHERE a.attempt_id = ?
    `;
    const [rows] = await db.query(sql, [attemptId]);
    
    // Parse JSON columns if using actual MySQL database
    return rows.map(row => {
      if (row.evaluation_data && typeof row.evaluation_data === 'string') {
        try {
          row.evaluation_data = JSON.parse(row.evaluation_data);
        } catch (e) {
          console.error('Failed to parse evaluation_data for row:', row.id, e);
        }
      }
      return row;
    });
  }
}

module.exports = Answer;
