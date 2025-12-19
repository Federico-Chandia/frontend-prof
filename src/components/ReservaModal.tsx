import React, { useState, useEffect} from 'react';
import { Oficio } from '../types';
import api from '../services/api';
import { useValidacionCobertura } from '../hooks/useValidacionCobertura';
import { useNotifications } from '../contexts/NotificationContext';
import ValidacionCobertura from './ValidacionCobertura';
import LocationSelector from './LocationSelector';

interface ReservaModalProps {
  oficio: Oficio;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReservaModal: React.FC<ReservaModalProps> = ({ oficio, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    descripcionTrabajo: '',
    direccion: {
      calle: '',
      barrio: ''
    },
    tipoServicio: 'porHora'
  });
  const [ubicacion, setUbicacion] = useState<{lat: number; lng: number; address: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { validacion: validacionCobertura, loading: validandoCobertura, validarCobertura, reset } = useValidacionCobertura();
  const { addNotification } = useNotifications();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.direccion.calle && formData.direccion.barrio) {
        validarCobertura(
          oficio._id,
          formData.direccion,
          formData.tipoServicio,
        );
      } else {
        reset();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.direccion.calle, formData.direccion.barrio, formData.tipoServicio, validarCobertura, reset, oficio._id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const reservaData = {
        oficioId: oficio._id,
        descripcionTrabajo: formData.descripcionTrabajo,
        direccion: formData.direccion,
        tipoServicio: formData.tipoServicio
      };

      await api.post('/reservas', reservaData);
      
      // Mostrar toast de éxito
      addNotification({
        tipo: 'reserva_aceptada',
        titulo: 'Orden Generada',
        mensaje: `Tu reserva con ${oficio.usuario.nombre} ha sido creada exitosamente. Coordina la fecha y hora por chat.`,
        icon: '📋',
        url: '/mis-reservas',
        actions: [
          { action: 'ver', title: 'Ver Reservas' }
        ]
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating reserva:', error);
      setError(error.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reservar Servicio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-semibold">{oficio.usuario.nombre}</p>
          <p className="text-sm text-gray-600 capitalize">{oficio.tipoOficio}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Servicio</label>
            <select
              value={formData.tipoServicio}
              onChange={(e) => {
                const newValue = e.target.value;
                setFormData(prev => ({...prev, tipoServicio: newValue}));
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="porHora">Obra general (${oficio.tarifas.porHora}/h)</option>
              <option value="visitaTecnica">Visita Técnica (${oficio.tarifas.visitaTecnica})</option>
              <option value="emergencia">Emergencia (${oficio.tarifas.emergencia})</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Descripción del Trabajo</label>
            <textarea
              value={formData.descripcionTrabajo}
              onChange={(e) => {
                const newValue = e.target.value;
                setFormData(prev => ({...prev, descripcionTrabajo: newValue}));
              }}
              placeholder="Describe el trabajo que necesitas..."
              rows={3}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm">
            💬 La fecha y hora se coordinarán mediante chat con el profesional
          </div> <br />
          <div>
            <label className="block text-sm font-medium mb-1">¿Dónde necesitas el servicio?</label>
            <LocationSelector
              onLocationSelect={(location) => {
                setUbicacion(location);
                const addressParts = location.address.split(',');
                setFormData({
                  ...formData,
                  direccion: {
                    calle: addressParts[0]?.trim() || location.address,
                    barrio: addressParts[1]?.trim() || 'Centro'
                  }
                });
              }}
            />
            
          </div>
 <ValidacionCobertura 
              validacion={validacionCobertura} 
              loading={validandoCobertura} 
            />
         
          

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                loading || 
                validandoCobertura || 
                !ubicacion?.address?.trim() || 
                !formData.descripcionTrabajo.trim() ||
                (validacionCobertura && !validacionCobertura.cobertura)
              }
              className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              title={
                !ubicacion?.address?.trim() ? 'Ingresa una dirección' :
                !formData.descripcionTrabajo.trim() ? 'Describe el trabajo' :
                validandoCobertura ? 'Validando cobertura...' :
                validacionCobertura && !validacionCobertura.cobertura ? 'Área fuera de cobertura' :
                loading ? 'Procesando reserva...' : 'Confirmar reserva'
              }
            >
              {loading ? 'Reservando...' : 
               validandoCobertura ? 'Validando...' : 
               'Confirmar Reserva'}
            </button>
          </div>
          
          {/* Mensaje de ayuda cuando el botón está desactivado */}
          {(
            !ubicacion?.address?.trim() || 
            !formData.descripcionTrabajo.trim() ||
            validandoCobertura ||
            (validacionCobertura && !validacionCobertura.cobertura)
          ) && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
              {!ubicacion?.address?.trim() && '📍 Ingresa una dirección para continuar'}
              {!formData.descripcionTrabajo.trim() && ubicacion?.address?.trim() && '✏️ Describe el trabajo que necesitas'}
              {ubicacion?.address?.trim() && formData.descripcionTrabajo.trim() && validandoCobertura && '⏳ Validando cobertura del área...'}
              {ubicacion?.address?.trim() && formData.descripcionTrabajo.trim() && !validandoCobertura && validacionCobertura && !validacionCobertura.cobertura && '❌ El profesional no cubre esta área'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReservaModal;