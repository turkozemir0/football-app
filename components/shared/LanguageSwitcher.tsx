'use client';

import { APP_LOCALES } from '@/lib/constants';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex gap-2">
      {APP_LOCALES.map((locale) => (
        <button
          key={locale}
          onClick={() => router.replace(pathname, { locale })}
          className="rounded border px-2 py-1 text-xs"
          aria-label={`Switch locale to ${locale}`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
