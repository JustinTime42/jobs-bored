import React from 'react';
import NavPanel from '@/src/components/NavPanel/NavPanel';
import styles from './layout.module.css';
interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {

  return (
    <NavPanel>
      {children}
    </NavPanel>
  );
}
