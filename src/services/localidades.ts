// API de localidades argentinas
const LOCALIDADES_API = 'https://apis.datos.gob.ar/georef/api';

export interface Provincia {
  id: string;
  nombre: string;
}

export interface Localidad {
  id: string;
  nombre: string;
  provincia: {
    id: string;
    nombre: string;
  };
}

export const fetchProvincias = async (): Promise<Provincia[]> => {
  try {
    const response = await fetch(`${LOCALIDADES_API}/provincias`);
    const data = await response.json();
    const provinciaMap = new Map<string, Provincia>();
    data.provincias.forEach((p: any) => {
      if (!provinciaMap.has(p.nombre)) {
        provinciaMap.set(p.nombre, { id: p.id, nombre: p.nombre });
      }
    });
    const provincias = Array.from(provinciaMap.values())
      .sort((a: Provincia, b: Provincia) => a.nombre.localeCompare(b.nombre));
    return provincias;
  } catch (error) {
    console.error('Error fetching provincias:', error);
    return [];
  }
};

export const fetchLocalidades = async (provinciaId?: string): Promise<Localidad[]> => {
  try {
    const url = provinciaId 
      ? `${LOCALIDADES_API}/localidades?provincia=${provinciaId}&max=1000`
      : `${LOCALIDADES_API}/localidades?max=1000`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const localidadMap = new Map<string, Localidad>();
    data.localidades.forEach((l: any) => {
      const key = `${l.nombre}-${l.provincia.id}`;
      if (!localidadMap.has(key)) {
        localidadMap.set(key, {
          id: l.id,
          nombre: l.nombre,
          provincia: {
            id: l.provincia.id,
            nombre: l.provincia.nombre
          }
        });
      }
    });
    const localidades = Array.from(localidadMap.values())
      .sort((a: Localidad, b: Localidad) => a.nombre.localeCompare(b.nombre));
    return localidades;
  } catch (error) {
    console.error('Error fetching localidades:', error);
    return [];
  }
};