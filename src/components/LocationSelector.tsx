import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  placeholder?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Ingresa la dirección donde necesitas el servicio"
}) => {
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const initialLocationSet = useRef(false);
  
  // Inicializar el estado basado en si el usuario tiene dirección
  useEffect(() => {
    if (user && (!user.direccion?.calle || !user.direccion?.barrio)) {
      setUseProfileAddress(false);
    }
  }, [user]);

  // Usar dirección del perfil por defecto al cargar
  useEffect(() => {
    if (!initialLocationSet.current && user?.direccion && useProfileAddress && user.direccion.calle && user.direccion.barrio) {
      const profileAddress = `${user.direccion.calle}, ${user.direccion.barrio}${user.direccion.ciudad ? ', ' + user.direccion.ciudad : ''}${user.direccion.provincia ? ', ' + user.direccion.provincia : ''}`;
      setAddress(profileAddress);
      onLocationSelect({
        lat: 0,
        lng: 0,
        address: profileAddress
      });
      initialLocationSet.current = true;
    } else if (user && (!user.direccion || !user.direccion.calle || !user.direccion.barrio)) {
      // Si no hay dirección en el perfil, cambiar a modo manual
      setUseProfileAddress(false);
    }
  }, [user?.direccion, useProfileAddress]);

  // Función para volver a usar dirección del perfil
  const useMyAddress = () => {
    if (user?.direccion && user.direccion.calle && user.direccion.barrio) {
      const profileAddress = `${user.direccion.calle}, ${user.direccion.barrio}${user.direccion.ciudad ? ', ' + user.direccion.ciudad : ''}${user.direccion.provincia ? ', ' + user.direccion.provincia : ''}`;
      setAddress(profileAddress);
      setUseProfileAddress(true);
      onLocationSelect({
        lat: 0,
        lng: 0,
        address: profileAddress
      });
    }
  };

  // Función para usar otra dirección (ingreso manual)
  const useOtherAddress = () => {
    setUseProfileAddress(false);
    setAddress('');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    // Siempre llamar onLocationSelect, incluso con dirección vacía
    onLocationSelect({
      lat: 0,
      lng: 0,
      address: newAddress.trim()
    });
  };

  const hasProfileAddress = user?.direccion?.calle && user?.direccion?.barrio;

  return (
    <div className="space-y-3">
      {useProfileAddress && hasProfileAddress ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">🏠 Usando mi dirección</span>
            <button
              type="button"
              onClick={useOtherAddress}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Usar otra dirección
            </button>
          </div>
          <input
            type="text"
            value={address}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {hasProfileAddress ? '📍 Otra dirección' : '📍 Dirección del servicio'}
            </span>
            {hasProfileAddress && (
              <button
                type="button"
                onClick={useMyAddress}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Usar mi dirección
              </button>
            )}
          </div>
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder={hasProfileAddress ? "Ej: Av. Corrientes 1234, Balvanera, CABA" : "Ingresa la dirección donde necesitas el servicio"}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {!hasProfileAddress && (
            <p className="text-xs text-gray-500">
              💡 Puedes agregar tu dirección en tu perfil para usarla por defecto
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;