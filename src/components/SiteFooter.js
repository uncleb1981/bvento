'use client';

import { usePathname } from 'next/navigation';

export default function SiteFooter() {
  const pathname = usePathname();
  const isWeekendPage = pathname?.startsWith('/weekend');

  return (
    <footer className="hidden sm:block border-t mt-12 py-10" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="font-serif italic text-2xl mb-1" style={{ color: 'var(--ink)' }}>bvento</div>
        <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--ink-soft)' }}>
          {isWeekendPage
            ? 'Local happenings in Bentonville, Arkansas.'
            : 'Buy, sell, and trade bikes with local riders in Bentonville, Rogers, Springdale, and Fayetteville, Arkansas.'}
        </p>
        <div className="text-xs mt-3" style={{ color: 'var(--ink-soft)', opacity: 0.6 }}>© 2026 bvento</div>
      </div>
    </footer>
  );
}
