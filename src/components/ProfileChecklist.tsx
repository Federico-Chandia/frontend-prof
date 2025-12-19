import React from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

interface ProfileChecklistProps {
  items: ChecklistItem[];
  onItemClick?: (itemId: string) => void;
}

const ProfileChecklist: React.FC<ProfileChecklistProps> = ({ items, onItemClick }) => {
  const completedCount = items.filter(item => item.completed).length;
  const requiredItems = items.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed).length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Lista de Verificación</h3>
        <span className="text-sm text-gray-500">
          {completedCount}/{items.length} completado
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center p-3 rounded-lg border transition-colors ${
              item.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            } ${onItemClick ? 'cursor-pointer' : ''}`}
            onClick={() => onItemClick?.(item.id)}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
              item.completed 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-300'
            }`}>
              {item.completed && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <div className="flex-1">
              <span className={`text-sm font-medium ${
                item.completed ? 'text-green-800' : 'text-gray-700'
              }`}>
                {item.label}
                {item.required && !item.completed && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </span>
            </div>

            {!item.completed && onItemClick && (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {completedRequired < requiredItems.length && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <span className="text-sm text-yellow-800">
              Completa los campos obligatorios (*) para ser visible en búsquedas
            </span>
          </div>
        </div>
      )}

      {completedRequired === requiredItems.length && completedCount < items.length && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">💡</span>
            <span className="text-sm text-blue-800">
              ¡Perfil básico completo! Agrega más información para destacar
            </span>
          </div>
        </div>
      )}

      {completedCount === items.length && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">🎉</span>
            <span className="text-sm text-green-800">
              ¡Perfil 100% completo! Ya eres visible para todos los clientes
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileChecklist;