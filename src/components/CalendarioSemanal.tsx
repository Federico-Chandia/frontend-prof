import React, { useState, useMemo } from 'react';
import { Reserva } from '../types';

interface CalendarioSemanalProps {
  reservas: Reserva[];
}

const CalendarioSemanal: React.FC<CalendarioSemanalProps> = ({ reservas }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
    return new Date(d.setDate(diff));
  };

  const reservasSemana = useMemo(() => {
    const startOfWeek = getStartOfWeek(currentWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Incluir todo el último día
    
    console.log('Filtrando reservas para semana:', startOfWeek, 'a', endOfWeek);
    console.log('Total reservas disponibles:', reservas.length);
    
    const reservasFiltradas = reservas.filter(reserva => {
      const reservaDate = new Date(reserva.fechaHora);
      const enRango = reservaDate >= startOfWeek && reservaDate <= endOfWeek;
      if (enRango) {
        console.log('Reserva en rango:', reserva.cliente.nombre, reservaDate);
      }
      return enRango;
    });
    
    console.log('Reservas filtradas para la semana:', reservasFiltradas.length);
    return reservasFiltradas;
  }, [reservas, currentWeek]);

  const getDaysOfWeek = () => {
    const startOfWeek = getStartOfWeek(currentWeek);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getReservasForDay = (date: Date) => {
    return reservasSemana.filter(reserva => {
      const reservaDate = new Date(reserva.fechaHora);
      return reservaDate.toDateString() === date.toDateString();
    });
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getReservaAtTime = (date: Date, time: string) => {
    const dayReservas = getReservasForDay(date);
    const [slotHour] = time.split(':').map(Number);
    
    return dayReservas.find(reserva => {
      const reservaDate = new Date(reserva.fechaHora);
      const reservaHour = reservaDate.getHours();
      // Mostrar la reserva en el slot de la hora correspondiente
      return reservaHour === slotHour;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      'pendiente': 'bg-yellow-200 text-yellow-800',
      'confirmada': 'bg-blue-200 text-blue-800',
      'en_progreso': 'bg-purple-200 text-purple-800',
      'completada': 'bg-green-200 text-green-800',
      'cancelada': 'bg-red-200 text-red-800'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-200 text-gray-800';
  };

  const formatWeekRange = () => {
    const startOfWeek = getStartOfWeek(currentWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString('es-AR')} - ${endOfWeek.toLocaleDateString('es-AR')}`;
  };



  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Calendario Semanal</h2>
          <p className="text-sm text-gray-600">{formatWeekRange()}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded"
          >
            Hoy
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 text-sm font-medium text-gray-500">Hora</div>
            {getDaysOfWeek().map((day, index) => (
              <div key={index} className="p-3 text-center border-l">
                <div className="text-sm font-medium text-gray-900">
                  {day.toLocaleDateString('es-AR', { weekday: 'short' })}
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {getTimeSlots().map((time) => (
            <div key={time} className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-3 text-sm text-gray-500 border-r">
                {time}
              </div>
              
              {getDaysOfWeek().map((day, dayIndex) => {
                const reserva = getReservaAtTime(day, time);
                
                return (
                  <div key={dayIndex} className="p-1 border-l min-h-[60px]">
                    {reserva && (
                      <div className={`p-2 rounded text-xs ${getEstadoColor(reserva.estado)}`}>
                        <div className="font-medium truncate">
                          {reserva.cliente.nombre}
                        </div>
                        <div className="text-xs opacity-75 mb-1">
                          {new Date(reserva.fechaHora).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="truncate">
                          {reserva.descripcionTrabajo}
                        </div>
                        <div className="text-xs opacity-75">
                          ${reserva.costos.subtotal}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {reservasSemana.length}
            </div>
            <div className="text-sm text-gray-600">Total Citas</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {reservasSemana.filter(r => r.estado === 'completada').length}
            </div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {reservasSemana.filter(r => r.estado === 'en_progreso').length}
            </div>
            <div className="text-sm text-gray-600">Confirmadas</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {reservasSemana.filter(r => r.estado === 'orden_generada').length}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioSemanal;