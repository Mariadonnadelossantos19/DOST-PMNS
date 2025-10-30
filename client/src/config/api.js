import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dost-pmns-pkjy.vercel.app/api';

// Create axios instance
const api = axios.create({
   baseURL: API_BASE_URL,
   timeout: 30000,
   headers: {
      'Content-Type': 'application/json',
   },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use( 
   (response) => response,
   (error) => {
      if (error.response?.status === 401) {
         localStorage.removeItem('authToken');
         localStorage.removeItem('isLoggedIn');
         localStorage.removeItem('userData');
         window.location.reload();
      }
      return Promise.reject(error);
   }
);

export const API_ENDPOINTS = {
   // Auth endpoints
   LOGIN: `${API_BASE_URL}/auth/login`,
   REGISTER: `${API_BASE_URL}/users/create`,
   FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
   VERIFY_RESET_TOKEN: (token) => `${API_BASE_URL}/auth/verify-reset-token/${token}`,
   RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
   
   // User endpoints
   USERS: `${API_BASE_URL}/users`,
   USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
   USER_TOGGLE_STATUS: (id) => `${API_BASE_URL}/users/${id}/toggle-status`,
   USER_ACTIVATE: (id) => `${API_BASE_URL}/users/${id}/activate`,
   USER_DEACTIVATE: (id) => `${API_BASE_URL}/users/${id}/deactivate`,
   PSTO_PROPONENTS: (province) => `${API_BASE_URL}/users/psto/${province}/proponents`,
   
   // Program endpoints
   SETUP_SUBMIT: `${API_BASE_URL}/programs/setup/submit`,
   SETUP_MY_APPLICATIONS: `${API_BASE_URL}/programs/setup/my-applications`,
   SETUP_APPLICATION: (id) => `${API_BASE_URL}/programs/setup/${id}`,
   SETUP_APPLICATION_DOCUMENTS: (id) => `${API_BASE_URL}/programs/setup/${id}/documents`,
   SETUP_APPLICATION_RESUBMIT: (id) => `${API_BASE_URL}/programs/setup/${id}/resubmit`,
   GIA_SUBMIT: `${API_BASE_URL}/programs/gia/submit`,
   GIA_MY_APPLICATIONS: `${API_BASE_URL}/programs/gia/my-applications`,
   CEST_SUBMIT: `${API_BASE_URL}/programs/cest/submit`,
   CEST_MY_APPLICATIONS: `${API_BASE_URL}/programs/cest/my-applications`,
   SSCP_SUBMIT: `${API_BASE_URL}/programs/sscp/submit`,
   SSCP_MY_APPLICATIONS: `${API_BASE_URL}/programs/sscp/my-applications`,
   PROGRAM_SUBMIT: (programCode) => `${API_BASE_URL}/programs/${programCode}/submit`,
   
   
   // Proponent requests
   PROPONENT_REQUESTS: `${API_BASE_URL}/proponent-requests`,
   
   // PSTO Review endpoints
   PSTO_APPLICATIONS: `${API_BASE_URL}/programs/psto/applications`,
   PSTO_APPLICATION_DETAIL: (id) => `${API_BASE_URL}/programs/psto/applications/${id}`,
   PSTO_REVIEW: (id) => `${API_BASE_URL}/programs/psto/applications/${id}/review`,
   FORWARD_TO_DOST_MIMAROPA: (id) => `${API_BASE_URL}/programs/psto/applications/${id}/forward-to-dost-mimaropa`,
   
   // DOST MIMAROPA Review endpoints
   DOST_MIMAROPA_APPLICATIONS: `${API_BASE_URL}/programs/dost-mimaropa/applications`,
   DOST_MIMAROPA_APPLICATION_DETAIL: (id) => `${API_BASE_URL}/programs/dost-mimaropa/applications/${id}`,
   DOST_MIMAROPA_REVIEW: (id) => `${API_BASE_URL}/programs/dost-mimaropa/applications/${id}/review`,
};

export { API_BASE_URL };
export default api;

// Runtime shim to redirect hardcoded localhost calls to the configured API base URL
export function patchFetchToApiBaseUrl() {
   if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;

   const originalFetch = window.fetch.bind(window);
   const LOCAL_PREFIX = 'http://localhost:4000';
   const LOCAL_API_PREFIX = 'http://localhost:4000/api';

   window.fetch = (input, init) => {
      try {
         const stringUrl = typeof input === 'string' ? input : (input && input.url) || '';

         // Replace localhost:4000/api → API_BASE_URL
         if (stringUrl.startsWith(LOCAL_API_PREFIX)) {
            const rest = stringUrl.slice(LOCAL_API_PREFIX.length);
            const redirected = `${API_BASE_URL}${rest}`;
            return originalFetch(redirected, init);
         }

         // Replace bare localhost:4000 (non-/api paths like /uploads) → base without trailing /api
         if (stringUrl.startsWith(LOCAL_PREFIX)) {
            const baseWithoutApi = API_BASE_URL.replace(/\/?api\/?$/, '');
            const rest = stringUrl.slice(LOCAL_PREFIX.length);
            const redirected = `${baseWithoutApi}${rest}`;
            return originalFetch(redirected, init);
         }
      } catch (_) {}

      return originalFetch(input, init);
   };
}