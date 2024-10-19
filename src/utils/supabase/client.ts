import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient()

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  if (error) {
    throw new Error("Auth session missing!");
  }
  const { data, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!data) {
    await supabase
      .from('users')
      .insert({ 
        id: user.id, 
        email: user.email, 
        name: user.user_metadata.name,
        avatar_url: user.user_metadata.avatar_url,
        user_name: user.user_metadata.user_name,
      });
  }
  return user;
};

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
    },
  });
  if (error) throw error;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};