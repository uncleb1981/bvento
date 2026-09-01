'use client';

import { usePathname } from 'next/navigation';

export default function MainArea({ children }) {
  const pathname = usePathname();
  const isWeekendPage = pathname?.startsWith('/weekend');

  return (
    <main className={isWeekendPage ? 'flex-1' : 'flex-1 pb-20 sm:pb-0'}>
      {children}
    </main>
  );
}
