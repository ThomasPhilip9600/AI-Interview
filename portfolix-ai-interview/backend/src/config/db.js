const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool = null;
let useLocalDb = false;

// Path to file database fallback
const LOCAL_DB_DIR = path.join(__dirname, '..', '..', 'data');
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, 'db.json');

// Default Seed Data
const defaultQuestions = [
  { id: 1, category: 'UI/UX', difficulty: 'Beginner', question_text: 'What is the difference between UI and UX design?', preparation_time: 15, allowed_time: 60 },
  { id: 2, category: 'UI/UX', difficulty: 'Intermediate', question_text: 'Explain how you conduct user research for a new product concept.', preparation_time: 30, allowed_time: 90 },
  { id: 3, category: 'UI/UX', difficulty: 'Advanced', question_text: 'How do you design for accessibility (WCAG compliance) in a complex enterprise dashboard?', preparation_time: 30, allowed_time: 120 },
  { id: 4, category: 'Flutter', difficulty: 'Beginner', question_text: 'What is the difference between a StatelessWidget and a StatefulWidget in Flutter?', preparation_time: 15, allowed_time: 60 },
  { id: 5, category: 'Flutter', difficulty: 'Intermediate', question_text: 'Explain the Flutter widget lifecycle and how you manage state using Provider or Bloc.', preparation_time: 30, allowed_time: 90 },
  { id: 6, category: 'Full Stack', difficulty: 'Intermediate', question_text: 'Explain the difference between SQL and NoSQL databases, and when you would choose one over the other.', preparation_time: 30, allowed_time: 90 },
  { id: 7, category: 'Python', difficulty: 'Beginner', question_text: 'What are list comprehensions in Python and how do you use them?', preparation_time: 15, allowed_time: 60 },
  { id: 8, category: 'Python', difficulty: 'Intermediate', question_text: 'Explain Python decorators and provide a practical use-case for them.', preparation_time: 30, allowed_time: 90 },
  { id: 9, category: 'Digital Marketing', difficulty: 'Beginner', question_text: 'What is SEO and what are its primary components?', preparation_time: 15, allowed_time: 60 },
  { id: 10, category: 'HR', difficulty: 'Beginner', question_text: 'Tell me about yourself and why you are interested in this role.', preparation_time: 15, allowed_time: 60 },
  { id: 11, category: 'HR', difficulty: 'Intermediate', question_text: 'Describe a time you had a conflict with a team member and how you resolved it.', preparation_time: 30, allowed_time: 90 }
];

const defaultUsers = [
  { id: 1, name: 'Default Student', email: 'student@portfolix.ai', role: 'student', created_at: new Date().toISOString() }
];

function initLocalDb() {
  if (!fs.existsSync(LOCAL_DB_DIR)) {
    fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    const initialData = {
      users: defaultUsers,
      questions: defaultQuestions,
      attempts: [],
      interview_answers: []
    };
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readLocalDb() {
  initLocalDb();
  const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeLocalDb(data) {
  initLocalDb();
  fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2));
}

// Local DB Query engine mapping simple SQL commands to JSON mutations
async function localQuery(sql, params = []) {
  const data = readLocalDb();
  const sqlNormalized = sql.trim().replace(/\s+/g, ' ').toUpperCase();

  // 1. SELECT FROM QUESTIONS
  if (sqlNormalized.includes('SELECT * FROM QUESTIONS') || sqlNormalized.includes('SELECT FROM QUESTIONS')) {
    return [data.questions];
  }

  // 2. SELECT FROM USERS WHERE EMAIL = ?
  if (sqlNormalized.includes('SELECT * FROM USERS WHERE EMAIL =') || sqlNormalized.includes('FROM USERS WHERE EMAIL =')) {
    const email = params[0];
    const match = data.users.filter(u => u.email === email);
    return [match];
  }

  // 3. SELECT FROM USERS WHERE ID = ?
  if (sqlNormalized.includes('SELECT * FROM USERS WHERE ID =') || sqlNormalized.includes('FROM USERS WHERE ID =')) {
    const id = parseInt(params[0]);
    const match = data.users.filter(u => u.id === id);
    return [match];
  }

  // 4. INSERT INTO ATTEMPTS
  if (sqlNormalized.includes('INSERT INTO ATTEMPTS')) {
    // INSERT INTO attempts (user_id, category, status) VALUES (?, ?, ?)
    const userId = parseInt(params[0]);
    const category = params[1];
    const status = params[2] || 'started';
    const newId = data.attempts.length > 0 ? Math.max(...data.attempts.map(a => a.id)) + 1 : 1;
    const newAttempt = {
      id: newId,
      user_id: userId,
      category,
      status,
      created_at: new Date().toISOString()
    };
    data.attempts.push(newAttempt);
    writeLocalDb(data);
    return [{ insertId: newId }];
  }

  // 5. UPDATE ATTEMPTS SET STATUS = ?
  if (sqlNormalized.includes('UPDATE ATTEMPTS SET STATUS =')) {
    // UPDATE attempts SET status = ? WHERE id = ?
    const status = params[0];
    const attemptId = parseInt(params[1]);
    const attempt = data.attempts.find(a => a.id === attemptId);
    if (attempt) {
      attempt.status = status;
      writeLocalDb(data);
    }
    return [{ affectedRows: attempt ? 1 : 0 }];
  }

  // 6. SELECT ATTEMPTS & ANSWERS JOIN FOR HISTORY
  if (sqlNormalized.includes('FROM ATTEMPTS') && sqlNormalized.includes('ORDER BY CREATED_AT')) {
    // This is the history retrieval
    // Join attempts with users or answers to show aggregated stats
    const results = data.attempts.map(attempt => {
      const answers = data.interview_answers.filter(ans => ans.attempt_id === attempt.id);
      let avgScore = 0;
      if (answers.length > 0) {
        const sum = answers.reduce((acc, a) => acc + (a.answer_score || 0), 0);
        avgScore = Math.round(sum / answers.length);
      }
      return {
        ...attempt,
        avg_score: avgScore,
        answers_count: answers.length
      };
    });
    // Sort descending by created_at
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [results];
  }

  // 7. SELECT FROM ATTEMPTS WHERE ID = ?
  if (sqlNormalized.includes('SELECT * FROM ATTEMPTS WHERE ID =')) {
    const id = parseInt(params[0]);
    const match = data.attempts.filter(a => a.id === id);
    return [match];
  }

  // 8. INSERT INTO INTERVIEW_ANSWERS
  if (sqlNormalized.includes('INSERT INTO INTERVIEW_ANSWERS')) {
    // INSERT INTO interview_answers (attempt_id, question_id, video_url, audio_url, transcript, answer_score, speech_score, body_language_score, evaluation_data)
    const newId = data.interview_answers.length > 0 ? Math.max(...data.interview_answers.map(a => a.id)) + 1 : 1;
    const newAnswer = {
      id: newId,
      attempt_id: parseInt(params[0]),
      question_id: parseInt(params[1]),
      video_url: params[2],
      audio_url: params[3],
      transcript: params[4],
      answer_score: parseInt(params[5] || 0),
      speech_score: parseInt(params[6] || 0),
      body_language_score: parseInt(params[7] || 0),
      evaluation_data: typeof params[8] === 'string' ? JSON.parse(params[8]) : params[8],
      created_at: new Date().toISOString()
    };
    data.interview_answers.push(newAnswer);
    writeLocalDb(data);
    return [{ insertId: newId }];
  }

  // 9. SELECT JOIN INTERVIEW_ANSWERS & QUESTIONS
  if (sqlNormalized.includes('FROM INTERVIEW_ANSWERS') && sqlNormalized.includes('JOIN QUESTIONS')) {
    // SELECT a.*, q.question_text, q.category, q.difficulty FROM interview_answers a JOIN questions q ON a.question_id = q.id WHERE a.attempt_id = ?
    const attemptId = parseInt(params[0]);
    const answers = data.interview_answers.filter(ans => ans.attempt_id === attemptId);
    const results = answers.map(ans => {
      const q = data.questions.find(qItem => qItem.id === ans.question_id) || {};
      return {
        ...ans,
        question_text: q.question_text || '',
        category: q.category || '',
        difficulty: q.difficulty || ''
      };
    });
    return [results];
  }

  console.log(`Local DB: Unhandled SQL command query: "${sql}"`);
  return [[]];
}

// Primary DB configuration logic
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolix_interview',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function query(sql, params = []) {
  if (useLocalDb) {
    return localQuery(sql, params);
  }

  if (!pool) {
    if (!process.env.DB_HOST) {
      console.log('No MySQL host provided in env. Falling back to local JSON database.');
      useLocalDb = true;
      initLocalDb();
      return localQuery(sql, params);
    }

    try {
      pool = mysql.createPool(dbConfig);
      // Test the pool connection
      const conn = await pool.getConnection();
      conn.release();
      console.log('Successfully connected to MySQL Database.');
    } catch (err) {
      console.error('MySQL connection failed. Falling back to local JSON database. Error:', err.message);
      useLocalDb = true;
      initLocalDb();
      return localQuery(sql, params);
    }
  }

  try {
    return await pool.query(sql, params);
  } catch (err) {
    console.error('MySQL Query error. Falling back to local JSON DB. Error:', err.message);
    useLocalDb = true;
    initLocalDb();
    return localQuery(sql, params);
  }
}

module.exports = {
  query
};
