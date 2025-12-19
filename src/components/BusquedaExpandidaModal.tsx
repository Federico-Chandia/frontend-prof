import React from 'react';

interface BusquedaExpandidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuscarLejanos: () => void;
  tipoOficio: string;
}

const BusquedaExpandidaModal: React.FC<BusquedaExpandidaModalProps> = ({ 
  isOpen, 
  onClose, 
  onBuscarLejanos, 
  tipoOficio 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">No hay profesionales cercanos</h3>
        </div>
        
        <p className="text-gray-600 mb-4 text-center">
          No se encontraron {tipoOficio}s disponibles en un radio de 15km de tu ubicación.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <span className="text-blue-600 text-lg mr-2">💡</span>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Búsqueda extendida</h4>
              <p className="text-sm text-blue-700">
                Podemos buscar profesionales en un radio de hasta 50km. 
                <strong>Pueden aplicar cargos adicionales por traslado</strong> (aproximadamente $50 por km adicional después de los primeros 10km gratuitos).
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onBuscarLejanos}
            className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Buscar más lejanos
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusquedaExpandidaModal;