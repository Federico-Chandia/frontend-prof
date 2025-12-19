import React from 'react';

interface ValidacionCoberturaProps {
  validacion: {
    cobertura: boolean;
    distancia: number;
    cargoTraslado: number;
    mensaje?: string;
  };
  loading: boolean;
}

const ValidacionCobertura: React.FC<ValidacionCoberturaProps> = ({ validacion, loading }) => {
  if (loading) {
    return (
      <div className="mt-2 text-sm text-blue-600 flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        Validando cobertura...
      </div>
    );
  }

  if (!validacion) return null;

  return (
    <div className={`mt-2 p-3 rounded-md text-sm ${
      validacion.cobertura 
        ? 'bg-green-50 border border-green-200 text-green-700'
        : 'bg-red-50 border border-red-200 text-red-700'
    }`}>
      {validacion.cobertura ? (
        <div>
          <p className="font-medium">✓ Área cubierta</p>
          {validacion.distancia > 0 && (
            <p>Distancia: {validacion.distancia}km</p>
          )}
          {validacion.cargoTraslado > 0 && (
            <p>Cargo por traslado: ${validacion.cargoTraslado}</p>
          )}
          {validacion.mensaje && (
            <p className="text-xs mt-1 opacity-75">{validacion.mensaje}</p>
          )}
        </div>
      ) : (
        <div>
          <p className="font-medium">✗ Fuera del área de cobertura</p>
          <p className="text-sm mt-1">{validacion.mensaje || 'El profesional no cubre esta área'}</p>
        </div>
      )}
    </div>
  );
};

export default ValidacionCobertura;