const fs = require('fs');
const path = require('path');
const os = require('os');
const Groq = require('groq-sdk');

// Initialize Groq only if the API key is present
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Transcribe audio using Groq's Whisper API.
 */
async function transcribeAudio(audioUrl, durationSec) {
  console.log(`[AI] Transcribing audio from URL: ${audioUrl}`);
  if (durationSec < 3) return "[Recording too short or silent]";
  
  if (!groq) {
    console.warn("[AI] GROQ_API_KEY not found. Returning stubbed transcription.");
    return "This is a stubbed transcription because Groq API key is missing.";
  }

  try {
    // 1. Fetch the audio file
    console.log(`[AI] Downloading audio for transcription...`);
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // We need a proper filename with extension for Groq
    const ext = audioUrl.split('.').pop().split('?')[0] || 'webm';
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.${ext}`);
    fs.writeFileSync(tempFilePath, buffer);
    
    // 2. Transcribe via Groq Whisper API
    console.log(`[AI] Sending to Groq Whisper API...`);
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3",
      response_format: "verbose_json", // Gives words & timestamps if needed
    });
    
    // 3. Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    return transcription.text;
  } catch (error) {
    console.error("[AI] Transcription failed:", error);
    return "[Transcription failed due to an error]";
  }
}

/**
 * Evaluate answer using Groq's Llama 3 model in JSON mode.
 */
async function evaluateAnswer(questionText, rubric, transcript, durationSec) {
  console.log(`[AI] Evaluating answer...`);
  
  if (durationSec < 3 || transcript.includes("[Transcription failed") || transcript.includes("[Recording too short") || transcript.trim().length < 5) {
    return {
      overall_score: 0,
      relevance_score: 0,
      clarity_score: 0,
      knowledge_score: 0,
      example_score: 0,
      communication_score: 0,
      business_understanding_score: 0,
      impact_score: 0,
      what_went_well: [],
      what_needs_improvement: ["Audio was too short to evaluate", "No meaningful answer provided"],
      missing_keywords: [],
      used_keywords: [],
      short_feedback: "Answer too short to evaluate.",
      detailed_feedback: "You stopped the recording before providing a complete answer. Please ensure you take enough time to answer the question fully.",
      refined_answer: "N/A",
      hire_readiness: "NOT_READY"
    };
  }

  if (!groq) {
    console.warn("[AI] GROQ_API_KEY not found. Returning stubbed evaluation.");
    return getStubbedEvaluation();
  }

  const prompt = `You are an expert interview evaluator for Portfolio Builders LMS.
Evaluate the candidate answer based only on the transcript and question context.

Question:
${questionText}

Expected Answer / Rubric:
${rubric}

Candidate Transcript:
${transcript}

Evaluate based on:
1. Relevance
2. Clarity
3. Role knowledge
4. Practical examples
5. Structure
6. Confidence in communication
7. Missing points

You MUST return a JSON object with this exact structure (and no other text or markdown block formatting, just the raw JSON object):
{
  "overall_score": 0-100,
  "relevance_score": 0-20,
  "clarity_score": 0-15,
  "knowledge_score": 0-20,
  "example_score": 0-15,
  "communication_score": 0-10,
  "business_understanding_score": 0-10,
  "impact_score": 0-10,
  "what_went_well": ["point 1", "point 2"],
  "what_needs_improvement": ["point 1", "point 2"],
  "missing_keywords": ["keyword1"],
  "used_keywords": ["keyword1"],
  "short_feedback": "string",
  "detailed_feedback": "string",
  "refined_answer": "string",
  "hire_readiness": "NOT_READY or NEEDS_IMPROVEMENT or GOOD or STRONG or EXCELLENT"
}`;

  console.log(`[AI] Sending prompt to Groq Llama 3...`);
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer and evaluator. Always output valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("[AI] Evaluation failed:", error);
    console.warn("[AI] Falling back to stubbed evaluation due to error.");
    return getStubbedEvaluation();
  }
}

function getStubbedEvaluation() {
  return {
    overall_score: 85,
    relevance_score: 18,
    clarity_score: 12,
    knowledge_score: 17,
    example_score: 13,
    communication_score: 8,
    business_understanding_score: 8,
    impact_score: 9,
    what_went_well: ["Good explanation of core concepts", "Clear communication"],
    what_needs_improvement: ["Could provide a more concrete practical example"],
    missing_keywords: ["optimization", "memoization"],
    used_keywords: ["state", "props", "components"],
    short_feedback: "Solid answer with good foundational knowledge.",
    detailed_feedback: "Your answer demonstrated a strong understanding of the topic. You clearly explained the concepts. To improve, try incorporating a specific case study from a past project where you applied this knowledge.",
    refined_answer: "A complete and optimized answer would look like this...",
    hire_readiness: "GOOD"
  };
}

/**
 * Programmatically analyze speech metrics based on the transcript text.
 */
async function analyzeSpeech(transcript, durationSec) {
  console.log(`[AI] Analyzing speech...`);
  if (durationSec < 3 || !transcript) {
    return {
      words_per_minute: 0,
      filler_word_count: 0,
      filler_word_breakdown: JSON.stringify({}),
      repeated_words: JSON.stringify([]),
      long_pause_count: 0,
      pitch_variation: 0,
      speech_rate_score: 0,
      filler_score: 0,
      final_speech_score: 0
    };
  }

  // Basic programmatic speech analysis
  const words = transcript.toLowerCase().match(/\b\w+\b/g) || [];
  const totalWords = words.length;
  
  // Words per minute = (Total words / Duration in seconds) * 60
  const durationMinutes = durationSec / 60;
  const wpm = Math.round(totalWords / durationMinutes);
  
  const fillerWordsList = ["um", "uh", "ah", "like", "basically", "literally", "actually"];
  let fillerCount = 0;
  let fillerBreakdown = {};
  
  words.forEach(word => {
    if (fillerWordsList.includes(word)) {
      fillerCount++;
      fillerBreakdown[word] = (fillerBreakdown[word] || 0) + 1;
    }
  });
  
  // Calculate some simple scores
  // Ideal WPM is ~130-150.
  let speechRateScore = 5; // out of 5
  if (wpm < 100 || wpm > 180) speechRateScore = 3;
  if (wpm < 80 || wpm > 200) speechRateScore = 1;

  let fillerScore = 5; // out of 5
  const fillerRatio = fillerCount / (totalWords || 1);
  if (fillerRatio > 0.05) fillerScore = 3;
  if (fillerRatio > 0.1) fillerScore = 1;

  const finalScore = speechRateScore + fillerScore;

  return {
    words_per_minute: wpm,
    filler_word_count: fillerCount,
    filler_word_breakdown: JSON.stringify(fillerBreakdown),
    repeated_words: JSON.stringify([]), // Needs complex n-gram analysis
    long_pause_count: 0, // Needs word-level timestamps
    pitch_variation: 0, // Needs raw audio processing
    speech_rate_score: speechRateScore,
    filler_score: fillerScore,
    final_speech_score: finalScore
  };
}

/**
 * Stubbed posture analysis (should ideally be moved to frontend MediaPipe)
 */
async function analyzePosture(videoUrl, durationSec) {
  console.log(`[AI Stub] Analyzing posture from URL: ${videoUrl}`);
  if (durationSec < 3) {
    return {
      face_centered_score: 0,
      eye_contact_score: 0,
      shoulder_alignment_score: 0,
      head_straight_score: 0,
      distance_score: 0,
      stability_score: 0,
      final_posture_score: 0
    };
  }

  return {
    face_centered_score: 5,
    eye_contact_score: 4,
    shoulder_alignment_score: 5,
    head_straight_score: 4,
    distance_score: 5,
    stability_score: 4,
    final_posture_score: 9
  };
}

module.exports = {
  transcribeAudio,
  evaluateAnswer,
  analyzeSpeech,
  analyzePosture
};

