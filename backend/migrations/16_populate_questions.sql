-- Clear all old attempts, answers, and questions to start with a clean slate
DELETE FROM answer_evaluations;
DELETE FROM speech_reports;
DELETE FROM posture_reports;
DELETE FROM interview_answers;
DELETE FROM interview_attempts;
DELETE FROM interview_questions;

-- Insert 3 questions for each of the 3 difficulties (9 questions total) for each of the 9 templates

-- 1. React Developer (template-react)
INSERT INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) VALUES
-- Beginner
('q_react_b1', 'template-react', 'What is React and what are its core features?', 
 'React is a JavaScript library for building user interfaces. Its core features include the Virtual DOM for performance, JSX for declarative syntax, and a component-based architecture.',
 '{"relevance": "Mention user interfaces", "knowledge": "Mention Virtual DOM, JSX, components"}', 10, 60, 1, 'Beginner'),
('q_react_b2', 'template-react', 'What are React props and how do they differ from state?', 
 'Props are read-only arguments passed from parent to child components, whereas state is a local data store that is managed within the component and can change over time.',
 '{"relevance": "Distinguish props and state", "knowledge": "Props are read-only/passed down, state is internal/mutable"}', 10, 60, 2, 'Beginner'),
('q_react_b3', 'template-react', 'What is the purpose of the key prop in React lists?', 
 'Keys help React identify which items have changed, are added, or are removed. They give elements a stable identity, allowing React to optimize rendering performance.',
 '{"relevance": "Identify changes in lists", "knowledge": "Stable identity, rendering optimization"}', 10, 60, 3, 'Beginner'),
-- Intermediate
('q_react_i1', 'template-react', 'Explain the difference between useMemo and useCallback.', 
 'useMemo caches a computed value between renders, whereas useCallback caches a function definition itself. Both are hooks used to prevent unnecessary re-computations or re-creations.',
 '{"relevance": "Memoization hook difference", "knowledge": "useMemo caches values, useCallback caches functions"}', 15, 90, 1, 'Intermediate'),
('q_react_i2', 'template-react', 'What are custom hooks in React and when should you use them?', 
 'Custom hooks are Javascript functions whose names start with use and that can call other hooks. They are used to share stateful logic between components without duplicating code.',
 '{"relevance": "Explain sharing logic", "knowledge": "Must call other hooks, reuse stateful logic"}', 15, 90, 2, 'Intermediate'),
('q_react_i3', 'template-react', 'Explain the concept of Virtual DOM and how React\'s reconciliation works.', 
 'The Virtual DOM is a lightweight representation of the real DOM. When state changes, React creates a new virtual tree, compares it with the old tree (diffing), and updates only the changed parts in the real DOM (reconciliation).',
 '{"relevance": "Explain Virtual DOM diffing", "knowledge": "Diffing algorithm, reconciliation, selective real DOM updates"}', 15, 90, 3, 'Intermediate'),
-- Advanced
('q_react_a1', 'template-react', 'How do you optimize rendering performance in a large-scale React application?', 
 'Optimization can be achieved using code-splitting (React.lazy/Suspense), memoization (useMemo, useCallback, React.memo), virtualizing long lists (react-window), and avoiding anonymous functions in props.',
 '{"relevance": "Performance tuning React", "knowledge": "Code splitting, virtualization, component memoization"}', 20, 120, 1, 'Advanced'),
('q_react_a2', 'template-react', 'Explain React Server Components (RSC) and how they differ from Client Components.', 
 'Server Components run and render exclusively on the server, resulting in zero-bundle-size for client-side JS. Client Components are traditional components that run on the client and support state/interactivity.',
 '{"relevance": "Contrast RSC and Client components", "knowledge": "Server rendering, zero client-side bundle, backend direct access"}', 20, 120, 2, 'Advanced'),
('q_react_a3', 'template-react', 'What is the React Fiber architecture and how does it enable concurrent features?', 
 'React Fiber is a complete rewrite of the React core algorithm. It introduces incremental rendering, allowing React to pause, resume, or abort rendering work, which enables concurrent features like transition APIs.',
 '{"relevance": "Explain Fiber engine", "knowledge": "Incremental rendering, fiber tree, pause/resume work"}', 20, 120, 3, 'Advanced');


-- 2. UI/UX Designer (template-uiux)
INSERT INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) VALUES
-- Beginner
('q_uiux_b1', 'template-uiux', 'What is the difference between UI and UX?', 
 'UX (User Experience) is the overall feel, flow, and user journey of the product, focusing on solving user problems. UI (User Interface) is the visual design, typography, colors, and interactive elements of the product.',
 '{"relevance": "Contrast UI and UX", "knowledge": "UX = journey/logic, UI = visual/layout"}', 10, 60, 1, 'Beginner'),
('q_uiux_b2', 'template-uiux', 'What are the key principles of visual hierarchy?', 
 'Visual hierarchy guides the user\'s eye to the most important elements. Key principles include size, scale, color contrast, whitespace, alignment, and proximity.',
 '{"relevance": "Define visual elements guiding focus", "knowledge": "Contrast, size, spacing, positioning"}', 10, 60, 2, 'Beginner'),
('q_uiux_b3', 'template-uiux', 'What is the purpose of wireframing in the design process?', 
 'Wireframes are low-fidelity layouts that outline structure, content, and functionality without styling. They help quickly validate layouts and user flows before high-fidelity visual design begins.',
 '{"relevance": "Define wireframe role", "knowledge": "Low-fidelity, structural layout, flow validation"}', 10, 60, 3, 'Beginner'),
-- Intermediate
('q_uiux_i1', 'template-uiux', 'How do you conduct user research before starting a design?', 
 'I start by defining the target audience, then conduct user interviews, surveys, and competitive analysis. I create user personas and user journey maps to understand pain points before wireframing.',
 '{"relevance": "Mention research techniques", "knowledge": "Interviews, surveys, personas, journey maps"}', 15, 90, 1, 'Intermediate'),
('q_uiux_i2', 'template-uiux', 'Explain what a Design System is and why it is important.', 
 'A design system is a collection of reusable components, guided by clear standards, that can be assembled together to build any number of applications. It ensures visual consistency, speeds up development, and maintains brand identity.',
 '{"relevance": "Define design system", "knowledge": "Reusable components, consistency, scalability"}', 15, 90, 2, 'Intermediate'),
('q_uiux_i3', 'template-uiux', 'What is cognitive load and how do you minimize it in your designs?', 
 'Cognitive load is the amount of mental effort required to use a system. We minimize it by using familiar design patterns, simplifying navigation, visual decluttering, chunking information, and progressive disclosure.',
 '{"relevance": "Reducing user mental effort", "knowledge": "Progressive disclosure, visual consistency, clear cues"}', 15, 90, 3, 'Intermediate'),
-- Advanced
('q_uiux_a1', 'template-uiux', 'How do you design for accessibility (WCAG compliance) in complex web apps?', 
 'I ensure sufficient color contrast, keyboard navigability, clear screen reader labels (aria attributes), and responsive layouts that scale gracefully. Accessible design makes apps usable for everyone.',
 '{"relevance": "Accessibility principles", "knowledge": "Contrast ratios, screen readers, semantic tags, keyboard focus"}', 20, 120, 1, 'Advanced'),
('q_uiux_a2', 'template-uiux', 'Explain your process for resolving user testing feedback that contradicts design guidelines.', 
 'I prioritize empirical usability over strict aesthetics. If user testing proves a standardized guideline causes confusion, I create custom alternative layouts and A/B test them to find the most intuitive path.',
 '{"relevance": "Resolving user data vs guidelines", "knowledge": "A/B testing, user intuition over rigid visual standards"}', 20, 120, 2, 'Advanced'),
('q_uiux_a3', 'template-uiux', 'How do you design high-interaction micro-animations to enhance user experience without causing distraction?', 
 'Micro-animations should be functional, not just visual. I use them for feedback (button loaders), status changes, and path guidance. They must have short durations (200-300ms) and use natural easing functions.',
 '{"relevance": "Functional UI animations", "knowledge": "Feedback, transition speeds (ms), natural ease curves"}', 20, 120, 3, 'Advanced');


-- 3. Flutter Developer (template-flutter)
INSERT INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) VALUES
-- Beginner
('q_flutter_b1', 'template-flutter', 'What is the difference between a Stateless and Stateful widget in Flutter?', 
 'A Stateless widget is immutable and its properties cannot change once built. A Stateful widget maintains state that might change during the lifetime of the widget, triggering the build method to update the UI.',
 '{"relevance": "Distinguish between the two widgets", "knowledge": "Stateless = immutable, Stateful = mutable/can call setState"}', 10, 60, 1, 'Beginner'),
('q_flutter_b2', 'template-flutter', 'What is the purpose of the Pubspec.yaml file in a Flutter project?', 
 'The pubspec.yaml file is used to manage dependencies, package versions, and assets (fonts, images) used in the Flutter application.',
 '{"relevance": "Define dependency management file", "knowledge": "Imports packages, defines fonts and image assets"}', 10, 60, 2, 'Beginner'),
('q_flutter_b3', 'template-flutter', 'Explain the difference between hot reload and hot restart.', 
 'Hot reload injects updated code into the running Dart VM, preserving the current state of the app. Hot restart destroys the current state and recreates the app, rebuilding the entire widget tree.',
 '{"relevance": "Distinguish hot reload and restart", "knowledge": "Preserves state vs resets state"}', 10, 60, 3, 'Beginner'),
-- Intermediate
('q_flutter_i1', 'template-flutter', 'Explain the widget lifecycle in a StatefulWidget.', 
 'The lifecycle starts with createState(), then initState(), didChangeDependencies(), build(), and didUpdateWidget(). When removed, it calls deactivate() and finally dispose().',
 '{"relevance": "List lifecycle methods", "knowledge": "Must mention initState, build, and dispose"}', 15, 90, 1, 'Intermediate'),
('q_flutter_i2', 'template-flutter', 'How do keys work in Flutter and when should you use them?', 
 'Keys preserve state when widgets move around in the widget tree. They are used when modifying collections of stateful widgets (like reorderable lists) to help Flutter preserve widget associations.',
 '{"relevance": "Identify widget keys usage", "knowledge": "Preserves state, collections of stateful items, LocalKey vs GlobalKey"}', 15, 90, 2, 'Intermediate'),
('q_flutter_i3', 'template-flutter', 'Explain the difference between packages and plugins in Flutter.', 
 'A package contains pure Dart code. A plugin contains Dart code combined with native platforms code (Kotlin/Swift) to access device APIs like camera, GPS, or storage.',
 '{"relevance": "Distinguish packages and plugins", "knowledge": "Dart code only vs Native wrapper APIs"}', 15, 90, 3, 'Intermediate'),
-- Advanced
('q_flutter_a1', 'template-flutter', 'How do you manage state in a large Flutter application?', 
 'For large applications, passing state down the widget tree is inefficient. I use state management solutions like Provider, Riverpod, or BLoC to separate business logic from the UI and provide state globally.',
 '{"relevance": "Mention state management patterns", "knowledge": "Provider, BLoC, Riverpod, or Redux"}', 20, 120, 1, 'Advanced'),
('q_flutter_a2', 'template-flutter', 'Explain how Flutter\'s rendering pipeline works (Simple, Layout, Paint, Layer).', 
 'Flutter uses its own rendering engine (Impeller/Skia). The pipeline runs: Animate, Build, Layout (constraints go down, sizes go up), Paint (recording painting commands), and Composite (rasterizing layers).',
 '{"relevance": "Explain layout/rendering steps", "knowledge": "Constraints down, sizes up, compositing, rasterization"}', 20, 120, 2, 'Advanced'),
('q_flutter_a3', 'template-flutter', 'How do you implement platform channels to communicate with native iOS/Android code?', 
 'I use MethodChannels for one-off calls (invoking Swift/Kotlin methods) or EventChannels for data streams (receiving battery updates), writing native handlers in AppDelegate/MainActivity.',
 '{"relevance": "Accessing native functionality", "knowledge": "MethodChannel, EventChannel, serialization, native handlers"}', 20, 120, 3, 'Advanced');


-- 4. Full Stack Developer (template-fullstack)
INSERT INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) VALUES
-- Beginner
('q_fs_b1', 'template-fullstack', 'Explain the concept of RESTful APIs.', 
 'RESTful APIs use HTTP requests to GET, PUT, POST, and DELETE data. They are stateless, meaning each request contains all necessary information, and they treat data as resources accessible via standard URIs.',
 '{"relevance": "Define REST", "knowledge": "HTTP methods, statelessness, resources"}', 10, 60, 1, 'Beginner'),
('q_fs_b2', 'template-fullstack', 'What is the difference between SQL and NoSQL databases?', 
 'SQL databases are relational, structured with predefined schemas, and use tables (e.g., PostgreSQL). NoSQL databases are non-relational, schema-less, and store data in documents or key-value pairs (e.g., MongoDB), making them more horizontally scalable.',
 '{"relevance": "Contrast SQL and NoSQL", "knowledge": "Relational vs non-relational, schema vs schema-less, vertical vs horizontal scaling"}', 10, 60, 2, 'Beginner'),
('q_fs_b3', 'template-fullstack', 'What is the difference between client-side rendering and server-side rendering?', 
 'Client-side rendering loads a bare HTML file and populates it with JS in the browser. Server-side rendering compiles HTML with data on the server and delivers ready-to-view HTML pages, improving SEO and initial load speeds.',
 '{"relevance": "CSR vs SSR comparison", "knowledge": "Client compilation vs Server rendering, SEO, hydration"}', 10, 60, 3, 'Beginner'),
-- Intermediate
('q_fs_i1', 'template-fullstack', 'How do you handle authentication and authorization in a web application?', 
 'Authentication verifies who a user is, typically using JWTs (JSON Web Tokens) or session cookies. Authorization determines what they can access, usually implemented via Role-Based Access Control (RBAC) middleware.',
 '{"relevance": "Differentiate AuthN and AuthZ", "knowledge": "JWT, Sessions, RBAC, Middleware"}', 15, 90, 1, 'Intermediate'),
('q_fs_i2', 'template-fullstack', 'Explain the differences between SQL joins (Inner, Left, Right, Full).', 
 'Inner join returns matching records from both tables. Left join returns all records from left table and matching from right. Right join does the opposite. Full join returns all records when there is a match in either.',
 '{"relevance": "Define SQL joins", "knowledge": "Inner, Left, Right, Full records matches"}', 15, 90, 2, 'Intermediate'),
('q_fs_i3', 'template-fullstack', 'What is connection pooling and why is it important in database management?', 
 'Connection pooling maintains a cache of active database connections that can be reused for queries, avoiding the high latency overhead of opening and closing database connections for every request.',
 '{"relevance": "Database connections cache", "knowledge": "Cache of connections, latency reduction, preventing db server overload"}', 15, 90, 3, 'Intermediate'),
-- Advanced
('q_fs_a1', 'template-fullstack', 'How do you design a highly scalable and fault-tolerant system architecture?', 
 'I design with horizontal scaling (load balancers), stateless application layers, caching (Redis), database replicas, auto-scaling groups, and CDN distribution, using failover architectures to guarantee uptime.',
 '{"relevance": "System scalability patterns", "knowledge": "Caching, replication, load balancers, CDN, circuit breakers"}', 20, 120, 1, 'Advanced'),
('q_fs_a2', 'template-fullstack', 'Explain microservices architecture, its benefits, and common patterns like API Gateways.', 
 'Microservices divide an application into independent, decentralized services. Benefits include modular scaling and independent deploys. An API Gateway acts as a reverse proxy, routing requests and handling auth/throttling.',
 '{"relevance": "Microservice system patterns", "knowledge": "API gateway, route matching, decouple, load balancer"}', 20, 120, 2, 'Advanced'),
('q_fs_a3', 'template-fullstack', 'How do you handle data consistency in a distributed microservice system?', 
 'Since transaction scopes are split, I use the Saga pattern (choreography or orchestration) to coordinate multi-step transactions, and event-driven architectures with idempotent handlers.',
 '{"relevance": "Consistency in distributed systems", "knowledge": "Saga pattern, compensations, eventual consistency, event bus"}', 20, 120, 3, 'Advanced');


-- 5. Python Developer (template-python)
INSERT INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) VALUES
-- Beginner
('q_python_b1', 'template-python', 'What are Python list comprehensions and how do they work?', 
 'List comprehensions provide a concise way to create lists using a single line of bracketed syntax. E.g., [x*x for x in list] replaces multi-line loops.',
 '{"relevance": "Define list comprehension", "knowledge": "Syntactic sugar, bracket notation, inline loops"}', 10, 60, 1, 'Beginner'),
('q_python_b2', 'template-python', 'Explain the difference between lists and tuples in Python.', 
 'Lists are mutable (can be changed after creation) and defined with brackets. Tuples are immutable (cannot be changed) and defined with parentheses, making them faster and safe from changes.',
 '{"relevance": "Contrast lists and tuples", "knowledge": "Mutable vs immutable, performance differences"}', 10, 60, 2, 'Beginner'),
('q_python_b3', 'template-python', 'What is PEP 8 and why is it important?', 
 'PEP 8 is the official Python style guide. It defines standards for indenting, line length, naming conventions, and imports to ensure high readability and consistency in codebases.',
 '{"relevance": "Style guide for python", "knowledge": "Readability, naming conventions, formatting conventions"}', 10, 60, 3, 'Beginner'),
-- Intermediate
('q_python_i1', 'template-python', 'What are Python decorators and how do you write a custom one?', 
 'Decorators wrap another function to modify or extend its behavior without changing its source code. They take a function as an argument, define a wrapper, and return it.',
 '{"relevance": "Python decorator pattern", "knowledge": "First-class functions, wrapper functions, @ syntax"}', 15, 90, 1, 'Intermediate'),
('q_python_i2', 'template-python', 'Explain the difference between deepcopy and shallowcopy in Python.', 
 'A shallow copy creates a new object but copies references to nested objects. A deep copy recursively copies the object and all nested objects, resulting in complete independence.',
 '{"relevance": "Cloning objects", "knowledge": "Shallow vs deep references cloning, copying nested structures"}', 15, 90, 2, 'Intermediate'),
('q_python_i3', 'template-python', 'What is the Global Interpreter Lock (GIL) and how does it affect multi-threading?', 
 'The GIL is a mutex that allows only one thread to execute Python bytecodes at a time, preventing race conditions in memory. It prevents multi-threaded Python scripts from using multiple CPU cores for CPU-bound tasks.',
 '{"relevance": "GIL in CPython", "knowledge": "Single-thread execution, CPU-bound block, multi-processing vs threading"}', 15, 90, 3, 'Intermediate'),
-- Advanced
('q_python_a1', 'template-python', 'How does Python\'s memory management work, including garbage collection and reference counting?', 
 'Python uses reference counting to track object instances. When count hits zero, memory is freed. It also runs a generational garbage collector to identify and clean reference cycles.',
 '{"relevance": "CPython memory structures", "knowledge": "Reference counting, generational collector, reference cycles"}', 20, 120, 1, 'Advanced'),
('q_python_a2', 'template-python', 'Explain asynchronous programming in Python using asyncio and how the event loop works.', 
 'asyncio uses coroutines (async/await) and cooperative multitasking. An event loop manages tasks, pausing execution on await operations to run other coroutines without blocking.',
 '{"relevance": "Async python", "knowledge": "Coroutines, event loop, single-threaded concurrency, futures"}', 20, 120, 2, 'Advanced'),
('q_python_a3', 'template-python', 'How do you optimize python application performance and profile memory/CPU utilization?', 
 'I profile bottlenecks using modules like cProfile and memory_profiler, replace loops with built-ins/C-extensions, use generators for large datasets, and use multiprocessing for CPU-bound tasks.',
 '{"relevance": "Profiling and optimization", "knowledge": "cProfile, generators, multiprocessing, cython/built-in options"}', 20, 120, 3, 'Advanced');


-- 6. Digital Marketing (template-marketing)
INSERT INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) VALUES
-- Beginner
('q_mkt_b1', 'template-marketing', 'What is SEO and how does it differ from SEM?', 
 'SEO (Search Engine Optimization) focuses on getting organic, free search traffic through rankings. SEM (Search Engine Marketing) is paid search marketing (e.g., Google Ads) to acquire immediate visits.',
 '{"relevance": "Organic vs paid search traffic", "knowledge": "SEO = rankings/content, SEM = PPC/bidding"}', 10, 60, 1, 'Beginner'),
('q_mkt_b2', 'template-marketing', 'Explain the concept of a sales funnel in digital marketing.', 
 'A sales funnel is the user journey from awareness (top of funnel), to consideration (middle), and finally conversion/purchase (bottom of funnel).',
 '{"relevance": "Stages of purchasing journey", "knowledge": "Awareness, Interest, Consideration, Conversion"}', 10, 60, 2, 'Beginner'),
('q_mkt_b3', 'template-marketing', 'What are key metrics to track in email marketing campaigns?', 
 'Key metrics include Open Rate (percentage of opened emails), Click-Through Rate (CTR) of links, Bounce Rate (undelivered emails), and Conversion Rate (completed goals).',
 '{"relevance": "Email performance analytics", "knowledge": "Open rate, CTR, bounce, unsubscribe"}', 10, 60, 3, 'Beginner'),
-- Intermediate
('q_mkt_i1', 'template-marketing', 'How do you optimize a landing page to improve conversion rates?', 
 'Optimization involves defining a single clear CTA, using concise headings, showing visual proofs/reviews, removing unnecessary form fields, and ensuring fast load times.',
 '{"relevance": "CRO page elements", "knowledge": "Call To Action, social proof, layout simplification"}', 15, 90, 1, 'Intermediate'),
('q_mkt_i2', 'template-marketing', 'Explain the difference between CPM, CPC, and CPA pricing models.', 
 'CPM is Cost Per Mille (cost per 1,000 impressions). CPC is Cost Per Click (pay only when clicked). CPA is Cost Per Acquisition (pay only when a specific action/sale is completed).',
 '{"relevance": "Ad billing models", "knowledge": "CPM = impressions, CPC = clicks, CPA = conversions"}', 15, 90, 2, 'Intermediate'),
('q_mkt_i3', 'template-marketing', 'How do you track user behavior and conversions using Google Tag Manager and Analytics?', 
 'I set up Google Tag Manager trigger templates (e.g., button clicks, pageviews) to fire tags that send structured custom event payloads to GA4 (Google Analytics 4).',
 '{"relevance": "Marketing tag implementation", "knowledge": "Triggers, tags, dataLayer variables, custom events"}', 15, 90, 3, 'Intermediate'),
-- Advanced
('q_mkt_a1', 'template-marketing', 'How do you design an omni-channel attribution model for complex customer journeys?', 
 'I transition from last-click models to data-driven or position-based attribution. By assigning fractional value to touchpoints, we can accurately track user paths across paid search, social, and direct channels.',
 '{"relevance": "Marketing attribution modeling", "knowledge": "First click vs last click, data-driven modeling, fractional credit"}', 20, 120, 1, 'Advanced'),
('q_mkt_a2', 'template-marketing', 'Explain search engine ranking algorithms and your approach to recovering from search updates.', 
 'Search algorithms assess helpful content, user intent, Core Web Vitals, and backlink authority. To recover, I analyze search console data, audit low-quality content, and focus on E-E-A-T guidelines.',
 '{"relevance": "Search ranking factors", "knowledge": "E-E-A-T, Core Web Vitals, backlink audits, helpful content"}', 20, 120, 2, 'Advanced'),
('q_mkt_a3', 'template-marketing', 'How do you use cohort analysis to optimize customer lifetime value (LTV) and reduce churn?', 
 'I segment users into weekly/monthly sign-up cohorts. By analyzing retention curves, I pinpoint exactly when drops happen and launch targeted reactivation emails to optimize value.',
 '{"relevance": "Cohort-based user value optimization", "knowledge": "Retention curves, decay rate, personalized offers, lifecycle tracking"}', 20, 120, 3, 'Advanced');


-- 7. MBA Marketing Internship (template-mba)
INSERT INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) VALUES
-- Beginner
('q_mba_b1', 'template-mba', 'What is the 4P marketing mix and how do you apply it?', 
 'The 4Ps are Product (features/benefits), Price (positioning strategy), Place (channels of distribution), and Promotion (advertising, sales channels).',
 '{"relevance": "Framework definitions", "knowledge": "Product, Price, Place, Promotion"}', 10, 60, 1, 'Beginner'),
('q_mba_b2', 'template-mba', 'What is market segmentation and why is it important?', 
 'Segmentation divides a broad target market into subsets of consumers who share common characteristics (demographics, psychographics, behavior), enabling tailored marketing campaigns.',
 '{"relevance": "Dividing target audiences", "knowledge": "Targeting, demographics, buyer personas"}', 10, 60, 2, 'Beginner'),
('q_mba_b3', 'template-mba', 'Explain the difference between B2B and B2C marketing.', 
 'B2B (Business-to-Business) focus on relationship building, logical rationales, and longer sales cycles. B2C (Business-to-Consumer) focuses on emotional connections, immediate value, and quick sales.',
 '{"relevance": "Contrast business and consumer channels", "knowledge": "Sales cycle length, rational vs emotional triggers"}', 10, 60, 3, 'Beginner'),
-- Intermediate
('q_mba_i1', 'template-mba', 'How do you conduct a competitive market analysis (SWOT/Porter\'s Five Forces)?', 
 'SWOT analyzes internal Strengths/Weaknesses and external Opportunities/Threats. Porter\'s Five Forces looks at competitive rivalry, threat of new entrants, buyer power, supplier power, and threat of substitutes.',
 '{"relevance": "Strategic business frameworks", "knowledge": "SWOT factors, Porters forces definitions"}', 15, 90, 1, 'Intermediate'),
('q_mba_i2', 'template-mba', 'How do you calculate Customer Acquisition Cost (CAC) and Lifetime Value (LTV)?', 
 'CAC = Total Marketing and Sales spend / number of customers acquired. LTV = Average Purchase Value * Purchase Frequency * Customer Lifespan.',
 '{"relevance": "Unit economics calculation", "knowledge": "CAC formula, LTV calculation, LTV:CAC ratio (ideal is 3:1)"}', 15, 90, 2, 'Intermediate'),
('q_mba_i3', 'template-mba', 'How would you design a go-to-market (GTM) strategy for a new product launch?', 
 'A GTM strategy outlines target audience, value proposition, pricing model, marketing channels (digital/traditional), sales readiness, and post-launch customer success paths.',
 '{"relevance": "Product GTM planning", "knowledge": "Value prop, target market, launch timeline, customer feedback loop"}', 15, 90, 3, 'Intermediate'),
-- Advanced
('q_mba_a1', 'template-mba', 'How do you optimize brand positioning and equity in a highly saturated commodity market?', 
 'I differentiate through emotional branding, unique service-layer bundles, values alignment, and visual consistency, shifting the narrative from price-point to unique brand value.',
 '{"relevance": "Commodity market branding", "knowledge": "Brand equity, value-added services, unique selling proposition (USP)"}', 20, 120, 1, 'Advanced'),
('q_mba_a2', 'template-mba', 'Explain your approach to pricing strategies (Value-based, Penetration, Skimming) for software-as-a-service.', 
 'Value-based aligns price with customer perceived value. Penetration uses low introductory rates to capture share. Skimming targets premium buyers first, lowering costs as the market matures.',
 '{"relevance": "SaaS pricing strategies", "knowledge": "Value-based pricing, skimming, penetration, user pricing tiers"}', 20, 120, 2, 'Advanced'),
('q_mba_a3', 'template-mba', 'How do you use marketing analytics and data modeling to forecast campaign ROI and allocate marketing budgets?', 
 'I construct predictive attribution models based on historical channel performance, seasonality, and conversion rates, adjusting spend using media mix modeling (MMM) for optimization.',
 '{"relevance": "Budget planning analytics", "knowledge": "Media Mix Modeling, predictive analytics, channel attribution"}', 20, 120, 3, 'Advanced');


-- 8. General HR (template-hr)
INSERT INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) VALUES
-- Beginner
('q_hr_b1', 'template-hr', 'Tell me about a time you faced a conflict at work and how you resolved it.', 
 'I focus on active listening and empathy. In a past conflict, I scheduled a 1-on-1 meeting to understand my colleague\'s perspective, found common ground regarding our project goals, and compromised on a solution that satisfied both parties.',
 '{"relevance": "Provide a conflict scenario", "knowledge": "Communication, empathy, compromise, professional resolution"}', 10, 60, 1, 'Beginner'),
('q_hr_b2', 'template-hr', 'What are your greatest strengths and weaknesses?', 
 'My greatest strength is my adaptability and quick learning curve. A weakness is that I sometimes struggle with delegating tasks, but I have been actively working on this by using project management tools to better distribute workload.',
 '{"relevance": "State strength and weakness", "knowledge": "Self-awareness, actionable steps taken to improve the weakness"}', 10, 60, 2, 'Beginner'),
('q_hr_b3', 'template-hr', 'Where do you see yourself in 5 years?', 
 'I see myself in a leadership or senior technical role where I can mentor junior team members, drive architectural decisions, and continue contributing to high-impact projects within a forward-thinking company.',
 '{"relevance": "Discuss future goals", "knowledge": "Leadership, growth, contribution to company success"}', 10, 60, 3, 'Beginner'),
-- Intermediate
('q_hr_i1', 'template-hr', 'How do you manage stress and prioritize deadlines when working on multiple projects?', 
 'I prioritize using the Eisenhower Matrix (urgent vs. important) and communicate early with stakeholders if delays arise, managing mental stress through structured work habits and task breakdowns.',
 '{"relevance": "Stress and deadline management", "knowledge": "Eisenhower Matrix, task breakdown, stakeholder communication"}', 15, 90, 1, 'Intermediate'),
('q_hr_i2', 'template-hr', 'Tell me about a time you worked on a team and had to deal with a non-performing member.', 
 'I initiate a private conversation to see if they are facing personal/technical blocks. I support them by explaining expectations clearly, and collaborate on a task plan to get their delivery back on track.',
 '{"relevance": "Peer performance issue", "knowledge": "Non-confrontational, collaborative solutions, clarity on expectations"}', 15, 90, 2, 'Intermediate'),
('q_hr_i3', 'template-hr', 'How do you approach giving constructive feedback to a peer or manager?', 
 'I use the Situation-Behavior-Impact (SBI) framework. I state the facts, explain the impact it had on the project, and suggest a collaborative solution, ensuring the conversation remains objective.',
 '{"relevance": "Feedback delivery method", "knowledge": "SBI framework, factual framing, growth-mindset focus"}', 15, 90, 3, 'Intermediate'),
-- Advanced
('q_hr_a1', 'template-hr', 'Tell me about a time you had to lead a change initiative within a team and overcame resistance.', 
 'I secure alignment by communicating the "why" behind the change, involving team members in the transition plan to build ownership, and showing small quick wins to demonstrate the benefits.',
 '{"relevance": "Leading change and overcoming friction", "knowledge": "Transparency, collaborative onboarding, quick-wins strategy"}', 20, 120, 1, 'Advanced'),
('q_hr_a2', 'template-hr', 'How do you maintain cross-functional collaboration and alignment across remote or global teams?', 
 'I implement clear documentation processes (asynchronous alignment), establish standardized messaging channels, schedule occasional overlapping touchpoints, and define clear milestones.',
 '{"relevance": "Global team collaboration", "knowledge": "Asynchronous communication, structured tooling, documentation"}', 20, 120, 2, 'Advanced'),
('q_hr_a3', 'template-hr', 'How do you resolve ethical dilemmas or compliance issues in the workplace?', 
 'I analyze the situation against company code of conduct, seek guidance through appropriate reporting channels (HR/compliance leaders), and maintain strict confidentiality throughout the resolution.',
 '{"relevance": "Resolving ethical issues", "knowledge": "Company code, HR policies, reporting protocols, professional integrity"}', 20, 120, 3, 'Advanced');


-- 9. Portfolio Review (template-portfolio)
INSERT INTO interview_questions (id, template_id, question_text, ideal_answer, scoring_rubric, preparation_time, answer_time_limit, order_index, difficulty) VALUES
-- Beginner
('q_port_b1', 'template-portfolio', 'What is the most interesting project in your portfolio and why?', 
 'My most interesting project is a containerized web portal. I chose it because it solved a real user problem, required integrating multiple APIs, and taught me a lot about systems deployment.',
 '{"relevance": "Explain choice of project", "knowledge": "Real use case, tech integration, learnings"}', 10, 60, 1, 'Beginner'),
('q_port_b2', 'template-portfolio', 'Describe the technologies you chose for your primary portfolio project.', 
 'For my primary project, I used React for the frontend due to its component reusability, Node.js/Express for API development, and PostgreSQL because of its structured database capabilities.',
 '{"relevance": "Technology choices rationale", "knowledge": "React, Node, relational databases"}', 10, 60, 2, 'Beginner'),
('q_port_b3', 'template-portfolio', 'What was the biggest challenge you faced in your recent project?', 
 'The biggest challenge was integrating real-time audio analysis. I resolved it by reading browser MediaRecorder specifications, adding debounces, and building structured callback handlers.',
 '{"relevance": "Technical blocker solved", "knowledge": "Gaining information, testing solutions, structuring code"}', 10, 60, 3, 'Beginner'),
-- Intermediate
('q_port_i1', 'template-portfolio', 'How do you decide which features to build and prioritize in a project?', 
 'I prioritize using the MoSCoW framework (Must have, Should have, Could have, Won\'t have) or ICE scoring (Impact, Confidence, Ease), focusing on delivering the core MVP first.',
 '{"relevance": "Feature prioritization processes", "knowledge": "MoSCoW, ICE, Minimum Viable Product"}', 15, 90, 1, 'Intermediate'),
('q_port_i2', 'template-portfolio', 'Explain a design trade-off you had to make in one of your projects.', 
 'In my mock interview project, I chose web browser-based recording over server-side transcodes to save server infrastructure cost and lower latency, even though it meant less file type control.',
 '{"relevance": "Design decisions trade-offs", "knowledge": "Cost vs control, browser capabilities vs server resources"}', 15, 90, 2, 'Intermediate'),
('q_port_i3', 'template-portfolio', 'How do you handle unit testing and code quality in your projects?', 
 'I write unit tests using Jest, configure ESLint for code style alignment, and set up git hooks to run formatting and lint checks automatically before commits.',
 '{"relevance": "Testing and CI/CD tools", "knowledge": "Jest, ESLint, Git hooks, test coverage"}', 15, 90, 3, 'Intermediate'),
-- Advanced
('q_port_a1', 'template-portfolio', 'Walk me through the system design and architecture of your most complex portfolio project.', 
 'The project utilizes a load-balanced frontend, a microservices backend communicating via an event bus, a primary database replica configuration, and MinIO object storage for media files.',
 '{"relevance": "High-level architecture layout", "knowledge": "Load balancing, event bus, database replication, object storage"}', 20, 120, 1, 'Advanced'),
('q_port_a2', 'template-portfolio', 'How did you monitor, measure, and optimize performance/latency in production for your projects?', 
 'I implemented tracing, measured API latency using APM tools, optimized slow database queries by adding indexes, and used CDNs to serve static frontend files closer to user locations.',
 '{"relevance": "Production optimization checks", "knowledge": "CDNs, APMs, query indexing, caching"}', 20, 120, 2, 'Advanced'),
('q_port_a3', 'template-portfolio', 'Explain how you managed technical debt versus feature delivery in your major projects.', 
 'I dedicate 20% of every development sprint to refactoring and debt reduction, documenting issues in a backlog, and using static analysis tools to maintain a clean codebase.',
 '{"relevance": "Technical debt management", "knowledge": "Sprint scheduling, code analysis metrics, product priorities"}', 20, 120, 3, 'Advanced');
