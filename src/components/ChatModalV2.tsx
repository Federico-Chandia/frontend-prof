import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';

interface Message {
  _id: string;
  reserva: string;
  emisor: { _id: string; nombre: string };
  receptor: { _id: string; nombre: string };
  mensaje: string;
  tipo: 'texto' | 'imagen' | 'ubicacion' | 'sistema';
  leido: boolean;
  fechaLectura?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatModalProps {
  reservaId: string;
  otherUser: { id: string; name: string };
  onClose: () => void;
}

const ChatModalV2: React.FC<ChatModalProps> = ({ reservaId, otherUser, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const { user, token } = useAuth();

  // Normalizar mensajes entrantes para evitar problemas con ObjectId vs string
  const normalizeMessage = useCallback((raw: any) => {
    if (!raw) return raw;
    const emisor = raw.emisor || {};
    const receptor = raw.receptor || {};

    const norm = {
      ...raw,
      _id: raw._id || raw.id,
      emisor: {
        ...emisor,
        _id: emisor._id ? (typeof emisor._id === 'string' ? emisor._id : emisor._id.toString()) : emisor.id || undefined,
        id: emisor.id || (emisor._id ? (typeof emisor._id === 'string' ? emisor._id : emisor._id.toString()) : undefined),
      },
      receptor: {
        ...receptor,
        _id: receptor._id ? (typeof receptor._id === 'string' ? receptor._id : receptor._id.toString()) : receptor.id || undefined,
        id: receptor.id || (receptor._id ? (typeof receptor._id === 'string' ? receptor._id : receptor._id.toString()) : undefined),
      }
    };

    return norm;
  }, []);

  // Scroll automático al último mensaje
  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // Conectar socket
  useEffect(() => {
    if (!reservaId || !user?.id || !token) {
      setError('Datos incompletos para conectar');
      return;
    }

    console.log('[ChatV2] Conectando socket para reserva:', reservaId, 'usuario:', user.id);
    
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5003';
    const newSocket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    newSocket.on('connect', () => {
      console.log('[ChatV2] Socket conectado:', newSocket.id);
      setConnected(true);
      setError(null);
      
      // Unirse a la sala
      console.log('[ChatV2] Emitiendo joinRoom para:', reservaId);
      newSocket.emit('joinRoom', { reservaId });
    });

    newSocket.on('initialMessages', (data: { messages: Message[] }) => {
      console.log('[ChatV2] Mensajes iniciales recibidos:', data.messages?.length || 0);
      const normalized = (data.messages || []).map((m: any) => normalizeMessage(m));
      setMessages(normalized);
      scrollToBottom();
      setError(null);
    });

    newSocket.on('newMessage', (data: { message: Message }) => {
      console.log('[ChatV2] Nuevo mensaje recibido:', data.message?._id);
      const norm = normalizeMessage(data.message);
      setMessages((prev) => {
        if (prev.some((m) => m._id === norm._id)) return prev;
        return [...prev, norm];
      });
      scrollToBottom();
    });

    newSocket.on('error', (err: any) => {
      console.warn('[ChatV2] Error del socket:', err?.message || err);
      if (messages.length === 0) setError('Conectando al chat...');
    });

    newSocket.on('connect_error', (err: any) => {
      console.warn('[ChatV2] Error de conexión (reintentando):', err?.message || err);
      if (messages.length === 0 && !connected) setError('Conectando al chat...');
    });

    newSocket.on('disconnect', (reason: string) => {
      console.log('[ChatV2] Socket desconectado:', reason);
      setConnected(false);
    });

    setSocket(newSocket);

    // Fallback: si no recibimos initialMessages por socket en X ms, pedir por HTTP
    let fallbackTimer: ReturnType<typeof setTimeout> | null = setTimeout(async () => {
      try {
        if ((messages || []).length === 0) {
          console.log('[ChatV2] Fallback: obteniendo mensajes por HTTP para reserva:', reservaId);
          const resp = await api.get(`/messages/${reservaId}`);
          const fetched = resp.data?.messages || [];
          const normalized = (fetched || []).map((m: any) => normalizeMessage(m));
          setMessages((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            const toAdd = normalized.filter((n: any) => !ids.has(n._id));
            return [...prev, ...toAdd].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          });
          scrollToBottom();
          setError(null);
        }
      } catch (err) {
        console.warn('[ChatV2] Fallback HTTP failed:', err);
      }
    }, 800);

    return () => {
      console.log('[ChatV2] Limpiando socket');
      newSocket.off('connect');
      newSocket.off('initialMessages');
      newSocket.off('newMessage');
      newSocket.off('error');
      newSocket.off('connect_error');
      newSocket.off('disconnect');
      newSocket.disconnect();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [reservaId, user?.id, token, scrollToBottom, messages.length]);

  // Enviar mensaje
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !socket || !connected) {
      console.warn('[ChatV2] No se puede enviar:', { 
        emptyMsg: !newMessage.trim(), 
        noSocket: !socket, 
        notConnected: !connected 
      });
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    console.log('[ChatV2] Enviando mensaje:', messageText);

    socket.emit(
      'sendMessage',
      {
        reservaId,
        receptorId: otherUser.id,
        mensaje: messageText,
        tipo: 'texto',
      },
      (ack: any) => {
        setLoading(false);
        if (ack?.success) {
          console.log('[ChatV2] Mensaje enviado exitosamente (ack):', ack.message?._id);
          try {
            const norm = normalizeMessage(ack.message);
            setMessages((prev) => {
              if (prev.some((m) => m._id === norm._id)) return prev;
              return [...prev, norm];
            });
            scrollToBottom();
          } catch (err) {
            console.warn('[ChatV2] Error normalizando mensaje en ack:', err);
          }
        } else {
          console.error('[ChatV2] Error en ack:', ack?.message);
          setError(ack?.message || 'Error al enviar mensaje');
          setNewMessage(messageText);
        }
      }
    );
  }, [newMessage, socket, connected, reservaId, otherUser.id, scrollToBottom]);

  // Marcar como leído al cerrar
  useEffect(() => {
    return () => {
      if (socket && connected) {
        console.log('[ChatV2] Marcando como leído al cerrar');
        socket.emit('markRead', { reservaId });
      }
    };
  }, [socket, connected, reservaId]);

  // Cerrar preview con Escape y navegación de galería
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
        setPreviewIndex(null);
      }
      if (e.key === 'ArrowLeft' && previewImage) {
        setPreviewIndex((cur) => {
          if (cur == null) return cur;
          const imgs = messages.filter((m: any) => m.tipo === 'imagen');
          const prev = Math.max(0, cur - 1);
          const url = imgs[prev]?.mensaje;
          if (url) setPreviewImage(url);
          return prev;
        });
      }
      if (e.key === 'ArrowRight' && previewImage) {
        setPreviewIndex((cur) => {
          if (cur == null) return cur;
          const imgs = messages.filter((m: any) => m.tipo === 'imagen');
          const next = Math.min(imgs.length - 1, cur + 1);
          const url = imgs[next]?.mensaje;
          if (url) setPreviewImage(url);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [messages, previewImage]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md h-96 flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="text-white">
            <h3 className="font-semibold">{otherUser.name}</h3>
            <p className="text-sm text-blue-100">
              {connected ? '🟢 Conectado' : '🔴 Desconectado'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 flex items-center justify-center rounded"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>No hay mensajes aún. ¡Inicia la conversación!</p>
            </div>
          ) : (
            messages.map((message) => {
              const senderId = ((message.emisor as any)?._id) || ((message.emisor as any)?.id);
              const isOwn = senderId === user?.id || senderId === (user as any)?._id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-900'
                    }`}
                  >
                    {message.tipo === 'imagen' ? (
                      <div className="max-w-xs">
                        <img
                          src={message.mensaje}
                          alt="imagen"
                          className="rounded-md max-w-full h-auto cursor-pointer"
                          onClick={() => {
                            const images = messages.filter((mm: any) => mm.tipo === 'imagen');
                            const idx = images.findIndex((im: any) => im._id === message._id);
                            setPreviewIndex(idx >= 0 ? idx : 0);
                            setPreviewImage(message.mensaje);
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-sm break-words">{message.mensaje}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Escribe un mensaje..."
              disabled={loading || !connected}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <label className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                disabled={imageUploading || !connected}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setImageUploading(true);
                    const fd = new FormData();
                    fd.append('image', file);
                    console.log('[ChatV2] Subiendo imagen...');
                    const resp = await api.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    const url = resp.data?.url;
                    if (url && socket) {
                      socket.emit('sendMessage', { reservaId, receptorId: otherUser.id, mensaje: url, tipo: 'imagen' }, (ack: any) => {
                        if (ack?.success) {
                          const norm = normalizeMessage(ack.message);
                          setMessages((prev) => {
                            if (prev.some((m) => m._id === norm._id)) return prev;
                            return [...prev, norm];
                          });
                          scrollToBottom();
                        } else {
                          setError(ack?.message || 'Error al enviar imagen');
                        }
                      });
                    } else {
                      setError('No se obtuvo URL al subir la imagen');
                    }
                  } catch (err) {
                    console.error('Error subiendo imagen:', err);
                    setError('Error subiendo imagen');
                  } finally {
                    setImageUploading(false);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="hidden"
              />
              <span className={`px-3 py-2 rounded-md text-sm border cursor-pointer ${imageUploading || !connected ? 'opacity-50 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}>
                📷
              </span>
            </label>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || loading || !connected}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen image preview gallery */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-60 flex items-center justify-center p-4"
          onClick={() => {
            setPreviewImage(null);
            setPreviewIndex(null);
          }}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={(e) => {
              touchStartX.current = e.touches?.[0]?.clientX ?? null;
            }}
            onTouchMove={(e) => {
              touchEndX.current = e.touches?.[0]?.clientX ?? null;
            }}
            onTouchEnd={() => {
              if (touchStartX.current == null || touchEndX.current == null) return;
              const dx = (touchEndX.current ?? 0) - (touchStartX.current ?? 0);
              const threshold = 50;
              const imgs = messages.filter((m: any) => m.tipo === 'imagen');
              if (dx > threshold) {
                setPreviewIndex((cur) => {
                  if (cur == null) return cur;
                  const prev = Math.max(0, cur - 1);
                  const url = imgs[prev]?.mensaje;
                  if (url) setPreviewImage(url);
                  return prev;
                });
              } else if (dx < -threshold) {
                setPreviewIndex((cur) => {
                  if (cur == null) return cur;
                  const next = Math.min(imgs.length - 1, cur + 1);
                  const url = imgs[next]?.mensaje;
                  if (url) setPreviewImage(url);
                  return next;
                });
              }
              touchStartX.current = null;
              touchEndX.current = null;
            }}
          >
            <img
              src={previewImage}
              alt="preview"
              className="max-h-full max-w-full object-contain rounded-md shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex((cur) => {
                  if (cur == null) return cur;
                  const imgs = messages.filter((m: any) => m.tipo === 'imagen');
                  const prev = Math.max(0, cur - 1);
                  const url = imgs[prev]?.mensaje;
                  if (url) setPreviewImage(url);
                  return prev;
                });
              }}
              className="absolute left-4 text-white bg-black bg-opacity-40 rounded-full p-2 hover:bg-opacity-60"
              aria-label="Anterior"
            >
              ◀
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex((cur) => {
                  if (cur == null) return cur;
                  const imgs = messages.filter((m: any) => m.tipo === 'imagen');
                  const next = Math.min(imgs.length - 1, cur + 1);
                  const url = imgs[next]?.mensaje;
                  if (url) setPreviewImage(url);
                  return next;
                });
              }}
              className="absolute right-4 text-white bg-black bg-opacity-40 rounded-full p-2 hover:bg-opacity-60"
              aria-label="Siguiente"
            >
              ▶
            </button>

            <div className="absolute bottom-6 text-white text-sm bg-black bg-opacity-40 px-3 py-1 rounded">
              {(() => {
                const imgs = messages.filter((m: any) => m.tipo === 'imagen');
                const total = imgs.length;
                const cur = (previewIndex == null ? imgs.findIndex((i: any) => i.mensaje === previewImage) : previewIndex) ?? 0;
                return `${cur + 1} / ${total}`;
              })()}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
                setPreviewIndex(null);
              }}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-40 rounded-full p-2 hover:bg-opacity-60"
              aria-label="Cerrar vista previa"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatModalV2;
