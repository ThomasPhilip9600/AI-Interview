const fs = require('fs');
const path = require('path');
const os = require('os');
const Groq = require('groq-sdk');
const storageService = require('./storage');

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Transcribe audio using Groq's Whisper API and return transcription object.
 * Rejects low confidence transcriptions.
 */
async function transcribeAudio(objectKey, durationSec) {
  console.log(`[Transcription] Processing objectKey: ${objectKey}`);
  
  if (durationSec < 3) {
    return { success: false, reason: "Recording too short or silent", text: "" };
  }

  if (!groq) {
    console.warn("[Transcription] GROQ_API_KEY not found. Using stub.");
    return { success: true, text: "This is a stubbed transcription because Groq API key is missing." };
  }

  try {
    const ext = objectKey.split('.').pop().split('?')[0] || 'webm';
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.${ext}`);
    
    // Download directly from MinIO using the storage service
    await storageService.downloadFileLocally(objectKey, tempFilePath);
    
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3",
      response_format: "verbose_json",
      language: "en",
      // This prompt primes Whisper to preserve filler words in the transcript
      // instead of silently removing them. Critical for accurate speech analysis.
      prompt: "Transcribe exactly what is spoken, including all filler words and hesitations such as um, uh, umm, ah, hmm, like, you know, basically, actually, so, and repeated words.",
    });
    
    fs.unlinkSync(tempFilePath);

    // Whisper verbose_json gives average log probability for segments
    // Check if the transcription is confident
    let isConfident = true;
    if (transcription.segments && transcription.segments.length > 0) {
      // Calculate avg_logprob across segments
      const totalLogprob = transcription.segments.reduce((acc, seg) => acc + (seg.avg_logprob || 0), 0);
      const avgLogprob = totalLogprob / transcription.segments.length;
      
      // Usually logprob > -1.0 is decent. If it's very low (e.g., -2.5), it might be a hallucination
      if (avgLogprob < -1.5) {
        isConfident = false;
        console.warn(`[Transcription] Low confidence transcript detected: avg_logprob=${avgLogprob}`);
      }
    }

    if (!isConfident || !transcription.text || transcription.text.trim().length < 5) {
      return { success: false, reason: "Transcription low confidence or empty", text: transcription.text || "" };
    }
    
    return { success: true, text: transcription.text };
  } catch (error) {
    console.error("[Transcription] Failed:", error);
    return { success: false, reason: `Transcription failed due to an error: ${error.message || error}`, text: "" };
  }
}

module.exports = {
  transcribeAudio
};
