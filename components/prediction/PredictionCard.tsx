import { useTranslations } from 'next-intl';

interface PredictionCardProps {
  fixture: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: 'high' | 'medium' | 'low';
}

export function PredictionCard(props: PredictionCardProps) {
  const t = useTranslations('prediction');

  return (
    <article className="rounded-xl border border-indigo-700 bg-indigo-950/30 p-4">
      <p className="text-xs uppercase tracking-wide text-indigo-300">{t('aiPrediction')}</p>
      <h3 className="mb-2 mt-1 text-lg font-bold">{props.fixture}</h3>
      <p className="text-sm text-slate-300">
        Home {Math.round(props.homeWinProb * 100)}% · Draw {Math.round(props.drawProb * 100)}% · Away {Math.round(props.awayWinProb * 100)}%
      </p>
      <p className="mt-2 text-xs text-slate-400">
        {t('confidence')}: {props.confidence}
      </p>
    </article>
  );
}
