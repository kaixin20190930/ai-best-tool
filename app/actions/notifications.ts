'use server';

/**
 * Notification Actions
 *
 * Server actions for managing user notifications including:
 * - Creating notifications
 * - Fetching user notifications
 * - Marking notifications as read
 * - Deleting notifications
 */
import { query } from '@/db/neon/client';

import { getAdminEmails } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string | null;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

/**
 * Create a new notification
 *
 * @param userId User ID
 * @param type Notification type
 * @param title Notification title
 * @param content Notification content (optional)
 * @param link Link to related content (optional)
 * @returns Created notification or error
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  content?: string,
  link?: string,
): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, content, link, read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())
       RETURNING id, user_id as "userId", type, title, content, link, read, created_at as "createdAt"`,
      [userId, type, title, content || null, link || null],
    );

    return {
      success: true,
      notification: result.rows[0],
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function getAdminUserIds(): Promise<string[]> {
  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    return [];
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    return (data.users ?? [])
      .filter((user) => {
        const email = user.email?.toLowerCase().trim();
        return !!email && adminEmails.includes(email);
      })
      .map((user) => user.id);
  } catch (error) {
    console.error('Error resolving admin user ids:', error);
    return [];
  }
}

export async function notifyAdminsOfSubmission(input: {
  toolName: string;
  toolTitle: string;
  submittedByEmail?: string | null;
  submissionPlan: 'free' | 'standard_paid';
  fastTrack: boolean;
  featuredDays: 0 | 3 | 7 | 14;
}): Promise<void> {
  try {
    const adminIds = await getAdminUserIds();

    if (adminIds.length === 0) {
      return;
    }

    const displayName = input.toolTitle.trim() || input.toolName;
    const isPaid = input.submissionPlan === 'standard_paid';
    const title = isPaid ? 'Paid submission received / 付费提交已收到' : 'New submission received / 新提交已收到';
    const content = isPaid
      ? `${displayName} selected a paid listing${input.fastTrack ? ' with faster review' : ''}${input.featuredDays > 0 ? ` and ${input.featuredDays} featured days` : ''}. Review can continue after payment is confirmed. / ${displayName} 选择了付费入驻${input.fastTrack ? '（更快审核）' : ''}${input.featuredDays > 0 ? `，前排展示 ${input.featuredDays} 天` : ''}。付款确认后即可继续审核。`
      : `${displayName} has entered the review queue. / ${displayName} 已进入审核队列。`;

    await Promise.all(
      adminIds.map((adminId) =>
        createNotification(adminId, 'admin_submission', title, content, '/admin/tools?status=pending'),
      ),
    );
  } catch (error) {
    console.error('Error notifying admins of submission:', error);
  }
}

export async function notifyAdminsOfClaimLead(input: {
  listingName: string;
  email: string;
  company?: string | null;
  website?: string | null;
  sourcePath?: string | null;
  sourceLocale?: string | null;
}): Promise<void> {
  try {
    const adminIds = await getAdminUserIds();

    if (adminIds.length === 0) {
      return;
    }

    const displayName = input.listingName.trim() || 'Unnamed listing';
    const title = 'New claim lead received / 新认领线索已收到';
    const content = [
      `${displayName} requested ownership verification.`,
      input.company ? `Company: ${input.company}` : '',
      input.website ? `Website: ${input.website}` : '',
      input.sourceLocale ? `Locale: ${input.sourceLocale}` : '',
      input.sourcePath ? `Source: ${input.sourcePath}` : '',
      `${displayName} 已提交认领请求，建议尽快跟进。`,
    ]
      .filter(Boolean)
      .join(' / ');

    await Promise.all(
      adminIds.map((adminId) => createNotification(adminId, 'admin_claim', title, content, '/admin/claims?status=new')),
    );
  } catch (error) {
    console.error('Error notifying admins of claim lead:', error);
  }
}

/**
 * Get notifications for a user
 *
 * @param userId User ID
 * @param limit Maximum number of notifications to return (default: 20)
 * @param unreadOnly Only return unread notifications (default: false)
 * @returns Array of notifications
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 20,
  unreadOnly: boolean = false,
): Promise<Notification[]> {
  try {
    const whereClause = unreadOnly ? 'WHERE user_id = $1 AND read = false' : 'WHERE user_id = $1';

    const result = await query(
      `SELECT 
        id, 
        user_id as "userId", 
        type, 
        title, 
        content, 
        link, 
        read, 
        created_at as "createdAt"
       FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit],
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Get unread notification count for a user
 *
 * @param userId User ID
 * @returns Number of unread notifications
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const result = await query(
      `SELECT COUNT(*)::int as count
       FROM notifications
       WHERE user_id = $1 AND read = false`,
      [userId],
    );

    return result.rows[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

/**
 * Mark a notification as read
 *
 * @param notificationId Notification ID
 * @param userId User ID (for security check)
 * @returns Success status
 */
export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await query(
      `UPDATE notifications
       SET read = true
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId],
    );

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mark all notifications as read for a user
 *
 * @param userId User ID
 * @returns Success status
 */
export async function markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await query(
      `UPDATE notifications
       SET read = true
       WHERE user_id = $1 AND read = false`,
      [userId],
    );

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a notification
 *
 * @param notificationId Notification ID
 * @param userId User ID (for security check)
 * @returns Success status
 */
export async function deleteNotification(
  notificationId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId],
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Notification trigger: New tool in followed category
 *
 * @param categoryId Category ID
 * @param toolId Tool ID
 * @param toolTitle Tool title
 */
export async function notifyNewToolInCategory(categoryId: string, toolId: string, toolTitle: string): Promise<void> {
  try {
    // Get users who follow this category
    const result = await query(
      `SELECT DISTINCT user_id
       FROM user_preferences
       WHERE favorite_categories @> $1::jsonb`,
      [JSON.stringify([categoryId])],
    );

    // Create notifications for each user
    const notifications = result.rows.map((row) =>
      createNotification(
        row.user_id,
        'new_tool',
        'New Tool Added',
        `${toolTitle} has been added to your followed category`,
        `/ai/${toolId}`,
      ),
    );

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error notifying new tool in category:', error);
  }
}

/**
 * Notification trigger: Tool update
 *
 * @param toolId Tool ID
 * @param toolTitle Tool title
 */
export async function notifyToolUpdate(toolId: string, toolTitle: string): Promise<void> {
  try {
    // Get users who favorited this tool
    const result = await query(
      `SELECT user_id
       FROM favorites
       WHERE tool_id = $1`,
      [toolId],
    );

    // Create notifications for each user
    const notifications = result.rows.map((row) =>
      createNotification(row.user_id, 'tool_update', 'Tool Updated', `${toolTitle} has been updated`, `/ai/${toolId}`),
    );

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error notifying tool update:', error);
  }
}

/**
 * Notification trigger: Comment reply
 *
 * @param parentCommentId Parent comment ID
 * @param replyAuthorName Reply author name
 * @param toolId Tool ID
 */
export async function notifyCommentReply(
  parentCommentId: string,
  replyAuthorName: string,
  toolId: string,
): Promise<void> {
  try {
    // Get the parent comment author
    const result = await query(
      `SELECT user_id
       FROM comments
       WHERE id = $1`,
      [parentCommentId],
    );

    if (result.rows.length === 0) return;

    const parentAuthorId = result.rows[0].user_id;

    // Create notification
    await createNotification(
      parentAuthorId,
      'comment_reply',
      'New Reply',
      `${replyAuthorName} replied to your comment`,
      `/ai/${toolId}`,
    );
  } catch (error) {
    console.error('Error notifying comment reply:', error);
  }
}
