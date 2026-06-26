# Portfolix AI Interview Module: Final Technical Specification

## 1. Core Student / Candidate Journey (MVP)

### 1.1 Dashboard & Selection
* **Interface:** A clean portal for students to view available interview categories (e.g., Full Stack, Python, General HR), difficulty levels, and historical performance graphs.

### 1.2 Pre-Flight Checks & Live Environment Setup
* **Hardware Permissions:** Browser prompt utilizing `getUserMedia()` to access the webcam and microphone.
* **Live Posture Tracking (MediaPipe):** The browser runs Google MediaPipe via JavaScript to analyze the live webcam feed at 30+ FPS. It provides instant UI feedback (face centered, lighting, distance) without saving any photos or sending frames to the backend.

### 1.3 The One-Way Interview Execution
* **Recording:** The browser uses the `MediaRecorder` API to capture the entire answer into a single `.webm` video Blob. 
* **Background Processing:** Simultaneously, MediaPipe calculates the final posture scores (e.g., eye contact %, face centered %) and compiles them into a lightweight JSON object.

### 1.4 Processing & Evaluation Flow
* **The Upload:** Once the answer timer ends, the frontend makes a single POST request to the Node.js/Express backend, sending **one `.webm` file** and **one posture JSON object**.
* **Storage & Extraction:** The backend uploads the video to cloud storage (e.g., AWS S3) and uses an FFmpeg wrapper to extract the compressed audio.
* **Transcription:** The extracted audio is sent to **OpenAI Whisper** to accurately capture technical jargon and exact filler words ("um", "uh", "like").
* **AI Evaluation:** The transcript is sent to the LLM (using Placement-Tailored Rubrics) with strict JSON output enforcement to score the answer and generate actionable feedback.

### 1.5 Final Report & Insights
* **Dashboard:** Displays the final weighted score, question-wise video playback, exact transcripts, missing keywords, AI-refined ideal answers, and hire-readiness indicators.

---

## 2. Database Architecture (MySQL)

**Why MySQL?** MySQL was chosen because the LMS module requires strict relational data integrity (Users $\rightarrow$ Attempts $\rightarrow$ Answers $\rightarrow$ Questions), while also providing native support for flexible JSON data types for AI outputs.

### 2.1 The Hybrid Schema Design (`interview_answers` Table)
To balance query speed for standard metrics and flexibility for dynamic AI feedback, the system uses a **Hybrid Schema**:

**A. Relational "Glue" Columns (Standard):**
* `id` (Primary Key)
* `attempt_id` (Foreign Key linking to the student's attempt)
* `question_id` (Foreign Key linking to the specific template question)
* `created_at` (Timestamp)

**B. Media Columns (Standard):**
* `video_url` (Link to cloud storage)
* `audio_url` (Optional link to extracted audio)
* `transcript` (Full text from Whisper)

**C. Core Queryable Metrics (Standard INT Columns):**
* `answer_score` (0-100)
* `speech_score` (0-10)
* `body_language_score` (0-10)

**D. Flexible AI Data (Native JSON Column):**
* `evaluation_data` (JSON data type)
  * Stores all highly variable LLM outputs and frontend arrays.
  * Contains: `ai_feedback` (Strengths, Weaknesses, Missing Keywords), `refined_answer`, and the raw `detailed_posture_metrics` received from MediaPipe.

---

## 3. Key AI/ML Technical Decisions

* **Client-Side Vision Processing:** Using Google MediaPipe in the browser ensures zero server compute cost for visual AI, no backend bottlenecks, and complete data privacy (no images sent to the server).
* **Strict LLM JSON Enforcement:** Prevents database parsing errors by forcing the AI to return exact keys that map perfectly to the backend.
* **Cost-Efficient Media Handling:** Extracting audio with FFmpeg before sending it to Whisper drastically reduces API bandwidth and processing costs compared to uploading full video files to the AI.
