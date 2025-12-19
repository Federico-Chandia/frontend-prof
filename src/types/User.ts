export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: {
    calle: string;
    barrio: string;
    ciudad: string;
    provincia: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
  };
  rol: 'cliente' | 'profesional' | 'admin';
  avatar?: string;
  verificado: boolean;
  activo: boolean;
  tokens?: {
    disponibles: number;
    plan: 'basico' | 'premium' | 'profesional';
    renovacion?: string;
  };
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  rol: 'cliente' | 'profesional';
  direccion?: {
    calle: string;
    barrio: string;
    ciudad: string;
    provincia: string;
  };
}