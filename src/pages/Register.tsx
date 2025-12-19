import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente' as 'cliente' | 'profesional',
    direccion: {
      calle: '',
      barrio: '',
      ciudad: 'Buenos Aires',
      provincia: 'Buenos Aires',
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('direccion.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        direccion: {
          ...formData.direccion,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateAddress = () => {
    if (!formData.direccion.calle.trim()) {
      return 'La dirección es requerida';
    }
    if (formData.direccion.calle.length < 5) {
      return 'La dirección debe tener al menos 5 caracteres';
    }
    if (!formData.direccion.barrio.trim()) {
      return 'El barrio es requerido';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const addressError = validateAddress();
    if (addressError) {
      setError(addressError);
      return;
    }
    
    setLoading(true);

    try {
      await register(formData);
      // Redirección condicional según el rol
      if (formData.rol === 'profesional') {
        navigate('/mi-perfil?onboarding=true');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      let errorMessage = 'Error al crear la cuenta';
      
      if (err?.response?.data?.errors) {
        // Errores de validación
        errorMessage = err.response.data.errors.map((e: any) => e.msg).join(', ');
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                La contraseña debe contener al menos una mayúscula, una minúscula y un número
              </p>
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                Tipo de Usuario
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cliente">Cliente (busco servicios)</option>
                <option value="profesional">Profesional (ofrezco servicios)</option>
              </select>
            </div>

            <div>
              <label htmlFor="direccion.calle" className="block text-sm font-medium text-gray-700">
                Dirección *
              </label>
              <input
                id="direccion.calle"
                name="direccion.calle"
                type="text"
                required
                placeholder="Ej: Av. Corrientes 1234"
                value={formData.direccion.calle}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="direccion.barrio" className="block text-sm font-medium text-gray-700">
                  Localidad *
                </label>
                <input
                  id="direccion.barrio"
                  name="direccion.barrio"
                  type="text"
                  required
                  placeholder="Ej: Palermo"
                  value={formData.direccion.barrio}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="direccion.provincia" className="block text-sm font-medium text-gray-700">
                  Provincia
                </label>
                <select
                  id="direccion.provincia"
                  name="direccion.provincia"
                  value={formData.direccion.provincia}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Buenos Aires">Buenos Aires</option>
                  <option value="CABA">CABA</option>
                  <option value="Córdoba">Córdoba</option>
                  <option value="Santa Fe">Santa Fe</option>
                  <option value="Mendoza">Mendoza</option>
                  <option value="Tucumán">Tucumán</option>
                  <option value="Entre Ríos">Entre Ríos</option>
                  <option value="Salta">Salta</option>
                  <option value="Misiones">Misiones</option>
                  <option value="Chaco">Chaco</option>
                  <option value="Corrientes">Corrientes</option>
                  <option value="Santiago del Estero">Santiago del Estero</option>
                  <option value="San Juan">San Juan</option>
                  <option value="Jujuy">Jujuy</option>
                  <option value="Río Negro">Río Negro</option>
                  <option value="Neuquén">Neuquén</option>
                  <option value="Formosa">Formosa</option>
                  <option value="Chubut">Chubut</option>
                  <option value="San Luis">San Luis</option>
                  <option value="Catamarca">Catamarca</option>
                  <option value="La Rioja">La Rioja</option>
                  <option value="La Pampa">La Pampa</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="Tierra del Fuego">Tierra del Fuego</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;