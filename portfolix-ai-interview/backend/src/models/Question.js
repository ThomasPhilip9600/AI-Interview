const db = require('../config/db');

class Question {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM questions');
    return rows;
  }
}

module.exports = Question;
