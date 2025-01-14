'use server'
import { createClient } from "../utils/supabase/server"
import { getUserDetails } from './user';
import { User } from '@supabase/supabase-js';

export async function handleAuthCallback() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser() as { data: { user: User } };

  if (!user) {
    throw new Error('No user found');
  }

  try {
    const userDetails = await getUserDetails(user);
    return userDetails;
  } catch (error) {
    console.error('Error in handleAuthCallback:', error);
    throw error;
  }
}
