/**
 * Utility to extract user_id from requests.
 * This is a stub where the parent site's auth will hook in later.
 * Currently, it extracts user_id from query parameters or body, with no token validation.
 * No auth middleware or JWT logic is needed as per constraints.
 */
function getUserId(req) {
  // Try to find user_id in query, body, or headers
  const userId = req.query.user_id || req.body.user_id || req.headers['x-user-id'];
  
  // For development, if no user_id is passed, use a hardcoded default testing UUID
  if (!userId) {
    return '11111111-1111-1111-1111-111111111111';
  }
  
  return userId;
}

module.exports = { getUserId };
