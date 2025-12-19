import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Encontrá profesionales en tu Barrio
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Conectamos clientes con profesionales verificados: plomeros, electricistas, 
              gasistas y más. Disponibilidad inmediata y pagos seguros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/oficios"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Buscar Profesionales
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Registrarse como Profesional
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Busca por Barrio</h3>
              <p className="text-gray-600">
                Encuentra profesionales disponibles en tu zona con filtros por tipo y disponibilidad.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reserva Online</h3>
              <p className="text-gray-600">
                Selecciona un profesional, describí el trabajo y coordinen fecha y hora.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Califica el Servicio</h3>
              <p className="text-gray-600">
                Una vez finalizado el trabajo, deja tu reseña y ayuda a otros usuarios a encontrar los mejores profesionales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Servicios Más Solicitados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Plomería', icon: '🔧', count: '120+ profesionales' },
              { name: 'Electricidad', icon: '⚡', count: '85+ profesionales' },
              { name: 'Gasista', icon: '🔥', count: '45+ profesionales' },
              { name: 'Pintura', icon: '🎨', count: '90+ profesionales' },
              { name: 'Carpintería', icon: '🪚', count: '60+ profesionales' },
              { name: 'Albañilería', icon: '🧱', count: '70+ profesionales' },
              { name: 'Jardinería', icon: '🌱', count: '35+ profesionales' },
              { name: 'Cerrajería', icon: '🔐', count: '25+ profesionales' },
            ].map((service) => (
              <Link
                key={service.name}
                to={`/oficios?tipo=${encodeURIComponent(service.name.toLowerCase())}`}
                className="bg-gray-50 p-6 rounded-lg text-center hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  try {
                    // Validar que el enlace sea válido antes de navegar
                    if (!service.name) {
                      e.preventDefault();
                      console.error('Nombre de servicio inválido');
                    }
                  } catch (error) {
                    e.preventDefault();
                    console.error('Error al navegar:', error);
                  }
                }}
              >
                <div className="text-3xl mb-2">{service.icon}</div>
                <h3 className="font-semibold mb-1">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;