import { useState } from 'react';
import api from '../services/api';

interface UsePasswordResetReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  requestReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearState: () => void;
}

export const usePasswordReset = (): UsePasswordResetReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requestReset = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  const clearState = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  return {
    loading,
    error,
    success,
    requestReset,
    resetPassword,
    clearState
  };
};