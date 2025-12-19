import React, { useState, useEffect } from 'react';
import { Reserva } from '../types';
import api from '../services/api';

interface ReviewModalProps {
  reserva: Reserva;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ reserva, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingReview, setExistingReview] = useState<any>(null);
  const [checkingReview, setCheckingReview] = useState(true);

  useEffect(() => {
    if (isOpen && reserva) {
      checkExistingReview();
    }
  }, [isOpen, reserva]);

  const checkExistingReview = async () => {
    try {
      const response = await api.get(`/reviews/oficio/${reserva.oficio._id}`);
      const reviews = response.data.reviews || [];
      const userReview = reviews.find((r: any) => r.reserva === reserva._id);
      if (userReview) {
        setExistingReview(userReview);
        setRating(userReview.puntuacion);
        setComentario(userReview.comentario || '');
      }
    } catch (error) {
      // No existing review found
    } finally {
      setCheckingReview(false);
    }
  };

  if (!isOpen) return null;

  if (checkingReview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando reseña...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setLoading(true);
    setError('');
    try {
      const reviewData = {
        reserva: reserva._id,
        oficio: reserva.oficio._id,
        puntuacion: rating,
        comentario
      };
      
      // Sending review data
      const response = await api.post('/reviews', reviewData);
      // Review created successfully
      
      onSuccess();
      onClose();
    } catch (error: any) {
      // Error creating review - check network connection
      
      let errorMessage = 'Error al enviar la reseña';
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0].msg || error.response.data.errors[0];
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Calificar Servicio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-semibold">{reserva.oficio.usuario.nombre}</p>
          <p className="text-sm text-gray-600">{reserva.descripcionTrabajo}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Calificación</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => !existingReview && setRating(star)}
                  disabled={existingReview}
                  className={`text-3xl transition-colors ${
                    star <= rating 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  } ${!existingReview ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className={`text-sm mt-2 ${
              rating === 0 ? 'text-red-600 font-semibold' : 'text-gray-500'
            }`}>
              {rating === 0 && '⚠️ Selecciona una calificación'}
              {rating === 1 && 'Muy malo'}
              {rating === 2 && 'Malo'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bueno'}
              {rating === 5 && 'Excelente'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Comentario (opcional)</label>
            <textarea
              value={comentario}
              onChange={(e) => !existingReview && setComentario(e.target.value)}
              placeholder={existingReview ? "" : "Comparte tu experiencia con este profesional..."}
              rows={4}
              disabled={existingReview}
              className={`w-full p-2 border rounded-md ${
                existingReview ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {existingReview && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
              ✅ Ya has enviado una reseña para este servicio
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {existingReview ? 'Cerrar' : 'Cancelar'}
            </button>
            {!existingReview && (
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Reseña'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;