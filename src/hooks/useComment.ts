import { useCallback } from 'react';
import {
  addComment,
  deleteComment,
  fetchComments,
  optimisticVote,
  rollbackVote,
  setEditingComment,
  setPage,
  setSortBy,
  updateComment,
  voteComment,
} from '../redux/slices/commentsSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import type { CommentPayload, SortOption, VotePayload } from '../types';

export const useComments = (postId: string) => {
  const dispatch = useAppDispatch();
  
  const {
    comments,
    commentIds,
    isLoading,
    error,
    sortBy,
    pagination,
  } = useAppSelector((state) => state.comments);
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Memoized selectors
  const commentsList = commentIds.map((id) => comments[id]).filter(Boolean);

  const loadComments = useCallback(() => {
    dispatch(fetchComments({
      postId,
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy,
    }));
  }, [dispatch, postId, pagination.page, pagination.pageSize, sortBy]);

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      
      const payload: CommentPayload = {
        content: content.trim(),
        postId,
      };
      
      await dispatch(addComment(payload)).unwrap();
    },
    [dispatch, postId]
  );

  const handleUpdateComment = useCallback(
    async (id: string, content: string) => {
      if (!content.trim()) return;
      await dispatch(updateComment({ id, content: content.trim() })).unwrap();
    },
    [dispatch]
  );

  const handleDeleteComment = useCallback(
    async (id: string) => {
      await dispatch(deleteComment(id)).unwrap();
    },
    [dispatch]
  );

  const handleVote = useCallback(
    async (commentId: string, voteType: 'like' | 'dislike') => {
      if (!isAuthenticated) return;
      
      const payload: VotePayload = { commentId, voteType };
      
      // Optimistic update
      dispatch(optimisticVote(payload));
      
      try {
        await dispatch(voteComment(payload)).unwrap();
      } catch {
        // Rollback on error
        dispatch(rollbackVote(commentId));
      }
    },
    [dispatch, isAuthenticated]
  );

  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      dispatch(setSortBy(newSort));
      dispatch(setPage(1));
    },
    [dispatch]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  const handleEditToggle = useCallback(
    (id: string, isEditing: boolean) => {
      dispatch(setEditingComment({ id, isEditing }));
    },
    [dispatch]
  );

  const canModify = useCallback(
    (authorId: string) => {
      return isAuthenticated && user?.id === authorId;
    },
    [isAuthenticated, user?.id]
  );

  return {
    comments: commentsList,
    isLoading,
    error,
    sortBy,
    pagination,
    isAuthenticated,
    currentUser: user,
    loadComments,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleVote,
    handleSortChange,
    handlePageChange,
    handleEditToggle,
    canModify,
  };
};
