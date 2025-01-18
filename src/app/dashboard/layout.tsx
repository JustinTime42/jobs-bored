'use client'
import React, { useEffect } from 'react';
import NavPanel from '@/src/components/NavPanel/NavPanel';
import styles from './layout.module.css';
import { useUserContext } from '../context/UserContext';
import { useRouter } from 'next/navigation';
interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const router = useRouter();
  const { user, loading, isInitialized } = useUserContext();

  useEffect(() => {
    if (!isInitialized || loading) return;

    if (!user) {
      router.push('/');
      return;
    }

    const pathname = window.location.pathname;
    if (pathname === '/dashboard') {
      if (!user.locations?.length) {
        router.push('/dashboard/settings');
      } else {
        router.push('/dashboard/feed');
      }
    }
  }, [user, loading, isInitialized]);

  if (!isInitialized || loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <NavPanel>
      {children}
    </NavPanel>
  );
}
