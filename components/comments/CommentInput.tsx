'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { postComment } from '@/app/actions/comments';
import { Button } from '@/components/ui/button';

interface CommentInputProps {
  toolId: string;
  parentId?: string;
  onCommentPosted?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentInput({
  toolId,
  parentId,
  onCommentPosted,
  onCancel,
  placeholder = 'Write a comment...',
  autoFocus = false
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    startTransition(async () => {
      const result = await postComment(toolId, content, parentId);
      
      if (result.success) {
        setContent('');
        toast.success(result.message || 'Comment posted successfully');
        onCommentPosted?.();
      } else {
        if (result.error === 'You must be logged in to post comments') {
          toast.error('Please log in to post comments');
        } else {
          toast.error(result.error || 'Failed to post comment');
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={isPending}
        maxLength={2000}
        rows={3}
        className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-200 disabled:opacity-50"
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {content.length}/2000 characters
        </span>
        
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !content.trim()}
          >
            {isPending ? 'Posting...' : parentId ? 'Reply' : 'Post Comment'}
          </Button>
        </div>
      </div>
    </form>
  );
}
