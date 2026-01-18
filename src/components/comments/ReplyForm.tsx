import { Send, X } from 'lucide-react';
import { motion } from 'motion/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

const ReplyForm = memo<ReplyFormProps>(({
  onSubmit,
  onCancel,
  placeholder = 'Write a reply...',
  isLoading = false,
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length < 2) return;
    
    try {
      await onSubmit(trimmedContent);
      setContent('');
      onCancel();
    } catch (err) {
      // Error handling can be added here
    }
  }, [content, onSubmit, onCancel]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mt-2 space-y-2"
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm",
          "text-foreground placeholder-muted-foreground resize-none",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
          "min-h-[60px] max-h-[200px]"
        )}
        rows={2}
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onCancel();
          }
        }}
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary/60 transition-colors flex items-center gap-1"
          disabled={isLoading}
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading || !content.trim() || content.trim().length < 2}
          className={cn(
            "px-3 py-1.5 text-sm rounded-lg font-medium transition-all",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-1.5"
          )}
        >
          <Send className="w-3.5 h-3.5" />
          Reply
        </motion.button>
      </div>
    </motion.form>
  );
});

ReplyForm.displayName = 'ReplyForm';

export default ReplyForm;

