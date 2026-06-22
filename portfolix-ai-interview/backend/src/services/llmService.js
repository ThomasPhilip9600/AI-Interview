const { OpenAI } = require('openai');
const rubrics = require('../prompts/rubrics.json');

// Mock ideal responses fallback if OpenAI GPT-4 is unavailable
const mockIdealAnswers = {
  1: "An ideal UI vs UX response clarifies that UI focuses on layout design, typography, brand assets, and interactive controls (visuals). UX covers research, persona building, wireframing, and user testing (flow and mechanics). The score reflects how well both aspects are defined.",
  2: "An ideal research answer utilizes both qualitative (interviews, usability testing) and quantitative (surveys, web analytics) methods. It details recruiting target personas, drafting structured questions, and organizing results via affinity maps.",
  3: "For WCAG compliance, the ideal answer highlights a 4.5:1 text-background contrast ratio (AA standard), comprehensive keyboard focus indicators, text descriptions for media elements, and ARIA markup for assistive screen readers.",
  4: "StatelessWidgets are immutable. The configuration cannot change dynamically once built. StatefullWidgets maintain state that is preserved across widget builds. Modifying state requires calling setState() to repaint the tree.",
  5: "The state lifecycle includes initState, didChangeDependencies, build, and dispose. For state management, Provider is used for tree-based injections while Bloc is preferred for event-driven logic separating state from layout.",
  6: "SQL is relational, ACID-compliant, and table-based. NoSQL is non-relational, horizontally scalable, and document/key-value based. SQL suits consistent schemas, whereas NoSQL is best for flexible, rapid-growth semi-structured datasets.",
  7: "List comprehensions in Python offer a compact, readable syntax: '[expression for item in iterable if condition]'. They are generally faster than standard loops but should not be overly nested to maintain code readability.",
  8: "A Python decorator extends the behavior of an underlying function or class without directly modifying its source code. It wraps the target function. Common examples are authentication filters, request speed loggers, and event catchers.",
  9: "SEO relies on on-page elements (titles, headers, keywords), off-page links (domain authority, backlinks), and technical components (page-load speeds, XML sitemaps, structured schema data, SSL certificates).",
  10: "A compelling HR answer provides a concise summary of experience, highlights engineering stacks (React, Node.js, Flutter), and aligns interest with the company's innovation values (AI interview tools).",
  11: "Resolving team conflicts is best done using the STAR method: stating the Situation, the conflict Task, the Action (setting up objective, data-backed tests), and the Result (the consensus solution accepted by the team)."
};

class LLMService {
  /**
   * Evaluates the candidate's transcript based on category rubrics.
   * @param {string} transcript - The text transcript of the candidate's answer.
   * @param {Object} question - The database question object.
   * @returns {Promise<Object>} The structured evaluation result.
   */
  static async evaluateAnswer(transcript, question) {
    const category = question.category || 'HR';
    const questionId = question.id;
    const categoryRubric = rubrics[category] || rubrics['HR'];

    // 1. Local Fallback Rule-Based Scorer
    // This executes if no API key is specified OR if the LLM call fails.
    const runLocalEvaluator = () => {
      console.log(`LLMService: Running local rule-based evaluation for question ID ${questionId} (${category}).`);
      
      const text = transcript.toLowerCase();
      const matchedKeywords = [];
      
      // Check for rubric keywords
      categoryRubric.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        }
      });

      const totalKeywordsCount = categoryRubric.keywords.length;
      const matchedCount = matchedKeywords.length;
      
      // Calculate scores dynamically based on matches
      const keywordRatio = totalKeywordsCount > 0 ? (matchedCount / totalKeywordsCount) : 0.5;
      
      // Calculate individual scores
      // Answer score is derived from keyword matches and text length (max 100)
      const lengthFactor = Math.min(transcript.length / 300, 1.0); // score bonus for substantial length
      const rawAnswerScore = 50 + Math.round(keywordRatio * 40) + Math.round(lengthFactor * 10);
      const answerScore = Math.max(0, Math.min(100, rawAnswerScore));
      
      // Speech score (simulated based on transcript quality/length)
      const speechScore = Math.max(5, Math.min(10, 6 + Math.round(lengthFactor * 3) + (transcript.includes('um') || transcript.includes('uh') ? -1 : 1)));
      
      // Body language score (defaults to 8, will be adjusted by MediaPipe scoring)
      const bodyLanguageScore = 8; 

      const strengths = [];
      const weaknesses = [];
      const missingKeywords = [];

      // Generate context-aware feedback
      if (matchedCount > 0) {
        strengths.push(`Addressed core terminology such as ${matchedKeywords.slice(0, 3).join(', ')}.`);
      } else {
        weaknesses.push("Did not include specific domain terminology for this category.");
      }

      if (transcript.length < 100) {
        weaknesses.push("Response is quite short. Try to elaborate on technical details and provide concrete examples.");
      } else {
        strengths.push("Provided a structured and detailed explanation of the concept.");
      }

      categoryRubric.keywords.forEach(kw => {
        if (!matchedKeywords.includes(kw)) {
          missingKeywords.push(kw);
        }
      });

      if (missingKeywords.length > 0) {
        weaknesses.push(`Consider explaining keywords like: ${missingKeywords.slice(0, 3).join(', ')}.`);
      }

      const refinedAnswer = mockIdealAnswers[questionId] || 
        `An ideal answer for this ${category} question should clearly explain the core concepts, address all key parameters, and touch upon keywords like: ${categoryRubric.keywords.join(', ')}.`;

      return {
        answer_score: answerScore,
        speech_score: speechScore,
        body_language_score: bodyLanguageScore,
        ai_feedback: {
          strengths: strengths.length > 0 ? strengths : ["Communicated clearly"],
          weaknesses: weaknesses.length > 0 ? weaknesses : ["No major technical weaknesses observed."],
          keywords_missing: missingKeywords
        },
        refined_answer: refinedAnswer
      };
    };

    if (!process.env.OPENAI_API_KEY) {
      return runLocalEvaluator();
    }

    try {
      console.log(`LLMService: Sending request to OpenAI GPT for evaluation of question ID ${questionId}...`);
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const prompt = `
You are an expert technical interviewer evaluating a student's answer for the following question.

Question: "${question.question_text}"
Category: "${category}"
Difficulty: "${question.difficulty}"

Candidate Response Transcript:
"${transcript}"

Placement Rubrics for ${category}:
${categoryRubric.evaluation_criteria.map((c, i) => `${i+1}. ${c}`).join('\n')}
Keywords to look for: ${categoryRubric.keywords.join(', ')}

Please evaluate the answer and output a strict JSON object with the following keys. Do NOT include any markdown code blocks or additional text:
{
  "answer_score": <Integer from 0 to 100 representing answer accuracy and depth>,
  "speech_score": <Integer from 1 to 10 representing articulation, vocabulary and structural flow>,
  "body_language_score": <Integer from 1 to 10 representing non-verbal communication structure>,
  "ai_feedback": {
    "strengths": [<Array of strings highlighting what the candidate explained well>],
    "weaknesses": [<Array of strings outlining what is incorrect, missing, or needs improvement>],
    "keywords_missing": [<Array of strings of keywords that were NOT mentioned but would improve the score>]
  },
  "refined_answer": "<A polished, professional, ideal answer that the candidate should strive for, based on the prompt question>"
}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a strict technical interviewer that evaluates transcripts and always returns valid, raw JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const output = JSON.parse(response.choices[0].message.content);
      console.log('LLMService: Evaluation completed successfully via OpenAI API.');
      return output;
    } catch (err) {
      console.error('LLMService: OpenAI LLM evaluation failed. Falling back to local scorer. Error:', err.message);
      return runLocalEvaluator();
    }
  }
}

module.exports = LLMService;
