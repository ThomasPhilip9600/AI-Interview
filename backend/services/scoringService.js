const transcriptionService = require('./transcriptionService');
const evaluationService = require('./evaluationService');
const behavioralService = require('./behavioralService');

/**
 * Main AI Pipeline Coordinator
 * Handles transcription, behavioral analysis, and answer evaluation.
 * Returns exactly the format expected by interviewController.
 */
async function processAnswerPipeline(videoUrl, durationSec, questionText, rubric, frontendMetricsJson, frontendTranscript) {
  console.log(`[ScoringService] Starting pipeline for duration: ${durationSec}s`);
  
  // 1. Transcription (handles duration < 3s internally)
  const transcriptionResult = await transcriptionService.transcribeAudio(videoUrl, durationSec);
  
  // Use backend transcript if successful, otherwise fallback to frontend transcript
  const transcript = transcriptionResult.success ? transcriptionResult.text : (frontendTranscript || "");
  
  let evalResult;
  let speechResult;
  let postureResult;
  
  if (!transcript || transcript.trim().length === 0) {
    // Pipeline shortcut: if transcription fails or is empty/rejected, AND no frontend fallback
    console.warn(`[ScoringService] Transcription rejected: ${transcriptionResult.reason || "Empty transcript"}`);
    
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
      what_needs_improvement: [transcriptionResult.reason || "Recording too short or silent", "No valid answer detected"],
      missing_keywords: [],
      used_keywords: [],
      short_feedback: "Invalid or missing answer.",
      detailed_feedback: `The system could not process your answer because: ${transcriptionResult.reason || "No speech detected"}.`,
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
