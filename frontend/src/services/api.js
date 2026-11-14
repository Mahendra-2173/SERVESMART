const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  },

  async predictBatch(params) {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async getData() {
    const res = await fetch(`${API_BASE}/data`);
    return res.json();
  },

  async addRecord(record) {
    const res = await fetch(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return res.json();
  },

  async getHistory() {
    const res = await fetch(`${API_BASE}/history`);
    return res.json();
  },

  async logPrediction(prediction) {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediction),
    });
    return res.json();
  },

  async updateHistoryActuals(id, actuals) {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actuals),
    });
    return res.json();
  },

  getExportUrl() {
    return `${API_BASE}/export`;
  }
};
