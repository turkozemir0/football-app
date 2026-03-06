'use client';

import { PremiumGate } from '@/components/prediction/PremiumGate';
import { useSubscription } from '@/hooks/useSubscription';

export function SubscriptionGate({
  children,
  initialIsPremium = false
}: {
  children: React.ReactNode;
  initialIsPremium?: boolean;
}) {
  const { isPremium } = useSubscription(initialIsPremium);
  return <PremiumGate isPremium={isPremium}>{children}</PremiumGate>;
}
