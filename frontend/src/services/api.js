import axios from 'axios';

export const AUTH_STORAGE_KEY = 'taskPlannerAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeToken = null;

export const setAuthToken = (token) => {
  activeToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const clearAuthToken = () => {
  activeToken = null;
  delete api.defaults.headers.common.Authorization;
};

api.interceptors.request.use((config) => {
  if (activeToken) {
    config.headers.Authorization = `Bearer ${activeToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return Promise.reject(error);
  },
);

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks/'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Calendar API
export const calendarAPI = {
  getAll: () => api.get('/calendar/'),
  getRange: (start, end) => api.get('/calendar/range', { params: { start, end } }),
  getById: (id) => api.get(`/calendar/${id}`),
  create: (data) => api.post('/calendar/', data),
  update: (id, data) => api.put(`/calendar/${id}`, data),
  delete: (id) => api.delete(`/calendar/${id}`),
};

// Reminders API
export const remindersAPI = {
  getAll: (activeOnly = false) => api.get('/reminders/', { params: { active_only: activeOnly } }),
  getUpcoming: () => api.get('/reminders/upcoming'),
  getById: (id) => api.get(`/reminders/${id}`),
  create: (data) => api.post('/reminders/', data),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`),
};

// Knowledge Base API
export const knowledgeAPI = {
  getAll: (category = null) => api.get('/knowledge/', { params: { category } }),
  search: (searchTerm) => api.get(`/knowledge/search/${searchTerm}`),
  getById: (id) => api.get(`/knowledge/${id}`),
  create: (data) => api.post('/knowledge/', data),
  update: (id, data) => api.put(`/knowledge/${id}`, data),
  delete: (id) => api.delete(`/knowledge/${id}`),
};

// Documents API
export const documentsAPI = {
  getAll: (fileType = null) => api.get('/documents/', { params: { file_type: fileType } }),
  search: (searchTerm) => api.get(`/documents/search/${searchTerm}`),
  getById: (id) => api.get(`/documents/${id}`),
  create: (data) => api.post('/documents/', data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message, context = null) => api.post('/chat/', { message, context }),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history'),
};

// Search API
export const searchAPI = {
  search: (query, categories = null) => api.post('/search/', { query, categories }),
  aiSearch: (query) => api.post('/search/ai', { query }),
};

// Team API
export const teamAPI = {
  getAll: () => api.get('/team/'),
};

// Task Templates API
export const taskTemplatesAPI = {
  getAll: () => api.get('/task-templates/'),
  getById: (id) => api.get(`/task-templates/${id}`),
  create: (data) => api.post('/task-templates/', data),
  update: (id, data) => api.put(`/task-templates/${id}`, data),
  delete: (id) => api.delete(`/task-templates/${id}`),
  bulkImport: (data) => api.post('/task-templates/bulk-import', data),
};

// Admin API
export const adminAPI = {
  getLoginAttempts: (limit = 100) => api.get('/admin/login-attempts', { params: { limit } }),
  getAccessCodes: () => api.get('/admin/access-codes'),
  getTeamMembers: () => api.get('/admin/team'),
  updateTeamMembers: (teamData) => api.put('/admin/team', teamData),
};

export const feedbackAPI = {
  submit: (data) => api.post('/feedback/', data),
  getAll: () => api.get('/feedback/'),
};

export default api;
