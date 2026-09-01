'use client';

import { usePathname } from 'next/navigation';

export default function MainArea({ children }) {
  const pathname = usePathname();
  const isEventHome = pathname === '/';

  return (
    <main className={isEventHome ? 'flex-1' : 'flex-1 pb-20 sm:pb-0'}>
      {children}
    </main>
  );
}
