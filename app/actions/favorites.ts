'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseUnavailableError } from '@/lib/supabase/error';

/**
 * Toggle favorite status for a tool
 * If the tool is already favorited, it will be unfavorited
 * If the tool is not favorited, it will be favorited
 */
export async function toggleFavorite(toolId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'You must be logged in to favorite tools',
        isFavorited: false
      };
    }

    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking favorite:', checkError);
      return { 
        success: false, 
        error: 'Failed to check favorite status',
        isFavorited: false
      };
    }

    if (existing) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('Error removing favorite:', deleteError);
        return { 
          success: false, 
          error: 'Failed to remove favorite',
          isFavorited: true
        };
      }

      revalidatePath('/');
      revalidatePath('/profile/favorites');
      
      return { 
        success: true, 
        isFavorited: false,
        message: 'Removed from favorites'
      };
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          tool_id: toolId
        });

      if (insertError) {
        console.error('Error adding favorite:', insertError);
        return { 
          success: false, 
          error: 'Failed to add favorite',
          isFavorited: false
        };
      }

      revalidatePath('/');
      revalidatePath('/profile/favorites');
      
      return { 
        success: true, 
        isFavorited: true,
        message: 'Added to favorites'
      };
    }
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return {
        success: false,
        error: 'Favorites are temporarily unavailable. Please try again later.',
        isFavorited: false,
      };
    }
    console.error('Unexpected error in toggleFavorite:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred',
      isFavorited: false
    };
  }
}

/**
 * Check if a tool is favorited by the current user
 */
export async function isFavorited(toolId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking favorite:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return false;
    }
    console.error('Unexpected error in isFavorited:', error);
    return false;
  }
}

/**
 * Get all favorited tools for the current user
 */
export async function getFavorites() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'You must be logged in to view favorites',
        favorites: []
      };
    }

    // Get favorites with tool details
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        tool_id,
        tools (
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
          rating_count,
          view_count,
          click_count
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return { 
        success: false, 
        error: 'Failed to fetch favorites',
        favorites: []
      };
    }

    return { 
      success: true, 
      favorites: data || []
    };
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return { 
        success: false, 
        error: 'Favorites are temporarily unavailable. Please try again later.',
        favorites: [],
      };
    }
    console.error('Unexpected error in getFavorites:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred',
      favorites: []
    };
  }
}

/**
 * Get favorite count for a tool
 */
export async function getFavoriteCount(toolId: string): Promise<number> {
  try {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('tool_id', toolId);

    if (error) {
      console.error('Error getting favorite count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      return 0;
    }
    console.error('Unexpected error in getFavoriteCount:', error);
    return 0;
  }
}
