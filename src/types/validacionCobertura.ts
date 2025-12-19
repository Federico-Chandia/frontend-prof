export interface Direccion {
  calle: string;
  barrio: string;
}

export interface Costos {
  base: number;
  transporte: number;
  total: number;
}

export interface ValidacionCobertura {
  cobertura: boolean;
  mensaje: string;
  costos?: Costos;
}

export type TipoServicio = 'porHora' | 'visitaTecnica' | 'emergencia';

export interface InformacionVisible {
  ubicacion: string;
  distancia: string | null;
  precision: 'ciudad' | 'barrio' | 'completa';
}

export interface SolicitudConPrivacidad {
  id: string;
  cliente: string;
  profesional: string;
  descripcionTrabajo: string;
  estado: 'pendiente' | 'contactado' | 'completada' | 'cancelada';
  distanciaAproximada?: number;
  informacionVisible: InformacionVisible;
  createdAt: Date;
}