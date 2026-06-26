-- We cannot safely DELETE FROM interview_templates because attempts reference it.
-- Instead, we use INSERT IGNORE for idempotency.

-- Create a template (ignores if it already exists)
INSERT IGNORE INTO interview_templates (id, title, category, difficulty, interview_type, total_questions, min_passing_score, description, status, created_by) 
VALUES ('template-sql', 'React Developer (Seed Data)', 'Frontend', 'BEGINNER', 'ONE_WAY', 3, 50, 'Automatically seeded questions for all difficulties.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111');

-- Update total count just in case
UPDATE interview_templates SET total_questions = 3 WHERE id = 'template-sql';

-- Insert questions of varying difficulties (ignores if already exists)
INSERT IGNORE INTO interview_questions (id, template_id, question_text, preparation_time, answer_time_limit, order_index, difficulty) 
VALUES 
-- Beginner (3 questions)
('q_b1', 'template-sql', 'What is React and what are its core features?', 10, 60, 1, 'Beginner'),
('q_b2', 'template-sql', 'What are React props and how do they differ from state?', 10, 60, 2, 'Beginner'),
('q_b3', 'template-sql', 'Explain what JSX is and why it is used in React.', 10, 60, 3, 'Beginner'),

-- Intermediate (3 questions)
('q_i1', 'template-sql', 'Explain the difference between useMemo and useCallback. When would you use each?', 15, 90, 1, 'Intermediate'),
('q_i2', 'template-sql', 'Describe the React component lifecycle methods for class components.', 15, 90, 2, 'Intermediate'),
('q_i3', 'template-sql', 'What are React Hooks? Explain useState and useEffect.', 15, 90, 3, 'Intermediate'),

-- Advanced (3 questions)
('q_a1', 'template-sql', 'Describe a complex scenario where you had to manage state across multiple disjoint components. How did you optimize renders?', 20, 120, 1, 'Advanced'),
('q_a2', 'template-sql', 'How does React Fiber architecture improve performance?', 20, 120, 2, 'Advanced'),
('q_a3', 'template-sql', 'Explain the concept of Higher Order Components (HOCs) and provide a use case.', 20, 120, 3, 'Advanced');
