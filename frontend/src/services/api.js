import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadResume: (formData) =>
    api.post('/users/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUser: (id) => api.get(`/users/${id}`),
  getUsers: (params) => api.get('/users', { params }),
};

export const groupAPI = {
  getGroups: (params) => api.get('/groups', { params }),
  getGroup: (id) => api.get(`/groups/${id}`),
  createGroup: (data) => api.post('/groups', data),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
  joinGroup: (id) => api.post(`/groups/${id}/join`),
  leaveGroup: (id) => api.post(`/groups/${id}/leave`),
  getMessages: (id, params) => api.get(`/groups/${id}/messages`, { params }),
  messageCount : (id,userId) => api.get(`/groups/${id}/messages/count`, { params: {userId: userId } }),
  updateLastReadMessage : (id) => api.post('groups/update-last-read',id)
};

export const placementAPI = {
  getPlacements: (params) => api.get('/placements', { params }),
  getPlacement: (id) => api.get(`/placements/${id}`),
  createPlacement: (data) => api.post('/placements', data),
  bookmarkPlacement: (id) => api.post(`/placements/${id}/bookmark`),
  deletePlacement: (id) => api.delete(`/placements/${id}/delete`),
  applyPlacement: (id) => api.post(`/placements/${id}/apply`),
};

export const aiAPI = {
  reviewResume: (formData) =>
    api.post('/ai/resume-review', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  chat: (data) => api.post('/ai/chat', data),
  summarizeChat: (data) => api.post('/ai/summarize', data),
};

export const interviewAPI = {
  requestInterview: (data) => api.post('/interviews', data),
  getInterviewPool: (params) => api.get('/interviews/pool', { params }),
  getMyInterviews: (params) => api.get('/interviews/my', { params }),
  acceptInterview: (id) => api.put(`/interviews/${id}/accept`),
  rejectInterview: (id) => api.put(`/interviews/${id}/reject`),
  requestReschedule: (id, data) => api.post(`/interviews/${id}/reschedule`, data),
  acceptReschedule: (id) => api.put(`/interviews/${id}/reschedule/accept`),
  cancelReschedule : (id) => api.put(`/interviews/${id}/reschedule/cancel`),
  cancelInterview: (id) => api.put(`/interviews/${id}/cancel`),
  submitFeedback: (id, data) => api.post(`/interviews/${id}/feedback`, data),
};

export const problemAPI = {
  getProblems: (params) => api.get('/problems', { params }),
  getProblem: (id) => api.get(`/problems/${id}`),
  createProblem: (data) => api.post('/problems', data),
  updateProblem: (id, data) => api.put(`/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/problems/${id}`),
};

export const submissionAPI = {
  createSubmission: (data) => api.post('/submissions/submit', data),
  getSubmissions: (params) => api.get('/submissions', { params }),
  getSubmission: (id) => api.get(`/submissions/${id}`),
  runCode: (data) => api.post('/submissions/run', data),
};


export default api;
