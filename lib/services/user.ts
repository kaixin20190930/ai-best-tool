import { createClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/auth/admin';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
}

export interface UserPreferences {
  userId: string;
  language: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  notifyNewTools: boolean;
  notifyToolUpdates: boolean;
  notifyReplies: boolean;
  favoriteCategories: string[];
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data: user, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !user) {
    return null;
  }

  return {
    id: user.user.id,
    email: user.user.email || '',
    username: user.user.user_metadata?.username || '',
    avatar: user.user.user_metadata?.avatar_url,
    role: user.user.user_metadata?.role || 'user',
    emailVerified: !!user.user.email_confirmed_at,
    createdAt: new Date(user.user.created_at),
  };
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
    username: user.user_metadata?.username || '',
    avatar: user.user_metadata?.avatar_url,
    role: user.user_metadata?.role || 'user',
    emailVerified: !!user.email_confirmed_at,
    createdAt: new Date(user.created_at),
  };
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: {
  username?: string;
  avatar?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get user preferences
 */
export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    userId: data.user_id,
    language: data.language,
    emailNotifications: data.email_notifications,
    inAppNotifications: data.in_app_notifications,
    notifyNewTools: data.notify_new_tools,
    notifyToolUpdates: data.notify_tool_updates,
    notifyReplies: data.notify_replies,
    favoriteCategories: data.favorite_categories || [],
  };
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<Omit<UserPreferences, 'userId'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {};

  if (preferences.language !== undefined) updateData.language = preferences.language;
  if (preferences.emailNotifications !== undefined)
    updateData.email_notifications = preferences.emailNotifications;
  if (preferences.inAppNotifications !== undefined)
    updateData.in_app_notifications = preferences.inAppNotifications;
  if (preferences.notifyNewTools !== undefined)
    updateData.notify_new_tools = preferences.notifyNewTools;
  if (preferences.notifyToolUpdates !== undefined)
    updateData.notify_tool_updates = preferences.notifyToolUpdates;
  if (preferences.notifyReplies !== undefined)
    updateData.notify_replies = preferences.notifyReplies;
  if (preferences.favoriteCategories !== undefined)
    updateData.favorite_categories = preferences.favoriteCategories;

  const { error } = await supabase
    .from('user_preferences')
    .update(updateData)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Check if user is admin
 */
export async function isAdmin(user: User): Promise<boolean> {
  return isAdminUser(user);
}

/**
 * Get user's favorite tools
 */
export async function getUserFavorites(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      id,
      created_at,
      tool:tools (
        id,
        name,
        title,
        content,
        url,
        image_url,
        thumbnail_url,
        category_id,
        tags,
        pricing,
        average_rating,
        rating_count
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if tool is favorited by user
 */
export async function isFavorited(userId: string, toolId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .single();

  return !error && !!data;
}
