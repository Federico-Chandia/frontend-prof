import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = Date.now().toString();
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('🚨 Error caught by boundary:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send to error reporting service
    if (import.meta.env.PROD) {
      // Example: sendErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Ups! Algo salió mal
            </h2>
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al inicio.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-4 text-left bg-red-50 p-4 rounded-md">
                <summary className="cursor-pointer text-red-800 font-medium">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="mt-2 text-xs text-red-700 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Ir al inicio
              </button>
            </div>
            {this.state.errorId && (
              <p className="text-xs text-gray-400 mt-4">
                ID del error: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;