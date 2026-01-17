import { useCallback, useState } from 'react';
import { clearError, login, logout, register } from '../redux/slices/authSlice';
import { closeAuthModal, openAuthModal, switchAuthView } from '../redux/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import type { LoginCredentials, RegisterCredentials } from '../types';


export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  const { isAuthModalOpen, authModalView } = useAppSelector((state) => state.ui);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateUsername = (username: string): boolean => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      setValidationErrors({});
      
      const errors: Record<string, string> = {};
      
      if (!credentials.email) {
        errors.email = 'Email is required';
      } else if (!validateEmail(credentials.email)) {
        errors.email = 'Invalid email format';
      }
      
      if (!credentials.password) {
        errors.password = 'Password is required';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return false;
      }
      
      try {
        await dispatch(login(credentials)).unwrap();
        dispatch(closeAuthModal());
        return true;
      } catch {
        return false;
      }
    },
    [dispatch]
  );

  const handleRegister = useCallback(
    async (credentials: RegisterCredentials) => {
      setValidationErrors({});
      
      const errors: Record<string, string> = {};
      
      if (!credentials.username) {
        errors.username = 'Username is required';
      } else if (!validateUsername(credentials.username)) {
        errors.username = 'Username must be 3+ characters, alphanumeric only';
      }
      
      if (!credentials.email) {
        errors.email = 'Email is required';
      } else if (!validateEmail(credentials.email)) {
        errors.email = 'Invalid email format';
      }
      
      if (!credentials.password) {
        errors.password = 'Password is required';
      } else if (!validatePassword(credentials.password)) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return false;
      }
      
      try {
        await dispatch(register(credentials)).unwrap();
        dispatch(closeAuthModal());
        return true;
      } catch {
        return false;
      }
    },
    [dispatch]
  );

  const handleLogout = useCallback(async () => {
    await dispatch(logout());
  }, [dispatch]);

  const openLogin = useCallback(() => {
    dispatch(clearError());
    setValidationErrors({});
    dispatch(openAuthModal('login'));
  }, [dispatch]);

  const openRegister = useCallback(() => {
    dispatch(clearError());
    setValidationErrors({});
    dispatch(openAuthModal('register'));
  }, [dispatch]);

  const closeModal = useCallback(() => {
    dispatch(closeAuthModal());
    dispatch(clearError());
    setValidationErrors({});
  }, [dispatch]);

  const switchView = useCallback(
    (view: 'login' | 'register') => {
      dispatch(clearError());
      setValidationErrors({});
      dispatch(switchAuthView(view));
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    validationErrors,
    isAuthModalOpen,
    authModalView,
    handleLogin,
    handleRegister,
    handleLogout,
    openLogin,
    openRegister,
    closeModal,
    switchView,
  };
};
