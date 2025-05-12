
import { createClient } from '@supabase/supabase-js'


export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.SUPABASE_SERVICE_KEY!,
        {auth: {
            persistSession: true,
            autoRefreshToken: true,
          },}
    );
}

export const supabaseAdmin = createAdminClient();
  

