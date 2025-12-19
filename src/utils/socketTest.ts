import { io } from 'socket.io-client';

export function testSocketConnection(token?: string) {
  const baseUrl = 'http://localhost:5003';
  const finalToken = token || localStorage.getItem('token');
  
  console.log('[socketTest] Intentando conectar a:', baseUrl);
  console.log('[socketTest] Token disponible:', !!finalToken);
  
  if (!finalToken) {
    console.error('[socketTest] ❌ No hay token. Por favor inicia sesión primero.');
    throw new Error('Token requerido');
  }

  const socket = io(baseUrl, {
    auth: { token: finalToken },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('[socketTest] ✅ CONECTADO. Socket ID:', socket.id);
    socket.emit('test', { msg: 'Mensaje de prueba' });
  });

  socket.on('connect_error', (error) => {
    console.error('[socketTest] ❌ Error de conexión:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socketTest] Desconectado:', reason);
  });

  socket.on('test', (data) => {
    console.log('[socketTest] Evento test recibido:', data);
  });

  return socket;
}
