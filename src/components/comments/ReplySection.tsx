import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useCallback, useEffect, useState } from 'react';
import { commentsService } from '../../services/commentsService';
import type { Comment, User } from '../../types';
import CommentCard from './CommentCard';
import ReplyForm from './ReplyForm';

interface ReplySectionProps {
  commentId: string;
  pageId: string;
  isAuthenticated: boolean;
  currentUser: User | null;
  onVote: (commentId: string, voteType: 'like' | 'dislike') => void;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEditToggle: (id: string, isEditing: boolean) => void;
  onReplyAdded?: () => void;
}

const ReplySection = memo<ReplySectionProps>(({
  commentId,
  pageId,
  isAuthenticated,
  currentUser,
  onVote,
  onEdit,
  onDelete,
  onEditToggle,
  onReplyAdded,
}) => {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyCount, setReplyCount] = useState(0);

  const loadReplies = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await commentsService.getReplies(commentId, 1, 50, 'newest');
      setReplies(result.comments);
      setReplyCount(result.pagination.totalItems);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [commentId]);

  useEffect(() => {
    if (isExpanded && replies.length === 0 && !isLoading) {
      loadReplies();
    }
  }, [isExpanded, loadReplies, replies.length, isLoading]);

  const handleAddReply = useCallback(async (content: string) => {
    setIsSubmitting(true);
    try {
      await commentsService.createComment({
        content,
        pageId,
        parentCommentId: commentId,
      });
      // Reload replies to get the latest data including any other new replies
      await loadReplies();
      setShowReplyForm(false);
      onReplyAdded?.();
    } catch (error) {
      console.error('Failed to add reply:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [commentId, pageId, loadReplies, onReplyAdded]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const isOwner = useCallback(
    (authorId: string) => currentUser?.id === authorId,
    [currentUser?.id]
  );

  if (replyCount === 0 && !showReplyForm) {
    return (
      <div className="mt-2">
        {isAuthenticated && (
          <button
            onClick={() => setShowReplyForm(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <MessageSquare className="w-3 h-3" />
            Reply
          </button>
        )}
        <AnimatePresence>
          {showReplyForm && (
            <ReplyForm
              onSubmit={handleAddReply}
              onCancel={() => setShowReplyForm(false)}
              isLoading={isSubmitting}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      {/* Reply button and count */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleToggleExpand}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          <span>
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
        </button>
        {isAuthenticated && (
          <button
            onClick={() => {
              setShowReplyForm((prev) => !prev);
              if (!isExpanded) setIsExpanded(true);
            }}
            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            <MessageSquare className="w-3 h-3" />
            Reply
          </button>
        )}
      </div>

      {/* Reply form */}
      <AnimatePresence>
        {showReplyForm && (
          <ReplyForm
            onSubmit={handleAddReply}
            onCancel={() => setShowReplyForm(false)}
            isLoading={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Replies list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2 pl-4 border-l-2 border-border/30"
          >
            {isLoading ? (
              <div className="text-xs text-muted-foreground py-2">Loading replies...</div>
            ) : replies.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">No replies yet</div>
            ) : (
              replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  isOwner={isOwner(reply.authorId)}
                  isAuthenticated={isAuthenticated}
                  pageId={pageId}
                  currentUser={currentUser}
                  onVote={onVote}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onEditToggle={onEditToggle}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ReplySection.displayName = 'ReplySection';

export default ReplySection;

