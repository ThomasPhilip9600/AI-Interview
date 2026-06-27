/**
 * Behavioral Service
 * Parses the frontend metrics and combines them with programmatic speech analysis.
 */

async function analyzeBehavior(transcript, durationSec, frontendMetricsJson) {
  console.log(`[Behavioral] Analyzing behavior...`);
  
  // 1. Parse frontend metrics
  let frontendMetrics = {
    eyeContactPercentage: 0,
    faceCenteredPercentage: 0,
    headStability: 0,
    shoulderAlignment: 0
  };
  
  try {
    if (frontendMetricsJson) {
      frontendMetrics = JSON.parse(frontendMetricsJson);
    }
  } catch (e) {
    console.error("[Behavioral] Failed to parse frontend metrics:", e);
  }
  
  // 2. Programmatic speech analysis
  let wpm = 0;
  let fillerCount = 0;
  let fillerBreakdown = {};
  let speechRateScore = 0;
  let fillerScore = 0;
  let finalSpeechScore = 0;

  if (transcript && durationSec > 0) {
    const words = transcript.toLowerCase().match(/\b\w+\b/g) || [];
    const totalWords = words.length;
    
    const durationMinutes = durationSec / 60;
    wpm = Math.round(totalWords / durationMinutes);
    
    const fillerWordsList = ["um", "uh", "ah", "like", "basically", "literally", "actually"];
    
    words.forEach(word => {
      if (fillerWordsList.includes(word)) {
        fillerCount++;
        fillerBreakdown[word] = (fillerBreakdown[word] || 0) + 1;
      }
    });
    
    // Ideal WPM is ~130-150.
    speechRateScore = 5; 
    if (wpm < 100 || wpm > 180) speechRateScore = 3;
    if (wpm < 80 || wpm > 200) speechRateScore = 1;

    fillerScore = 5; 
    const fillerRatio = fillerCount / (totalWords || 1);
    if (fillerRatio > 0.05) fillerScore = 3;
    if (fillerRatio > 0.1) fillerScore = 1;

    finalSpeechScore = speechRateScore + fillerScore;
  }

  // 3. Posture / Visual score mapping
  // Eye contact percentage -> 0-5 score
  let eyeScore = Math.round((frontendMetrics.eyeContactPercentage / 100) * 5);
  // Head stability -> 0-5 score (it is out of 10)
  let headScore = Math.round((frontendMetrics.headStability / 10) * 5);
  // Distance / Centering -> 0-5
  let distanceScore = Math.round((frontendMetrics.faceCenteredPercentage / 100) * 5);
  // Shoulder / Slouching -> 0-5
  let shoulderScore = Math.round((frontendMetrics.shoulderAlignment / 10) * 5);
  
  // Weights for final posture score (out of 10)
  const finalPostureScore = Math.round((eyeScore * 0.4 + headScore * 0.2 + distanceScore * 0.2 + shoulderScore * 0.2) * 2);

  return {
    speech: {
      words_per_minute: wpm,
      filler_word_count: fillerCount,
      filler_word_breakdown: JSON.stringify(fillerBreakdown),
      repeated_words: JSON.stringify([]),
      long_pause_count: 0,
      pitch_variation: 0,
      speech_rate_score: speechRateScore,
      filler_score: fillerScore,
      final_speech_score: finalSpeechScore
    },
    posture: {
      face_centered_score: distanceScore * 2,
      eye_contact_score: eyeScore * 2,
      shoulder_alignment_score: shoulderScore * 2,
      head_straight_score: headScore * 2,
      distance_score: distanceScore * 2,
      stability_score: headScore * 2,
      final_posture_score: finalPostureScore
    }
  };
}

module.exports = {
  analyzeBehavior
};
