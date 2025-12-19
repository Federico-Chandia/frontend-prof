import React from 'react';

interface OnboardingBannerProps {
  onDismiss: () => void;
}

const OnboardingBanner: React.FC<OnboardingBannerProps> = ({ onDismiss }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-4">
            <span className="text-2xl">🚀</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ¡Completa tu perfil para ser visible!
            </h3>
            <p className="text-blue-700 mb-3">
              Al completar tu información profesional aparecerás en las búsquedas de clientes y podrás recibir solicitudes de trabajo.
            </p>
            <div className="flex items-center text-sm text-blue-600">
              <span className="mr-2">✨</span>
              <span>Perfil básico incluye 5 tokens de contacto gratuitos (por única vez)</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onDismiss} 
          className="text-blue-400 hover:text-blue-600 text-xl font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default OnboardingBanner;