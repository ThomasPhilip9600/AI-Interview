-- We cannot safely DELETE FROM interview_templates because attempts reference it.
-- Instead, we use INSERT IGNORE for idempotency.

-- Create templates (ignores if it already exists)
INSERT IGNORE INTO interview_templates (id, title, category, difficulty, interview_type, total_questions, min_passing_score, description, status, created_by) 
VALUES 
('template-react', 'React Developer Interview', 'Frontend', 'BEGINNER', 'ONE_WAY', 3, 50, 'Core React concepts including state, props, and hooks.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111'),
('template-uiux', 'UI/UX Designer Interview', 'Design', 'INTERMEDIATE', 'ONE_WAY', 3, 50, 'Focuses on user research, wireframing, and design systems.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111'),
('template-flutter', 'Flutter Developer Interview', 'Mobile', 'INTERMEDIATE', 'ONE_WAY', 3, 50, 'Dart, state management, and widget lifecycle in Flutter.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111'),
('template-fullstack', 'Full Stack Developer Interview', 'Engineering', 'ADVANCED', 'ONE_WAY', 3, 50, 'System design, API architecture, and database management.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111'),
('template-python', 'Python Developer Interview', 'Backend', 'INTERMEDIATE', 'ONE_WAY', 3, 50, 'Python data structures, Django/FastAPI, and asynchronous programming.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111'),
('template-marketing', 'Digital Marketing Interview', 'Marketing', 'BEGINNER', 'ONE_WAY', 3, 50, 'SEO, SEM, and content strategy fundamentals.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111'),
('template-mba', 'MBA Marketing Internship Interview', 'Business', 'INTERMEDIATE', 'ONE_WAY', 3, 50, 'Market analysis, campaign strategy, and brand positioning.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111'),
('template-hr', 'General HR Interview', 'Human Resources', 'BEGINNER', 'ONE_WAY', 3, 50, 'Behavioral questions, cultural fit, and conflict resolution.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111'),
('template-portfolio', 'Portfolio Review Interview', 'General', 'INTERMEDIATE', 'ONE_WAY', 3, 50, 'Deep dive into past projects and practical experience.', 'PUBLISHED', '11111111-1111-1111-1111-111111111111');

-- Insert questions of varying difficulties with strict rubrics
INSERT IGNORE INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) 
VALUES 
-- React Developer (Beginner/Intermediate/Advanced)
('q_react_1', 'template-react', 'What is React and what are its core features?', 
 'React is a JavaScript library for building user interfaces. Its core features include the Virtual DOM for performance, JSX for declarative syntax, and a component-based architecture.', 
 '{"relevance": "Must mention building user interfaces or frontends", "knowledge": "Must mention Virtual DOM, JSX, and components", "missing_penalty": "Penalize heavily if Virtual DOM is not mentioned"}', 
 10, 60, 1, 'Beginner'),

('q_react_2', 'template-react', 'What are React props and how do they differ from state?', 
 'Props are read-only arguments passed from parent to child components, whereas state is a local data store that is managed within the component and can change over time. State changes trigger re-renders.', 
 '{"relevance": "Must distinguish between props and state", "knowledge": "Must state that props are passed down/read-only and state is internal/mutable", "missing_penalty": "Penalize if they don\'t mention re-rendering on state change"}', 
 10, 60, 2, 'Beginner'),

('q_react_3', 'template-react', 'Explain the difference between useMemo and useCallback.', 
 'useMemo is used to memoize a calculated value so it is not re-calculated on every render, while useCallback is used to memoize a function definition so it is not recreated on every render. Both are used for performance optimization.', 
 '{"relevance": "Must address both hooks", "knowledge": "useMemo caches values, useCallback caches functions", "missing_penalty": "Penalize if they fail to mention performance optimization or re-renders"}', 
 15, 90, 3, 'Intermediate'),


-- UI/UX Designer
('q_uiux_1', 'template-uiux', 'What is the difference between UI and UX?', 
 'UX (User Experience) is the overall feel, flow, and user journey of the product, focusing on solving user problems. UI (User Interface) is the visual design, typography, colors, and interactive elements of the product.', 
 '{"relevance": "Must contrast UI and UX", "knowledge": "UX = journey/logic, UI = visual/layout"}', 
 10, 60, 1, 'Beginner'),

('q_uiux_2', 'template-uiux', 'How do you conduct user research before starting a design?', 
 'I start by defining the target audience, then conduct user interviews, surveys, and competitive analysis. I create user personas and user journey maps to understand pain points before wireframing.', 
 '{"relevance": "Must mention research techniques", "knowledge": "Interviews, surveys, personas, journey maps"}', 
 15, 90, 2, 'Intermediate'),

('q_uiux_3', 'template-uiux', 'Explain what a Design System is and why it is important.', 
 'A design system is a collection of reusable components, guided by clear standards, that can be assembled together to build any number of applications. It ensures visual consistency, speeds up development, and maintains brand identity.', 
 '{"relevance": "Define design system", "knowledge": "Reusable components, consistency, scalability"}', 
 15, 90, 3, 'Intermediate'),


-- Flutter Developer
('q_flutter_1', 'template-flutter', 'What is the difference between a Stateless and Stateful widget in Flutter?', 
 'A Stateless widget is immutable and its properties cannot change once built. A Stateful widget maintains state that might change during the lifetime of the widget, triggering the build method to update the UI.', 
 '{"relevance": "Distinguish between the two widgets", "knowledge": "Stateless = immutable, Stateful = mutable/can call setState"}', 
 10, 60, 1, 'Beginner'),

('q_flutter_2', 'template-flutter', 'Explain the widget lifecycle in a StatefulWidget.', 
 'The lifecycle starts with createState(), then initState(), didChangeDependencies(), build(), and didUpdateWidget(). When removed, it calls deactivate() and finally dispose().', 
 '{"relevance": "List lifecycle methods", "knowledge": "Must mention initState, build, and dispose"}', 
 15, 90, 2, 'Intermediate'),

('q_flutter_3', 'template-flutter', 'How do you manage state in a large Flutter application?', 
 'For large applications, passing state down the widget tree is inefficient. I use state management solutions like Provider, Riverpod, or BLoC to separate business logic from the UI and provide state globally.', 
 '{"relevance": "Mention state management patterns", "knowledge": "Provider, BLoC, Riverpod, or Redux"}', 
 20, 120, 3, 'Advanced'),


-- Full Stack Developer
('q_fs_1', 'template-fullstack', 'Explain the concept of RESTful APIs.', 
 'RESTful APIs use HTTP requests to GET, PUT, POST, and DELETE data. They are stateless, meaning each request contains all necessary information, and they treat data as resources accessible via standard URIs.', 
 '{"relevance": "Define REST", "knowledge": "HTTP methods, statelessness, resources"}', 
 10, 60, 1, 'Beginner'),

('q_fs_2', 'template-fullstack', 'What is the difference between SQL and NoSQL databases?', 
 'SQL databases are relational, structured with predefined schemas, and use tables (e.g., PostgreSQL). NoSQL databases are non-relational, schema-less, and store data in documents or key-value pairs (e.g., MongoDB), making them more horizontally scalable.', 
 '{"relevance": "Contrast SQL and NoSQL", "knowledge": "Relational vs non-relational, schema vs schema-less, vertical vs horizontal scaling"}', 
 15, 90, 2, 'Intermediate'),

('q_fs_3', 'template-fullstack', 'How do you handle authentication and authorization in a web application?', 
 'Authentication verifies who a user is, typically using JWTs (JSON Web Tokens) or session cookies. Authorization determines what they can access, usually implemented via Role-Based Access Control (RBAC) middleware.', 
 '{"relevance": "Differentiate AuthN and AuthZ", "knowledge": "JWT, Sessions, RBAC, Middleware"}', 
 20, 120, 3, 'Advanced'),


-- General HR Interview
('q_hr_1', 'template-hr', 'Tell me about a time you faced a conflict at work and how you resolved it.', 
 'I focus on active listening and empathy. In a past conflict, I scheduled a 1-on-1 meeting to understand my colleague\'s perspective, found common ground regarding our project goals, and compromised on a solution that satisfied both technical requirements and deadlines.', 
 '{"relevance": "Provide a conflict scenario", "knowledge": "Communication, empathy, compromise, professional resolution"}', 
 10, 60, 1, 'Beginner'),

('q_hr_2', 'template-hr', 'What are your greatest strengths and weaknesses?', 
 'My greatest strength is my adaptability and quick learning curve. A weakness is that I sometimes struggle with delegating tasks, but I have been actively working on this by using project management tools to better distribute workload.', 
 '{"relevance": "State strength and weakness", "knowledge": "Self-awareness, actionable steps taken to improve the weakness"}', 
 10, 60, 2, 'Beginner'),

('q_hr_3', 'template-hr', 'Where do you see yourself in 5 years?', 
 'I see myself in a leadership or senior technical role where I can mentor junior team members, drive architectural decisions, and continue contributing to high-impact projects within a forward-thinking company.', 
 '{"relevance": "Discuss future goals", "knowledge": "Leadership, growth, contribution to company success"}', 
 10, 60, 3, 'Beginner');
