'use client'
import React, { useEffect } from 'react';
import { useUserContext } from '../../context/UserContext';
import { useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const router = useRouter();
  const { user, loading } = useUserContext();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/');
      return;
    }

    if (user.locations.length === 0 || !user.locations) {
      router.push('/dashboard/settings');
      return;
    }
  }, [user, loading]);

  return (
    <>
      {children}
    </>
  );
}
