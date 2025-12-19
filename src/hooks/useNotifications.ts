import { useEffect, useState } from 'react';

interface NotificationState {
  permission: NotificationPermission;
  supported: boolean;
}

export const useNotifications = () => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    permission: 'default',
    supported: false
  });

  useEffect(() => {
    // Verificar si las notificaciones están soportadas
    if ('Notification' in window) {
      setNotificationState({
        permission: Notification.permission,
        supported: true
      });
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!notificationState.supported) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setNotificationState(prev => ({ ...prev, permission }));
    return permission;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (notificationState.permission === 'granted' && notificationState.supported) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
    return null;
  };

  const showWorkRequestNotification = (clientName: string, serviceType: string) => {
    return showNotification('¡Nueva solicitud de trabajo!', {
      body: `${clientName} solicita servicios de ${serviceType}`,
      icon: '/favicon.ico',
      tag: 'work-request',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Ver solicitud' },
        { action: 'dismiss', title: 'Descartar' }
      ]
    });
  };

  return {
    ...notificationState,
    requestPermission,
    showNotification,
    showWorkRequestNotification
  };
};