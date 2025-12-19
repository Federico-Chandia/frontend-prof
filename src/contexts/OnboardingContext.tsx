import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { OnboardingState, OnboardingContextType, OnboardingStep } from '../types/Onboarding';
import { useAuth } from '../context/AuthContext';

const initialSteps: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Completa tu perfil',
    description: 'Agrega tu información personal y de contacto',
    completed: false,
    required: true,
  },
  {
    id: 'verification',
    title: 'Verifica tu cuenta',
    description: 'Confirma tu email y número de teléfono',
    completed: false,
    required: true,
  },
  {
    id: 'preferences',
    title: 'Configura tus preferencias',
    description: 'Selecciona tus zonas de trabajo y servicios',
    completed: false,
    required: false,
  },
];

const initialState: OnboardingState = {
  currentStep: 0,
  steps: initialSteps,
  isCompleted: false,
  skipped: false,
};

type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'COMPLETE_STEP'; payload: string }
  | { type: 'SKIP_ONBOARDING' }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'LOAD_STATE'; payload: OnboardingState };

const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
  switch (action.type) {
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.steps.length - 1),
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };
    case 'COMPLETE_STEP':
      const updatedSteps = state.steps.map(step =>
        step.id === action.payload ? { ...step, completed: true } : step
      );
      const allRequired = updatedSteps.filter(s => s.required).every(s => s.completed);
      return {
        ...state,
        steps: updatedSteps,
        isCompleted: allRequired,
      };
    case 'SKIP_ONBOARDING':
      return {
        ...state,
        skipped: true,
        isCompleted: true,
      };
    case 'RESET_ONBOARDING':
      return initialState;
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`onboarding_${user.id}`);
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved) });
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(state));
    }
  }, [state, user]);

  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });
  const completeStep = (stepId: string) => dispatch({ type: 'COMPLETE_STEP', payload: stepId });
  const skipOnboarding = () => dispatch({ type: 'SKIP_ONBOARDING' });
  const resetOnboarding = () => dispatch({ type: 'RESET_ONBOARDING' });

  const value: OnboardingContextType = {
    state,
    nextStep,
    prevStep,
    completeStep,
    skipOnboarding,
    resetOnboarding,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};