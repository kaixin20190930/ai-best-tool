'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseUnavailableMessage, isSupabaseUnavailableError } from '@/lib/supabase/error';
import { query, transaction } from '@/db/neon/client';
import { isAdminUser } from '@/lib/auth/admin';
import { notifyCommentReply } from './notifications';

const COMMENT_COOLDOWN_SECONDS = 20;
const COMMENT_MAX_PER_MINUTE = 5;
const COMMENT_MAX_URLS = 2;
const COMMENT_AUTO_HIDE_REPORT_THRESHOLD = Math.max(
  1,
  parseInt(process.env.COMMENT_AUTO_HIDE_REPORT_THRESHOLD || '3', 10)
);
const DEFAULT_BLOCKED_TERMS = ['buy followers', 'telegram:', 'whatsapp:', '稳赚', '代发', '刷单', '赌博', '色情'];

function countUrls(text: string): number {
  const matches = text.match(/https?:\/\/\S+|www\.\S+/gi);
  return matches ? matches.length : 0;
}

function hasBlockedTerm(text: string): boolean {
  const extraTerms = (process.env.COMMENT_BLOCKED_TERMS || '')
    .split(',')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  const blockList = [...DEFAULT_BLOCKED_TERMS, ...extraTerms];
  const normalized = text.toLowerCase();
  return blockList.some((term) => normalized.includes(term));
}

async function validateCommentRateLimit(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recentCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneMinuteAgo);

  if ((recentCount || 0) >= COMMENT_MAX_PER_MINUTE) {
    return {
      ok: false,
      error: `You're commenting too fast. Please wait a minute and try again.`,
    };
  }

  const { data: latestComment } = await supabase
    .from('comments')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestComment?.created_at) {
    const lastTs = new Date(latestComment.created_at).getTime();
    const diffSeconds = Math.floor((Date.now() - lastTs) / 1000);
    if (diffSeconds < COMMENT_COOLDOWN_SECONDS) {
      return {
        ok: false,
        error: `Please wait ${COMMENT_COOLDOWN_SECONDS - diffSeconds}s before posting another comment.`,
      };
    }
  }

  return { ok: true };
}

export interface Comment {
  id: string;
  user_id: string;
  tool_id: string;
  content: string;
  parent_id: string | null;
  likes: number;
  created_at: string;
  updated_at: string;
  viewer_has_liked?: boolean;
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

async function ensureCommentReportsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS comment_reports (
      comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (comment_id, user_id)
    )
  `);
  await query(`
    ALTER TABLE comment_reports
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ
  `);
  await query(`
    ALTER TABLE comment_reports
    ADD COLUMN IF NOT EXISTS resolved_by UUID
  `);
  await query(
    'CREATE INDEX IF NOT EXISTS idx_comment_reports_created_at ON comment_reports(created_at DESC)'
  );
}

async function ensureCommentModerationColumns() {
  await query(`
    ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE
  `);
  await query(`
    ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS hidden_reason TEXT
  `);
}

/**
 * Get comments for a tool
 */
export async function getComments(
  toolId: string,
  sort: 'latest' | 'oldest' | 'helpful' = 'latest'
) {
  try {
    await ensureCommentModerationColumns();
    const supabase = await createClient();
    
    // Get all comments for the tool
    let commentsQuery = supabase
      .from('comments')
      .select('*')
      .eq('tool_id', toolId);

    if (sort === 'helpful') {
      commentsQuery = commentsQuery
        .order('likes', { ascending: false })
        .order('created_at', { ascending: false });
    } else {
      commentsQuery = commentsQuery.order('created_at', { ascending: sort === 'oldest' });
    }

    const { data, error } = await commentsQuery;

    if (error) {
      if (isSupabaseUnavailableError(error)) {
        return {
          success: false,
          error: getSupabaseUnavailableMessage('Comments'),
          comments: [],
          totalCount: 0,
          submitterId: null,
        };
      }
      console.error('Error fetching comments from Supabase:', error);
      return { 
        success: false, 
        error: 'Failed to fetch comments',
        comments: [],
        totalCount: 0,
        submitterId: null,
      };
    }

    const commentsWithUsers = data || [];
    const commentIds = commentsWithUsers.map((comment) => comment.id);
    const likedCommentIdSet = new Set<string>();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = isAdminUser(user);

    if (!isAdmin) {
      commentsWithUsers.splice(
        0,
        commentsWithUsers.length,
        ...commentsWithUsers.filter((comment) => !comment.is_hidden)
      );
    }

    if (user && commentIds.length > 0) {
      const { data: likesData } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      (likesData || []).forEach((entry: { comment_id: string }) => {
        likedCommentIdSet.add(entry.comment_id);
      });
    }
    const { data: toolRecord } = await supabase
      .from('tools')
      .select('submitted_by')
      .eq('id', toolId)
      .single();
    const submitterId: string | null = toolRecord?.submitted_by || null;

    // Organize comments into a tree structure (parent comments with replies)
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    commentsWithUsers.forEach((comment) => {
      commentMap.set(comment.id, {
        ...comment,
        viewer_has_liked: likedCommentIdSet.has(comment.id),
        replies: []
      });
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
      comments: rootComments,
      totalCount: commentsWithUsers.length,
      submitterId,
    };
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return {
        success: false,
        error: getSupabaseUnavailableMessage('Comments'),
        comments: [],
        totalCount: 0,
        submitterId: null,
      };
    }
    console.error('Unexpected error in getComments:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred',
      comments: [],
      totalCount: 0,
      submitterId: null,
    };
  }
}

export async function getCommentCount(toolId: string): Promise<number> {
  try {
    await ensureCommentModerationColumns();
    const result = await query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM comments WHERE tool_id = $1 AND COALESCE(is_hidden, false) = false',
      [toolId]
    );

    return Number(result.rows[0]?.count || 0);
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return 0;
    }
    console.error('Unexpected error in getCommentCount:', error);
    return 0;
  }
}

/**
 * Post a new comment
 */
export async function postComment(toolId: string, content: string, parentId?: string) {
  try {
    const normalizedContent = content?.trim() || '';
    if (!normalizedContent) {
      return {
        success: false,
        error: 'Comment content cannot be empty'
      };
    }

    if (normalizedContent.length > 2000) {
      return {
        success: false,
        error: 'Comment is too long (max 2000 characters)'
      };
    }

    if (countUrls(normalizedContent) > COMMENT_MAX_URLS) {
      return {
        success: false,
        error: `Too many links. Please keep it under ${COMMENT_MAX_URLS} links.`,
      };
    }

    if (hasBlockedTerm(normalizedContent)) {
      return {
        success: false,
        error: 'Your comment contains blocked content. Please edit and try again.',
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

    const rateLimitResult = await validateCommentRateLimit(supabase, user.id);
    if (!rateLimitResult.ok) {
      return {
        success: false,
        error: rateLimitResult.error,
      };
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        tool_id: toolId,
        content: normalizedContent,
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

    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return {
        success: false,
        error: 'Comment not found'
      };
    }

    const result = await transaction(async (client) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS comment_likes (
          comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (comment_id, user_id)
        )
      `);

      const existingLike = await client.query(
        'SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        [commentId, user.id]
      );

      if (existingLike.rowCount && existingLike.rowCount > 0) {
        await client.query(
          'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
          [commentId, user.id]
        );
        const updateResult = await client.query(
          'UPDATE comments SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = $1 RETURNING likes',
          [commentId]
        );
        return {
          liked: false,
          likes: updateResult.rows[0]?.likes ?? 0,
        };
      }

      await client.query(
        'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [commentId, user.id]
      );
      const updateResult = await client.query(
        'UPDATE comments SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes',
        [commentId]
      );
      return {
        liked: true,
        likes: updateResult.rows[0]?.likes ?? 0,
      };
    });

    revalidatePath('/');
    
    return { 
      success: true,
      message: result.liked ? 'Comment liked' : 'Like removed',
      liked: result.liked,
      likes: result.likes,
    };
  } catch (error) {
    console.error('Unexpected error in likeComment:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred'
    };
  }
}

export async function reportComment(commentId: string, reason?: string) {
  try {
    await ensureCommentModerationColumns();
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to report comments',
      };
    }

    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return {
        success: false,
        error: 'Comment not found',
      };
    }

    const normalizedReason = (reason || '').trim().slice(0, 500);

    const result = await transaction(async (client) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS comment_reports (
          comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          reason TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (comment_id, user_id)
        )
      `);

      const existing = await client.query(
        'SELECT 1 FROM comment_reports WHERE comment_id = $1 AND user_id = $2',
        [commentId, user.id]
      );

      if ((existing.rowCount || 0) > 0) {
        return { created: false };
      }

      await client.query(
        'INSERT INTO comment_reports (comment_id, user_id, reason) VALUES ($1, $2, $3)',
        [commentId, user.id, normalizedReason || null]
      );

      const reportCountResult = await client.query(
        'SELECT COUNT(*)::int AS count FROM comment_reports WHERE comment_id = $1',
        [commentId]
      );
      const reportCount = reportCountResult.rows[0]?.count || 0;
      if (reportCount >= COMMENT_AUTO_HIDE_REPORT_THRESHOLD) {
        await client.query(
          `
            UPDATE comments
            SET is_hidden = TRUE, hidden_reason = 'auto_report_threshold', updated_at = NOW()
            WHERE id = $1
          `,
          [commentId]
        );
      }
      return { created: true };
    });

    if (!result.created) {
      return {
        success: false,
        error: 'You have already reported this comment.',
      };
    }

    revalidatePath('/admin/comments');
    return {
      success: true,
      message: 'Comment reported. Thank you for helping improve quality.',
    };
  } catch (error) {
    console.error('Unexpected error in reportComment:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
