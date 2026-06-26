-- Portfolix AI Interview System Migration
-- Schema Version: 001

CREATE DATABASE IF NOT EXISTS portfolix_interview;
USE portfolix_interview;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- UI/UX, Flutter, Full Stack, Python, etc.
    difficulty VARCHAR(50) NOT NULL, -- Beginner, Intermediate, Advanced
    question_text TEXT NOT NULL,
    preparation_time INT DEFAULT 15, -- preparation time in seconds
    allowed_time INT DEFAULT 60, -- record duration in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'started', -- started, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Answers Table (Hybrid Relational / JSON)
CREATE TABLE IF NOT EXISTS interview_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    video_url VARCHAR(500) NOT NULL,      -- Cloud storage (S3) or local link
    audio_url VARCHAR(500) DEFAULT NULL,   -- Optional link to extracted audio
    transcript TEXT DEFAULT NULL,          -- Text output from Whisper
    
    -- Relational "Glue" / Core Queryable Metrics
    answer_score INT DEFAULT 0,            -- 0 to 100
    speech_score INT DEFAULT 0,            -- 0 to 10
    body_language_score INT DEFAULT 0,     -- 0 to 10
    
    -- Flexible AI Data (Native JSON Column)
    evaluation_data JSON NOT NULL,         -- Stores ai_feedback, refined_answer, and detailed_posture_metrics
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Seed Questions
INSERT INTO questions (category, difficulty, question_text, preparation_time, allowed_time) VALUES
('UI/UX', 'Beginner', 'What is the difference between UI and UX design?', 15, 60),
('UI/UX', 'Intermediate', 'Explain how you conduct user research for a new product concept.', 30, 90),
('UI/UX', 'Advanced', 'How do you design for accessibility (WCAG compliance) in a complex enterprise dashboard?', 30, 120),
('Flutter', 'Beginner', 'What is the difference between a StatelessWidget and a StatefulWidget in Flutter?', 15, 60),
('Flutter', 'Intermediate', 'Explain the Flutter widget lifecycle and how you manage state using Provider or Bloc.', 30, 90),
('Full Stack', 'Intermediate', 'Explain the difference between SQL and NoSQL databases, and when you would choose one over the other.', 30, 90),
('Python', 'Beginner', 'What are list comprehensions in Python and how do you use them?', 15, 60),
('Python', 'Intermediate', 'Explain Python decorators and provide a practical use-case for them.', 30, 90),
('Digital Marketing', 'Beginner', 'What is SEO and what are its primary components?', 15, 60),
('HR', 'Beginner', 'Tell me about yourself and why you are interested in this role.', 15, 60),
('HR', 'Intermediate', 'Describe a time you had a conflict with a team member and how you resolved it.', 30, 90);

-- Insert a Seed User
INSERT INTO users (name, email, role) VALUES
('Default Student', 'student@portfolix.ai', 'student');
