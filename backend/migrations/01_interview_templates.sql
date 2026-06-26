CREATE TABLE IF NOT EXISTS interview_templates (
  id              CHAR(36)       PRIMARY KEY DEFAULT (UUID()),
  title           VARCHAR(255)   NOT NULL,
  description     TEXT,
  category        VARCHAR(100)   NOT NULL,
  difficulty      ENUM('BEGINNER','INTERMEDIATE','ADVANCED') NOT NULL,
  interview_type  ENUM('ONE_WAY','CONVERSATIONAL') NOT NULL,
  total_questions INT            NOT NULL,
  min_passing_score INT,
  status          ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  created_by      CHAR(36)       NOT NULL,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
