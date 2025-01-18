import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        detectSessionInUrl: false,  // Changed from true
        autoRefreshToken: false,    // Changed from true
        storage: {
          getItem: (key) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value);
            }
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
            }
          },
        }
      },
      global: {
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    }
  )
}

// export const supabase = createClient()

// export const getUser = async () => {
//   const { data: { user }, error } = await supabase.auth.getUser();
//   if (!user) {
//     return null;
//   }
//   if (error) {
//     throw new Error("Auth session missing!");
//   }
//   const { data, error: fetchError } = await supabase
//     .from('users')
//     .select('*')
//     .eq('id', user.id)
//     .single();

//   if (!data) {
//     await supabase
//       .from('users')
//       .insert({ 
//         id: user.id, 
//         email: user.email, 
//         name: user.user_metadata.name,
//         avatar_url: user.user_metadata.avatar_url,
//         user_name: user.user_metadata.user_name,
//       });
//   }
//   return user;
// };

export const signInWithGitHub = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}dashboard`,
      skipBrowserRedirect: false,
    },
  });
  console.log("sign in data", data)
  if (error) throw error;
};

export const signOutUser = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};