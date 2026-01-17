import { AlertCircle, Send, User } from 'lucide-react';
import { motion } from 'motion/react';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface CommentFormProps {
  isAuthenticated: boolean;
  isLoading?: boolean;
  onSubmit: (content: string) => Promise<void>;
  onLoginClick: () => void;
  username?: string;
}

const CommentForm = memo<CommentFormProps>(({
  isAuthenticated,
  isLoading = false,
  onSubmit,
  onLoginClick,
  username,
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      setError('Please enter a comment');
      return;
    }
    
    if (trimmedContent.length < 2) {
      setError('Comment must be at least 2 characters');
      return;
    }
    
    if (trimmedContent.length > 2000) {
      setError('Comment must be less than 2000 characters');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onSubmit(trimmedContent);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, onSubmit]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const characterCount = content.length;
  const isNearLimit = characterCount > 1800;
  const isOverLimit = characterCount > 2000;

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Join the conversation
        </h3>
        <p className="text-muted-foreground mb-4">
          Log in or create an account to share your thoughts
        </p>
        <button
          onClick={onLoginClick}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-glow hover:shadow-glow-lg"
        >
          Get started
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="hidden sm:block">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-2 ring-primary/20">
            <User className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Input area */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-foreground">
              {username || 'You'}
            </span>
            <span className="text-xs text-muted-foreground">posting as</span>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              placeholder="Share your thoughts..."
              className={cn(
                "w-full bg-secondary/40 border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground resize-none",
                "focus:outline-none focus:ring-2 transition-all min-h-[100px]",
                error 
                  ? "border-destructive focus:ring-destructive/50" 
                  : "border-border focus:ring-primary/50"
              )}
              rows={3}
              disabled={isSubmitting || isLoading}
            />
            
            {/* Character count */}
            {content.length > 0 && (
              <div className={cn(
                "absolute bottom-3 right-3 text-xs tabular-nums",
                isOverLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-muted-foreground"
              )}>
                {characterCount}/2000
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {/* Submit button */}
          <div className="flex justify-end">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || isLoading || !content.trim() || isOverLimit}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 shadow-glow hover:shadow-glow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              )}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Comment
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.form>
  );
});

CommentForm.displayName = 'CommentForm';

export default CommentForm;
