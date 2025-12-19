import React from 'react';
import { Link } from 'react-router-dom';
import { OficioConDistancia } from '../hooks/useBusquedaProfesionales';

interface ProfesionalCardUbicacionProps {
  profesional: OficioConDistancia;
  mostrarDistancia?: boolean;
}

const ProfesionalCardUbicacion: React.FC<ProfesionalCardUbicacionProps> = ({ 
  profesional, 
  mostrarDistancia = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {profesional.usuario.nombre}
            </h3>
            <p className="text-blue-600 font-medium">
              {(profesional.tipoOficio || profesional.profesion)?.charAt(0).toUpperCase() + 
               (profesional.tipoOficio || profesional.profesion)?.slice(1)}
            </p>
          </div>
          {profesional.disponibilidad?.inmediata && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Disponible
            </span>
          )}
        </div>
        
        {mostrarDistancia && profesional.distancia && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-gray-500 text-sm">📍 {profesional.distancia.toFixed(1)} km</span>
            </div>
            {profesional.cargoTraslado && profesional.cargoTraslado > 0 && (
              <span className="text-orange-600 text-sm font-medium">
                +${profesional.cargoTraslado} traslado
              </span>
            )}
          </div>
        )}
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {profesional.descripcion}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600 ml-1">
              {profesional.rating?.toFixed(1) || '0.0'} ({profesional.totalReviews || 0} reseñas)
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold text-gray-900">
              ${profesional.tarifas?.porHora || 0}/hora
            </span>
            {mostrarDistancia && profesional.cargoTraslado && profesional.cargoTraslado > 0 && (
              <p className="text-xs text-gray-500">+ cargo traslado</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {(profesional.zonasTrabajo || []).slice(0, 3).map((zona) => (
            <span
              key={zona}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {zona}
            </span>
          ))}
          {(profesional.zonasTrabajo || []).length > 3 && (
            <span className="text-xs text-gray-500">
              +{profesional.zonasTrabajo.length - 3} más
            </span>
          )}
        </div>
        
        <Link
          to={`/oficios/${profesional._id}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
        >
          Ver Perfil
        </Link>
      </div>
    </div>
  );
};

export default ProfesionalCardUbicacion;