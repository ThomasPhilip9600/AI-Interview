# AI Interview Module — Database Design & Implementation Guide

**Project:** Portfolix LMS — AI Interview Practice & Evaluation System  
**Prepared for:** Parvathy  
**Date:** June 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Storage Strategy: Database vs. Object Storage](#2-storage-strategy-database-vs-object-storage)
3. [Core Database Schema](#3-core-database-schema)
   - 3.1 [Interview Templates & Questions](#31-interview-templates--questions)
   - 3.2 [Attempts & Answers](#32-attempts--answers)
   - 3.3 [AI Evaluation, Speech & Posture Reports](#33-ai-evaluation-speech--posture-reports)
   - 3.4 [Admin Review](#34-admin-review)
   - 3.5 [Phase 2: Conversational Interview (Stub)](#35-phase-2-conversational-interview-stub)
4. [The 30-Day "Recently Deleted" System](#4-the-30-day-recently-deleted-system)
5. [Premium / Paid Access System](#5-premium--paid-access-system)
6. [Open Decisions & Next Steps](#6-open-decisions--next-steps)
7. [Adaptations for This Project](#7-adaptations-for-this-project)

---

## 1. Overview

This document lays out the database architecture for the AI Interview Practice & Evaluation System. It covers:

- How interview data is modeled (templates, questions, attempts, answers, scores)
- How recorded video and audio are stored and eventually purged (30-day retention window)
- How a freemium/paid access layer can be added without reworking the schema later

The architecture is organized around three independent but cooperating layers:
1. **Core relational schema** — templates, questions, attempts, answers, scores
2. **Storage and retention layer** — where video/audio live and how deletion works
3. **Access-control layer** — free vs. paid usage

> **Note for this project:** The original document was written for PostgreSQL + Prisma + Node.js/Express. This project uses **MySQL + Sequelize (or raw queries) + Node.js/Express**. Schema adaptations are noted in [Section 7](#7-adaptations-for-this-project).

---

## 2. Storage Strategy: Database vs. Object Storage

**Core rule: Video and audio files never live inside MySQL — not even as BLOBs.**

Recorded interview answers are large binary files. A database carrying gigabytes of binary data:
- Becomes slow to query
- Is expensive to back up
- Is difficult to stream to a browser efficiently

**Instead:** Files live in object storage (this project uses **MinIO**). The database only stores a reference — a URL or storage key pointing to where the file lives. Every `video_url` or `audio_url` field in the schema is a `VARCHAR` string, not a file.

This separation also enables the 30-day retention system: "deleting" a recording is initially a database-only operation (flipping a flag). The actual file removal from MinIO happens separately, via a scheduled job, only after the 30-day window closes.

---

## 3. Core Database Schema

> The schema below is adapted from Prisma/PostgreSQL to **MySQL-compatible SQL**. UUIDs are used as primary keys. Enums are implemented as `ENUM` columns or `VARCHAR` with CHECK constraints depending on MySQL version.

### Enums (as MySQL ENUM types)

```sql
-- Role
ENUM('STUDENT', 'ADMIN', 'SUPER_ADMIN')

-- Difficulty
ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED')

-- InterviewType
ENUM('ONE_WAY', 'CONVERSATIONAL')

-- TemplateStatus
ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED')

-- AttemptStatus
ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED')

-- ProcessingStatus
ENUM('UPLOADED', 'TRANSCRIBING', 'TRANSCRIBED', 'EVALUATING', 'EVALUATED', 'FAILED')

-- HireReadiness
ENUM('NOT_READY', 'NEEDS_IMPROVEMENT', 'GOOD', 'STRONG', 'EXCELLENT')

-- ReviewStatus
ENUM('PENDING', 'REVIEWED')
```

---

### 3.1 Interview Templates & Questions

Templates represent a specific interview (e.g. "Flutter Developer Interview — Intermediate") and hold their questions, each with timing rules and an optional ideal-answer rubric for AI scoring.

```sql
CREATE TABLE interview_templates (
  id              CHAR(36)       PRIMARY KEY DEFAULT (UUID()),
  title           VARCHAR(255)   NOT NULL,
  description     TEXT,
  category        VARCHAR(100)   NOT NULL,  -- e.g. "Flutter Developer", "UI/UX Designer"
  difficulty      ENUM('BEGINNER','INTERMEDIATE','ADVANCED') NOT NULL,
  interview_type  ENUM('ONE_WAY','CONVERSATIONAL') NOT NULL,
  total_questions INT            NOT NULL,
  min_passing_score INT,
  status          ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  created_by      CHAR(36)       NOT NULL,  -- references external user table
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE interview_questions (
  id                  CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  template_id         CHAR(36)     NOT NULL,
  question_text       TEXT         NOT NULL,
  ideal_answer        TEXT,
  keywords_expected   JSON,        -- stored as JSON array: ["keyword1", "keyword2"]
  scoring_rubric      JSON,        -- flexible per-question rubric overrides
  preparation_time    INT          NOT NULL,  -- seconds
  answer_time_limit   INT          NOT NULL,  -- seconds
  max_retakes         INT          NOT NULL DEFAULT 1,
  order_index         INT          NOT NULL,

  FOREIGN KEY (template_id) REFERENCES interview_templates(id) ON DELETE CASCADE
);
```

---

### 3.2 Attempts & Answers

An attempt represents one full run through a template. Each answer moves through a processing pipeline (upload → transcription → evaluation), so status is tracked explicitly.

```sql
CREATE TABLE interview_attempts (
  id                  CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  user_id             CHAR(36)    NOT NULL,  -- references external user table
  template_id         CHAR(36)    NOT NULL,
  status              ENUM('IN_PROGRESS','COMPLETED','ABANDONED') NOT NULL DEFAULT 'IN_PROGRESS',
  final_score         FLOAT,
  answer_score        FLOAT,
  speech_score        FLOAT,
  body_language_score FLOAT,
  started_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at        DATETIME,

  FOREIGN KEY (template_id) REFERENCES interview_templates(id)
);

CREATE TABLE interview_answers (
  id                    CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  attempt_id            CHAR(36)    NOT NULL,
  question_id           CHAR(36)    NOT NULL,
  retake_count          INT         NOT NULL DEFAULT 0,
  video_url             VARCHAR(500),         -- MinIO object URL
  audio_url             VARCHAR(500),         -- MinIO object URL (optional)
  duration_sec          INT,
  transcript            TEXT,
  transcript_edited_by  CHAR(36),             -- admin user id, if manually edited
  processing_status     ENUM('UPLOADED','TRANSCRIBING','TRANSCRIBED','EVALUATING','EVALUATED','FAILED')
                                    NOT NULL DEFAULT 'UPLOADED',
  processing_error      TEXT,
  -- Soft delete fields (see Section 4)
  is_deleted            BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_at            DATETIME,
  purge_at              DATETIME,
  created_at            DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (attempt_id) REFERENCES interview_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES interview_questions(id),
  INDEX idx_answer_deleted_purge (is_deleted, purge_at)  -- critical for purge job performance
);
```

---

### 3.3 AI Evaluation, Speech & Posture Reports

Each is a **one-to-one extension** of an `interview_answer`. Splitting them out means:
- Queries like "all answers with hire_readiness = STRONG" never touch speech/posture columns
- The AI evaluation table can store raw model responses for debugging without bloating other tables

```sql
CREATE TABLE answer_evaluations (
  id                            CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  answer_id                     CHAR(36)    NOT NULL UNIQUE,
  overall_score                 INT         NOT NULL,
  relevance_score               INT         NOT NULL,
  clarity_score                 INT         NOT NULL,
  knowledge_score               INT         NOT NULL,
  example_score                 INT         NOT NULL,
  communication_score           INT         NOT NULL,
  business_understanding_score  INT         NOT NULL,
  impact_score                  INT         NOT NULL,
  what_went_well                JSON,       -- JSON array of strings
  what_needs_improvement        JSON,       -- JSON array of strings
  missing_keywords              JSON,       -- JSON array of strings
  used_keywords                 JSON,       -- JSON array of strings
  short_feedback                TEXT        NOT NULL,
  detailed_feedback             TEXT        NOT NULL,
  refined_answer                TEXT        NOT NULL,
  hire_readiness                ENUM('NOT_READY','NEEDS_IMPROVEMENT','GOOD','STRONG','EXCELLENT') NOT NULL,
  raw_ai_response               JSON,       -- raw model output, for debugging/audit
  created_at                    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (answer_id) REFERENCES interview_answers(id) ON DELETE CASCADE
);

CREATE TABLE speech_reports (
  id                    CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  answer_id             CHAR(36)    NOT NULL UNIQUE,
  words_per_minute      FLOAT       NOT NULL,
  filler_word_count     INT         NOT NULL,
  filler_word_breakdown JSON        NOT NULL,  -- e.g. {"um": 3, "like": 5}
  repeated_words        JSON,
  long_pause_count      INT         NOT NULL,
  pitch_variation       FLOAT,
  speech_rate_score     INT         NOT NULL,  -- out of 5
  filler_score          INT         NOT NULL,  -- out of 5
  final_speech_score    INT         NOT NULL,  -- out of 10

  FOREIGN KEY (answer_id) REFERENCES interview_answers(id) ON DELETE CASCADE
);

CREATE TABLE posture_reports (
  id                        CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  answer_id                 CHAR(36)    NOT NULL UNIQUE,
  face_centered_score       INT         NOT NULL,  -- out of 5
  eye_contact_score         INT         NOT NULL,
  shoulder_alignment_score  INT         NOT NULL,
  head_straight_score       INT         NOT NULL,
  distance_score            INT         NOT NULL,
  stability_score           INT         NOT NULL,
  final_posture_score       INT         NOT NULL,  -- out of 10

  FOREIGN KEY (answer_id) REFERENCES interview_answers(id) ON DELETE CASCADE
);
```

---

### 3.4 Admin Review

AI scoring supports mentors rather than replacing them. Every attempt can carry a manual score override.

```sql
CREATE TABLE admin_reviews (
  id             CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  attempt_id     CHAR(36)    NOT NULL UNIQUE,
  reviewed_by    CHAR(36)    NOT NULL,  -- admin user id
  manual_score   INT,
  admin_comment  TEXT,
  status         ENUM('PENDING','REVIEWED') NOT NULL DEFAULT 'PENDING',
  reviewed_at    DATETIME,

  FOREIGN KEY (attempt_id) REFERENCES interview_attempts(id) ON DELETE CASCADE
);
```

---

### 3.5 Phase 2: Conversational Interview (Stub)

Stubbed into the schema now so it doesn't require a rework when conversational interviews are built later.

```sql
CREATE TABLE conversation_turns (
  id                        CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  attempt_id                CHAR(36)    NOT NULL,
  turn_index                INT         NOT NULL,
  ai_question               TEXT        NOT NULL,
  student_answer_video_url  VARCHAR(500),  -- MinIO URL
  transcript                TEXT,
  is_follow_up              BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at                DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (attempt_id) REFERENCES interview_attempts(id) ON DELETE CASCADE
);
```

---

### Processing Pipeline Flow

```
Video uploaded → interview_answers row created (status: UPLOADED)
      ↓
  Audio extracted + transcribed → status: TRANSCRIBED
      ↓
  AI evaluation runs → answer_evaluations row created → status: EVALUATED
      ↓ (parallel)
  Speech analysis  → speech_reports row created
  Posture analysis → posture_reports row created
      ↓
  All answers EVALUATED → final_score aggregated on interview_attempts
  (70% answer evaluation + 15% speech + 15% body language)
```

---

## 4. The 30-Day "Recently Deleted" System

A Photos-app-style retention model:
- When a recording is deleted → moves to "recently deleted" for 30 days
- During those 30 days → can be restored instantly (database flag flip only)
- After 30 days → a background job permanently removes files from MinIO, then nulls the URL columns (the row itself, with scores and transcript, survives)

### How It Works

Three columns on `interview_answers` carry the mechanism:
- `is_deleted` — whether the row is in the trash
- `deleted_at` — when it was trashed
- `purge_at` — the exact datetime it becomes permanently unrecoverable

The `INDEX idx_answer_deleted_purge (is_deleted, purge_at)` is critical — the daily cleanup job queries `WHERE is_deleted = TRUE AND purge_at <= NOW()` repeatedly, and this must hit an index once there are thousands of rows.

### Node.js / Express Implementation

```javascript
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Soft-delete an answer
router.patch('/answers/:id/delete', authMiddleware, async (req, res) => {
  const answer = await db.query('SELECT * FROM interview_answers ia JOIN interview_attempts ia2 ON ia.attempt_id = ia2.id WHERE ia.id = ?', [req.params.id]);
  if (!answer) return res.status(404).json({ error: 'Not found' });
  if (answer.user_id !== req.user.id) return res.status(403).json({ error: 'Not allowed' });

  const deletedAt = new Date();
  const purgeAt = new Date(deletedAt.getTime() + THIRTY_DAYS_MS);
  await db.query(
    'UPDATE interview_answers SET is_deleted = TRUE, deleted_at = ?, purge_at = ? WHERE id = ?',
    [deletedAt, purgeAt, req.params.id]
  );
  res.json({ success: true });
});

// Restore within the 30-day window
router.patch('/answers/:id/restore', authMiddleware, async (req, res) => {
  await db.query(
    'UPDATE interview_answers SET is_deleted = FALSE, deleted_at = NULL, purge_at = NULL WHERE id = ?',
    [req.params.id]
  );
  res.json({ success: true });
});
```

### MinIO Purge Job (runs daily at 3am)

```javascript
async function purgeExpiredAnswers() {
  const [expired] = await db.query(
    'SELECT id, video_url, audio_url FROM interview_answers WHERE is_deleted = TRUE AND purge_at <= NOW()'
  );

  for (const answer of expired) {
    try {
      if (answer.video_url) await minioClient.removeObject(BUCKET_NAME, answer.video_url);
      if (answer.audio_url) await minioClient.removeObject(BUCKET_NAME, answer.audio_url);
      await db.query(
        'UPDATE interview_answers SET video_url = NULL, audio_url = NULL WHERE id = ?',
        [answer.id]
      );
    } catch (err) {
      console.error(`Failed to purge ${answer.id}:`, err.message);
    }
  }
}

// Run once daily at 3am
cron.schedule('0 3 * * *', purgeExpiredAnswers);
```

> **Note:** If running multiple server instances, use a BullMQ repeatable job instead of node-cron to avoid duplicate purge runs.

---

## 5. Premium / Paid Access System

The payment gateway and pricing model are not finalized, so the schema is built to support any option without rework.

**Core principle:** Track entitlements separately from payments. A user's first free attempt is a starting credit balance — not a hardcoded special case.

### 5.1 Schema

```sql
CREATE TABLE user_entitlements (
  id                      CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  user_id                 CHAR(36)    NOT NULL UNIQUE,  -- references external user table
  free_attempts_used      INT         NOT NULL DEFAULT 0,
  free_attempts_limit     INT         NOT NULL DEFAULT 1,  -- increase if free tier becomes per-category
  paid_credits            INT         NOT NULL DEFAULT 0,
  is_subscribed           BOOLEAN     NOT NULL DEFAULT FALSE,
  subscription_expires_at DATETIME,
  updated_at              DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id                  CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  user_id             CHAR(36)     NOT NULL,
  provider            VARCHAR(50),                    -- 'razorpay' | 'stripe' (TBD)
  provider_payment_id VARCHAR(255),
  amount              INT          NOT NULL,           -- in paise/cents
  currency            VARCHAR(10)  NOT NULL DEFAULT 'INR',
  plan_type           VARCHAR(100) NOT NULL,           -- 'single_attempt' | 'credit_pack_5' | 'subscription_monthly'
  credits_granted     INT,
  status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',  -- PENDING | SUCCESS | FAILED
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 Access Check Logic (Node.js)

```javascript
async function canStartInterview(userId) {
  const [rows] = await db.query('SELECT * FROM user_entitlements WHERE user_id = ?', [userId]);
  const entitlement = rows[0];

  if (!entitlement) return { allowed: true, reason: 'free_attempt' };  // first-ever user

  if (entitlement.is_subscribed && new Date(entitlement.subscription_expires_at) > new Date()) {
    return { allowed: true, reason: 'subscription' };
  }
  if (entitlement.free_attempts_used < entitlement.free_attempts_limit) {
    return { allowed: true, reason: 'free_attempt' };
  }
  if (entitlement.paid_credits > 0) {
    return { allowed: true, reason: 'paid_credit' };
  }
  return { allowed: false, reason: 'payment_required' };
}
```

**Entitlement is deducted only when an attempt is actually created** — never on the paywall check, so a student doesn't lose a credit just for loading the page.

### 5.3 Why This Is Flexible

Whichever pricing model is chosen, only the payment webhook handler changes — the access-check logic above never does:
- **Pay-per-attempt** → adds 1 credit per successful payment
- **Credit packs** → adds N credits based on plan
- **Subscription** → sets `is_subscribed = TRUE` and `subscription_expires_at`

Switching gateways (Razorpay ↔ Stripe) only changes how the webhook event is parsed — everything downstream stays identical.

---

## 6. Open Decisions & Next Steps

These choices should be settled before building the paywall and free-tier messaging on the frontend:

| Decision | Options | Impact |
|---|---|---|
| **Payment gateway** | Razorpay (INR default) vs. Stripe (international support) | Only affects webhook handler |
| **Pricing model** | Pay-per-attempt / monthly subscription / credit packs | Only affects webhook handler |
| **Free tier scope** | One attempt ever vs. one per category | Changes `user_entitlements` key and paywall copy |
| **Retake logging** | Log discarded retakes to a `RetakeLog` table vs. overwrite | Audit trail decision |
| **Posture analysis** | Server-side (MediaPipe) vs. in-browser JSON metrics | Cost vs. scoring accuracy |

---

## 7. Adaptations for This Project

The original document targeted **PostgreSQL + Prisma**. This project uses **MySQL + Node.js/Express**. Key differences:

| Feature | Original (PostgreSQL) | This Project (MySQL) |
|---|---|---|
| UUID generation | `@default(uuid())` in Prisma | `DEFAULT (UUID())` — requires MySQL 8.0+ |
| Arrays | Native PostgreSQL arrays | `JSON` columns |
| Text search | `@db.Text` annotation | `TEXT` column type |
| Migrations | `prisma migrate dev` | Manual SQL migration files or Sequelize migrations |
| ORM | Prisma | Sequelize or raw `mysql2` queries |
| Scheduled jobs | Same — node-cron or BullMQ | Same |

### Storage: MinIO vs. Bunny.net

The original document references **Bunny.net Stream** as the object storage. This project uses **MinIO** (self-hosted, S3-compatible). The deletion API call changes, but the architecture is identical:

```javascript
// Original (Bunny.net)
await axios.delete(`https://storage.bunnycdn.com/${ZONE}${path}`, { headers: { AccessKey: KEY } });

// This project (MinIO)
await minioClient.removeObject(BUCKET_NAME, objectKey);
```

All storage logic is isolated in `services/storage/` so this swap requires no changes elsewhere.
