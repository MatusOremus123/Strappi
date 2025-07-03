import axios from 'axios';

const API_BASE_URL = 'http://localhost:1337/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Events
  getEvents: () => 
    api.get(`/events?populate=*`),
  
  getEvent: (id) => 
    api.get(`/events/${id}?populate=*`),
  
  // Authentication
  register: (userData) => 
    api.post('/auth/local/register', userData),
    
  login: (credentials) =>
    api.post('/auth/local', credentials),

  // Role Management
  getRoles: () =>
    api.get('/users-permissions/roles'),

  updateUserRole: (userId, roleId) =>
    api.put(`/users/${userId}`, { role: roleId }),

  // Role Requests (for approval workflow)
  createRoleRequest: (requestData) =>
    api.post('/role-requests', requestData),

  getRoleRequests: () =>
    api.get('/role-requests?populate=*'),

  updateRoleRequest: (id, status) =>
    api.put(`/role-requests/${id}`, { data: { status } }),
  
  // File Upload
  uploadFile: (formData) => 
    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // User Profile Management (for extended user data)
  createUserProfile: (profileData) => 
    api.post('/app-users', profileData),
  
  updateUserProfile: (id, profileData) => 
    api.put(`/app-users/${id}`, profileData),
  
  getUserProfile: (userId) => 
    api.get(`/app-users?filters[users_permissions_user][id][$eq]=${userId}&populate=*`),

  // Additional useful endpoints
  getAccessibilityFeatures: () => 
    api.get('/accessibility-features'),
  
  getTicketTypes: () => 
    api.get('/ticket-types?populate=*'),
  
  createTicket: (ticketData) => 
    api.post('/tickets', ticketData),
  
  getUserTickets: (userId) => 
    api.get(`/tickets?filters[app_user][users_permissions_user][id][$eq]=${userId}&populate=*`),
  
  getLocations: () => 
    api.get('/locations?populate=*'),
  
  getOrganizers: () => 
    api.get('/organizers?populate=*'),

  // Current user info
  getMe: () =>
    api.get('/users/me?populate=*'),
};

export default api;