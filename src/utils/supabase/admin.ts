
import { createClient } from '@supabase/supabase-js'


export const createAdminClient = () => {
    console.log("Creating admin client")
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.SUPABASE_SERVICE_KEY!,
        {auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },}
    );
}

export const supabaseAdmin = createAdminClient();
  
