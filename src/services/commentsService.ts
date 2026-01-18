import type { Comment, CommentPayload, PaginationState, SortOption } from '../types';
import api from './api';

interface CommentsResponse {
  comments: Comment[];
  pagination: PaginationState;
}

interface ApiComment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  pageId: string;
  parentCommentId?: string | null;
  likes: string[];
  dislikes: string[];
  likesCount: number;
  dislikesCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiCommentsResponse {
  success: boolean;
  data: ApiComment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ApiCommentResponse {
  success: boolean;
  message?: string;
  data: ApiComment;
}

interface ApiVoteResponse {
  success: boolean;
  message?: string;
  data: {
    _id: string;
    content: string;
    likesCount: number;
    dislikesCount: number;
  };
}

// Transform API comment to app Comment type
const transformComment = (apiComment: ApiComment, currentUserId?: string): Comment => {
  // Check if current user has voted
  let userVote: 'like' | 'dislike' | null = null;
  if (currentUserId) {
    if (apiComment.likes.includes(currentUserId)) {
      userVote = 'like';
    } else if (apiComment.dislikes.includes(currentUserId)) {
      userVote = 'dislike';
    }
  }

  return {
    id: apiComment._id,
    content: apiComment.content,
    authorId: apiComment.author._id,
    author: {
      id: apiComment.author._id,
      name: apiComment.author.name,
      email: apiComment.author.email,
      createdAt: apiComment.createdAt, // Use comment createdAt as fallback
    },
    pageId: apiComment.pageId,
    parentId: apiComment.parentCommentId || undefined,
    likes: apiComment.likesCount,
    dislikes: apiComment.dislikesCount,
    userVote,
    createdAt: apiComment.createdAt,
    updatedAt: apiComment.updatedAt,
    isEdited: apiComment.isEdited,
  };
};

// Map app sort option to API sort option
const mapSortOption = (sortBy: SortOption): string => {
  const mapping: Record<SortOption, string> = {
    newest: 'newest',
    oldest: 'oldest',
    mostLiked: 'mostLiked',
    mostDisliked: 'mostDisliked',
  };
  return mapping[sortBy] || 'newest';
};

export const commentsService = {
  async getComments(
    pageId: string,
    page: number,
    limit: number,
    sortBy: SortOption
  ): Promise<CommentsResponse> {
    const response = await api.get<ApiCommentsResponse>('/comments', {
      params: {
        pageId,
        page,
        limit,
        sort: mapSortOption(sortBy),
      },
    });

    if (!response.data.success) {
      throw new Error('Failed to fetch comments');
    }

    // Get current user ID from localStorage (we'll need to parse the token or store user ID)
    const userStr = localStorage.getItem('auth_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser?.id;

    const comments = response.data.data.map((apiComment) =>
      transformComment(apiComment, currentUserId)
    );

    return {
      comments,
      pagination: {
        page: response.data.pagination.currentPage,
        pageSize: response.data.pagination.pageSize,
        totalPages: response.data.pagination.totalPages,
        totalItems: response.data.pagination.totalCount,
      },
    };
  },

  async getComment(id: string): Promise<Comment> {
    const response = await api.get<ApiCommentResponse>(`/comments/${id}`);

    if (!response.data.success) {
      throw new Error('Failed to fetch comment');
    }

    const userStr = localStorage.getItem('auth_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser?.id;

    return transformComment(response.data.data, currentUserId);
  },

  async getReplies(
    commentId: string,
    page: number,
    limit: number,
    sortBy: SortOption
  ): Promise<CommentsResponse> {
    const response = await api.get<ApiCommentsResponse>(`/comments/${commentId}/replies`, {
      params: {
        page,
        limit,
        sort: mapSortOption(sortBy),
      },
    });

    if (!response.data.success) {
      throw new Error('Failed to fetch replies');
    }

    const userStr = localStorage.getItem('auth_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser?.id;

    const comments = response.data.data.map((apiComment) =>
      transformComment(apiComment, currentUserId)
    );

    return {
      comments,
      pagination: {
        page: response.data.pagination.currentPage,
        pageSize: response.data.pagination.pageSize,
        totalPages: response.data.pagination.totalPages,
        totalItems: response.data.pagination.totalCount,
      },
    };
  },

  async createComment(payload: CommentPayload): Promise<Comment> {
    const response = await api.post<ApiCommentResponse>('/comments', {
      content: payload.content,
      pageId: payload.pageId,
      parentCommentId: payload.parentCommentId || null,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create comment');
    }

    const userStr = localStorage.getItem('auth_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser?.id;

    return transformComment(response.data.data, currentUserId);
  },

  async updateComment(id: string, content: string): Promise<Comment> {
    const response = await api.put<ApiCommentResponse>(`/comments/${id}`, { content });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update comment');
    }

    const userStr = localStorage.getItem('auth_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser?.id;

    return transformComment(response.data.data, currentUserId);
  },

  async deleteComment(id: string): Promise<void> {
    const response = await api.delete(`/comments/${id}`);

    if (response.status !== 200 && response.status !== 204) {
      throw new Error('Failed to delete comment');
    }
  },

  async likeComment(commentId: string): Promise<Comment> {
    const response = await api.post<ApiVoteResponse>(`/comments/${commentId}/like`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to like comment');
    }

    // Get the full comment to return complete data
    return this.getComment(commentId);
  },

  async dislikeComment(commentId: string): Promise<Comment> {
    const response = await api.post<ApiVoteResponse>(`/comments/${commentId}/dislike`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to dislike comment');
    }

    // Get the full comment to return complete data
    return this.getComment(commentId);
  },

  // Legacy vote method for backward compatibility
  async vote(commentId: string, voteType: 'like' | 'dislike'): Promise<Comment> {
    if (voteType === 'like') {
      return this.likeComment(commentId);
    } else {
      return this.dislikeComment(commentId);
    }
  },
};
