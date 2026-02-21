import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('access_token', response.data.access);
        // Save rotated refresh token if the backend returns one
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }

        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Log the error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      status: error.response?.status,
      responseData: error.response?.data,
      message: error.message
    });

    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  login: async (identifier, password) => {
    const requestData = {
      identifier: identifier,  // Django backend expects 'identifier' field
      password: password
    };
    
    console.log('Login request data:', requestData);
    const response = await api.post('/auth/login/', requestData);
    return response.data;
  },

  register: async (userData) => {
    const requestData = {
      username: userData.email, // Use email as username
      email: userData.email,
      password: userData.password,
      password_confirm: userData.password, // Django backend requires password confirmation
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      country: userData.country,
      address: userData.residential_address
    };
    
    console.log('Register request data:', requestData);
    const response = await api.post('/auth/register/', requestData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/user/profile/');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
  },

  updateProfile: async (updates) => {
    const response = await api.put('/user/profile/', updates);
    return response.data;
  }
};

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/user/profile/');
    return response.data;
  },

  changePin: async (currentPin, newPin) => {
    const response = await api.post('/user/change-pin/', {
      current_pin: currentPin,
      new_pin: newPin
    });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/user/change-password/', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  }
};

export const transferApi = {
  validateReceiver: async (accountNumber) => {
    const response = await api.post('/transfers/validate-receiver/', {
      account_number: accountNumber
    });
    return response.data;
  },

  yeetTransfer: async (recipientAccount, amount, transferPin, message = '') => {
    const response = await api.post('/transactions/api/yeet_transfer/', {
      recipient_account: recipientAccount,
      amount: parseFloat(amount),
      transfer_pin: transferPin,
      message: message
    });
    return response.data;
  },

  wireTransfer: async (transferData) => {
    const response = await api.post('/transactions/api/wire_transfer/', transferData);
    return response.data;
  },

  getTransactionHistory: async () => {
    const response = await api.get('/transactions/api/my_transactions/');
    return response.data;
  },

  getAccountSummary: async () => {
    const response = await api.get('/transactions/api/account_summary/');
    return response.data;
  },

  reportTransaction: async (transactionId, reason, description) => {
    const response = await api.post('/transactions/api/reports/create/', {
      transaction: transactionId,
      reason,
      description
    });
    return response.data;
  },

  getTransactionReports: async () => {
    const response = await api.get('/transactions/api/reports/');
    return response.data;
  }
};

export const chatApi = {
  getConversations: async () => {
    const response = await api.get('/chat/rooms/conversations/');
    return response.data;
  },

  getStaffUsers: async () => {
    const response = await api.get('/chat/rooms/staff_users/');
    return response.data;
  },

  startChatWithUser: async (userId) => {
    const response = await api.post('/chat/rooms/start_chat_with_user/', { user_id: userId });
    return response.data;
  },

  getMessages: async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/messages/`);
    return response.data;
  },

  sendMessage: async (roomId, content, imageFile = null) => {
    if (imageFile) {
      // Send as FormData for file upload
      const formData = new FormData();
      if (content) {
        formData.append('content', content);
      } else {
        formData.append('content', 'Photo');
      }
      formData.append('image', imageFile, imageFile.name);
      formData.append('message_type', 'IMAGE');
      
      // Use axios directly with proper config - don't set Content-Type, let browser do it
      const token = localStorage.getItem('access_token');
      const response = await axios({
        method: 'post',
        url: `${API_URL}/api/chat/rooms/${roomId}/send_message/`,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } else {
      // Send as JSON for text-only messages
      const response = await api.post(`/chat/rooms/${roomId}/send_message/`, { 
        content,
        message_type: 'TEXT'
      });
      return response.data;
    }
  },

  setTyping: async (roomId, isTyping) => {
    const response = await api.post(`/chat/rooms/${roomId}/set_typing/`, { is_typing: isTyping });
    return response.data;
  },

  getTyping: async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/get_typing/`);
    return response.data;
  },

  // Legacy methods for backward compatibility
  getMessagesLegacy: async (chatId) => {
    const response = await api.get(`/chat/messages/${chatId}/`);
    return response.data;
  },

  sendMessageLegacy: async (chatId, message, photo = null) => {
    const response = await api.post('/chat/send-message/', {
      chat_id: chatId,
      message,
      photo
    });
    return response.data;
  }
};

export const notificationApi = {
  getNotifications: async () => {
    const response = await api.get('/notifications/');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/mark-read/`);
    return response.data;
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count/');
      return response.data.count || 0;
    } catch (error) {
      // Fallback: get all notifications and count unread
      try {
        const notifications = await api.get('/notifications/');
        return notifications.data.filter(n => !n.read).length;
      } catch {
        return 0;
      }
    }
  }
};

export default api;
