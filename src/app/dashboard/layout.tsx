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
  const { user, loading } = useUserContext();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/');
      return;
    }
    const pathname = window.location.pathname;
    
    if (pathname === '/dashboard') {
      if ( user.locations?.length === 0 || !user.locations) {
        router.push('/dashboard/settings');
      } else {
        router.push('/dashboard/feed');
      }
      return;
    }
  }, [user, loading]);



  return (
    <NavPanel>
      {children}
    </NavPanel>
  );
}
