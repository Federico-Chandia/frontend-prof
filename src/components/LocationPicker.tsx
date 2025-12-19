import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    components: {
      street: string;
      neighborhood: string;
      city: string;
    };
  }) => void;
  initialValue?: string;
  placeholder?: string;
}

interface SearchResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  components: {
    street: string;
    neighborhood: string;
    city: string;
  };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialValue = '',
  placeholder = 'Buscar dirección...'
}) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Buscar direcciones
  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/geocoding/search', {
        params: { q: searchQuery }
      });
      
      setResults([response.data]);
      setShowResults(true);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query) {
        searchAddresses(query);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada por este navegador');
      setUseCurrentLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await api.get('/geocoding/reverse', {
            params: { lat: latitude, lng: longitude }
          });

          const location = {
            lat: latitude,
            lng: longitude,
            address: response.data.formattedAddress,
            components: response.data.components
          };

          setQuery(location.address);
          onLocationSelect(location);
          setShowResults(false);
        } catch (error) {
          console.error('Error obteniendo dirección:', error);
          alert('Error obteniendo la dirección actual');
        } finally {
          setUseCurrentLocation(false);
        }
      },
      (error) => {
        console.error('Error geolocalización:', error);
        alert('Error accediendo a la ubicación');
        setUseCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleResultSelect = (result: SearchResult) => {
    const location = {
      lat: result.lat,
      lng: result.lng,
      address: result.formattedAddress,
      components: result.components
    };

    setQuery(result.formattedAddress);
    onLocationSelect(location);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {loading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={useCurrentLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {useCurrentLocation ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            '📍'
          )}
          Mi ubicación
        </button>
      </div>

      {/* Resultados de búsqueda */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleResultSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">
                {result.components.street} {result.components.neighborhood}
              </div>
              <div className="text-sm text-gray-600">
                {result.components.city}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay para cerrar resultados */}
      {showResults && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default LocationPicker;