import type { LoginCredentials, RegisterCredentials, User } from '../types';
import api from './api';

interface AuthResponse {
  user: User;
  token: string;
}

interface ApiAuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      createdAt: string;
    };
    token: string;
  };
}

interface ApiUserResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
}

// Transform API user response to app User type
const transformUser = (apiUser: { id: string; email: string; name: string; createdAt: string }): User => {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    createdAt: apiUser.createdAt,
  };
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiAuthResponse>('/auth/login', credentials);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }
    
    return {
      user: transformUser(response.data.data.user),
      token: response.data.data.token,
    };
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiAuthResponse>('/auth/register', credentials);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }
    
    return {
      user: transformUser(response.data.data.user),
      token: response.data.data.token,
    };
  },

  async logout(): Promise<void> {
    // API doesn't have a logout endpoint, just clear local storage
    // This is handled by the Redux slice
    return Promise.resolve();
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiUserResponse>('/auth/profile');
    
    if (!response.data.success) {
      throw new Error('Failed to fetch user profile');
    }
    
    return transformUser(response.data.data);
  },
};
