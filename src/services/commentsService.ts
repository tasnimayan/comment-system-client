import { store } from '../redux/store';
import type { Comment, CommentPayload, PaginationState, SortOption } from '../types';
import api from './api';

interface CommentsResponse {
  comments: Comment[];
  pagination: PaginationState;
}

// Demo mode data
const DEMO_MODE = true;
const DEMO_COMMENTS_KEY = 'demo_comments';
const DEMO_VOTES_KEY = 'demo_votes';

const getDemoComments = (): Comment[] => {
  try {
    const stored = localStorage.getItem(DEMO_COMMENTS_KEY);
    return stored ? JSON.parse(stored) : getInitialComments();
  } catch {
    return getInitialComments();
  }
};

const saveDemoComments = (comments: Comment[]) => {
  localStorage.setItem(DEMO_COMMENTS_KEY, JSON.stringify(comments));
};

const getDemoVotes = (): Record<string, Record<string, 'like' | 'dislike'>> => {
  try {
    const stored = localStorage.getItem(DEMO_VOTES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveDemoVotes = (votes: Record<string, Record<string, 'like' | 'dislike'>>) => {
  localStorage.setItem(DEMO_VOTES_KEY, JSON.stringify(votes));
};

const getInitialComments = (): Comment[] => {
  const now = new Date();
  return [
    {
      id: 'comment-1',
      content: 'This is an amazing feature! The glassmorphism design really makes it stand out. Love the attention to detail.',
      authorId: 'demo-user-1',
      author: {
        id: 'demo-user-1',
        username: 'Alex Chen',
        email: 'alex@example.com',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      postId: 'demo-post',
      likes: 24,
      dislikes: 2,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'comment-2',
      content: 'The real-time updates work flawlessly. Great implementation of WebSockets!',
      authorId: 'demo-user-2',
      author: {
        id: 'demo-user-2',
        username: 'Sarah Miller',
        email: 'sarah@example.com',
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      postId: 'demo-post',
      likes: 18,
      dislikes: 0,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'comment-3',
      content: 'Would love to see threaded replies in the next update. The sorting options are super helpful though!',
      authorId: 'demo-user-3',
      author: {
        id: 'demo-user-3',
        username: 'Marcus Johnson',
        email: 'marcus@example.com',
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      postId: 'demo-post',
      likes: 12,
      dislikes: 1,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'comment-4',
      content: 'The dark mode is perfect. Easy on the eyes for late-night browsing. 🌙',
      authorId: 'demo-user-4',
      author: {
        id: 'demo-user-4',
        username: 'Emma Watson',
        email: 'emma@example.com',
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
      postId: 'demo-post',
      likes: 31,
      dislikes: 0,
      createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'comment-5',
      content: 'Performance is buttery smooth even with many comments loaded. Virtualization done right!',
      authorId: 'demo-user-5',
      author: {
        id: 'demo-user-5',
        username: 'David Kim',
        email: 'david@example.com',
        createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      },
      postId: 'demo-post',
      likes: 15,
      dislikes: 3,
      createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const sortComments = (comments: Comment[], sortBy: SortOption): Comment[] => {
  const sorted = [...comments];
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'most_liked':
      return sorted.sort((a, b) => b.likes - a.likes);
    case 'most_disliked':
      return sorted.sort((a, b) => b.dislikes - a.dislikes);
    default:
      return sorted;
  }
};

export const commentsService = {
  async getComments(
    postId: string,
    page: number,
    pageSize: number,
    sortBy: SortOption
  ): Promise<CommentsResponse> {
    if (DEMO_MODE) {
      await delay(400);
      
      let comments = getDemoComments().filter((c) => c.postId === postId);
      const currentUser = store.getState().auth.user;
      
      // Add user vote status
      if (currentUser) {
        const votes = getDemoVotes();
        const userVotes = votes[currentUser.id] || {};
        comments = comments.map((c) => ({
          ...c,
          userVote: userVotes[c.id] || null,
        }));
      }
      
      comments = sortComments(comments, sortBy);
      
      const totalItems = comments.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const start = (page - 1) * pageSize;
      const paginatedComments = comments.slice(start, start + pageSize);
      
      return {
        comments: paginatedComments,
        pagination: {
          page,
          pageSize,
          totalPages,
          totalItems,
        },
      };
    }
    
    const response = await api.get<CommentsResponse>(`/comments`, {
      params: { postId, page, pageSize, sortBy },
    });
    return response.data;
  },

  async createComment(payload: CommentPayload): Promise<Comment> {
    if (DEMO_MODE) {
      await delay(300);
      
      const currentUser = store.getState().auth.user;
      if (!currentUser) {
        throw new Error('You must be logged in to comment');
      }
      
      const now = new Date().toISOString();
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        content: payload.content,
        authorId: currentUser.id,
        author: currentUser,
        postId: payload.postId,
        parentId: payload.parentId,
        likes: 0,
        dislikes: 0,
        userVote: null,
        createdAt: now,
        updatedAt: now,
      };
      
      const comments = getDemoComments();
      comments.unshift(newComment);
      saveDemoComments(comments);
      
      return newComment;
    }
    
    const response = await api.post<Comment>('/comments', payload);
    return response.data;
  },

  async updateComment(id: string, content: string): Promise<Comment> {
    if (DEMO_MODE) {
      await delay(300);
      
      const currentUser = store.getState().auth.user;
      const comments = getDemoComments();
      const index = comments.findIndex((c) => c.id === id);
      
      if (index === -1) {
        throw new Error('Comment not found');
      }
      
      if (comments[index].authorId !== currentUser?.id) {
        throw new Error('You can only edit your own comments');
      }
      
      comments[index] = {
        ...comments[index],
        content,
        updatedAt: new Date().toISOString(),
      };
      
      saveDemoComments(comments);
      return comments[index];
    }
    
    const response = await api.patch<Comment>(`/comments/${id}`, { content });
    return response.data;
  },

  async deleteComment(id: string): Promise<void> {
    if (DEMO_MODE) {
      await delay(300);
      
      const currentUser = store.getState().auth.user;
      const comments = getDemoComments();
      const comment = comments.find((c) => c.id === id);
      
      if (!comment) {
        throw new Error('Comment not found');
      }
      
      if (comment.authorId !== currentUser?.id) {
        throw new Error('You can only delete your own comments');
      }
      
      const filtered = comments.filter((c) => c.id !== id);
      saveDemoComments(filtered);
      return;
    }
    
    await api.delete(`/comments/${id}`);
  },

  async vote(commentId: string, voteType: 'like' | 'dislike'): Promise<Comment> {
    if (DEMO_MODE) {
      await delay(200);
      
      const currentUser = store.getState().auth.user;
      if (!currentUser) {
        throw new Error('You must be logged in to vote');
      }
      
      const comments = getDemoComments();
      const index = comments.findIndex((c) => c.id === commentId);
      
      if (index === -1) {
        throw new Error('Comment not found');
      }
      
      const votes = getDemoVotes();
      if (!votes[currentUser.id]) {
        votes[currentUser.id] = {};
      }
      
      const currentVote = votes[currentUser.id][commentId];
      const comment = comments[index];
      
      if (currentVote === voteType) {
        // Remove vote
        delete votes[currentUser.id][commentId];
        if (voteType === 'like') comment.likes--;
        else comment.dislikes--;
        comment.userVote = null;
      } else {
        // Change or add vote
        if (currentVote === 'like') comment.likes--;
        else if (currentVote === 'dislike') comment.dislikes--;
        
        votes[currentUser.id][commentId] = voteType;
        if (voteType === 'like') comment.likes++;
        else comment.dislikes++;
        comment.userVote = voteType;
      }
      
      saveDemoComments(comments);
      saveDemoVotes(votes);
      
      return {
        ...comment,
        userVote: votes[currentUser.id][commentId] || null,
      };
    }
    
    const response = await api.post<Comment>(`/comments/${commentId}/vote`, { voteType });
    return response.data;
  },
};
