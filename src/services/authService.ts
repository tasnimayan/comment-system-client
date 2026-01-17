import type { LoginCredentials, RegisterCredentials, User } from '../types';
import api from './api';

interface AuthResponse {
  user: User;
  token: string;
}

// Demo mode - simulate API calls with localStorage
const DEMO_MODE = true;
const DEMO_USERS_KEY = 'demo_users';

const getDemoUsers = (): Array<User & { password: string }> => {
  try {
    const stored = localStorage.getItem(DEMO_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDemoUsers = (users: Array<User & { password: string }>) => {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
};

const generateToken = (userId: string): string => {
  const payload = {
    userId,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  return btoa(JSON.stringify(payload));
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (DEMO_MODE) {
      await delay(500); // Simulate network delay
      
      const users = getDemoUsers();
      const user = users.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token: generateToken(user.id),
      };
    }
    
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (DEMO_MODE) {
      await delay(500);
      
      const users = getDemoUsers();
      
      if (users.some((u) => u.email === credentials.email)) {
        throw new Error('Email already registered');
      }
      
      if (users.some((u) => u.username === credentials.username)) {
        throw new Error('Username already taken');
      }
      
      const newUser = {
        id: `user-${Date.now()}`,
        email: credentials.email,
        username: credentials.username,
        password: credentials.password,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      saveDemoUsers(users);
      
      const { password: _, ...userWithoutPassword } = newUser;
      return {
        user: userWithoutPassword,
        token: generateToken(newUser.id),
      };
    }
    
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    if (DEMO_MODE) {
      await delay(200);
      return;
    }
    
    await api.post('/auth/logout');
  },

  async refreshToken(): Promise<{ token: string }> {
    if (DEMO_MODE) {
      await delay(200);
      const storedToken = localStorage.getItem('auth_token');
      
      if (!storedToken) {
        throw new Error('No token to refresh');
      }
      
      try {
        const payload = JSON.parse(atob(storedToken));
        if (payload.exp < Date.now()) {
          throw new Error('Token expired');
        }
        return { token: generateToken(payload.userId) };
      } catch {
        throw new Error('Invalid token');
      }
    }
    
    const response = await api.post<{ token: string }>('/auth/refresh');
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
