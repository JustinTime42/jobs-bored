'use server'
import { createClient } from "../utils/supabase/server"
import { getUserDetails } from './user';

export async function handleAuthCallback() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No user found');
  }

  try {
    const userDetails = await getUserDetails(user.id, user.email!, user.user_metadata.full_name);
    return userDetails;
  } catch (error) {
    console.error('Error in handleAuthCallback:', error);
    throw error;
  }
}
