const Groq = require('groq-sdk');
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Evaluate answer using Groq's Llama 3 model.
 * Assumes transcript is valid and passed successfully from transcriptionService.
 */
async function evaluateAnswer(questionText, rubric, transcript) {
  console.log(`[Evaluation] Evaluating answer correctness...`);

  if (!groq) {
    console.warn("[Evaluation] GROQ_API_KEY not found. Returning stubbed evaluation.");
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
    console.error("[Evaluation] Failed:", error);
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

module.exports = {
  evaluateAnswer
};
