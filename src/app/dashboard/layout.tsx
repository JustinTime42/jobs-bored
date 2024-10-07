import React from 'react';
import NavPanel from '@/src/components/NavPanel/NavPanel';

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
