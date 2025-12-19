import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DebugDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setLogs([
      '=== DEBUG DASHBOARD ===',
      `Usuario: ${user?.nombre || 'No autenticado'}`,
      `Usuario ID: ${user?.id || 'N/A'}`,
      `Token: ${token ? token.substring(0, 20) + '...' : 'No disponible'}`,
      `Token en localStorage: ${localStorage.getItem('token') ? 'Sí' : 'No'}`,
      `VITE_API_URL: ${import.meta.env.VITE_API_URL}`,
      `VITE_SOCKET_URL: ${import.meta.env.VITE_SOCKET_URL}`,
    ]);

    const handleLog = (e: any) => {
      if (e.detail?.message) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${e.detail.message}`]);
      }
    };

    window.addEventListener('debug:log', handleLog);
    return () => window.removeEventListener('debug:log', handleLog);
  }, [user, token]);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white font-mono">
      <h1 className="text-2xl font-bold mb-4">Debug Dashboard</h1>
      <div className="bg-gray-800 p-4 rounded-lg max-w-2xl max-h-96 overflow-y-auto">
        {logs.map((log, idx) => (
          <div key={idx} className="text-sm text-green-400 mb-1">{log}</div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-400">
        Abre la consola del navegador (F12) para más detalles
      </div>
    </div>
  );
};

export default DebugDashboard;
