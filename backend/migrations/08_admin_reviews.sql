CREATE TABLE IF NOT EXISTS admin_reviews (
  id             CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  attempt_id     CHAR(36)    NOT NULL UNIQUE,
  reviewed_by    CHAR(36)    NOT NULL,
  manual_score   INT,
  admin_comment  TEXT,
  status         ENUM('PENDING','REVIEWED') NOT NULL DEFAULT 'PENDING',
  reviewed_at    DATETIME,
  FOREIGN KEY (attempt_id) REFERENCES interview_attempts(id) ON DELETE CASCADE
);
