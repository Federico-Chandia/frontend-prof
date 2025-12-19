import React, { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Notification } from '../types/notification';

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState<Notification[]>([]);

  useEffect(() => {
    // Mostrar solo las notificaciones nuevas como toasts (últimas 3)
    const newToasts = notifications.slice(0, 3);
    setVisibleToasts(newToasts);

    // Auto-remover toast después de 5 segundos
    const timers = newToasts.map(toast => 
      setTimeout(() => {
        setVisibleToasts(prev => prev.filter(t => t.id !== toast.id));
        removeNotification(toast.id);
      }, 4000)
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [notifications, removeNotification]);

  const getToastBackground = (tipo: string) => {
    switch (tipo) {
      case 'reserva_aceptada':
        return 'bg-green-500';
      case 'reserva_rechazada':
        return 'bg-red-500';
      case 'mensaje':
        return 'bg-blue-500';
      default:
        return 'bg-gray-800';
    }
  };

  const getToastIcon = (tipo: string, icon?: string) => {
    if (icon) return icon;
    switch (tipo) {
      case 'reserva_aceptada':
        return '✅';
      case 'reserva_rechazada':
        return '❌';
      case 'mensaje':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastBackground(toast.tipo)} text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in max-w-sm pointer-events-auto hover:shadow-xl transition-shadow`}
        >
          <span className="text-xl flex-shrink-0">
            {getToastIcon(toast.tipo, toast.icon)}
          </span>
          <div className="flex-1">
            <p className="font-semibold text-sm">{toast.titulo}</p>
            <p className="text-xs opacity-90 mt-1">{toast.mensaje}</p>
          </div>
          <button
            onClick={() => {
              setVisibleToasts(prev => prev.filter(t => t.id !== toast.id));
              removeNotification(toast.id);
            }}
            className="text-lg opacity-70 hover:opacity-100 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
