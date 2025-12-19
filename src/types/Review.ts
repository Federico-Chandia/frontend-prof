import { User } from './User';

export interface Review {
  _id: string;
  reserva: string;
  cliente: User;
  oficio: string;
  puntuacion: number;
  comentario?: string;
  aspectos?: {
    puntualidad: number;
    calidad: number;
    precio: number;
    comunicacion: number;
  };
  fotos?: string[];
  respuestaOficio?: string;
  createdAt: string;
}