const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigrations() {
  console.log('Starting automated migrations...');
  
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'portfolix_ai_interview',
    multipleStatements: true // Required to run multi-query SQL files
  });

  try {
    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sorts by name, so 01_..., 02_... order is maintained

    for (const file of files) {
      console.log(`Executing migration: ${file}`);
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        // Execute the sql
        await pool.query(sql);
        console.log(`Successfully migrated: ${file}`);
      } catch (err) {
        console.warn(`Migration ${file} failed or was already applied: ${err.message}`);
      }
    }
    
    console.log('All migrations completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigrations();
