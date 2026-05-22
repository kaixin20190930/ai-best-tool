import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Create user preferences if they don't exist
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingPrefs } = await supabase
          .from('user_preferences')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (!existingPrefs) {
          await supabase.from('user_preferences').insert({
            user_id: user.id,
            language: 'en',
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
