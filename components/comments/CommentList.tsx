'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

import Loading from '@/components/Loading';
import { Comment, getComments } from '@/app/actions/comments';

import CommentInput from './CommentInput';
import CommentItem from './CommentItem';

interface CommentListProps {
  toolId: string;
  currentUserId?: string;
  placeholder?: string;
  starterPrompts?: string[];
  promptLabel?: string;
  locale?: string;
}

export default function CommentList({
  toolId,
  currentUserId,
  placeholder,
  starterPrompts,
  promptLabel,
  locale = 'en',
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [submitterId, setSubmitterId] = useState<string | null>(null);
  const [sort, setSort] = useState<'latest' | 'oldest' | 'helpful'>('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getComments(toolId, sort);

    if (result.success) {
      setComments(result.comments);
      setTotalCount(result.totalCount || result.comments.length);
      setSubmitterId(result.submitterId || null);
    } else {
      setError(result.error || 'Failed to load comments');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [toolId, sort]);

  const handleCommentUpdate = () => {
    loadComments();
  };

  const topHelpfulComment = [...comments]
    .filter((comment) => !comment.parent_id)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  const isChinese = locale === 'cn' || locale === 'tw';

  if (isLoading) {
    return (
      <div className='py-8'>
        <Loading />
      </div>
    );
  }

  if (error) {
    // 如果是服务不可用的错误，显示更友好的消息
    const isServiceUnavailable = error.includes('temporarily unavailable');

    return (
      <div className='py-8 text-center'>
        <MessageSquare className='mx-auto mb-3 size-12 text-slate-300' />
        <p className={`mb-2 ${isServiceUnavailable ? 'text-slate-600' : 'text-red-600'}`}>{error}</p>
        {!isServiceUnavailable && (
          <button type='button' onClick={loadComments} className='mt-4 text-cyan-700 hover:underline'>
            Try again
          </button>
        )}
        {isServiceUnavailable && <p className='mt-2 text-sm text-slate-500'>The comment system will be back soon.</p>}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-center gap-2'>
          <MessageSquare className='size-6 text-slate-700' />
          <h3 className='min-w-0 text-xl font-semibold text-slate-900'>Comments ({totalCount})</h3>
        </div>
        <div className='inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 text-sm'>
          <button
            type='button'
            onClick={() => setSort('latest')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              sort === 'latest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Latest
          </button>
          <button
            type='button'
            onClick={() => setSort('helpful')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              sort === 'helpful' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Most helpful
          </button>
          <button
            type='button'
            onClick={() => setSort('oldest')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              sort === 'oldest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      {/* Comment Input */}
      <div className='theme-surface rounded-lg border border-slate-200 p-4'>
        <CommentInput
          toolId={toolId}
          onCommentPosted={handleCommentUpdate}
          placeholder={placeholder || 'Share a real usage tip, a warning, or a workflow note...'}
          starterPrompts={starterPrompts}
          promptLabel={promptLabel}
        />
      </div>

      {topHelpfulComment && (
        <div className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-semibold uppercase tracking-wide text-amber-700'>
                {isChinese ? '最有帮助的讨论' : 'Most helpful so far'}
              </p>
              <p className='mt-1 break-words text-sm font-medium leading-6 text-slate-900'>
                {topHelpfulComment.content.slice(0, 160)}
                {topHelpfulComment.content.length > 160 ? '...' : ''}
              </p>
            </div>
            <div className='flex shrink-0 flex-wrap items-center gap-2'>
              <span className='inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200'>
                {topHelpfulComment.likes || 0} {isChinese ? '个赞' : 'likes'}
              </span>
              <Link
                href={`#comment-${topHelpfulComment.id}`}
                className='inline-flex items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100'
              >
                {isChinese ? '跳转到评论' : 'Jump to comment'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className='py-12 text-center'>
          <MessageSquare className='mx-auto mb-3 size-12 text-slate-300' />
          <p className='text-slate-500'>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className='space-y-6'>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              submitterId={submitterId}
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
