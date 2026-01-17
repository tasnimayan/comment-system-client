import { useVirtualizer } from '@tanstack/react-virtual';
import { AnimatePresence } from 'motion/react';
import { memo, useCallback, useRef } from 'react';
import type { Comment, User } from '../../types';
import CommentCard from './CommentCard';
import CommentSkeleton from './CommentSkeleton';
import EmptyState from './EmptyState';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  currentUser: User | null;
  isAuthenticated: boolean;
  onVote: (commentId: string, voteType: 'like' | 'dislike') => void;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEditToggle: (id: string, isEditing: boolean) => void;
  onLoginClick: () => void;
}

const ESTIMATED_ITEM_SIZE = 180;

const CommentList = memo<CommentListProps>(({
  comments,
  isLoading,
  currentUser,
  isAuthenticated,
  onVote,
  onEdit,
  onDelete,
  onEditToggle,
  onLoginClick,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Memoize owner check
  const isOwner = useCallback(
    (authorId: string) => currentUser?.id === authorId,
    [currentUser?.id]
  );

  // Use virtualization for large lists
  const shouldVirtualize = comments.length > 20;

  const virtualizer = useVirtualizer({
    count: comments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ITEM_SIZE,
    overscan: 5,
    enabled: shouldVirtualize,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Skeleton loading
  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && comments.length === 0) {
    return <EmptyState onLoginClick={onLoginClick} isAuthenticated={isAuthenticated} />;
  }

  // Virtualized list for large datasets
  if (shouldVirtualize) {
    return (
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto custom-scrollbar"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const comment = comments[virtualRow.index];
            return (
              <div
                key={comment.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="pb-4">
                  <CommentCard
                    comment={comment}
                    isOwner={isOwner(comment.authorId)}
                    isAuthenticated={isAuthenticated}
                    onVote={onVote}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onEditToggle={onEditToggle}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Regular list for small datasets
  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isOwner={isOwner(comment.authorId)}
            isAuthenticated={isAuthenticated}
            onVote={onVote}
            onEdit={onEdit}
            onDelete={onDelete}
            onEditToggle={onEditToggle}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

CommentList.displayName = 'CommentList';

export default CommentList;
