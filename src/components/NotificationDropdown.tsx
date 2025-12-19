import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useNotifications();

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'mensaje': return '💬';
      case 'reserva_aceptada': return '✅';
      case 'reserva_rechazada': return '❌';
      default: return '🔔';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notificaciones</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Marcar leídas
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.leida ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    // Abrir url si existe y marcar como leída
                    if (notification.url) {
                      markAsRead(notification.id);
                      window.location.href = notification.url;
                    } else {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">
                      {getNotificationIcon(notification.tipo)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.titulo}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.mensaje}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(new Date(notification.fechaCreacion))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.leida && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <div className="flex flex-col items-end gap-2">
                        {notification.url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                              window.location.href = notification.url;
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Ver
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;