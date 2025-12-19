import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ProfileState, ProfileContextType, ProfileProgress } from '../types/Profile';
import { useAuth } from '../context/AuthContext';

const initialState: ProfileState = {
  progress: {
    completionPercentage: 0,
    missingFields: [],
    completedSections: [],
  },
  isProfileComplete: false,
  lastUpdated: null,
};

type ProfileAction =
  | { type: 'UPDATE_PROGRESS'; payload: ProfileProgress }
  | { type: 'MARK_SECTION_COMPLETE'; payload: string }
  | { type: 'SET_LAST_UPDATED'; payload: Date };

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: action.payload,
        isProfileComplete: action.payload.completionPercentage === 100,
        lastUpdated: new Date(),
      };
    case 'MARK_SECTION_COMPLETE':
      const updatedSections = [...state.progress.completedSections];
      if (!updatedSections.includes(action.payload)) {
        updatedSections.push(action.payload);
      }
      return {
        ...state,
        progress: {
          ...state.progress,
          completedSections: updatedSections,
        },
        lastUpdated: new Date(),
      };
    case 'SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.payload,
      };
    default:
      return state;
  }
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { user } = useAuth();

  const calculateProgress = (): ProfileProgress => {
    if (!user) {
      return {
        completionPercentage: 0,
        missingFields: [],
        completedSections: [],
      };
    }

    const requiredFields = ['nombre', 'email', 'telefono'];
    const optionalFields = ['direccion', 'avatar'];
    const completedFields = [];
    const missingFields = [];

    // Check required fields
    requiredFields.forEach(field => {
      if (user[field as keyof typeof user]) {
        completedFields.push(field);
      } else {
        missingFields.push(field);
      }
    });

    // Check optional fields
    optionalFields.forEach(field => {
      if (user[field as keyof typeof user]) {
        completedFields.push(field);
      }
    });

    const totalFields = requiredFields.length + optionalFields.length;
    const completionPercentage = Math.round((completedFields.length / totalFields) * 100);

    const completedSections = [];
    if (user.nombre && user.email) completedSections.push('basic');
    if (user.telefono) completedSections.push('contact');
    if (user.direccion) completedSections.push('location');
    if (user.verificado) completedSections.push('verification');

    return {
      completionPercentage,
      missingFields,
      completedSections,
    };
  };

  const updateProgress = () => {
    const progress = calculateProgress();
    dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
  };

  const markSectionComplete = (section: string) => {
    dispatch({ type: 'MARK_SECTION_COMPLETE', payload: section });
  };

  useEffect(() => {
    if (user) {
      updateProgress();
    }
  }, [user]);

  const value: ProfileContextType = {
    state,
    updateProgress,
    markSectionComplete,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};