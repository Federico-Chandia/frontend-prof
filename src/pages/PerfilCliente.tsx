import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PerfilCliente: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    avatar: '',
    direccion: {
      calle: '',
      barrio: '',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires'
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        avatar: user.avatar || '',
        direccion: user.direccion ? {
          calle: user.direccion.calle || '',
          barrio: user.direccion.barrio || '',
          ciudad: user.direccion.ciudad || 'Buenos Aires',
          provincia: user.direccion.provincia || 'Buenos Aires'
        } : {
          calle: '',
          barrio: '',
          ciudad: 'Buenos Aires',
          provincia: 'Buenos Aires'
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // Limpiar datos antes de enviar
      const cleanData = {
        ...formData,
        nombre: formData.nombre?.trim() || '',
        telefono: formData.telefono?.trim() || '',
        direccion: formData.direccion ? {
          calle: formData.direccion.calle?.trim() || '',
          barrio: formData.direccion.barrio?.trim() || '',
          ciudad: formData.direccion.ciudad?.trim() || 'Buenos Aires',
          provincia: formData.direccion.provincia?.trim() || 'Buenos Aires'
        } : {
          calle: '',
          barrio: '',
          ciudad: 'Buenos Aires',
          provincia: 'Buenos Aires'
        }
      };
      
      const response = await api.put('/users/profile', cleanData);
      
      // Actualizar el contexto de autenticación con los nuevos datos
      if (response.data.user) {
        updateUser(response.data.user);
      }
      
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setEditMode(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Error al guardar el perfil';
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData({...formData, avatar: result});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">Gestiona tu información personal</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {editMode ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Foto de perfil */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                  👤
                </div>
              )}
            </div>
            
            {editMode && (
              <div>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
                  Cambiar Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Información personal */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.nombre || 'No especificado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900">{formData.email}</p>
                <p className="text-xs text-gray-500">El email no se puede cambiar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.telefono || 'No especificado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.direccion?.ciudad || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      direccion: {...(formData.direccion || {}), ciudad: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.direccion?.ciudad || 'No especificada'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.direccion?.provincia || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      direccion: {...(formData.direccion || {}), provincia: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.direccion?.provincia || 'No especificada'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              {editMode ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Calle y número"
                    value={formData.direccion?.calle || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      direccion: {...(formData.direccion || {}), calle: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Barrio"
                    value={formData.direccion?.barrio || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      direccion: {...(formData.direccion || {}), barrio: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-gray-900">
                    {formData.direccion?.calle && formData.direccion?.barrio 
                      ? `${formData.direccion.calle}, ${formData.direccion.barrio}`
                      : 'No especificada'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`mt-4 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Botones de acción */}
          {editMode && (
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setEditMode(false);
                  setMessage(null);
                }}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilCliente;