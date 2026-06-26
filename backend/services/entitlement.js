const db = require('../config/db');

/**
 * Checks if a user is allowed to start an interview based on the entitlement logic
 * specified in Section 5 of database_guide.md
 * @param {string} userId - The student's user ID
 * @returns {Promise<{allowed: boolean, reason: string}>}
 */
async function canStartInterview(userId) {
  const [rows] = await db.query('SELECT * FROM user_entitlements WHERE user_id = ?', [userId]);
  const entitlement = rows[0];

  // If no record exists, they get their first free attempt
  if (!entitlement) return { allowed: true, reason: 'free_attempt' };

  if (entitlement.is_subscribed && new Date(entitlement.subscription_expires_at) > new Date()) {
    return { allowed: true, reason: 'subscription' };
  }
  if (entitlement.free_attempts_used < entitlement.free_attempts_limit) {
    return { allowed: true, reason: 'free_attempt' };
  }
  if (entitlement.paid_credits > 0) {
    return { allowed: true, reason: 'paid_credit' };
  }
  return { allowed: false, reason: 'payment_required' };
}

/**
 * Consumes an entitlement credit or attempt after an interview attempt starts
 * @param {string} userId - The student's user ID
 * @param {string} reason - The reason code returned by canStartInterview
 */
async function consumeEntitlement(userId, reason) {
  const [rows] = await db.query('SELECT * FROM user_entitlements WHERE user_id = ?', [userId]);
  const entitlement = rows[0];

  // If no entitlement record exists, create one and mark 1 free attempt used
  if (!entitlement) {
    await db.query(
      `INSERT INTO user_entitlements (user_id, free_attempts_used, free_attempts_limit, paid_credits, is_subscribed) 
       VALUES (?, 1, 1, 0, FALSE)`,
      [userId]
    );
    return;
  }

  if (reason === 'free_attempt') {
    await db.query(
      'UPDATE user_entitlements SET free_attempts_used = free_attempts_used + 1 WHERE user_id = ?',
      [userId]
    );
  } else if (reason === 'paid_credit') {
    await db.query(
      'UPDATE user_entitlements SET paid_credits = paid_credits - 1 WHERE user_id = ?',
      [userId]
    );
  }
  // If 'subscription', nothing is deducted
}

module.exports = {
  canStartInterview,
  consumeEntitlement
};
