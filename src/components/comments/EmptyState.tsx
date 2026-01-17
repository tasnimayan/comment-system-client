import { MessageCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { memo } from 'react';

interface EmptyStateProps {
  isAuthenticated: boolean;
  onLoginClick: () => void;
}

const EmptyState = memo<EmptyStateProps>(({ isAuthenticated, onLoginClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-10 text-center"
    >
      {/* Animated icon */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative inline-block mb-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-primary" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-accent" />
        </motion.div>
      </motion.div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        No comments yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Be the first to share your thoughts and start the conversation!
      </p>

      {!isAuthenticated && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLoginClick}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-glow hover:shadow-glow-lg transition-all"
        >
          Sign in to comment
        </motion.button>
      )}
    </motion.div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
