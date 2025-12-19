import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
let csrfToken: string | null = null;

// Create a separate axios instance for CSRF requests to avoid circular dependency
const csrfApi = axios.create({
  baseURL: API_URL,
  timeout: 6000,
  withCredentials: true, // Important: enables cookies
});

export const getCsrfToken = async (): Promise<string> => {
  if (!csrfToken) {
    try {
      const response = await csrfApi.get('/auth/csrf-token');
      csrfToken = response.data.csrfToken;
    } catch (error) {
      console.error('Error obteniendo token CSRF:', error);
      throw error;
    }
  }
  return csrfToken || '';
};

export const clearCsrfToken = () => {
  csrfToken = null;
};