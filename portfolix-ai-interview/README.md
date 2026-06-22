# Portfolix AI Interview System

An interactive, one-way AI interview simulator built for students and candidates to practice technical and soft-skill mock interviews. It utilizes browser MediaRecorder for video capture, Google MediaPipe for client-side posture analysis, and a Node.js/Express backend that isolates audio via FFmpeg, transcribes speech with OpenAI Whisper, and evaluates responses against domain rubrics using LLMs.

---

## 🌟 Key Features

1. **Category Practice Dashboard:** Pick interview domains (UI/UX, Flutter, Full Stack, Python, Digital Marketing, HR) and browse template questionnaires.
2. **Interactive Calibration Check:** Webcam posture calibration verifying centering, shoulder visibility, straight-head orientation, lighting levels, and distance guides.
3. **Pulsing Recording Screen:** Active session manager with preparation countdown overlays, real-time warning indicators, and automatic recording submissions.
4. **Vibrant Processing Screen:** A multi-step status loader tracking upload, audio extraction, Whisper transcription, and rubric evaluation.
5. **Comprehensive AI Scorecard:** Circular grade rings, sub-ratings (Vocal, Posture, Knowledge), strengths, weaknesses, transcripts, missing keywords, and refined ideal answers.
6. **Performance Trajectory Chart:** Lightweight, custom interactive SVG improvement line chart tracking progress across sessions.

---

## 📂 Project Architecture

```
portfolix-ai-interview/
├── frontend/                     # React Single-Page Application (Vite-powered)
│   ├── index.html                # MediaPipe scripts links
│   ├── package.json              # Client packages list
│   ├── vite.config.js            # JSX loader & proxy mappings
│   └── src/
│       ├── App.js                # State-machine routing entry point
│       ├── main.jsx              # DOM rendering mount
│       ├── index.css             # Premium custom dark stylesheet
│       ├── services/
│       │   ├── apiService.js     # Form-data fetch wrapper
│       │   ├── mediaService.js   # Audio-video tracks & recorder controller
│       │   └── visionService.js  # MediaPipe FaceMesh & Pose engine binding
│       ├── utils/
│       │   └── postureScorer.js  # Cumulative facial alignment scoring
│       └── components/
│           ├── dashboard/        # Dashboard layout, histories & SVG chart
│           ├── interview/        # Hardware setup, calibration, recording, & processing UIs
│           └── results/          # Detailed assessment review cards & recommendations
├── backend/                      # Node.js/Express REST server
│   ├── package.json              # Server dependencies listing
│   └── src/
│       ├── server.js             # Express launcher
│       ├── config/
│       │   ├── db.js             # Database connections & fallbacks
│       │   └── storage.js        # File storage configs
│       ├── controllers/
│       │   └── evaluation.js     # Multipart processing & evaluation endpoint
│       ├── models/               # Relational wrappers
│       │   ├── User.js
│       │   ├── Question.js
│       │   ├── Attempt.js
│       │   └── Answer.js
│       ├── routes/
│       │   └── interviewRoutes.js# Router definitions
│       ├── services/
│       │   ├── storageService.js # AWS S3 / Local directory copy service
│       │   ├── mediaService.js   # FFmpeg audio conversion wrapper
│       │   ├── speechService.js  # OpenAI Whisper transcription
│       │   └── llmService.js     # OpenAI GPT-4 rubric scorer
│       └── prompts/
│           └── rubrics.json      # Evaluation parameters per category
├── database/                     # MySQL definitions
│   └── migrations/
│       └── 001_create_interview_answers.sql
├── .env.example                  # Environment configuration placeholder
└── README.md                     # Master walkthrough guide
```

---

## 🛠️ Setup & Local Installation

### Prerequisites
* **Node.js:** v16+
* **NPM:** v8+
* **FFmpeg:** Required on backend system host to extract audio (optional, the system automatically falls back to mock evaluations if missing).

### 1. Configuration (`.env`)
Create a `.env` file in the `backend/` directory by copying `.env.example`:
```bash
cp .env.example backend/.env
```
Provide API keys for Whisper and LLM evaluation (`OPENAI_API_KEY`) and optional S3/MySQL credentials. **If left blank, the application launches in a robust, responsive, mock-score fallback demonstration mode, making it immediately testable out-of-the-box.**

### 2. Database Migrations (MySQL)
If using MySQL, create the schema using the script:
```bash
mysql -u root -p < database/migrations/001_create_interview_answers.sql
```

### 3. Install & Start Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will boot on `http://localhost:5000`.

### 4. Install & Start Frontend Client
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The client launches on `http://localhost:3000`. Open it in your browser!

---

## 🧪 Verification & Fallback Design

To make development and verification simple on any system, the codebase has **zero-configuration fallbacks**:
* **Database Fallback:** If MySQL is not running or env credentials are missing, the server automatically reads/writes to a persistent JSON-file database (`backend/data/db.json`).
* **Storage Fallback:** If AWS S3 settings are unconfigured, videos are saved directly inside `backend/uploads/` and exposed statically.
* **Audio Fallback:** If the local system doesn't have FFmpeg, the conversion step catches the missing system path error and proceeds without audio extraction.
* **AI Evaluation Fallback:** If `OPENAI_API_KEY` is not present, the system runs a local rule-based evaluator. This scanner parses your actual spoken/written transcript, counts relevant domain keywords matching the rubrics, and dynamically outputs scores and context-aware feedback, making the demo interactive even when offline.
* **MediaPipe Fallback:** If the browser cannot reach CDN networks to load MediaPipe, `visionService` launches a simulated calibration stream at 10 FPS, providing animated guides and random warnings so you can click through hardware permissions and verify recording submissions without hardware blockages.
