import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BusquedaUbicacionButtonProps {
  className?: string;
}

const BusquedaUbicacionButton: React.FC<BusquedaUbicacionButtonProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBuscarPorUbicacion = async () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        navigate(`/oficios?lat=${latitude}&lng=${longitude}&ubicacion=true`);
        setLoading(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <button
      onClick={handleBuscarPorUbicacion}
      disabled={loading}
      className={`flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Obteniendo ubicación...
        </>
      ) : (
        <>
          <span className="text-lg">📍</span>
          Buscar cerca de mí
        </>
      )}
    </button>
  );
};

export default BusquedaUbicacionButton;