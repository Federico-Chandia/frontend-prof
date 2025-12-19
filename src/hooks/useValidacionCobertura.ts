import { useState, useCallback } from 'react';
import api from '../services/api';

interface ValidacionCobertura {
  cobertura: boolean;
  distancia: number;
  cargoTraslado: number;
  costos: {
    subtotal: number;
    comision: number;
    cargoTraslado: number;
    total: number;
  };
  mensaje?: string;
}

export const useValidacionCobertura = () => {
  const [validacion, setValidacion] = useState<ValidacionCobertura | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const validarCobertura = useCallback(async (
    oficioId: string,
    direccion: { calle: string; barrio: string },
    tipoServicio: string,
    duracionEstimada: number = 2
  ) => {
    if (!direccion.calle || !direccion.barrio) {
      setValidacion(null);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/reservas/validar-cobertura', {
        oficioId,
        direccion,
        tipoServicio,
        duracionEstimada
      });
      
      setValidacion(response.data);
    } catch (error: any) {
      console.error('Error validando cobertura:', error);
      const errorMessage = error.response?.data?.message || 'Error al validar cobertura';
      setError(errorMessage);
      
      // Si es un error de cobertura, mostrar el mensaje específico
      if (error.response?.status === 400 || errorMessage.includes('Fuera del área')) {
        setValidacion({
          cobertura: false,
          distancia: 0,
          cargoTraslado: 0,
          costos: {
            subtotal: 0,
            comision: 0,
            cargoTraslado: 0,
            total: 0
          },
          mensaje: errorMessage
        });
      } else {
        // Para otros errores, permitir continuar pero mostrar advertencia
        setValidacion({
          cobertura: true,
          distancia: 0,
          cargoTraslado: 0,
          costos: {
            subtotal: 0,
            comision: 0,
            cargoTraslado: 0,
            total: 0
          },
          mensaje: 'No se pudo validar la cobertura, pero puedes continuar'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setValidacion(null);
    setError('');
    setLoading(false);
  }, []);

  return {
    validacion,
    loading,
    error,
    validarCobertura,
    reset
  };
};