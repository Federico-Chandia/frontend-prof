import React from 'react';

interface ProfileProgressProps {
  completionPercentage: number;
  missingFields: string[];
}

const ProfileProgress: React.FC<ProfileProgressProps> = ({ completionPercentage}) => {
  return (
    <div className="bg-white p-4 rounded-lg border mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Perfil completado al: </span>
        <span className="text-sm text-gray-600">{completionPercentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      {completionPercentage < 100 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">
            Completa tu perfil para aparecer en las primeras posiciones
          </p>
        </div>
      )}
      {completionPercentage === 100 && (
        <div className="flex items-center text-xs text-green-600">
          <span className="mr-2">✅</span>
          <span>¡Perfil completo! Ya eres visible para los clientes</span>
        </div>
      )}
    </div>
  );
};

export default ProfileProgress;