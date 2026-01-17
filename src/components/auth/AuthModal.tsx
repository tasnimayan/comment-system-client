import { AlertCircle, Eye, EyeOff, Lock, Mail, Sparkles, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { memo, useCallback, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const AuthModal = memo(() => {
  const {
    isAuthModalOpen,
    authModalView,
    isLoading,
    error,
    validationErrors,
    handleLogin,
    handleRegister,
    closeModal,
    switchView,
  } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authModalView === 'login') {
      await handleLogin({
        email: formData.email,
        password: formData.password,
      });
    } else {
      await handleRegister({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
    }
  }, [authModalView, formData, handleLogin, handleRegister]);

  const handleSwitchView = useCallback((view: 'login' | 'register') => {
    setFormData({ username: '', email: '', password: '' });
    switchView(view);
  }, [switchView]);

  const handleClose = useCallback(() => {
    setFormData({ username: '', email: '', password: '' });
    closeModal();
  }, [closeModal]);

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="glass-strong rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="relative px-6 pt-8 pb-6 text-center border-b border-border/50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="absolute right-4 top-4 p-2 rounded-lg hover:bg-secondary/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mx-auto mb-4 shadow-glow"
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>

                <h2 className="text-2xl font-bold text-foreground">
                  {authModalView === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {authModalView === 'login'
                    ? 'Sign in to continue'
                    : 'Join the conversation'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Global error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Username (register only) */}
                {authModalView === 'register' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="johndoe"
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-lg bg-secondary/50 border transition-all",
                          "placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                          validationErrors.username
                            ? "border-destructive focus:ring-destructive/50"
                            : "border-border focus:ring-primary/50"
                        )}
                        autoComplete="username"
                      />
                    </div>
                    {validationErrors.username && (
                      <p className="text-xs text-destructive">{validationErrors.username}</p>
                    )}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-lg bg-secondary/50 border transition-all",
                        "placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                        validationErrors.email
                          ? "border-destructive focus:ring-destructive/50"
                          : "border-border focus:ring-primary/50"
                      )}
                      autoComplete="email"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-destructive">{validationErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={cn(
                        "w-full pl-10 pr-12 py-3 rounded-lg bg-secondary/50 border transition-all",
                        "placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                        validationErrors.password
                          ? "border-destructive focus:ring-destructive/50"
                          : "border-border focus:ring-primary/50"
                      )}
                      autoComplete={authModalView === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-destructive">{validationErrors.password}</p>
                  )}
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-3 rounded-lg font-medium transition-all",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 shadow-glow hover:shadow-glow-lg",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                      {authModalView === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    authModalView === 'login' ? 'Sign in' : 'Create account'
                  )}
                </motion.button>

                {/* Switch view */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {authModalView === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchView(authModalView === 'login' ? 'register' : 'login')}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {authModalView === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

AuthModal.displayName = 'AuthModal';

export default AuthModal;
