import React from 'react';

interface PricingBannerProps {
  currentPlan: 'basico' | 'profesional' | 'premium';
  tokensRemaining: number;
  onUpgrade: (plan: string) => void;
}

const PricingBanner: React.FC<PricingBannerProps> = ({ currentPlan, tokensRemaining, onUpgrade }) => {
  const plans = [
    {
      id: 'basico',
      name: 'Básico',
      price: 'Gratis',
      tokens: '5 tokens únicos',
      features: [
        'Perfil visible en búsquedas',
        '5 contactos con clientes',
        'Gestión básica de disponibilidad',
        'Notificaciones por email'
      ],
      color: 'gray',
      current: currentPlan === 'basico'
    },
    {
      id: 'profesional',
      name: 'Profesional',
      price: '$24.999/mes',
      tokens: '20 tokens/mes',
      features: [
        'Todo lo del plan Básico',
        '20 contactos mensuales',
        'Prioridad en búsquedas',
        'Estadísticas avanzadas',
        'Soporte prioritario'
      ],
      color: 'blue',
      current: currentPlan === 'profesional',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$49.999/mes',
      tokens: 'Tokens ilimitados',
      features: [
        'Todo lo del plan Profesional',
        'Contactos ilimitados',
        'Verificación profesional',
        'Badge de confianza',
        'Aparición destacada',
        'Soporte 24/7'
      ],
      color: 'purple',
      current: currentPlan === 'premium'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Planes de Suscripción
        </h3>
        <p className="text-gray-600">
          {currentPlan === 'basico' && tokensRemaining > 0 
            ? `Te quedan ${tokensRemaining} tokens gratuitos` 
            : currentPlan === 'basico' && tokensRemaining === 0
            ? 'Has agotado tus tokens gratuitos. ¡Actualiza para seguir recibiendo clientes!'
            : 'Gestiona tu plan actual y tokens disponibles'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border-2 rounded-lg p-4 ${
              plan.current 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  Más Popular
                </span>
              </div>
            )}
            
            {plan.current && (
              <div className="absolute -top-3 right-4">
                <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                  Plan Actual
                </span>
              </div>
            )}

            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
              <p className="text-2xl font-bold text-gray-900 mt-2">{plan.price}</p>
              <p className="text-sm text-gray-600 mt-1">{plan.tokens}</p>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {!plan.current && (
              <button
                onClick={() => onUpgrade(plan.id)}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  plan.color === 'blue'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : plan.color === 'purple'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {plan.id === 'basico' ? 'Plan Actual' : 'Actualizar Plan'}
              </button>
            )}

            {plan.current && plan.id !== 'basico' && (
              <button
                onClick={() => onUpgrade('manage')}
                className="w-full py-2 px-4 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Gestionar Plan
              </button>
            )}
          </div>
        ))}
      </div>

      {(currentPlan === 'basico' && tokensRemaining === 0) && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 text-xl mr-3">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-800">Tokens agotados</h4>
              <p className="text-yellow-700 text-sm">
                Has usado todos tus tokens gratuitos. Actualiza tu plan para seguir recibiendo solicitudes de clientes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingBanner;