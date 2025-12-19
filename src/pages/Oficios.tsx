import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Oficio } from '../types';
import api from '../services/api';
import { handleError } from '../utils/errorHandler';
import BusquedaExpandidaModal from '../components/BusquedaExpandidaModal';
import ProfesionalCardUbicacion from '../components/ProfesionalCardUbicacion';
import { useBusquedaProfesionales } from '../hooks/useBusquedaProfesionales';

const Oficios: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tipoOficioParam = searchParams.get('tipo') || '';
  
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [loading, setLoading] = useState(true);
  const [barriosDisponibles, setBarriosDisponibles] = useState<string[]>([]);
  const [usarBusquedaUbicacion, setUsarBusquedaUbicacion] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    tipoOficio: tipoOficioParam,
    barrio: '',
    disponible: false,
    rating: '',
  });

  const {
    profesionales,
    loading: loadingUbicacion,
    mostrarBusquedaExpandida,
    busquedaExtendida,
    error: errorUbicacion,
    buscar,
    buscarLejanos,
    cerrarModal,
    reiniciarBusqueda
  } = useBusquedaProfesionales(filters.tipoOficio);

  useEffect(() => {
    if (usarBusquedaUbicacion && filters.tipoOficio) {
      buscar();
    } else {
      loadOficios();
    }
  }, [filters, usarBusquedaUbicacion]);

  // Cargar barrios disponibles
  useEffect(() => {
    const loadBarrios = async () => {
      try {
        const response = await api.get('/oficios/barrios/disponibles');
        setBarriosDisponibles(response.data.barrios);
      } catch (error) {
        console.error('Error loading barrios:', error);
        handleError(error, 'loading barrios');
      }
    };

    loadBarrios();
  }, []);

  const loadOficios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.tipoOficio) params.append('tipoOficio', filters.tipoOficio);
      if (filters.barrio) params.append('barrio', filters.barrio);
      if (filters.disponible) params.append('disponible', 'true');
      if (filters.rating) params.append('rating', filters.rating);

      const response = await api.get(`/oficios?${params.toString()}`);
      setOficios(response.data.oficios);
    } catch (error) {
      handleError(error, 'loading oficios');
    } finally {
      setLoading(false);
    }
  };



  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newFilters = {
      ...filters,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    };
    setFilters(newFilters);
    
    if (usarBusquedaUbicacion) {
      reiniciarBusqueda();
    }
  };

  // Filtrar resultados por texto de búsqueda
  const filteredResults = (usarBusquedaUbicacion ? profesionales : oficios).filter((profesional) => {
    const nombreUsuario = profesional.usuario?.nombre || '';
    const profesion = profesional.profesion || profesional.tipoOficio || '';
    const searchLower = searchText.toLowerCase();
    
    return (
      nombreUsuario.toLowerCase().includes(searchLower) ||
      profesion.toLowerCase().includes(searchLower)
    );
  });

  const tiposOficio = [
    'plomero', 'electricista', 'gasista', 'pintor', 
    'carpintero', 'albañil', 'jardinero', 'cerrajero'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Buscar Profesionales</h1>
        
        {/* Buscador por texto */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre o profesión..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2 ${
                  mostrarFiltros
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⚙️ {mostrarFiltros ? 'Ocultar' : 'Mostrar'} filtros
              </button>
            </div>
          </div>
        </div>

        {/* Filtros - Minimizable */}
        {mostrarFiltros && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtros de búsqueda</h2>
              <button
                onClick={() => setMostrarFiltros(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de profesional
                </label>
                <select
                  name="tipoOficio"
                  value={filters.tipoOficio}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {tiposOficio.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barrio
                </label>
                <select
                  name="barrio"
                  value={filters.barrio}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {barriosDisponibles.map((barrio) => (
                    <option key={barrio} value={barrio}>
                      {barrio}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating Mínimo
                </label>
                <select
                  name="rating"
                  value={filters.rating}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Cualquiera</option>
                  <option value="4">4+ estrellas</option>
                  <option value="3">3+ estrellas</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="disponible"
                    checked={filters.disponible}
                    onChange={handleFilterChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Disponible ahora</span>
                </label>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setUsarBusquedaUbicacion(!usarBusquedaUbicacion)}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    usarBusquedaUbicacion
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📍 {usarBusquedaUbicacion ? 'Por ubicación' : 'Por zona'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {usarBusquedaUbicacion && busquedaExtendida && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-yellow-600 text-xl mr-3">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-800">Búsqueda extendida</h4>
                <p className="text-yellow-700 text-sm">
                  Se están mostrando profesionales en un radio de 50km. Pueden aplicar cargos adicionales por traslado.
                </p>
              </div>
            </div>
          </div>
        )}

        {errorUbicacion && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-700">{errorUbicacion}</p>
          </div>
        )}

        {/* Lista de Profesionales */}
        {(loading || loadingUbicacion) ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando profesionales...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Mostrando <span className="font-semibold">{filteredResults.length}</span> resultado{filteredResults.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((oficio) => (
                <ProfesionalCardUbicacion
                  key={oficio._id}
                  profesional={oficio}
                  mostrarDistancia={usarBusquedaUbicacion}
                />
              ))}
            </div>
          </>
        )}

        {!(loading || loadingUbicacion) && filteredResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {usarBusquedaUbicacion 
                ? 'No se encontraron profesionales en tu área.' 
                : 'No se encontraron profesionales con los filtros seleccionados.'}
            </p>
          </div>
        )}

        {/* Modal de búsqueda expandida */}
        <BusquedaExpandidaModal
          isOpen={mostrarBusquedaExpandida}
          onClose={cerrarModal}
          onBuscarLejanos={buscarLejanos}
          tipoOficio={filters.tipoOficio}
        />
      </div>
    </div>
  );
};

export default Oficios;