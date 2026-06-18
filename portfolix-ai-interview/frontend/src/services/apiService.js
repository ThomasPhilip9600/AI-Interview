const API_BASE = '/api';

export const apiService = {
  /**
   * Fetch all questions grouped by category.
   */
  async getQuestions() {
    const res = await fetch(`${API_BASE}/questions`);
    if (!res.ok) throw new Error('Failed to load questions.');
    return res.json();
  },

  /**
   * Start a new interview attempt for a candidate.
   * @param {string} category - Category name (e.g. 'UI/UX')
   * @param {string} email - Student email
   */
  async startAttempt(category, email) {
    const res = await fetch(`${API_BASE}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, email })
    });
    if (!res.ok) throw new Error('Failed to start interview.');
    return res.json();
  },

  /**
   * Upload video and posture evaluation metrics for a question in an attempt.
   * @param {number|string} attemptId - Active attempt database ID
   * @param {number|string} questionId - Current question database ID
   * @param {Blob} videoBlob - The recorded WebM video blob
   * @param {Object} postureData - Score and metrics object computed by postureScorer
   */
  async submitAnswer(attemptId, questionId, videoBlob, postureData) {
    const formData = new FormData();
    formData.append('video', videoBlob, 'recording.webm');
    formData.append('questionId', questionId);
    formData.append('postureData', JSON.stringify(postureData));

    const res = await fetch(`${API_BASE}/attempts/${attemptId}/answers`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to submit answer.');
    return res.json();
  },

  /**
   * Mark attempt as completed.
   */
  async completeAttempt(attemptId) {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/complete`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to complete interview.');
    return res.json();
  },

  /**
   * Fetch list of previous interview attempts and analytics.
   */
  async getHistory() {
    const res = await fetch(`${API_BASE}/attempts/history`);
    if (!res.ok) throw new Error('Failed to load history.');
    return res.json();
  },

  /**
   * Fetch detailed report card (answers, scores, transcript, LLM insights) for an attempt.
   */
  async getReport(attemptId) {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/report`);
    if (!res.ok) throw new Error('Failed to load attempt report.');
    return res.json();
  }
};
