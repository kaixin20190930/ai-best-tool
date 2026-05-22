'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseUnavailableMessage, isSupabaseUnavailableError } from '@/lib/supabase/error';
import { notifyCommentReply } from './notifications';

export interface Comment {
  id: string;
  user_id: string;
  tool_id: string;
  content: string;
  parent_id: string | null;
  likes: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      username?: string;
      avatar_url?: string;
    };
  };
  replies?: Comment[];
}

/**
 * Get comments for a tool
 */
export async function getComments(toolId: string) {
  try {
    const supabase = await createClient();
    
    // Get all comments for the tool
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('tool_id', toolId)
      .order('created_at', { ascending: false });

    if (error) {
      if (isSupabaseUnavailableError(error)) {
        return {
          success: false,
          error: getSupabaseUnavailableMessage('Comments'),
          comments: [],
        };
      }
      console.error('Error fetching comments from Supabase:', error);
      return { 
        success: false, 
        error: 'Failed to fetch comments',
        comments: []
      };
    }

    const commentsWithUsers = data || [];

    // Organize comments into a tree structure (parent comments with replies)
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    commentsWithUsers.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    commentsWithUsers.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return { 
      success: true, 
      comments: rootComments
    };
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return {
        success: false,
        error: getSupabaseUnavailableMessage('Comments'),
        comments: [],
      };
    }
    console.error('Unexpected error in getComments:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred',
      comments: []
    };
  }
}

/**
 * Post a new comment
 */
export async function postComment(toolId: string, content: string, parentId?: string) {
  try {
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: 'Comment content cannot be empty'
      };
    }

    if (content.length > 2000) {
      return {
        success: false,
        error: 'Comment is too long (max 2000 characters)'
      };
    }

    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'You must be logged in to post comments'
      };
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        tool_id: toolId,
        content: content.trim(),
        parent_id: parentId || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error posting comment:', error);
      return { 
        success: false, 
        error: 'Failed to post comment'
      };
    }

    // If this is a reply, notify the parent comment author
    if (parentId) {
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Someone';
      notifyCommentReply(parentId, username, toolId).catch(err =>
        console.error('Failed to send notification:', err)
      );
    }

    revalidatePath('/');
    revalidatePath(`/ai/${toolId}`);
    
    return { 
      success: true,
      comment: data,
      message: 'Comment posted successfully'
    };
  } catch (error) {
    console.error('Unexpected error in postComment:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string) {
  try {
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: 'Comment content cannot be empty'
      };
    }

    if (content.length > 2000) {
      return {
        success: false,
        error: 'Comment is too long (max 2000 characters)'
      };
    }

    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'You must be logged in to update comments'
      };
    }

    // Verify the comment belongs to the user
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return {
        success: false,
        error: 'Comment not found'
      };
    }

    if (comment.user_id !== user.id) {
      return {
        success: false,
        error: 'You can only edit your own comments'
      };
    }

    const { error: updateError } = await supabase
      .from('comments')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (updateError) {
      console.error('Error updating comment:', updateError);
      return { 
        success: false, 
        error: 'Failed to update comment'
      };
    }

    revalidatePath('/');
    
    return { 
      success: true,
      message: 'Comment updated successfully'
    };
  } catch (error) {
    console.error('Unexpected error in updateComment:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'You must be logged in to delete comments'
      };
    }

    // Verify the comment belongs to the user
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return {
        success: false,
        error: 'Comment not found'
      };
    }

    if (comment.user_id !== user.id) {
      return {
        success: false,
        error: 'You can only delete your own comments'
      };
    }

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return { 
        success: false, 
        error: 'Failed to delete comment'
      };
    }

    revalidatePath('/');
    
    return { 
      success: true,
      message: 'Comment deleted successfully'
    };
  } catch (error) {
    console.error('Unexpected error in deleteComment:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Like a comment (increment likes count)
 */
export async function likeComment(commentId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'You must be logged in to like comments'
      };
    }

    const { error } = await supabase
      .from('comments')
      .update({ likes: supabase.rpc('increment', { row_id: commentId }) })
      .eq('id', commentId);

    if (error) {
      // Fallback to manual increment
      const { data: comment } = await supabase
        .from('comments')
        .select('likes')
        .eq('id', commentId)
        .single();

      if (comment) {
        await supabase
          .from('comments')
          .update({ likes: (comment.likes || 0) + 1 })
          .eq('id', commentId);
      }
    }

    revalidatePath('/');
    
    return { 
      success: true,
      message: 'Comment liked'
    };
  } catch (error) {
    console.error('Unexpected error in likeComment:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred'
    };
  }
}
