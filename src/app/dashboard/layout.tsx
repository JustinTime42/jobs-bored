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
    } else if (!user.locations) {
      router.push('/dashboard/settings');
    } else {
      router.push('/dashboard/feed');
    }
  }, [user]);



  return (
    <NavPanel>
      {children}
    </NavPanel>
  );
}
