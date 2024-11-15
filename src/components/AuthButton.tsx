"use client";
import { signInWithGitHub, signOutUser } from "@/src/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserContext } from "@/src/app/context/UserContext";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Link from "next/link";

export default function AuthButton() {
  const { user, loading, error, fetchUser } = useUserContext();
  const router = useRouter();

  const handleLogin = async () => {
    console.log("logging in");
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleLogout = async () => {
    console.log("logging out");
    try {
      await signOutUser();
      await fetchUser();
      router.push("/"); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return user ? (
    <div className="flex items-center gap-4">
      <Link href={'/dashboard/settings'}>Hey, {user.user_metadata.preferred_username}! {` `}<ManageAccountsIcon /></Link>
      <button onClick={handleLogout} className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
        Logout
      </button>
    </div>
  ) : (
    <button onClick={handleLogin} className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
      Login with GitHub
    </button>
  );
}
