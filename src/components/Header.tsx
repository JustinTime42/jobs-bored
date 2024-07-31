'use client'
import Link from "next/link";
import AuthButton from "./AuthButton";
import { useEffect } from "react";
import { useUserContext } from "@/src/app/context/UserContext";

export default function Header() {
  const { user, loading, error, fetchUser } = useUserContext();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
      <nav className="w-full flex justify-center border-b border-b-foreground/10">
        <div className="w-full max-w-4xl flex justify-end gap-10 items-center p-3 text-sm">
          {user && (
            <Link href="/dashboard">
              Dashboard
            </Link>
          )}
          <AuthButton />
        </div>
      </nav>
  );
}
