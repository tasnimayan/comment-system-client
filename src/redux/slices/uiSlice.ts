import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIState {
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register';
  toasts: Toast[];
  isWebSocketConnected: boolean;
}

const initialState: UIState = {
  isAuthModalOpen: false,
  authModalView: 'login',
  toasts: [],
  isWebSocketConnected: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAuthModal: (state, action: PayloadAction<'login' | 'register'>) => {
      state.isAuthModalOpen = true;
      state.authModalView = action.payload;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    switchAuthView: (state, action: PayloadAction<'login' | 'register'>) => {
      state.authModalView = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setWebSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isWebSocketConnected = action.payload;
    },
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  switchAuthView,
  addToast,
  removeToast,
  setWebSocketConnected,
} = uiSlice.actions;

export default uiSlice.reducer;
