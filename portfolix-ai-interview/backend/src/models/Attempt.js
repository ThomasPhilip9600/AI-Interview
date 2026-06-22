const db = require('../config/db');

class Attempt {
  static async create({ userId, category }) {
    const [result] = await db.query(
      'INSERT INTO attempts (user_id, category, status) VALUES (?, ?, ?)',
      [userId, category, 'started']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM attempts WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    await db.query('UPDATE attempts SET status = ? WHERE id = ?', [status, id]);
  }

  static async getHistory() {
    // In actual MySQL, this joins answers and attempts
    // Our db.js query mock handles this join, as does the MySQL raw statement.
    const sql = `
      SELECT a.*, 
             IFNULL(ROUND(AVG(ans.answer_score)), 0) as avg_score,
             COUNT(ans.id) as answers_count
      FROM attempts a
      LEFT JOIN interview_answers ans ON a.id = ans.attempt_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }
}

module.exports = Attempt;
