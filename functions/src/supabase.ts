
import {createClient} from "@supabase/supabase-js";

export const createAdminClient = () => {
    return createClient(
        process.env.SUPABASE_URL || "",
        process.env.SUPABASE_KEY || "",
        {auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        }}
    );
};

export const supabaseAdmin = createAdminClient();

