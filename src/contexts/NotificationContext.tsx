import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification, NotificationContextType } from '../types/notification';
import { useAuth } from '../context/AuthContext';
import { useNotifications as useBrowserNotifications } from '../hooks/useNotifications';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { token, user } = useAuth();
  const browserNotifications = useBrowserNotifications();

  // Cargar notificaciones del localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const parsed = JSON.parse(saved).map((n: any) => ({
        ...n,
        fechaCreacion: new Date(n.fechaCreacion)
      }));
      setNotifications(parsed);
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Conectar Socket.IO para recibir notificaciones en tiempo real
  useEffect(() => {
    // Determinar URL de Socket según el ambiente
    const getSocketUrl = (): string => {
      const envUrl = import.meta.env.VITE_SOCKET_URL;
      if (envUrl) return envUrl;
      if (import.meta.env.DEV) return 'http://localhost:5003';
      return window.location.origin; // En producción, usar el mismo origen
    };

    const socketUrl = getSocketUrl();
    
    if (!token) return;

    console.log('[NotificationContext] Conectando Socket.IO a:', socketUrl);

    const socket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'] // Permitir fallback a polling
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[notifications] socket conectado', socket.id);
    });

    socket.on('notify', (payload: any) => {
      try {
        const tipoMap: any = { reserva: 'reserva_aceptada', orden: 'reserva_aceptada', solicitud: 'mensaje' };
        const tipo = payload.data?.tipo && tipoMap[payload.data.tipo] ? tipoMap[payload.data.tipo] : 'mensaje';
        const nueva = {
          tipo,
          titulo: payload.title || 'Notificación',
          mensaje: payload.body || '',
          reservaId: payload.data?.id || undefined,
          chatId: undefined,
          url: payload.data?.url || payload.url || undefined,
          icon: payload.icon || undefined,
          actions: payload.actions || undefined
        } as Omit<Notification, 'id' | 'fechaCreacion' | 'leida'>;
        const created = addNotification(nueva);

        // Mostrar notificación del navegador si está permitido
        if (browserNotifications.permission === 'granted') {
          const notif = browserNotifications.showNotification(created.titulo, {
            body: created.mensaje,
            icon: created.icon || '/favicon.ico',
            tag: created.id,
            data: { url: created.url },
            actions: created.actions as NotificationAction[] | undefined
          });

          try {
            if (notif) {
              notif.onclick = (ev: any) => {
                // Marcar como leída en la UI y navegar
                markAsRead(created.id);
                if (created.url) {
                  try { window.focus(); } catch (e) {}
                  try { window.location.href = created.url; } catch (e) { console.warn(e); }
                }
                try { notif.close(); } catch (e) {}
              };
              notif.onclose = () => {
                // No eliminar la notificación de la lista: persistirla
              };
            }
          } catch (err) {
            console.warn('Error attaching notification handlers', err);
          }
        }
      } catch (err) {
        console.warn('Error procesando notify:', err);
      }
    });

    socket.on('unreadCount', (data: any) => {
      // Opcional: podríamos sincronizar con backend si queremos
      console.log('[notifications] unreadCount', data);
    });

    socket.on('disconnect', (reason: any) => {
      console.log('[notifications] socket desconectado', reason);
      socketRef.current = null;
    });

    return () => {
      try { socket.disconnect(); } catch (e) {}
      socketRef.current = null;
    };
  }, [token]);

  const unreadCount = notifications.filter(n => !n.leida).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'fechaCreacion' | 'leida'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
      leida: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, leida: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};