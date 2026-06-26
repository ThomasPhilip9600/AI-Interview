CREATE TABLE IF NOT EXISTS interview_attempts (
  id                  CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  user_id             CHAR(36)    NOT NULL,
  template_id         CHAR(36)    NOT NULL,
  status              ENUM('IN_PROGRESS','COMPLETED','ABANDONED') NOT NULL DEFAULT 'IN_PROGRESS',
  difficulty          ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
  final_score         FLOAT,
  answer_score        FLOAT,
  speech_score        FLOAT,
  body_language_score FLOAT,
  started_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at        DATETIME,
  FOREIGN KEY (template_id) REFERENCES interview_templates(id)
);
