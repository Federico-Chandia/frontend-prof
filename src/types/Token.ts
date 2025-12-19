export interface TokenInfo {
  token: string;
  expiresAt: Date;
  refreshToken?: string;
  isValid: boolean;
}

export interface TokenState {
  accessToken: TokenInfo | null;
  refreshToken: string | null;
  isRefreshing: boolean;
}

export interface TokenContextType {
  state: TokenState;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  refreshAccessToken: () => Promise<boolean>;
  clearTokens: () => void;
  isTokenExpired: () => boolean;
}