'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { postComment } from '@/app/actions/comments';

interface CommentInputProps {
  toolId: string;
  parentId?: string;
  onCommentPosted?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  starterPrompts?: string[];
  promptLabel?: string;
  autoFocus?: boolean;
}

export default function CommentInput({
  toolId,
  parentId,
  onCommentPosted,
  onCancel,
  placeholder = 'Write a comment...',
  starterPrompts = [],
  promptLabel = 'Quick prompts',
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  const applyPrompt = (prompt: string) => {
    setContent((current) => {
      const trimmed = current.trim();
      if (!trimmed) {
        return prompt;
      }

      return `${trimmed}\n\n${prompt}`;
    });
  };

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
      } else if (result.error === 'You must be logged in to post comments') {
        toast.error('Please log in to post comments');
      } else {
        toast.error(result.error || 'Failed to post comment');
      }
    });
  };

  let submitLabel = parentId ? 'Reply' : 'Post Comment';
  if (isPending) {
    submitLabel = 'Posting...';
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-3'>
      {starterPrompts.length > 0 && (
        <div className='space-y-2'>
          <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>{promptLabel}</p>
          <div className='flex flex-wrap gap-2'>
            {starterPrompts.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                type='button'
                onClick={() => applyPrompt(prompt)}
                disabled={isPending}
                className='max-w-full rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-left text-xs font-medium leading-5 text-cyan-800 transition-colors hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={isPending}
        maxLength={2000}
        rows={3}
        className='w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-200 disabled:opacity-50'
      />

      <div className='flex items-center justify-between'>
        <span className='text-xs text-slate-500'>{content.length}/2000 characters</span>

        <div className='flex gap-2'>
          {onCancel && (
            <Button type='button' variant='outline' size='sm' onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type='submit' size='sm' disabled={isPending || !content.trim()}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
