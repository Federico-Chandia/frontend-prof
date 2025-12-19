export interface Notification {
  id: string;
  tipo: 'mensaje' | 'reserva_aceptada' | 'reserva_rechazada' | 'otro';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string | Date;
  reservaId?: string;
  chatId?: string;
  url?: string; // ruta a abrir al click
  icon?: string; // URL o emoji
  actions?: Array<{ action: string; title: string }>; // acciones sugeridas
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'fechaCreacion' | 'leida'>) => Notification; // devuelve la notificación creada
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  error?: string | null;
}