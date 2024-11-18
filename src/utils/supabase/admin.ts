
import { createClient } from '@supabase/supabase-js'


export const createAdminClient = () => {
    console.log("Creating admin client")
    console.log("public key", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("service key", process.env.SUPABASE_SERVICE_KEY)
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
  

