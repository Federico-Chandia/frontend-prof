import { useCallback } from 'react';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'Ha ocurrido un error inesperado'
    } = options;

    let message = fallbackMessage;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    if (logError) {
      console.error('Error handled:', error);
    }

    if (showToast) {
      // Here you could integrate with a toast library
      // For now, we'll use a simple alert in development
      if (import.meta.env.DEV) {
        console.warn('Toast would show:', message);
      }
    }

    return message;
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};

export default useErrorHandler;