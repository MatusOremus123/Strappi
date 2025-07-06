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
  // Events with locale support
  getEvents: (locale = 'en') => 
    api.get(`/events?populate=*&locale=${locale}`),
  
  getEvent: (id, locale = 'en') => 
    api.get(`/events/${id}?populate=*&locale=${locale}`),
  
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

  // User Profile Management (for extended user data) - FIXED VERSION
  createUserProfile: (profileData) => 
    api.post('/app-users', { data: profileData }),
  
  updateUserProfile: (id, profileData) => 
    api.put(`/app-users/${id}`, { data: profileData }),
  
  // FIXED: Use axios params config to properly handle URL encoding
  getUserProfile: (userId) => {
    console.log('getUserProfile called with userId:', userId);
    const config = {
      params: {
        'filters[users_permissions_user][id][$eq]': userId,
        'populate[disability_card][populate]': '*',
        'populate[accessibility_needs]': '*',
        'populate[tickets]': '*',
        'populate[ticket]': '*',
        'populate[users_permissions_user]': '*'
      }
    };
    console.log('API config:', config);
    return api.get('/app-users', config);
  },

  // Simple fallback method - get all profiles and filter client-side
  getUserProfileSimple: (userId) => {
    console.log('getUserProfileSimple called with userId:', userId);
    // Use URLSearchParams to properly encode the nested populate
    const params = new URLSearchParams();
    params.append('populate[disability_card][populate]', 'file');
    params.append('populate[accessibility_needs]', '*');
    params.append('populate[tickets]', '*');
    params.append('populate[ticket]', '*');
    params.append('populate[users_permissions_user]', '*');
    
    return api.get(`/app-users?${params.toString()}`).catch((error) => {
      console.log('Specific populate failed, trying basic populate:', error);
      return api.get('/app-users?populate=*');
    });
  },

  // NEW: User Account Management Methods
  updateUser: (userId, userData) => 
    api.put(`/users/${userId}`, userData),

  // Update current user profile (works with authentication)
  updateCurrentUser: (userData) => 
    api.put('/users/me', userData),

  // Alternative method for updating user via users-permissions plugin
  updateUserViaAuth: (userId, userData) => 
    api.put(`/users-permissions/users/${userId}`, userData),

  // NEW: Disability Card Management Methods (now as component)
  updateUserWithDisabilityCard: (userId, userData) => 
    api.put(`/users/${userId}`, userData),

  // Legacy methods - keeping for backward compatibility
  createDisabilityCard: (cardData) => 
    api.post('/disability-cards', { data: cardData }),

  updateDisabilityCard: (cardId, cardData) => 
    api.put(`/disability-cards/${cardId}`, { data: cardData }),

  getDisabilityCard: (cardId) => 
    api.get(`/disability-cards/${cardId}?populate=*`),

  deleteDisabilityCard: (cardId) => 
    api.delete(`/disability-cards/${cardId}`),

  // Additional useful endpoints
  getAccessibilityFeatures: () => 
    api.get('/accessibility-features'),
  
  getTicketTypes: () => 
    api.get('/ticket-types?populate=*'),
  
  createTicket: (ticketData) => 
    api.post('/tickets', ticketData),
  
  getUserTickets: (userId) => 
    api.get('/tickets', {
      params: {
        'filters[app_user][users_permissions_user][id][$eq]': userId,
        'populate': '*'
      }
    }),
  
  getLocations: () => 
    api.get('/locations?populate=*'),
  
  getOrganizers: () => 
    api.get('/organizers?populate=*'),

  // Current user info
  getMe: () =>
    api.get('/users/me?populate=*'),
};

export default api;