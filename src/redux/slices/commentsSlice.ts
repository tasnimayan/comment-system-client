import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { commentsService } from '../../services/commentsService';
import type { Comment, CommentPayload, CommentsState, SortOption, VotePayload } from '../../types';

const initialState: CommentsState = {
  comments: {},
  commentIds: [],
  isLoading: false,
  error: null,
  sortBy: 'newest',
  pagination: {
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  },
  optimisticUpdates: {},
};

// Normalize comments into a lookup table
const normalizeComments = (comments: Comment[]): Record<string, Comment> => {
  return comments.reduce((acc, comment) => {
    acc[comment.id] = comment;
    return acc;
  }, {} as Record<string, Comment>);
};

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (
    { pageId, page, pageSize, sortBy }: { pageId: string; page: number; pageSize: number; sortBy: SortOption },
    { rejectWithValue }
  ) => {
    try {
      return await commentsService.getComments(pageId, page, pageSize, sortBy);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch comments';
      return rejectWithValue(message);
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async (payload: CommentPayload, { rejectWithValue }) => {
    try {
      return await commentsService.createComment(payload);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add comment';
      return rejectWithValue(message);
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ id, content }: { id: string; content: string }, { rejectWithValue }) => {
    try {
      return await commentsService.updateComment(id, content);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update comment';
      return rejectWithValue(message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (id: string, { rejectWithValue }) => {
    try {
      await commentsService.deleteComment(id);
      return id;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete comment';
      return rejectWithValue(message);
    }
  }
);

export const voteComment = createAsyncThunk(
  'comments/voteComment',
  async (payload: VotePayload, { rejectWithValue, getState }) => {
    try {
      // Get current comment state for rollback
      const state = getState() as { comments: CommentsState };
      const currentComment = state.comments.comments[payload.commentId];
      
      const result = await commentsService.vote(payload.commentId, payload.voteType);
      return { ...result, previousState: currentComment };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to vote';
      return rejectWithValue(message);
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setEditingComment: (state, action: PayloadAction<{ id: string; isEditing: boolean }>) => {
      if (state.comments[action.payload.id]) {
        state.comments[action.payload.id].isEditing = action.payload.isEditing;
      }
    },
    // Optimistic vote update
    optimisticVote: (state, action: PayloadAction<VotePayload>) => {
      const { commentId, voteType } = action.payload;
      const comment = state.comments[commentId];
      if (!comment) return;

      // Store original state for rollback
      state.optimisticUpdates[commentId] = {
        likes: comment.likes,
        dislikes: comment.dislikes,
        userVote: comment.userVote,
      };

      // Calculate new vote counts
      const previousVote = comment.userVote;
      
      if (previousVote === voteType) {
        // Remove vote
        comment.userVote = null;
        if (voteType === 'like') comment.likes--;
        else comment.dislikes--;
      } else {
        // Add new vote
        if (previousVote === 'like') comment.likes--;
        else if (previousVote === 'dislike') comment.dislikes--;
        
        comment.userVote = voteType;
        if (voteType === 'like') comment.likes++;
        else comment.dislikes++;
      }
    },
    // Rollback optimistic update
    rollbackVote: (state, action: PayloadAction<string>) => {
      const commentId = action.payload;
      const originalState = state.optimisticUpdates[commentId];
      if (originalState && state.comments[commentId]) {
        state.comments[commentId] = {
          ...state.comments[commentId],
          ...originalState,
        };
        delete state.optimisticUpdates[commentId];
      }
    },
    // Real-time update handlers
    addCommentRealtime: (state, action: PayloadAction<Comment>) => {
      state.comments[action.payload.id] = action.payload;
      state.commentIds.unshift(action.payload.id);
      state.pagination.totalItems++;
    },
    updateCommentRealtime: (state, action: PayloadAction<Comment>) => {
      if (state.comments[action.payload.id]) {
        state.comments[action.payload.id] = action.payload;
      }
    },
    deleteCommentRealtime: (state, action: PayloadAction<string>) => {
      delete state.comments[action.payload];
      state.commentIds = state.commentIds.filter(id => id !== action.payload);
      state.pagination.totalItems--;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = normalizeComments(action.payload.comments);
        state.commentIds = action.payload.comments.map((c) => c.id);
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add comment
      .addCase(addComment.pending, (state) => {
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments[action.payload.id] = action.payload;
        state.commentIds.unshift(action.payload.id);
        state.pagination.totalItems++;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update comment
      .addCase(updateComment.fulfilled, (state, action) => {
        if (state.comments[action.payload.id]) {
          state.comments[action.payload.id] = {
            ...state.comments[action.payload.id],
            ...action.payload,
            isEditing: false,
          };
        }
      })
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        delete state.comments[action.payload];
        state.commentIds = state.commentIds.filter(id => id !== action.payload);
        state.pagination.totalItems--;
      })
      // Vote
      .addCase(voteComment.fulfilled, (state, action) => {
        const { id, likes, dislikes, userVote } = action.payload;
        if (state.comments[id]) {
          state.comments[id].likes = likes;
          state.comments[id].dislikes = dislikes;
          state.comments[id].userVote = userVote;
        }
        delete state.optimisticUpdates[id];
      })
      .addCase(voteComment.rejected, (state, action) => {
        // Rollback handled by middleware
        state.error = action.payload as string;
      });
  },
});

export const {
  setSortBy,
  setPage,
  setPageSize,
  clearError,
  setEditingComment,
  optimisticVote,
  rollbackVote,
  addCommentRealtime,
  updateCommentRealtime,
  deleteCommentRealtime,
} = commentsSlice.actions;

export default commentsSlice.reducer;
