"use client";
import { useUserContext } from "./context/UserContext";
import { useEffect } from "react";

export default function Index() {
  const { user, loading, error, fetchUser } = useUserContext();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div>
      <p>Home Page</p>
    </div>
  );
}
