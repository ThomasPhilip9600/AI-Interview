const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Predefined professional mock answers for fallback/demo mode
const mockTranscripts = {
  1: "The primary difference between UI and UX is that UI, or user interface, focuses on the aesthetic design and interactive elements of a product, such as buttons, icons, colors, and typography. UX, or user experience, focuses on the overall feel, structure, and usability of the product, ensuring that the user's journey is intuitive, efficient, and satisfies their goals. In short, UI is how it looks, and UX is how it works and feels.",
  2: "To conduct user research for a new product, I start by defining the research objectives. Then, I recruit target users matching our personas and conduct semi-structured interviews. I also run surveys for quantitative validation and perform competitive analysis. Finally, I synthesize findings using affinity mapping and user journey maps to uncover pain points and design opportunities.",
  3: "Designing for WCAG accessibility in a complex dashboard involves ensuring a contrast ratio of at least 4.5:1 for normal text, supporting complete keyboard navigation with clear focus indicators, adding aria-labels for chart data and interactive widgets, and using semantic HTML elements. I also run screen reader testing with tools like NVDA or VoiceOver.",
  4: "In Flutter, a StatelessWidget is immutable, meaning its properties cannot change once it is built. It is redrawn only when its configuration changes. A StatefulWidget, on the other hand, is mutable and maintains state that can change over time. Calling setState() triggers a rebuild of the widget to reflect the updated state in the user interface.",
  5: "The Flutter widget lifecycle for a StatefulWidget involves initState(), didChangeDependencies(), build(), didUpdateWidget(), and dispose(). To manage state at scale, I use Provider or Bloc. Provider is great for dependency injection and simple state tracking, whereas Bloc enforces a strict unidirectional data flow and clear separation of business logic from UI.",
  6: "SQL databases are relational, table-based, and enforce a strict schema with ACID properties, making them ideal for transaction-heavy systems like banking. NoSQL databases are non-relational, document- or key-value-based, and scale horizontally. I choose SQL when relationships and consistency are critical, and NoSQL when dealing with unstructured data or rapid, large-scale horizontal scaling.",
  7: "List comprehensions in Python provide a concise way to create lists. They consist of brackets containing an expression followed by a for clause, and optionally, if clauses. For example, squares equals x squared for x in range of 10 creates a list of squares from 0 to 81 in a single readable line of code.",
  8: "A Python decorator is a design pattern that allows you to modify the behavior of a function or class without permanently changing its code. It wraps another function, extending its behavior and returning it. A practical use-case is logging function entry and exit points, or performing authorization checks before executing a controller function.",
  9: "SEO, or Search Engine Optimization, is the process of improving site visibility on search engines. Its main components are on-page SEO, which includes optimizing content and tags, off-page SEO, which focuses on building high-quality backlinks, and technical SEO, which involves site speed, mobile responsiveness, and clean XML sitemaps.",
  10: "I am a software engineer passionate about building interactive, user-centric web applications. I've worked on frontend technologies like React and Flutter, and Node.js backends. I'm excited about this AI interview role because it combines bleeding-edge web APIs, client-side MediaPipe vision tracking, and LLMs to solve a real-world problem in career preparation.",
  11: "In my previous project, we had a disagreement on whether to use SQL or MongoDB. To resolve it, I set up a meeting where both sides presented benchmarks and data schemas. We evaluated the pros and cons objectively against our project requirements. We eventually chose Postgres because our data was highly relational, and the decision was accepted by everyone."
};

class SpeechService {
  /**
   * Transcribes an audio file to text.
   * @param {string|null} audioUrl - Relative path to the audio file.
   * @param {number} questionId - ID of the question being answered.
   * @returns {Promise<string>} Transcription text.
   */
  static async transcribeAudio(audioUrl, questionId) {
    // Fallback transcript if no audio or no API key
    const fallbackText = mockTranscripts[questionId] || 
      "This is a simulated transcript for the user's audio answer. The system is running in offline demo mode. Please configure the OpenAI API Key to enable real-time transcription via Whisper.";

    if (!audioUrl) {
      console.log(`SpeechService: No audio URL provided. Using mock transcript for question ${questionId}.`);
      return fallbackText;
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log(`SpeechService: OpenAI API key is missing. Using mock transcript for question ${questionId}.`);
      return fallbackText;
    }

    const absoluteAudioPath = path.join(__dirname, '..', '..', audioUrl);

    if (!fs.existsSync(absoluteAudioPath)) {
      console.warn(`SpeechService: Audio file not found at ${absoluteAudioPath}. Using mock transcript.`);
      return fallbackText;
    }

    try {
      console.log(`SpeechService: Sending audio file ${absoluteAudioPath} to OpenAI Whisper...`);
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(absoluteAudioPath),
        model: 'whisper-1'
      });

      console.log('SpeechService: Whisper transcription completed successfully.');
      return response.text;
    } catch (err) {
      console.error('SpeechService: Whisper transcription failed. Falling back to mock transcript. Error:', err.message);
      return fallbackText;
    }
  }
}

module.exports = SpeechService;
