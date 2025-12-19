import { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export const useNotificationHandler = () => {
  const { addNotification } = useNotifications();

  const notifyReservaAceptada = (nombreTecnico: string, reservaId: string) => {
    addNotification({
      tipo: 'reserva_aceptada',
      titulo: 'Reserva Aceptada',
      mensaje: `${nombreTecnico} ha aceptado tu reserva`,
      reservaId
    });
  };

  const notifyReservaRechazada = (nombreTecnico: string, reservaId: string) => {
    addNotification({
      tipo: 'reserva_rechazada',
      titulo: 'Reserva Rechazada',
      mensaje: `${nombreTecnico} ha rechazado tu reserva`,
      reservaId
    });
  };

  const notifyNuevoMensaje = (nombreUsuario: string, chatId: string) => {
    addNotification({
      tipo: 'mensaje',
      titulo: 'Nuevo Mensaje',
      mensaje: `${nombreUsuario} te ha enviado un mensaje`,
      chatId
    });
  };

  return {
    notifyReservaAceptada,
    notifyReservaRechazada,
    notifyNuevoMensaje
  };
};