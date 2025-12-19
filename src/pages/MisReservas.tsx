import React, { useState, useEffect } from 'react';
import { Reserva } from '../types';
import api from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

import ChatModalV2 from '../components/ChatModalV2';
import ReviewModal from '../components/ReviewModal';

const MisReservas: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activas' | 'historial' | 'favoritos'>('activas');

  const [chatOpen, setChatOpen] = useState<{reservaId: string, otherUser: {id: string, name: string}} | null>(null);
  const [reviewOpen, setReviewOpen] = useState<Reserva | null>(null);
  const [confirmModal, setConfirmModal] = useState<{type: 'confirmar' | 'corregir' | 'cancelar', reserva: Reserva} | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [importeReal, setImporteReal] = useState('');
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      const response = await api.get('/reservas?tipo=cliente');
      setReservas(response.data || []);
    } catch (error) {
      console.error('Error fetching reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReservasActivas = () => {
    return reservas.filter(r => ['orden_generada', 'en_progreso', 'pendiente_confirmacion'].includes(r.estado));
  };

  const getHistorial = () => {
    return reservas.filter(r => ['completada', 'cancelada'].includes(r.estado));
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      'orden_generada': 'bg-blue-100 text-blue-800',
      'en_progreso': 'bg-purple-100 text-purple-800',
      'pendiente_confirmacion': 'bg-amber-100 text-amber-800',
      'completada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    
    const labels = {
      'orden_generada': 'Orden Generada',
      'en_progreso': 'En Progreso',
      'pendiente_confirmacion': 'Pendiente Confirmación',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[estado as keyof typeof badges]}`}>
        {labels[estado as keyof typeof labels]}
      </span>
    );
  };

  const confirmarTrabajo = async (reservaId: string) => {
    try {
      const importe = parseFloat(importeReal);
      if (!importe || importe <= 0) {
        alert('Debe ingresar un importe válido');
        return;
      }
      
      await api.put(`/reservas/${reservaId}/confirmar`, { importeReal: importe });
      fetchReservas();
      setConfirmModal(null);
      setImporteReal('');
      notifyConfirmacion(reservaId);
    } catch (error) {
      console.error('Error confirmando trabajo:', error);
    }
  };

  // Mostrar toast/notification mejorado al confirmar trabajo
  // (se llama desde el flujo de confirmación después de éxito)
  const notifyConfirmacion = (reservaId: string) => {
    if (!addNotification) return;
    addNotification({
      tipo: 'reserva_aceptada',
      titulo: 'Trabajo confirmado',
      mensaje: 'Has confirmado la finalización. La reserva se marcara "Completada".',
      url: `/mis-reservas?reserva=${reservaId}`,
      icon: '✅',
      actions: [
        { action: 'ver', title: 'Ver Reserva' }
      ]
    });
  };

  const cancelarReserva = async (reservaId: string) => {
    try {
      await api.put(`/reservas/${reservaId}/estado`, { estado: 'cancelada' });
      fetchReservas();
      setConfirmModal(null);
      if (addNotification) {
        addNotification({ tipo: 'otro', titulo: 'Reserva cancelada', mensaje: 'Reserva cancelada correctamente' });
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      if (addNotification) {
        addNotification({ tipo: 'otro', titulo: 'Error', mensaje: 'No se pudo cancelar la reserva' });
      }
    }
  };

  const solicitarCorrecciones = async (reservaId: string, descripcion: string) => {
    try {
      await api.put(`/reservas/${reservaId}/solicitar-correcciones`, { descripcion });
      fetchReservas();
      setConfirmModal(null);
      setCorrectionText('');
    } catch (error) {
      console.error('Error solicitando correcciones:', error);
    }
  };

  const getProximaCita = () => {
    const activas = getReservasActivas();
    return activas.sort((a, b) => new Date(b.createdAt || b._id).getTime() - new Date(a.createdAt || a._id).getTime())[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const proximaCita = getProximaCita();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
              <p className="text-gray-600 mt-2">Gestiona tus reservas y servicios</p>
            </div>
          </div>
        </div>

        {proximaCita && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Orden Generada</h2>
                <p className="text-blue-100 mb-1">{proximaCita.profesional?.usuario?.nombre || 'Profesional'} - {proximaCita.profesional?.profesion || proximaCita.profesional?.tipoprofesional || 'Servicio'}</p>
                <p className="text-blue-100">{proximaCita.descripcionTrabajo}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setChatOpen({
                    reservaId: proximaCita._id,
                      otherUser: { id: proximaCita.profesional?.usuario?._id || '', name: proximaCita.profesional?.usuario?.nombre || 'Profesional' }
                  })}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 font-medium"
                >
                  💬 Chat
                </button>
                      {proximaCita.estado === 'orden_generada' && (
                        <button
                          onClick={() => setConfirmModal({ type: 'cancelar', reserva: proximaCita })}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium"
                        >
                          ✖️ Cancelar Orden
                        </button>
                      )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Reservas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{getReservasActivas().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservas.filter(r => r.estado === 'completada').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Gastado este Mes</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${reservas.filter(r => r.estado === 'completada').reduce((sum, r) => sum + r.costos.total, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'activas', label: 'Reservas Activas', count: getReservasActivas().length },
                { key: 'historial', label: 'Historial', count: getHistorial().length },
                { key: 'favoritos', label: 'Favoritos', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'activas' && (
              <div className="space-y-4">
                {getReservasActivas().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tienes reservas activas</p>
                    <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                      Buscar Profesionales
                    </button>
                  </div>
                ) : (
                  getReservasActivas().map((reserva) => (
                    <div key={reserva._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {reserva.profesional?.usuario?.nombre || 'Profesional'}
                            </h3>
                            {getEstadoBadge(reserva.estado)}
                          </div>
                          
                          <p className="text-gray-600 mb-2">{reserva.descripcionTrabajo}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>🔧 {reserva.oficio?.profesion || reserva.oficio?.tipoOficio || 'Servicio'}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${(reserva.costos.importeReal || reserva.costos.total).toLocaleString()}
                          </p>
                          {reserva.costos.importeReal && (
                            <p className="text-sm text-gray-500">
                              Importe real cobrado
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {reserva.notasFinalizacion && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Notas del profesional:</strong> {reserva.notasFinalizacion}
                          </p>
                        </div>
                      )}

                      {reserva.solicitudCorreccion?.activa && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Correcciones solicitadas:</strong> {reserva.solicitudCorreccion.descripcion}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex gap-2">
                        {reserva.estado === 'pendiente_confirmacion' && (
                          <>
                            <button
                              onClick={() => setConfirmModal({type: 'confirmar', reserva})}
                              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                            >
                              ✅ Confirmar Trabajo
                            </button>
                            <button
                              onClick={() => setConfirmModal({type: 'corregir', reserva})}
                              className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
                            >
                              🔧 Solicitar Correcciones
                            </button>
                          </>
                        )}
                        {reserva.estado === 'orden_generada' && (
                          <button
                            onClick={() => setConfirmModal({ type: 'cancelar', reserva })}
                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                          >
                            ✖️ Cancelar Orden
                          </button>
                        )}
                        
                        <button
                          onClick={() => setChatOpen({
                            reservaId: reserva._id,
                              otherUser: { id: reserva.profesional?.usuario?._id || '', name: reserva.profesional?.usuario?.nombre || 'Profesional' }
                          })}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
                        >
                          💬 Chat
                        </button>
                        
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'historial' && (
              <div className="space-y-4">
                {getHistorial().map((reserva) => (
                  <div key={reserva._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {reserva.profesional?.usuario?.nombre || 'Profesional'}
                          </h3>
                          {getEstadoBadge(reserva.estado)}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{reserva.descripcionTrabajo}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${reserva.costos.total.toLocaleString()}
                        </p>
                        {reserva.estado === 'completada' && (
                          <button 
                            onClick={() => setReviewOpen(reserva)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            ⭐ Dejar Reseña
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'favoritos' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Funcionalidad de favoritos próximamente</p>
              </div>
            )}
          </div>
        </div>

        {chatOpen && (
          <ChatModalV2
            reservaId={chatOpen.reservaId}
            otherUser={chatOpen.otherUser}
            onClose={() => setChatOpen(null)}
          />
        )}

        {reviewOpen && (
          <ReviewModal
            reserva={reviewOpen}
            isOpen={true}
            onClose={() => setReviewOpen(null)}
            onSuccess={() => {
              fetchReservas();
              setReviewOpen(null);
            }}
          />
        )}

        {confirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                {confirmModal.type === 'confirmar' ? (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Confirmar Trabajo Completado</h3>
                    <p className="text-gray-600 mb-4">
                      Ingresa el importe total que te cobró el profesional por este servicio:
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Importe cobrado ($)
                      </label>
                      <input
                        type="number"
                        value={importeReal}
                        onChange={(e) => setImporteReal(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md"
                        placeholder="Ej: 5000"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Este importe se usará para las estadísticas y comisiones de la plataforma.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => confirmarTrabajo(confirmModal.reserva._id)}
                        disabled={!importeReal || parseFloat(importeReal) <= 0}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Confirmar Trabajo
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal(null);
                          setImporteReal('');
                        }}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : confirmModal.type === 'corregir' ? (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Solicitar Correcciones</h3>
                    <p className="text-gray-600 mb-4">
                      Describe qué correcciones necesita el trabajo:
                    </p>
                    <textarea
                      value={correctionText}
                      onChange={(e) => setCorrectionText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md mb-4"
                      rows={4}
                      placeholder="Describe las correcciones necesarias..."
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => solicitarCorrecciones(confirmModal.reserva._id, correctionText)}
                        disabled={!correctionText.trim()}
                        className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
                      >
                        Enviar Solicitud
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal(null);
                          setCorrectionText('');
                        }}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Cancelar Orden</h3>
                    <p className="text-gray-600 mb-4">
                      ¿Deseas cancelar esta Orden Generada? Se marcará como cancelada.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => cancelarReserva(confirmModal.reserva._id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                      >
                        Sí, Cancelar Orden
                      </button>
                      <button
                        onClick={() => setConfirmModal(null)}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                      >
                        Volver
                      </button>
                    </div>
                  </>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisReservas;