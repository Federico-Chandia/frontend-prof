import { useState, useCallback } from 'react';
import { Oficio } from '../types';
import { buscarProfesionales, UbicacionBusqueda, obtenerUbicacionUsuario } from '../services/busquedaService';

export interface OficioConDistancia extends Oficio {
  distancia?: number;
  cargoTraslado?: number;
  ultimasReviews?: Array<{
    _id: string;
    cliente: { nombre: string };
    puntuacion: number;
    comentario?: string;
    createdAt: string;
  }>;
}

export const useBusquedaProfesionales = (tipoOficio: string) => {
  const [profesionales, setProfesionales] = useState<OficioConDistancia[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarBusquedaExpandida, setMostrarBusquedaExpandida] = useState(false);
  const [busquedaExtendida, setBusquedaExtendida] = useState(false);
  const [ubicacionUsuario, setUbicacionUsuario] = useState<UbicacionBusqueda | null>(null);
  const [error, setError] = useState<string>('');

  const buscar = useCallback(async (ubicacion?: UbicacionBusqueda) => {
    setLoading(true);
    setError('');
    
    try {
      let ubicacionFinal = ubicacion;
      
      if (!ubicacionFinal) {
        try {
          ubicacionFinal = await obtenerUbicacionUsuario();
          setUbicacionUsuario(ubicacionFinal);
        } catch (geoError) {
          setError('No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación.');
          setLoading(false);
          return;
        }
      }

      const resultado = await buscarProfesionales(tipoOficio, ubicacionFinal, false);
      
      if (resultado.oficios.length === 0) {
        setMostrarBusquedaExpandida(true);
      } else {
        setProfesionales(resultado.oficios);
        setBusquedaExtendida(false);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setError('Error al buscar profesionales. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [tipoOficio]);

  const buscarLejanos = useCallback(async () => {
    if (!ubicacionUsuario) return;
    
    setLoading(true);
    setBusquedaExtendida(true);
    setMostrarBusquedaExpandida(false);
    
    try {
      const resultado = await buscarProfesionales(tipoOficio, ubicacionUsuario, true);
      setProfesionales(resultado.oficios);
      
      if (resultado.oficios.length === 0) {
        setError('No se encontraron profesionales disponibles en un radio de 50km.');
      }
    } catch (error) {
      console.error('Error en búsqueda extendida:', error);
      setError('Error al buscar profesionales lejanos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [tipoOficio, ubicacionUsuario]);

  const cerrarModal = useCallback(() => {
    setMostrarBusquedaExpandida(false);
  }, []);

  const reiniciarBusqueda = useCallback(() => {
    setProfesionales([]);
    setBusquedaExtendida(false);
    setMostrarBusquedaExpandida(false);
    setError('');
  }, []);

  return {
    profesionales,
    loading,
    mostrarBusquedaExpandida,
    busquedaExtendida,
    error,
    buscar,
    buscarLejanos,
    cerrarModal,
    reiniciarBusqueda
  };
};