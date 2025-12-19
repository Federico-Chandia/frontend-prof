import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testSocketConnection } from '../utils/socketTest';

const SocketTest: React.FC = () => {
  const [status, setStatus] = useState('Prueba no iniciada');
  const [socketId, setSocketId] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      setStatus('❌ No estás autenticado. Redirigiendo a login...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setStatus('Conectando...');
    try {
      const socket = testSocketConnection(token);

      const handleConnect = () => {
        setStatus('✅ Conectado');
        setSocketId(socket.id || '');
      };

      const handleDisconnect = (reason: string) => {
        setStatus(`❌ Desconectado: ${reason}`);
      };

      const handleError = (error: any) => {
        setStatus(`❌ Error: ${error.message || JSON.stringify(error)}`);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleError);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleError);
        socket.disconnect();
      };
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
  }, [user, token, navigate]);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Prueba de Socket.IO</h1>
        <div className="mb-4">
          <p className="text-lg font-semibold">Estado: {status}</p>
          {socketId && <p className="text-sm text-gray-600">Socket ID: {socketId}</p>}
          {user && <p className="text-sm text-gray-600">Usuario: {user.nombre}</p>}
        </div>
        <p className="text-sm text-gray-500">
          Abre la consola del navegador (F12) para ver más detalles.
        </p>
      </div>
    </div>
  );
};

export default SocketTest;
