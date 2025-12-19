import { User, RegisterData } from './User';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
  error?: string | null;
}