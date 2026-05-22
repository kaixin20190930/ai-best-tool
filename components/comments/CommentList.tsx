'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Comment, getComments } from '@/app/actions/comments';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';
import Loading from '@/components/Loading';

interface CommentListProps {
  toolId: string;
  currentUserId?: string;
}

export default function CommentList({ toolId, currentUserId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await getComments(toolId);
    
    if (result.success) {
      setComments(result.comments);
    } else {
      setError(result.error || 'Failed to load comments');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [toolId]);

  const handleCommentUpdate = () => {
    loadComments();
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    // 如果是服务不可用的错误，显示更友好的消息
    const isServiceUnavailable = error.includes('temporarily unavailable');
    
    return (
      <div className="py-8 text-center">
        <MessageSquare className="mx-auto mb-3 size-12 text-slate-300" />
        <p className={`mb-2 ${isServiceUnavailable ? 'text-slate-600' : 'text-red-600'}`}>
          {error}
        </p>
        {!isServiceUnavailable && (
          <button
            onClick={loadComments}
            className="mt-4 text-cyan-700 hover:underline"
          >
            Try again
          </button>
        )}
        {isServiceUnavailable && (
          <p className="mt-2 text-sm text-slate-500">
            The comment system will be back soon.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="size-6 text-slate-700" />
        <h3 className="text-xl font-semibold text-slate-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Input */}
      <div className="theme-surface rounded-lg border border-slate-200 p-4">
        <CommentInput
          toolId={toolId}
          onCommentPosted={handleCommentUpdate}
          placeholder="Share your thoughts about this tool..."
        />
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto mb-3 size-12 text-slate-300" />
          <p className="text-slate-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleCommentUpdate}
              onUpdate={handleCommentUpdate}
              onDelete={handleCommentUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
