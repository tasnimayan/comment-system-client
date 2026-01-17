import { Check, Edit3, MoreHorizontal, ThumbsDown, ThumbsUp, Trash2, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import type { Comment } from '../../types';

interface CommentCardProps {
  comment: Comment;
  isOwner: boolean;
  isAuthenticated: boolean;
  onVote: (commentId: string, voteType: 'like' | 'dislike') => void;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEditToggle: (id: string, isEditing: boolean) => void;
}

const CommentCard = memo<CommentCardProps>(({
  comment,
  isOwner,
  isAuthenticated,
  onVote,
  onEdit,
  onDelete,
  onEditToggle,
}) => {
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (comment.isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [comment.isEditing, editContent.length]);

  // Close actions menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    
    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActions]);

  const handleSaveEdit = useCallback(async () => {
    if (!editContent.trim() || editContent === comment.content) {
      onEditToggle(comment.id, false);
      return;
    }
    await onEdit(comment.id, editContent);
  }, [comment.id, comment.content, editContent, onEdit, onEditToggle]);

  const handleCancelEdit = useCallback(() => {
    setEditContent(comment.content);
    onEditToggle(comment.id, false);
  }, [comment.content, comment.id, onEditToggle]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
      setShowActions(false);
    }
  }, [comment.id, onDelete]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const wasEdited = comment.createdAt !== comment.updatedAt;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        "group relative glass rounded-xl p-5 transition-all duration-300",
        "hover:border-primary/30",
        isOwner && "ring-1 ring-primary/20"
      )}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-2 ring-primary/20">
              {comment.author.avatarUrl ? (
                <img
                  src={comment.author.avatarUrl}
                  alt={comment.author.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
            {isOwner && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
          </div>
          
          {/* Author info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {comment.author.username}
              </span>
              {isOwner && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium uppercase tracking-wider">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <time>{formatDate(comment.createdAt)}</time>
              {wasEdited && (
                <span className="text-muted-foreground/60">• edited</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions menu */}
        {isOwner && !comment.isEditing && (
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-secondary/80 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Comment actions"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 glass-strong rounded-lg overflow-hidden shadow-lg z-10 min-w-[140px]"
                >
                  <button
                    onClick={() => {
                      onEditToggle(comment.id, true);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="mb-4">
        {comment.isEditing ? (
          <div className="space-y-3">
            <textarea
              ref={editInputRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              rows={3}
              placeholder="Edit your comment..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary/60 transition-colors flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
                className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}
      </div>

      {/* Footer - Voting */}
      <footer className="flex items-center gap-4">
        <VoteButton
          type="like"
          count={comment.likes}
          isActive={comment.userVote === 'like'}
          isAuthenticated={isAuthenticated}
          onClick={() => onVote(comment.id, 'like')}
        />
        <VoteButton
          type="dislike"
          count={comment.dislikes}
          isActive={comment.userVote === 'dislike'}
          isAuthenticated={isAuthenticated}
          onClick={() => onVote(comment.id, 'dislike')}
        />
      </footer>
    </motion.article>
  );
});

CommentCard.displayName = 'CommentCard';

// Vote button component
interface VoteButtonProps {
  type: 'like' | 'dislike';
  count: number;
  isActive: boolean;
  isAuthenticated: boolean;
  onClick: () => void;
}

const VoteButton = memo<VoteButtonProps>(({
  type,
  count,
  isActive,
  isAuthenticated,
  onClick,
}) => {
  const Icon = type === 'like' ? ThumbsUp : ThumbsDown;
  const activeClass = type === 'like' 
    ? 'text-like glow-like bg-like/10' 
    : 'text-dislike glow-dislike bg-dislike/10';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={!isAuthenticated}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive 
          ? activeClass
          : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
      )}
      title={!isAuthenticated ? 'Log in to vote' : undefined}
    >
      <motion.div
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Icon className={cn("w-4 h-4", isActive && "fill-current")} />
      </motion.div>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-sm font-medium tabular-nums"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
});

VoteButton.displayName = 'VoteButton';

export default CommentCard;
