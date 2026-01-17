import { ArrowUpDown, ChevronLeft, ChevronRight, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import React, { memo, useMemo } from 'react';
import { cn } from '../../lib/utils';
import type { PaginationState, SortOption } from '../../types';

interface CommentControlsProps {
  sortBy: SortOption;
  pagination: PaginationState;
  onSortChange: (sort: SortOption) => void;
  onPageChange: (page: number) => void;
}

const sortOptions: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'most_liked', label: 'Most Liked', icon: TrendingUp },
  { value: 'most_disliked', label: 'Most Disliked', icon: TrendingDown },
];

const CommentControls = memo<CommentControlsProps>(({
  sortBy,
  pagination,
  onSortChange,
  onPageChange,
}) => {
  const { page, totalPages, totalItems } = pagination;

  // Generate page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    pages.push(1);
    
    if (page > 3) {
      pages.push('ellipsis');
    }
    
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (page < totalPages - 2) {
      pages.push('ellipsis');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Sort options */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = sortBy === option.value;
            
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSortChange(option.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{option.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">
            {totalItems} comments
          </span>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, index) => (
              pageNum === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  …
                </span>
              ) : (
                <motion.button
                  key={pageNum}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-all",
                    page === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {pageNum}
                </motion.button>
              )
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-lg hover:bg-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
});

CommentControls.displayName = 'CommentControls';

export default CommentControls;
