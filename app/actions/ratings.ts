'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseUnavailableError } from '@/lib/supabase/error';

/**
 * Submit or update a rating for a tool
 */
export async function submitRating(toolId: string, score: number) {
  try {
    // Validate score
    if (score < 1 || score > 5 || !Number.isInteger(score)) {
      return {
        success: false,
        error: 'Rating must be an integer between 1 and 5'
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'You must be logged in to rate tools'
      };
    }

    // Check if user has already rated this tool
    const { data: existing, error: checkError } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking rating:', checkError);
      return { 
        success: false, 
        error: 'Failed to check existing rating'
      };
    }

    if (existing) {
      // Update existing rating
      const { error: updateError } = await supabase
        .from('ratings')
        .update({ 
          score,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating rating:', updateError);
        return { 
          success: false, 
          error: 'Failed to update rating'
        };
      }

      revalidatePath('/');
      revalidatePath(`/ai/${toolId}`);
      
      return { 
        success: true,
        message: 'Rating updated successfully'
      };
    } else {
      // Insert new rating
      const { error: insertError } = await supabase
        .from('ratings')
        .insert({
          user_id: user.id,
          tool_id: toolId,
          score
        });

      if (insertError) {
        console.error('Error inserting rating:', insertError);
        return { 
          success: false, 
          error: 'Failed to submit rating'
        };
      }

      revalidatePath('/');
      revalidatePath(`/ai/${toolId}`);
      
      return { 
        success: true,
        message: 'Rating submitted successfully'
      };
    }
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return {
        success: false,
        error: 'Ratings are temporarily unavailable. Please try again later.',
      };
    }
    console.error('Unexpected error in submitRating:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Get user's rating for a tool
 */
export async function getUserRating(toolId: string): Promise<number | null> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('ratings')
      .select('score')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user rating:', error);
      return null;
    }

    return data?.score || null;
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return null;
    }
    console.error('Unexpected error in getUserRating:', error);
    return null;
  }
}

/**
 * Get rating statistics for a tool
 * 
 * 注意：如果 Supabase 不可用，从 Neon 数据库读取统计信息
 */
export async function getToolRatingStats(toolId: string) {
  try {
    // 尝试从 Supabase 获取
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('tools')
      .select('average_rating, rating_count')
      .eq('id', toolId)
      .single();

    if (error) {
      // Fallback: 从 Neon 数据库读取
      return await getRatingStatsFromNeon(toolId);
    }

    // 确保返回的是数字类型
    const averageRating = Number(data?.average_rating) || 0;
    const ratingCount = Number(data?.rating_count) || 0;

    return {
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      ratingCount: isNaN(ratingCount) ? 0 : ratingCount
    };
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return await getRatingStatsFromNeon(toolId);
    }
    console.error('Unexpected error in getToolRatingStats:', error);
    // Fallback: 从 Neon 数据库读取
    return await getRatingStatsFromNeon(toolId);
  }
}

/**
 * 从 Neon 数据库获取 rating 统计信息（fallback）
 */
async function getRatingStatsFromNeon(toolId: string) {
  try {
    const { query } = await import('@/db/neon/client');
    
    const result = await query<{ average_rating: number; rating_count: number }>(
      'SELECT average_rating, rating_count FROM tools WHERE id = $1',
      [toolId]
    );

    if (result.rows.length === 0) {
      return {
        averageRating: 0,
        ratingCount: 0
      };
    }

    const averageRating = Number(result.rows[0].average_rating) || 0;
    const ratingCount = Number(result.rows[0].rating_count) || 0;

    return {
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      ratingCount: isNaN(ratingCount) ? 0 : ratingCount
    };
  } catch (error) {
    console.error('Error getting rating stats from Neon:', error);
    return {
      averageRating: 0,
      ratingCount: 0
    };
  }
}

/**
 * Delete user's rating for a tool
 */
export async function deleteRating(toolId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'You must be logged in to delete ratings'
      };
    }

    const { error: deleteError } = await supabase
      .from('ratings')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_id', toolId);

    if (deleteError) {
      console.error('Error deleting rating:', deleteError);
      return { 
        success: false, 
        error: 'Failed to delete rating'
      };
    }

    revalidatePath('/');
    revalidatePath(`/ai/${toolId}`);
    
    return { 
      success: true,
      message: 'Rating deleted successfully'
    };
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return { 
        success: false, 
        error: 'Ratings are temporarily unavailable. Please try again later.',
      };
    }
    console.error('Unexpected error in deleteRating:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred'
    };
  }
}
