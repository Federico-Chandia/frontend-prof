import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  color?: 'blue' | 'gray' | 'green' | 'red';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  fullScreen = false,
  color = 'blue',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen bg-gray-50 flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-2 ${colorClasses[color]} ${sizeClasses[size]}`}></div>
      {text && (
        <p className={`mt-3 text-gray-600 ${textSizeClasses[size]} text-center max-w-xs`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Componente para loading de página completa
export const FullPageLoader: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => (
  <LoadingSpinner size="lg" text={text} fullScreen />
);

// Componente para loading inline
export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <LoadingSpinner size="sm" text={text} />
);

export default LoadingSpinner;