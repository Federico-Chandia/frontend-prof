import React from 'react';
import { Link } from 'react-router-dom';
import { OficioConDistancia } from '../hooks/useBusquedaProfesionales';
import { calcularCargoTraslado } from '../services/busquedaService';

interface ProfesionalCardProps {
  oficio: OficioConDistancia;
  busquedaExtendida: boolean;
}

const ProfesionalCard: React.FC<ProfesionalCardProps> = ({ oficio, busquedaExtendida }) => {
  const distancia = oficio.distancia || 0;
  const cargoTraslado = busquedaExtendida && distancia > 10 ? calcularCargoTraslado(distancia) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {oficio.usuario.nombre}
            </h3>
            <p className="text-blue-600 font-medium capitalize">
              {oficio.tipoOficio}
            </p>
          </div>
          <div className="text-right">
            {distancia > 0 && (
              <div className="text-sm text-gray-600 mb-1">
                {distancia.toFixed(1)} km
              </div>
            )}
            {oficio.disponibilidad.inmediata && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Disponible
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {oficio.descripcion}
        </p>
        
        {cargoTraslado > 0 && (
          <div className="bg-orange-50 border border-orange-200 p-2 rounded text-xs mb-3">
            <div className="flex justify-between items-center">
              <span className="text-orange-700">Cargo por traslado:</span>
              <span className="font-semibold text-orange-800">${cargoTraslado}</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600 ml-1">
              {oficio.rating.toFixed(1)} ({oficio.totalReviews} reseñas)
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold text-gray-900">
              ${oficio.tarifas.porHora}/hora
            </span>
            {cargoTraslado > 0 && (
              <div className="text-xs text-orange-600">
                + traslado
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {oficio.zonasTrabajo.slice(0, 3).map((zona) => (
            <span
              key={zona}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {zona}
            </span>
          ))}
          {oficio.zonasTrabajo.length > 3 && (
            <span className="text-xs text-gray-500">
              +{oficio.zonasTrabajo.length - 3} más
            </span>
          )}
        </div>

        {/* Últimas Reseñas */}
        {oficio.ultimasReviews && oficio.ultimasReviews.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Últimas reseñas:</h4>
            <div className="space-y-2">
              {oficio.ultimasReviews.slice(0, 3).map((review, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{review.cliente?.nombre || 'Cliente'}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`${i < review.puntuacion ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.comentario && (
                    <p className="text-gray-600 line-clamp-2">{review.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Link
          to={`/oficios/${oficio._id}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
        >
          Ver Perfil
        </Link>
      </div>
    </div>
  );
};

export default ProfesionalCard;