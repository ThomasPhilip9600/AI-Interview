DROP PROCEDURE IF EXISTS AddDiffCols;

CREATE PROCEDURE AddDiffCols()
BEGIN
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'portfolix_ai_interview' AND TABLE_NAME = 'interview_attempts' AND COLUMN_NAME = 'difficulty') THEN
        ALTER TABLE interview_attempts ADD COLUMN difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner';
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'portfolix_ai_interview' AND TABLE_NAME = 'interview_questions' AND COLUMN_NAME = 'difficulty') THEN
        ALTER TABLE interview_questions ADD COLUMN difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner';
    END IF;
END;

CALL AddDiffCols();

DROP PROCEDURE AddDiffCols;
