import api from './api';

export interface UbicacionBusqueda {
  lat: number;
  lng: number;
  direccion?: string;
}

export interface ResultadoBusqueda {
  oficios: any[];
  busquedaExtendida: boolean;
  radioUtilizado: number;
}

export const buscarProfesionales = async (
  tipoOficio: string, 
  ubicacion: UbicacionBusqueda,
  radioExtendido: boolean = false
): Promise<ResultadoBusqueda> => {
  const radio = radioExtendido ? 50 : 15; // km
  
  try {
    const response = await api.get('/oficios/buscar', {
      params: {
        tipoOficio,
        lat: ubicacion.lat,
        lng: ubicacion.lng,
        radio,
        incluirTraslado: radioExtendido
      }
    });
    
    return {
      oficios: response.data.oficios || [],
      busquedaExtendida: radioExtendido,
      radioUtilizado: radio
    };
  } catch (error) {
    console.error('Error en búsqueda de profesionales:', error);
    return {
      oficios: [],
      busquedaExtendida: radioExtendido,
      radioUtilizado: radio
    };
  }
};

export const calcularCargoTraslado = (distancia: number): number => {
  const kmGratuitos = 10;
  const costoPorKm = 50; // $50 por km adicional
  
  if (distancia <= kmGratuitos) return 0;
  return (distancia - kmGratuitos) * costoPorKm;
};

// Función para obtener ubicación del usuario
export const obtenerUbicacionUsuario = (): Promise<UbicacionBusqueda> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  });
};