'use client';

import { useState, useTransition } from 'react';
import { ThumbsUp, Reply, Edit, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Comment } from '@/app/actions/comments';
import { updateComment, deleteComment, likeComment } from '@/app/actions/comments';
import CommentInput from './CommentInput';
import { Button } from '@/components/ui/button';
import BaseImage from '@/components/image/BaseImage';

// Simple time ago formatter
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply?: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export default function CommentItem({
  comment,
  currentUserId,
  onReply,
  onUpdate,
  onDelete
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserId === comment.user_id;
  const username = comment.user?.user_metadata?.username || comment.user?.email?.split('@')[0] || 'Anonymous';
  const avatarUrl = comment.user?.user_metadata?.avatar_url;

  const handleLike = () => {
    startTransition(async () => {
      const result = await likeComment(comment.id);
      if (result.success) {
        toast.success('Comment liked');
      } else {
        toast.error(result.error || 'Failed to like comment');
      }
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    startTransition(async () => {
      const result = await updateComment(comment.id, editContent);
      if (result.success) {
        setIsEditing(false);
        toast.success('Comment updated');
        onUpdate?.();
      } else {
        toast.error(result.error || 'Failed to update comment');
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    startTransition(async () => {
      const result = await deleteComment(comment.id);
      if (result.success) {
        toast.success('Comment deleted');
        onDelete?.();
      } else {
        toast.error(result.error || 'Failed to delete comment');
      }
    });
  };

  const handleReply = () => {
    setIsReplying(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <BaseImage
              src={avatarUrl}
              alt={`${username} profile avatar`}
              width={40}
              height={40}
              className="size-10 rounded-full"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-cyan-600 font-semibold text-white">
              {username[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{username}</span>
              <span className="text-xs text-slate-500">
                {formatTimeAgo(new Date(comment.created_at))}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-slate-400">(edited)</span>
              )}
            </div>

            {/* Menu */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded p-1 hover:bg-slate-100"
                >
                  <MoreVertical className="size-4 text-slate-500" />
                </button>

                {showMenu && (
                  <div className="theme-surface absolute right-0 z-10 mt-1 w-32 rounded-lg border border-slate-200 shadow-sm">
                    <button
                      onClick={handleEdit}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Edit className="size-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isPending}
                maxLength={2000}
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isPending}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap text-slate-700">{comment.content}</p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                disabled={isPending}
                className="flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-cyan-700"
              >
                <ThumbsUp className="size-4" />
                <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
              </button>

              <button
                onClick={handleReply}
                className="flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-cyan-700"
              >
                <Reply className="size-4" />
                <span>Reply</span>
              </button>
            </div>
          )}

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-3">
              <CommentInput
                toolId={comment.tool_id}
                parentId={comment.id}
                placeholder={`Reply to ${username}...`}
                autoFocus
                onCommentPosted={() => {
                  setIsReplying(false);
                  onReply?.();
                }}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-slate-200 pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
