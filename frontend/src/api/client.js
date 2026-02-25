import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('biomentor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('biomentor_token');
      localStorage.removeItem('biomentor_user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  deleteAccount: () => api.delete('/auth/account'),
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/send', data),
  getSessions: () => api.get('/chat/sessions'),
  getMessages: (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`),
};

// Quiz API
export const quizAPI = {
  getTopics: () => api.get('/quiz/topics'),
  generate: (data) => api.post('/quiz/generate', data),
  submit: (data) => api.post('/quiz/submit', data),
  getHistory: () => api.get('/quiz/history'),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getLearningPath: () => api.get('/learning-path'),
  getCurriculum: () => api.get('/curriculum'),
};

// Advanced Features API
export const featuresAPI = {
  predictExam: (data) => api.post('/features/exam-predictor', data || {}),
  createDiagram: (data) => api.post('/features/diagram', data),
  analyzeMistakes: (data) => api.post('/features/mistake-analyzer', data || {}),
  generateRevision: (data) => api.post('/features/revision', data),
  generateRoadmap: (data) => api.post('/features/roadmap', data || {}),
};

export default api;
