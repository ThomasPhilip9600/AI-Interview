# Task 1: Build AI Interview Module for Portfolix LMS

## Project Name
Portfolix AI Interview Practice & Evaluation System

## Goal

Create an AI-powered interview practice module inside Portfolix LMS where students can attend mock interviews, record video/audio answers, receive AI-based feedback, and view detailed reports on answer quality, speech, posture, eye contact, confidence, and improvement areas.

This should be inspired by platforms like TestGorilla and MyCaptain, but built for Portfolio Builders / Portfolix LMS use cases. TestGorilla's AI video interview model uses structured questions, video responses, rubric-based AI scoring, transcript review, scoring rationale, and manual review/override options.

---

## Existing System Context

### Current LMS Stack
- **Frontend:** Flutter
- **Backend:** Express.js / Node.js

### Development Flexibility
- For testing, the developer can build the frontend in React / Next.js / plain HTML-JS / any suitable web frontend. Later, the final flow can be converted into Flutter.
- Backend should preferably be built in Node.js + Express, because the current LMS backend already uses Express/Node.

---

## Main User Types

1. **Student / Candidate** — Can attend AI interview practice, record responses, view results, and track progress.
2. **Admin / Mentor** — Can create interview templates, add questions, review student attempts, override AI scores, and give manual feedback.
3. **LMS Super Admin** — Can manage interview categories, AI settings, scoring rules, storage, and access permissions.

---

## Core Features Required

### 1. Interview Practice Dashboard

Create a dashboard inside the LMS with:

- Available interview practice sets
- **Categories:**
  - UI/UX Designer Interview
  - Flutter Developer Interview
  - Full Stack Developer Interview
  - Python Developer Interview
  - Digital Marketing Interview
  - MBA Marketing Internship Interview
  - General HR Interview
  - Portfolio Review Interview
- **Difficulty levels:**
  - Beginner
  - Intermediate
  - Advanced
- **Interview types:**
  - One-way interview
  - Conversational AI interview
- Previous attempts
- Overall score history
- Improvement graph

---

### 2. One-Way AI Video Interview

This is the **MVP priority**.

#### Flow
Student selects an interview → system shows instructions → camera and microphone test → questions appear one by one → student records answer → video is uploaded → AI evaluates the answer → student receives report.

#### Required Question Flow

Each interview should have:
- 3 to 10 questions
- **Time limit per question:**
  - 30 seconds
  - 60 seconds
  - 2 minutes
  - Custom time
- **Preparation time before recording:**
  - 10 seconds
  - 30 seconds
  - Custom
- **Retake option:**
  - Admin configurable
  - Example: allow 1 retake per question

---

### 3. Camera, Microphone & Posture Check

Before starting the interview, create a setup screen. Use `getUserMedia()` to access webcam and microphone after user permission.

#### Checks Required
- Camera access
- Microphone access
- Face visible
- Face centered
- Shoulders visible
- Good lighting warning
- Distance from screen warning
- Head straight warning

For recording, use the browser **MediaRecorder API** during prototype testing.

---

### 4. Video & Audio Recording

#### Required
- Record webcam video and microphone audio
- Show live preview
- Show countdown timer
- Stop recording automatically when time limit ends
- Allow manual stop after minimum answer duration
- Upload video to backend
- Store video URL in database
- Generate transcript from audio
- Store transcript with each answer

#### Recommended Format
- Browser prototype: WebM or MP4
- Final storage: MP4 preferred
- Compress video before storage if possible
- Keep each answer as a separate video file

---

### 5. AI Transcription

After each answer is uploaded:
- Extract audio from video
- Convert speech to text
- Store transcript
- Show transcript in report
- Allow admin to edit transcript if needed

> Do not depend only on browser SpeechRecognition for production — some browsers use server-based recognition and availability is limited.

---

### 6. AI Answer Evaluation

AI should evaluate the answer **mainly from the transcript**, not from appearance, skin tone, accent, or physical features.

#### Score Areas (each answer scored out of 100)

| Category | Score |
|---|---|
| Relevance to Question | 20 |
| Structure & Clarity | 15 |
| Technical / Domain Knowledge | 20 |
| Practical Example / Case Study | 15 |
| Confidence & Communication | 10 |
| Business / Role Understanding | 10 |
| Final Impact | 10 |

#### AI Output Required (per answer)
- Overall answer score
- Strengths
- Weaknesses
- Missing points
- Suggested better answer
- Short feedback
- Detailed feedback
- Keywords used
- Keywords missing
- Interviewer impression
- **Hire readiness:**
  - Not ready
  - Needs improvement
  - Good
  - Strong
  - Excellent

---

### 7. Speech Evaluation

#### Metrics
- Words per minute
- Filler words count
- Repeated words
- Long pauses
- Answer duration
- Pitch variation (if technically possible)
- Confidence indicator
- Clarity score

#### Filler Words to Detect
- um, uh, like, actually, basically, you know, I mean, so, okay, right

#### Speech Score (out of 10)
| Metric | Score |
|---|---|
| Speech rate | /5 |
| Filler words | /5 |
| **Final speech score** | **/10** |

---

### 8. Body Language / Posture Evaluation

> This should be used **only for self-improvement feedback**, not final hiring judgment.

#### Metrics
- Face centered
- Eye contact estimate
- Shoulder alignment
- Head straight
- Distance from screen
- Body posture stability

#### Posture Score (out of 10)
| Metric | Score |
|---|---|
| Shoulder alignment | /5 |
| Center of screen | /5 |
| Eye contact | /5 |
| Distance from screen | /5 |
| **Final body language score** | **/10** |

---

### 9. Final Interview Report

#### Report Sections
- Final score out of 100
- Answer evaluation score
- Speech evaluation score
- Body language score
- Question-wise score breakdown
- Video playback for each answer
- Transcript for each answer
- AI feedback
- Refined answer
- What went well
- What needs improvement
- Recommended next practice
- Downloadable PDF report *(optional)*
- Shareable report link *(optional)*

#### Final Score Logic

| Component | Weight |
|---|---|
| Answer Evaluation | 70% |
| Speech Evaluation | 15% |
| Body Language | 15% |

---

### 10. Conversational AI Interview *(Phase 2)*

#### Goal
Create a real-time AI interviewer that asks follow-up questions based on the student's previous answer.

#### Flow
- AI interviewer welcomes student
- Asks first question
- Student answers by voice/video
- AI creates a follow-up question based on answer
- Student answers again
- Interview continues for 5 to 10 minutes
- Final report is generated

---

### 11. Admin Panel Requirements *(not needed for this build — student side only)*

> Included here for reference and for stubbing backend service interfaces correctly.

#### Admin Can Create
- Interview title, description, category, difficulty
- Number of questions, time limit, retake rules
- Scoring rubric, ideal answer, keywords expected, minimum passing score

#### Admin Can Review
- Student video, transcript, AI score, AI feedback
- Manual score override
- Admin comments

---

### 12. Backend Requirements

#### Suggested Modules
- Interview template module
- Question module
- Attempt module
- Recording upload module
- Transcript module
- AI evaluation module
- Speech analysis module
- Posture analysis module
- Report module
- Admin review module

#### Database Tables

**interview_templates**
- id, title, description, category, difficulty, interview_type, total_questions, time_limit, status, created_by, created_at, updated_at

**interview_questions**
- id, template_id, question_text, ideal_answer, keywords_expected, scoring_rubric, preparation_time, answer_time_limit, order_index

**interview_attempts**
- id, user_id, template_id, status, final_score, answer_score, speech_score, body_language_score, started_at, completed_at

**interview_answers**
- id, attempt_id, question_id, video_url, audio_url, transcript, answer_score, speech_score, body_language_score, ai_feedback, refined_answer, created_at

**admin_reviews**
- id, attempt_id, reviewed_by, manual_score, admin_comment, status, reviewed_at

> **Note:** Use the expanded schema from `database_guide.md` — it supersedes this basic table list with properly separated evaluation, speech, posture, and entitlement tables.

---

### 13. API Endpoints

#### Interview Templates
```
POST   /api/ai-interviews/templates
GET    /api/ai-interviews/templates
GET    /api/ai-interviews/templates/:id
PUT    /api/ai-interviews/templates/:id
DELETE /api/ai-interviews/templates/:id
```

#### Questions
```
POST   /api/ai-interviews/templates/:templateId/questions
GET    /api/ai-interviews/templates/:templateId/questions
PUT    /api/ai-interviews/questions/:id
DELETE /api/ai-interviews/questions/:id
```

#### Student Attempt
```
POST   /api/ai-interviews/:templateId/start
POST   /api/ai-interviews/attempts/:attemptId/answers
POST   /api/ai-interviews/attempts/:attemptId/complete
GET    /api/ai-interviews/attempts/:attemptId/report
GET    /api/ai-interviews/my-attempts
```

#### Recording Upload
```
POST   /api/ai-interviews/upload-video
POST   /api/ai-interviews/upload-audio
```

#### AI Evaluation
```
POST   /api/ai-interviews/answers/:answerId/transcribe
POST   /api/ai-interviews/answers/:answerId/evaluate
POST   /api/ai-interviews/attempts/:attemptId/generate-report
```

#### Admin Review *(for reference only — not needed for this build)*
```
GET    /api/admin/ai-interviews/attempts
GET    /api/admin/ai-interviews/attempts/:id
POST   /api/admin/ai-interviews/attempts/:id/review
```

---

### 14. AI Evaluation Prompt Structure

For each answer, send the AI exactly this prompt:

```
You are an expert interview evaluator for Portfolio Builders LMS.
Evaluate the candidate answer based only on the transcript and question context.

Question:
{{question}}

Expected Answer / Rubric:
{{rubric}}

Candidate Transcript:
{{transcript}}

Evaluate based on:
1. Relevance
2. Clarity
3. Role knowledge
4. Practical examples
5. Structure
6. Confidence in communication
7. Missing points

Return JSON only:
{
  "overall_score": 0-100,
  "relevance_score": 0-20,
  "clarity_score": 0-15,
  "knowledge_score": 0-20,
  "example_score": 0-15,
  "communication_score": 0-10,
  "business_understanding_score": 0-10,
  "impact_score": 0-10,
  "what_went_well": [],
  "what_needs_improvement": [],
  "missing_keywords": [],
  "used_keywords": [],
  "short_feedback": "",
  "detailed_feedback": "",
  "refined_answer": "",
  "hire_readiness": ""
}
```

---

### 15. Frontend Screens Required

#### Student Side *(build these)*
1. AI Interview Home
2. Interview Category List
3. Interview Details Page
4. Camera & Mic Setup Page
5. Posture Check Page
6. Question Display Page
7. Recording Page
8. Uploading / Processing Page
9. Final Report Page
10. Attempt History Page

#### Admin Side *(do not build — reference only)*
1. Interview Template List
2. Create Interview Template
3. Add Questions
4. Rubric Builder
5. Student Attempts List
6. Attempt Review Page
7. Manual Score Override Page

---

### 16. UI Guidelines

Design should match Portfolix / Portfolio Builders branding:
- Clean white LMS layout or dark mode option
- Purple/green accent colors
- Cards for scores
- Progress bars
- Report-style layout
- Simple and student-friendly UI

---

### 17. Security & Privacy Requirements

Because this module records webcam and microphone data:
- User consent screen before recording begins
- Permission request screen
- Clear data usage note shown to user
- Secure video upload
- Private video URLs (MinIO presigned URLs)
- Student can view only their own attempts
- Option to delete recordings
- Storage retention policy (30-day soft delete — see `database_guide.md` Section 4)

---

### 18. MVP Scope

#### Phase 1 — Must Build First
- One-way AI interview
- Camera/microphone setup
- Video recording
- Video upload
- Transcript generation *(stub)*
- AI answer evaluation *(stub)*
- Speech evaluation *(stub)*
- Basic posture evaluation *(stub)*
- Final report
- Admin interview/question creation *(backend stub only)*
- Admin review *(backend stub only)*

#### Phase 2 *(later)*
- Conversational AI interviewer
- AI avatar
- Real-time follow-up questions
- PDF report
- Progress analytics
- LMS certificate integration
- Mentor feedback workflow

---

### 19. Expected Deliverables

- Working frontend prototype (React)
- Express/Node backend APIs
- Database schema and migration files
- Video upload system (MinIO)
- AI transcription integration *(stub)*
- AI scoring system *(stub)*
- Student report page
- API documentation
- Setup instructions
- GitHub repository
- Postman collection
- Deployment guide

---

### 20. Acceptance Criteria

The task is complete when:
- Student can start an AI interview
- Camera and mic permission works
- Student can record answers
- Answers are uploaded successfully to MinIO
- Transcript generation is stubbed and ready to plug in
- AI score and feedback stubs return placeholder data correctly
- Speech report stub is in place
- Body language/posture report stub is in place
- Final report page is visible with placeholder data
- Backend APIs work and are structured for easy AI integration
- Code is clean enough to later convert frontend into Flutter

---

### Final Instruction

Build this as a separate AI Interview module that can be integrated into the existing Portfolix LMS. Prioritize backend logic, APIs, database design, and a working web prototype first. The final Flutter UI can be built after the functionality is tested successfully.
