ALTER TABLE interview_attempts
ADD COLUMN self_intro_duration INT DEFAULT 0;

ALTER TABLE interview_answers
MODIFY COLUMN question_id CHAR(36) NULL;
