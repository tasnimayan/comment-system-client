// Loading fallback
export const CommentsLoading = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="glass rounded-xl p-5 animate-pulse">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-4 w-24 rounded bg-muted mb-2" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
        </div>
      </div>
    ))}
  </div>
);
