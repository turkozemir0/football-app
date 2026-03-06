'use client';

import { useLocale } from 'next-intl';

export function PremiumGate({ children, isPremium }: { children: React.ReactNode; isPremium: boolean }) {
  const locale = useLocale();

  if (isPremium) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none blur-sm">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
        <a href={`/${locale}/pricing`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Upgrade - $3.99/mo
        </a>
      </div>
    </div>
  );
}
