'use client';

import { useEffect, useState } from 'react';

export function useSubscription(initialIsPremium = false) {
  const [isPremium, setIsPremium] = useState(initialIsPremium);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch('/api/subscription/status', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as { isPremium?: boolean };
        if (active) {
          setIsPremium(Boolean(data.isPremium));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return { isPremium, isLoading };
}
