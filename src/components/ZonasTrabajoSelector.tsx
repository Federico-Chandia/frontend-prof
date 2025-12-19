import React, { useState, useEffect } from 'react';
import { fetchProvincias, fetchLocalidades, Provincia, Localidad } from '../services/localidades';

interface ZonasTrabajoSelectorProps {
  zonasSeleccionadas: string[];
  onChange: (zonas: string[]) => void;
  editMode: boolean;
}

const ZonasTrabajoSelector: React.FC<ZonasTrabajoSelectorProps> = ({
  zonasSeleccionadas,
  onChange,
  editMode
}) => {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode) {
      loadProvincias();
    }
  }, [editMode]);

  useEffect(() => {
    if (provinciaSeleccionada) {
      loadLocalidades(provinciaSeleccionada);
    }
  }, [provinciaSeleccionada]);

  const loadProvincias = async () => {
    setLoading(true);
    try {
      const data = await fetchProvincias();
      setProvincias(data);
    } catch (error) {
      console.error('Error loading provincias:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalidades = async (provinciaId: string) => {
    setLoading(true);
    try {
      const data = await fetchLocalidades(provinciaId);
      setLocalidades(data);
    } catch (error) {
      console.error('Error loading localidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarZona = () => {
    if (!localidadSeleccionada) return;

    const localidad = localidades.find(l => l.id === localidadSeleccionada);
    if (!localidad) return;

    const nuevaZona = `${localidad.nombre}, ${localidad.provincia.nombre}`;
    
    if (!zonasSeleccionadas.includes(nuevaZona)) {
      onChange([...zonasSeleccionadas, nuevaZona]);
    }

    // Reset selecciones
    setLocalidadSeleccionada('');
    setProvinciaSeleccionada('');
    setLocalidades([]);
  };

  const removerZona = (zona: string) => {
    onChange(zonasSeleccionadas.filter(z => z !== zona));
  };

  if (!editMode) {
    return (
      <div className="flex flex-wrap gap-2">
        {zonasSeleccionadas.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay zonas de trabajo configuradas</p>
        ) : (
          zonasSeleccionadas.map((zona) => (
            <span key={zona} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              📍 {zona}
            </span>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de Provincia y Localidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provincia
          </label>
          <select
            value={provinciaSeleccionada}
            onChange={(e) => setProvinciaSeleccionada(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={loading}
          >
            <option value="">Seleccionar provincia</option>
            {provincias.map((provincia) => (
              <option key={provincia.id} value={provincia.id}>
                {provincia.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Localidad
          </label>
          <select
            value={localidadSeleccionada}
            onChange={(e) => setLocalidadSeleccionada(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={!provinciaSeleccionada || loading}
          >
            <option value="">Seleccionar localidad</option>
            {localidades.map((localidad) => (
              <option key={localidad.id} value={localidad.id}>
                {localidad.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={agregarZona}
            disabled={!localidadSeleccionada || loading}
            className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Cargando...' : '+ Agregar'}
          </button>
        </div>
      </div>

      {/* Zonas Seleccionadas */}
      {zonasSeleccionadas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zonas de Trabajo Seleccionadas
          </label>
          <div className="flex flex-wrap gap-2">
            {zonasSeleccionadas.map((zona) => (
              <div
                key={zona}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                📍 {zona}
                <button
                  type="button"
                  onClick={() => removerZona(zona)}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Selecciona las localidades donde ofreces tus servicios. 
          Los clientes podrán encontrarte más fácilmente.
        </p>
      </div>
    </div>
  );
};

export default ZonasTrabajoSelector;