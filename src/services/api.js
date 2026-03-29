import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

// Create AXIOS instance
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error.response?.data?.msg || error.message);
    throw error;
  }
};

export const registerAdmin = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('auth_token', data.token);
    return data;
}

export const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
}

export const resetPassword = async (id, token, password) => {
    const { data } = await api.post(`/auth/reset-password/${id}/${token}`, { password });
    return data;
}

export const getCurrentAdmin = async () => {
    try {
        const { data } = await api.get('/auth/me');
        return data;
    } catch (error) {
        return null;
    }
}

export const getDashboardStats = async () => {
    const { data } = await api.get('/stats');
    return {
      totalUsers: data.totalUsers,
      activeUsers: data.activeUsers,
      pendingUsers: data.pendingUsers,
      revenue: data.revenue,
      revenueGrowth: data.revenueGrowth,
      activeSessions: data.activeSessions,
    };
};

export const getRevenueData = async () => {
    const { data } = await api.get('/analytics');
    return data;
};

export const getUsers = async (search = '', status = 'All', sortBy = 'createdAt', order = 'desc', page = 1, limit = 10) => {
    const { data } = await api.get('/users', {
        params: { search, status, sortBy, order, page, limit }
    });
    return {
        ...data,
        users: data.users.map(u => ({ ...u, id: u._id }))
    };
};

export const addUser = async (userData) => {
    const { data } = await api.post('/users', userData);
    return { ...data, id: data._id };
};

export const updateUser = async (id, updates) => {
    const { data } = await api.put(`/users/${id}`, updates);
    return { ...data, id: data._id };
};

export const getActivities = async () => {
    const { data } = await api.get('/activities');
    return data;
};

export const deleteUser = async (id) => {
    await api.delete(`/users/${id}`);
    return true;
};

export const getSettings = async () => {
    const { data } = await api.get('/settings');
    return data;
};

export const updateSettings = async (settingsData) => {
    const { data } = await api.put('/settings', settingsData);
    return data;
};

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data; // returns { url: '...' }
};

export const updatePassword = async (passwords) => {
    const { data } = await api.put('/settings/password', passwords);
    return data;
};

export const getMessages = async (userId) => {
    const { data } = await api.get(userId ? `/messages?userId=${userId}` : '/messages');
    return data;
};

export const sendMessage = async (messageData) => {
    const { data } = await api.post('/messages', messageData);
    return data;
};

export default api;
