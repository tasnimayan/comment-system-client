import { motion } from 'motion/react';
import { memo } from 'react';

const CommentSkeleton = memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-xl p-5"
    >
      {/* Header skeleton */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full animate-shimmer" />
        <div className="flex-1">
          <div className="h-4 w-24 rounded animate-shimmer mb-2" />
          <div className="h-3 w-16 rounded animate-shimmer" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-4/5 rounded animate-shimmer" />
        <div className="h-4 w-3/5 rounded animate-shimmer" />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-16 rounded-lg animate-shimmer" />
        <div className="h-8 w-16 rounded-lg animate-shimmer" />
      </div>
    </motion.div>
  );
});

CommentSkeleton.displayName = 'CommentSkeleton';

export default CommentSkeleton;
