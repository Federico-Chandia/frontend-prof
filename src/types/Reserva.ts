import { User } from './User';
import { Oficio } from './Oficio';

export interface Reserva {
  _id: string;
  cliente: User;
  profesional?: {
    usuario?: {
      _id: string;
      nombre: string;
    };
    profesion?: string;
    tipoprofesional?: string;
  };
  oficio: Oficio;
  fechaHora: string;
  duracionEstimada: number;
  descripcionTrabajo: string;
  direccion: {
    calle: string;
    barrio: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
  };
  estado: 'orden_generada' | 'en_progreso' | 'pendiente_confirmacion' | 'completada' | 'cancelada';
  costos: {
    subtotal: number;
    total: number;
  };
  pago: {
    estado: 'pendiente' | 'pagado' | 'reembolsado';
    metodoPago?: string;
    transactionId?: string;
    fechaPago?: string;
  };
  notas?: string;
  notasFinalizacion?: string;
  confirmacion?: {
    profesionalCompleto: boolean;
    clienteAprobado: boolean;
    fechaCompletadoProfesional?: string;
    fechaAprobadoCliente?: string;
    timeoutAutoConfirmacion?: string;
  };
  solicitudCorreccion?: {
    activa: boolean;
    descripcion?: string;
    fechaSolicitud?: string;
  };
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface ReservaValidation {
  isValid: boolean;
  errors: string[];
}