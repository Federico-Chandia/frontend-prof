import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { TokenState, TokenContextType, TokenInfo } from '../types/Token';
import api from '../services/api';

const initialState: TokenState = {
  accessToken: null,
  refreshToken: null,
  isRefreshing: false,
};

type TokenAction =
  | { type: 'SET_TOKENS'; payload: { accessToken: TokenInfo; refreshToken?: string } }
  | { type: 'CLEAR_TOKENS' }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'UPDATE_ACCESS_TOKEN'; payload: TokenInfo };

const tokenReducer = (state: TokenState, action: TokenAction): TokenState => {
  switch (action.type) {
    case 'SET_TOKENS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || state.refreshToken,
        isRefreshing: false,
      };
    case 'CLEAR_TOKENS':
      return {
        ...state,
        accessToken: null,
        refreshToken: null,
        isRefreshing: false,
      };
    case 'SET_REFRESHING':
      return {
        ...state,
        isRefreshing: action.payload,
      };
    case 'UPDATE_ACCESS_TOKEN':
      return {
        ...state,
        accessToken: action.payload,
        isRefreshing: false,
      };
    default:
      return state;
  }
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tokenReducer, initialState);

  const createTokenInfo = (token: string, expiresIn?: number): TokenInfo => {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expiresIn || 3600)); // Default 1 hour
    
    return {
      token,
      expiresAt,
      isValid: true,
    };
  };

  const setTokens = (accessToken: string, refreshToken?: string) => {
    const tokenInfo = createTokenInfo(accessToken);
    
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    dispatch({
      type: 'SET_TOKENS',
      payload: { accessToken: tokenInfo, refreshToken },
    });
  };

  const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch({ type: 'CLEAR_TOKENS' });
  };

  const isTokenExpired = (): boolean => {
    if (!state.accessToken) return true;
    
    const now = new Date();
    const buffer = 5 * 60 * 1000; // 5 minutes buffer
    return now.getTime() > (state.accessToken.expiresAt.getTime() - buffer);
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    if (state.isRefreshing) return false;
    
    const refreshToken = state.refreshToken || localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });
      
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, expiresIn } = response.data;
      
      const tokenInfo = createTokenInfo(accessToken, expiresIn);
      localStorage.setItem('token', accessToken);
      
      dispatch({ type: 'UPDATE_ACCESS_TOKEN', payload: tokenInfo });
      return true;
    } catch (error) {
      clearTokens();
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token) {
      const tokenInfo = createTokenInfo(token);
      dispatch({
        type: 'SET_TOKENS',
        payload: { accessToken: tokenInfo, refreshToken: refreshToken || undefined },
      });
    }
  }, []);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!state.accessToken || state.isRefreshing) return;

    const checkTokenExpiry = () => {
      if (isTokenExpired()) {
        refreshAccessToken();
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.accessToken, state.isRefreshing]);

  const value: TokenContextType = {
    state,
    setTokens,
    refreshAccessToken,
    clearTokens,
    isTokenExpired,
  };

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within TokenProvider');
  }
  return context;
};