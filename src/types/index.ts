// Core domain types

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  pageId: string;
  parentId?: string;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  isEditing?: boolean;
  isEdited?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CommentsState {
  comments: Record<string, Comment>;
  commentIds: string[];
  isLoading: boolean;
  error: string | null;
  sortBy: SortOption;
  pagination: PaginationState;
  optimisticUpdates: Record<string, Partial<Comment>>;
}

export type SortOption = 'newest' | 'oldest' | 'mostLiked' | 'mostDisliked';

export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface CommentPayload {
  content: string;
  pageId: string;
  parentCommentId?: string | null;
}

export interface VotePayload {
  commentId: string;
  voteType: 'like' | 'dislike';
}

// WebSocket event types
export type WSEventType = 
  | 'comment:new'
  | 'comment:update'
  | 'comment:delete'
  | 'comment:vote';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}
