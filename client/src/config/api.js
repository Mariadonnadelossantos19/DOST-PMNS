// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
   GIA_SUBMIT: `${API_BASE_URL}/programs/gia/submit`,
   GIA_MY_APPLICATIONS: `${API_BASE_URL}/programs/gia/my-applications`,
   CEST_SUBMIT: `${API_BASE_URL}/programs/cest/submit`,
   CEST_MY_APPLICATIONS: `${API_BASE_URL}/programs/cest/my-applications`,
   SSCP_SUBMIT: `${API_BASE_URL}/programs/sscp/submit`,
   SSCP_MY_APPLICATIONS: `${API_BASE_URL}/programs/sscp/my-applications`,
   PROGRAM_SUBMIT: (programCode) => `${API_BASE_URL}/programs/${programCode}/submit`,
   
   // Enrollment endpoints
   ENROLLMENTS: `${API_BASE_URL}/enrollments`,
   ENROLLMENT_CREATE: `${API_BASE_URL}/enrollments/create`,
   ENROLLMENT_STATS: `${API_BASE_URL}/enrollments/stats`,
   ENROLLMENT_BY_PROPONENT: (proponentId) => `${API_BASE_URL}/enrollments/proponent/${proponentId}`,
   
   // Proponent requests
   PROPONENT_REQUESTS: `${API_BASE_URL}/proponent-requests`,
};

export default API_BASE_URL;
