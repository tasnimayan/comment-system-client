import { MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'motion/react';
import { memo, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useComments } from '../../hooks/useComment';
import { useAppSelector } from '../../redux/store';
import CommentControls from './CommentControls';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

interface CommentsContainerProps {
  postId: string;
}

const CommentsContainer = memo<CommentsContainerProps>(({ postId }) => {
  const {
    comments,
    isLoading,
    sortBy,
    pagination,
    isAuthenticated,
    currentUser,
    loadComments,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleVote,
    handleSortChange,
    handlePageChange,
    handleEditToggle,
  } = useComments(postId);

  const { openLogin } = useAuth();
  const isWebSocketConnected = useAppSelector((state) => state.ui.isWebSocketConnected);

  // Load comments on mount and when pagination/sort changes
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Comments
            </h2>
            <p className="text-sm text-muted-foreground">
              {pagination.totalItems} {pagination.totalItems === 1 ? 'comment' : 'comments'}
            </p>
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="flex items-center gap-2 text-sm">
          {isWebSocketConnected ? (
            <span className="flex items-center gap-1.5 text-success">
              <Wifi className="w-4 h-4" />
              <span className="hidden sm:inline">Live</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <WifiOff className="w-4 h-4" />
              <span className="hidden sm:inline">Offline</span>
            </span>
          )}
        </div>
      </header>

      {/* Comment form */}
      <CommentForm
        isAuthenticated={isAuthenticated}
        onSubmit={handleAddComment}
        onLoginClick={openLogin}
        username={currentUser?.username}
      />

      {/* Controls */}
      {comments.length > 0 && (
        <CommentControls
          sortBy={sortBy}
          pagination={pagination}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
        />
      )}

      {/* Comments list */}
      <CommentList
        comments={comments}
        isLoading={isLoading}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onVote={handleVote}
        onEdit={handleUpdateComment}
        onDelete={handleDeleteComment}
        onEditToggle={handleEditToggle}
        onLoginClick={openLogin}
      />
    </motion.section>
  );
});

CommentsContainer.displayName = 'CommentsContainer';

export default CommentsContainer;
