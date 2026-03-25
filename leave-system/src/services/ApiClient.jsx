import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =========================================================
// 1. REQUEST INTERCEPTOR (Attaches the token)
// =========================================================
apiClient.interceptors.request.use(
  (config) => {
    // Don't add token to login/auth endpoints (they're public)
    const publicEndpoints = ['/auth/login/', '/auth/password-reset/'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));

    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token');
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          // Smart Prefixing (Supports both Standard DRF Tokens and SimpleJWT)
          const isJWT = token.split('.').length === 3;
          config.headers.Authorization = `${isJWT ? 'Bearer' : 'Token'} ${token}`;
        } catch (e) {
          // Invalid token format, skip
          console.warn('Invalid token format', e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// 2. RESPONSE INTERCEPTOR (Handles expired/invalid tokens)
// =========================================================
let isLoggingOut = false;
let alertHandler = null;

// Function to register alert handler from a React component
export const setAlertHandler = (handler) => {
  alertHandler = handler;
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Token invalid or expired. Logging out...');

      // Show alert using custom AlertContext if available
      if (alertHandler) {
        alertHandler('Your session has expired. Please log in again.');
      }

      localStorage.removeItem('user');
      localStorage.removeItem('token');

      if (window.location.pathname !== '/login' && !isLoggingOut) {
        isLoggingOut = true;
        window.location.href = '/login';
        // Return a stalled Promise to prevent components from throwing errors
        // while the page is redirecting
        return new Promise(() => { });
      }
    }

    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login/', { email, password });
    return response.data; // Return user data and token
  } catch (error) {
    throw new Error('Login failed. Please check your credentials', { cause: error.message });
  }
};

export const getLeaveHistory = async () => {
  try {
    const response = await apiClient.get('/leaves/history/');
    return response.data; // Return leave history data
  } catch (error) {
    throw new Error('Failed to fetch leave history', { cause: error.message });
  }
};

export const applyLeave = async (leaveData) => {
  try {
    // Convert camelCase to snake_case for Django API
    const apiData = new FormData();

    // Convert field names to snake_case
    apiData.append('leave_type', leaveData.leaveType || leaveData.leave_type);
    apiData.append('start_date', leaveData.startDate || leaveData.start_date);
    apiData.append('end_date', leaveData.endDate || leaveData.end_date);
    apiData.append('reason', leaveData.reason || '');

    if (leaveData.document) {
      apiData.append('document', leaveData.document);
    }

    console.log('Leave application data being sent:', {
      leave_type: leaveData.leaveType || leaveData.leave_type,
      start_date: leaveData.startDate || leaveData.start_date,
      end_date: leaveData.endDate || leaveData.end_date,
      reason: leaveData.reason || '',
      has_document: !!leaveData.document,
    });

    // Log FormData contents
    for (let [key, value] of apiData.entries()) {
      console.log(`FormData - ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }

    const response = await apiClient.post('/leaves/apply/', apiData);
    return response.data;
  } catch (error) {
    console.error('Leave application error response:', error.response?.data);
    console.error('Leave application error status:', error.response?.status);
    console.error('Leave application error headers:', error.response?.headers);
    console.error('Request config:', error.config);
    console.error('Full error details:', error);
    throw new Error('Failed to apply for leave', { cause: error.message });
  }
};

export const getAllLeaves = async () => {
  try {
    const response = await apiClient.get('/leaves/all');
    return response.data; // Return all leave data
  } catch (error) {
    throw new Error('Failed to fetch all leaves', { cause: error.message });
  }
};

// API actions for admin
export const updateLeaveData = async (leaveId, leaveData) => {
  try {
    const response = await apiClient.patch(`/leaves/${leaveId}/`, leaveData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update leave data', { cause: error.message });
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post('/employee/create/', employeeData);
    return response;
  } catch (error) {
    throw new Error('Failed to create employee', { cause: error.message });
  }
};

export const getPendingLeaves = async () => {
  try {
    const response = await apiClient.get('/leaves/pending/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch pending leaves', { cause: error.message });
  }
}

export const getStatistics = async () => {
  try {
    const response = await apiClient.get('/leaves/statistics/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch statistics', { cause: error.message });
  }
};

export const passwordResetRequest = async (email) => {
  try {
    const response = await apiClient.post('/auth/password-reset/confirm/', { email });
    return response;
  } catch (error) {
    throw new Error('Failed to send password reset email', { cause: error.message });
  }
};

// =========================================================
// LEAVE POLICY MANAGEMENT APIs
// =========================================================
export const getLeavePolices = async () => {
  try {
    // Try primary endpoint
    try {
      const response = await apiClient.get('/leave-policies/');
      console.log('Leave policies fetched from /leave-policies/', response.data);
      return response.data;
    } catch (primaryError) {
      console.warn('Primary endpoint /leave-policies/ failed, trying alternatives...');
      
      // Try alternative endpoint
      try {
        const response = await apiClient.get('/leave-types/');
        console.log('Leave policies fetched from /leave-types/', response.data);
        return response.data;
      } catch (altError) {
        console.warn('Alternative endpoint /leave-types/ also failed');
        throw primaryError; // Throw the primary error
      }
    }
  } catch (error) {
    console.error('Error fetching leave policies:', error);
    throw new Error(`Failed to fetch leave policies: ${error.message}`);
  }
};

export const getLeavePolicy = async (policyId) => {
  try {
    const response = await apiClient.get(`/leave-policies/${policyId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch leave policy', { cause: error.message });
  }
};

export const createLeavePolicy = async (policyData) => {
  try {
    const response = await apiClient.post('/leave-policies/create/', policyData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create leave policy', { cause: error.message });
  }
};

export const updateLeavePolicy = async (policyId, policyData) => {
  try {
    const response = await apiClient.patch(`/leave-policies/${policyId}/update/`, policyData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update leave policy', { cause: error.message });
  }
};

export const deleteLeavePolicy = async (policyId) => {
  try {
    const response = await apiClient.delete(`/leave-policies/${policyId}/delete/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete leave policy', { cause: error.message });
  }
};

// =========================================================
// EMPLOYEE MANAGEMENT APIs
// =========================================================
export const getAllEmployees = async () => {
  try {
    const response = await apiClient.get('/employee/list/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch employees', { cause: error.message });
  }
};

export const getEmployee = async (employeeId) => {
  try {
    const response = await apiClient.get(`/employee/${employeeId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch employee', { cause: error.message });
  }
};

export const createEmployeeRecord = async (employeeData) => {
  try {
    const response = await apiClient.post('/employee/create/', employeeData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create employee', { cause: error.message });
  }
};

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await apiClient.post(`/employee/${employeeId}/`, employeeData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update employee', { cause: error.message });
  }
};

export const deleteEmployee = async (employeeId) => {
  try {
    const response = await apiClient.delete(`/employee/${employeeId}/delete/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete employee', { cause: error.message });
  }
};

export const listEmployees = async () => {
  try {
    const response = await apiClient.get('/employee/list/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to list employees', { cause: error.message });
  }
};