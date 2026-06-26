const cron = require('node-cron');
const db = require('../config/db');
const storage = require('../services/storage');

/**
 * Background job to permanently delete expired MinIO files
 * as per Section 4 of database_guide.md
 */
async function purgeExpiredAnswers() {
  console.log('[Purge Job] Running daily cleanup for expired answers...');
  try {
    const [expired] = await db.query(
      'SELECT id, video_url, audio_url FROM interview_answers WHERE is_deleted = TRUE AND purge_at <= NOW()'
    );

    if (expired.length === 0) {
      console.log('[Purge Job] No expired answers to purge today.');
      return;
    }

    for (const answer of expired) {
      try {
        if (answer.video_url) {
          await storage.removeFile(answer.video_url);
        }
        if (answer.audio_url) {
          await storage.removeFile(answer.audio_url);
        }
        // Null the URL columns so the row survives with scores and transcript, but files are gone
        await db.query(
          'UPDATE interview_answers SET video_url = NULL, audio_url = NULL WHERE id = ?',
          [answer.id]
        );
        console.log(`[Purge Job] Successfully purged files for answer ID: ${answer.id}`);
      } catch (err) {
        console.error(`[Purge Job] Failed to purge files for answer ${answer.id}:`, err.message);
      }
    }
  } catch (dbError) {
    console.error('[Purge Job] Database error during purge execution:', dbError.message);
  }
}

// Run once daily at 3am
cron.schedule('0 3 * * *', purgeExpiredAnswers);

module.exports = {
  purgeExpiredAnswers
};
