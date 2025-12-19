import { User } from './User';

export interface Oficio {
  _id: string;
  usuario: User;
  tipoOficio: 'plomero' | 'electricista' | 'gasista' | 'pintor' | 'carpintero' | 'albañil' | 'jardinero' | 'cerrajero' | 'otro';
  descripcion: string;
  experiencia: number;
  tarifas: {
    porHora: number;
    visitaTecnica: number;
    emergencia: number;
    desplazamiento?: number;
    kmGratuitos?: number;
  };
  radioCobertura?: number;
  disponibilidad: {
    inmediata: boolean;
    horarios: Array<{
      dia: string;
      inicio: string;
      fin: string;
    }>;
  };
  zonasTrabajo: string[];
  fotos: string[];
  certificaciones: string[];
  matricula?: string;
  seguroResponsabilidad?: boolean;
  whatsappLaboral?: string;
  disponibilidadHoraria?: {
    [dia: string]: {
      activo: boolean;
      inicio: string;
      fin: string;
    };
  };
  rating: number;
  totalReviews: number;
  trabajosCompletados: number;
  verificado: boolean;
  activo: boolean;
  enLinea: boolean;
  // Campos para búsqueda por ubicación
  distancia?: number;
  cargoTraslado?: number;
  profesion?: string; // Para compatibilidad con backend
  ultimasReviews?: Array<{
    _id: string;
    cliente: { nombre: string };
    puntuacion: number;
    comentario?: string;
    createdAt: string;
  }>;
}