-- Allow question_id to be NULL for self-intro answers
ALTER TABLE interview_answers MODIFY question_id CHAR(36) NULL;
