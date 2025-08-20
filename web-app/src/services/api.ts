import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Projects API calls
export const projectsAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (projectData: any) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  
  update: async (id: string, projectData: any) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

// Punchlist API calls
export const punchlistAPI = {
  getAll: async (projectId?: string) => {
    const url = projectId ? `/punchlist?projectId=${projectId}` : '/punchlist';
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/punchlist/${id}`);
    return response.data;
  },
  
  create: async (itemData: any) => {
    const response = await api.post('/punchlist', itemData);
    return response.data;
  },
  
  update: async (id: string, itemData: any) => {
    const response = await api.put(`/punchlist/${id}`, itemData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/punchlist/${id}`);
    return response.data;
  },
  
  addPhoto: async (id: string, photoData: FormData) => {
    const response = await api.post(`/punchlist/${id}/photos`, photoData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  addNote: async (id: string, noteData: { content: string }) => {
    const response = await api.post(`/punchlist/${id}/notes`, noteData);
    return response.data;
  },
};

// Users API calls
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/me/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/me/profile', userData);
    return response.data;
  },
};

// Reports API calls
export const reportsAPI = {
  getAll: async () => {
    const response = await api.get('/reports');
    return response.data;
  },
  
  generate: async (reportData: any) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },
  
  getByProject: async (projectId: string) => {
    const response = await api.get(`/reports/project/${projectId}`);
    return response.data;
  },
  
  export: async (reportId: string) => {
    const response = await api.get(`/reports/export/${reportId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;