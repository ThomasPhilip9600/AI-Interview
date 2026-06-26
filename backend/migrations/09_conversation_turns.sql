CREATE TABLE IF NOT EXISTS conversation_turns (
  id                        CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  attempt_id                CHAR(36)    NOT NULL,
  turn_index                INT         NOT NULL,
  ai_question               TEXT        NOT NULL,
  student_answer_video_url  VARCHAR(500),
  transcript                TEXT,
  is_follow_up              BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at                DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attempt_id) REFERENCES interview_attempts(id) ON DELETE CASCADE
);
