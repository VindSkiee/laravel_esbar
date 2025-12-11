import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // No cookies needed - pure token-based
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Add token to requests if exists (for admin routes)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // If no retry count, initialize it
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Retry up to 3 times for network errors or 5xx errors
    const shouldRetry = 
      (!error.response || error.response.status >= 500) && 
      config.__retryCount < 3;
    
    if (shouldRetry) {
      config.__retryCount += 1;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, config.__retryCount - 1) * 1000;
      console.log(`🔄 Retry ${config.__retryCount}/3 after ${delay}ms for ${config.url}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

export default api;

