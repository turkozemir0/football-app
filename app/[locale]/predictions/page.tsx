import { useTranslations } from 'next-intl';
import { PremiumGate } from '@/components/prediction/PremiumGate';
import { PredictionCard } from '@/components/prediction/PredictionCard';

export default function PredictionsPage() {
  const t = useTranslations('prediction');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('aiPrediction')}</h1>
      <PredictionCard fixture="Arsenal vs Chelsea" homeWinProb={0.45} drawProb={0.25} awayWinProb={0.3} confidence="medium" />
      <PremiumGate isPremium={false}>
        <PredictionCard fixture="Inter vs Milan" homeWinProb={0.42} drawProb={0.28} awayWinProb={0.3} confidence="high" />
      </PremiumGate>
    </div>
  );
}
