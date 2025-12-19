// Utility for safe error handling
export const handleError = (error: any, context: string) => {
  // Log error safely without exposing sensitive data
  if (import.meta.env.DEV) {
    console.error(`Error in ${context}:`, error?.message || 'Unknown error');
  }
  
  // Return user-friendly error message
  return error?.response?.data?.message || 'Ha ocurrido un error. Inténtalo de nuevo.';
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};