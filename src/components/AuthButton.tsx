"use client";
import { signInWithGitHub, signOutUser } from "@/src/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUserContext } from "@/src/app/context/UserContext";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Link from "next/link";

export default function AuthButton() {
  const { user, loading, error, fetchUser } = useUserContext();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGitHub();
      // No need to fetchUser here as the redirect will happen
    } catch (error) {
      console.error("Error logging in:", error);
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      await fetchUser();
      router.push("/"); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Show loading only during initial auth check
  if (loading && !isLoggingIn) {
    return <div>Loading...</div>;
  }

  return user ? (
    <div className="flex items-center gap-4">
      <Link href={'/dashboard/settings'}>
        Hey, {user.user_metadata?.preferred_username || user.user_metadata?.user_name || 'User'}! {` `}
        <ManageAccountsIcon />
      </Link>
      <button 
        onClick={handleLogout} 
        className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Logout
      </button>
    </div>
  ) : (
    <button 
      onClick={handleLogin} 
      disabled={isLoggingIn}
      className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    >
      {isLoggingIn ? 'Redirecting...' : 'Login with GitHub'}
    </button>
  );
}