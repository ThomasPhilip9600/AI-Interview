CREATE TABLE IF NOT EXISTS interview_questions (
  id                  CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  template_id         CHAR(36)     NOT NULL,
  question_text       TEXT         NOT NULL,
  ideal_answer        TEXT,
  keywords_expected   JSON,
  scoring_rubric      JSON,
  preparation_time    INT          NOT NULL,
  answer_time_limit   INT          NOT NULL,
  difficulty          ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
  max_retakes         INT          NOT NULL DEFAULT 1,
  order_index         INT          NOT NULL,
  FOREIGN KEY (template_id) REFERENCES interview_templates(id) ON DELETE CASCADE
);
