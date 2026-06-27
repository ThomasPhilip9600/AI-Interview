const transcriptionService = require('./transcriptionService');
const evaluationService = require('./evaluationService');
const behavioralService = require('./behavioralService');

/**
 * Main AI Pipeline Coordinator
 * Handles transcription, behavioral analysis, and answer evaluation.
 * Returns exactly the format expected by interviewController.
 */
async function processAnswerPipeline(videoUrl, durationSec, questionText, rubric, frontendMetricsJson) {
  console.log(`[ScoringService] Starting pipeline for duration: ${durationSec}s`);
  
  // 1. Transcription (handles duration < 3s internally)
  const transcriptionResult = await transcriptionService.transcribeAudio(videoUrl, durationSec);
  const transcript = transcriptionResult.text;
  
  let evalResult;
  let speechResult;
  let postureResult;
  
  if (!transcriptionResult.success) {
    // Pipeline shortcut: if transcription fails or is empty/rejected
    console.warn(`[ScoringService] Transcription rejected: ${transcriptionResult.reason}`);
    
    evalResult = {
      overall_score: 0,
      relevance_score: 0,
      clarity_score: 0,
      knowledge_score: 0,
      example_score: 0,
      communication_score: 0,
      business_understanding_score: 0,
      impact_score: 0,
      what_went_well: [],
      what_needs_improvement: [transcriptionResult.reason, "No valid answer detected"],
      missing_keywords: [],
      used_keywords: [],
      short_feedback: "Invalid or missing answer.",
      detailed_feedback: `The system could not process your answer because: ${transcriptionResult.reason}.`,
      refined_answer: "N/A",
      hire_readiness: "NOT_READY"
    };
    
    // Still run behavioral analysis on the frontend metrics
    const behavior = await behavioralService.analyzeBehavior(transcript, durationSec, frontendMetricsJson);
    speechResult = behavior.speech;
    postureResult = behavior.posture;
    
  } else {
    // 2. Full Pipeline
    const [evalResponse, behavior] = await Promise.all([
      evaluationService.evaluateAnswer(questionText, rubric, transcript),
      behavioralService.analyzeBehavior(transcript, durationSec, frontendMetricsJson)
    ]);
    
    evalResult = evalResponse;
    speechResult = behavior.speech;
    postureResult = behavior.posture;
  }
  
  return {
    transcript: transcript || "[Transcription failed or empty]",
    evalResult,
    speechResult,
    postureResult
  };
}

module.exports = {
  processAnswerPipeline
};
