import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getCsrfToken } from './csrf';

// Determinar URL de API según el ambiente
const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // En producción, usar la variable de entorno o URL por defecto
  if (envUrl) {
    return envUrl;
  }
  
  // En desarrollo, usar localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5005/api';
  }
  
  // Fallback para producción
  return '/api';
};

const API_URL = getApiUrl();

console.log('[API Config] API_URL:', API_URL, 'ENV:', import.meta.env.MODE);

// Create axios instance with better defaults
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  withCredentials: true, // Enable cookies for CSRF
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token and CSRF
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for non-GET requests (temporarily disabled)
    // if (config.method && config.method.toLowerCase() !== 'get' && config.headers) {
    //   try {
    //     const csrfToken = await getCsrfToken();
    //     config.headers['x-csrf-token'] = csrfToken;
    //   } catch (error) {
    //     console.warn('No se pudo obtener token CSRF:', error);
    //   }
    // }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(new Error('La solicitud tardó demasiado. Intenta de nuevo.'));
    }

    if (!error.response) {
      // Solo mostrar error de red si no es un error de conexión al servidor
      if (error.code !== 'ECONNREFUSED' && error.code !== 'ERR_NETWORK') {
        console.error('Network error:', error.message);
      }
      return Promise.reject(new Error('Error de conexión. Verifica que el servidor esté funcionando.'));
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Unauthorized - clear auth and emit event
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Emit custom event for components to handle
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        break;
      case 403:
        // Handle token-related errors specifically
        if ((data as any)?.message?.includes('tokens')) {
          console.error('Token error:', (data as any).message);
        } else {
          console.error('Forbidden access');
        }
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 422:
        console.error('Validation error');
        break;
      case 500:
        console.error('Server error');
        break;
      default:
        console.error(`HTTP Error ${status}`);
    }

    // Return a more user-friendly error message
    const message = (data as any)?.message || error.message || 'Ha ocurrido un error inesperado';
    return Promise.reject(new Error(message));
  }
);

// Helper function for retry logic
export const apiWithRetry = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  maxRetries = 3,
  delay = 1000
): Promise<AxiosResponse<T>> => {
  let lastError: Error = new Error('Request failed');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof AxiosError && error.response?.status && error.response.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

export default api;
