import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nilam_pesum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  demoLogin: () => api.post('/auth/demo')
};

export const profileAPI = {
  getProfile: () => api.get('/profile/me'),
  updateProfile: (data) => api.put('/profile/me', data),
  extractVoice: (transcript) => api.post('/profile/extract', { transcript })
};

export const fieldAPI = {
  getFields: (params) => api.get('/fields', { params }),
  getFieldToday: (fieldId) => api.get('/field/today', { params: { fieldId } }),
  getDataCheck: () => api.get('/data-check'),
  getSources: () => api.get('/sources')
};

export const rotationAPI = {
  getRotations: (params) => api.get('/rotations', { params }),
  getBacktest: (rotationId, fieldId) => api.get(`/rotations/${rotationId}/backtest`, { params: { fieldId } }),
  simulateWhatIf: (rotationId, data) => api.post(`/rotations/${rotationId}/whatif`, data),
  getPlantingWindow: (fieldId) => api.get('/planting-window', { params: { fieldId } }),
  getSoilBank: (sequence) => api.get('/soil-bank', { params: { sequence: sequence.join(',') } })
};

export const seasonAPI = {
  getSeason: (params) => api.get('/season', { params }),
  commitPlan: (data) => api.post('/season/commit', data),
  saveNote: (data) => api.post('/season/notes', data)
};

export const timeMachineAPI = {
  getSnapshot: (fieldId, date) => api.get('/timemachine/snapshot', { params: { fieldId, date } }),
  getReportCard: (fieldId, year) => api.get('/timemachine/report', { params: { fieldId, year } })
};

export const talkAPI = {
  ask: (question, fieldId) => api.post('/talk', { question, fieldId })
};

export const extensionAPI = {
  getOverview: () => api.get('/extension/overview')
};

export default api;
