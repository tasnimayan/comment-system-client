import { memo } from 'react';
import { motion } from 'motion/react';
import { LogOut, User, MessageSquare } from 'lucide-react';

const Header = memo(() => {
  const isAuthenticated = false;
  const user:{username:string} | null = null;

  const handleLogout = () =>{}
  const openLogin = () =>{}
  const openRegister = () =>{}
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong sticky top-0 z-40 border-b border-border/50"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Comment-System
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Real-time discussions
              </p>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                {/* User info */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-2 ring-primary/20">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {user.username}
                  </span>
                </div>

                {/* Logout button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary/60 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openLogin}
                  className="px-4 py-2 rounded-lg hover:bg-secondary/60 transition-colors text-sm font-medium"
                >
                  Sign in
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openRegister}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shadow-glow"
                >
                  Sign up
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
});

Header.displayName = 'Header';

export default Header;
