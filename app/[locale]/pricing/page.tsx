export default async function PricingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const redirectTo = `/${locale}/pricing`;

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Pricing</h1>
      <div className="rounded-xl border border-slate-700 p-4">
        <h2 className="text-lg font-bold">Premium - $3.99/mo</h2>
        <p className="text-sm text-slate-300">Unlimited predictions, detailed stats, shot maps, and ad-free experience.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`/api/subscription/demo?plan=premium&redirectTo=${encodeURIComponent(redirectTo)}`}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
          >
            Demo: Activate Premium
          </a>
          <a
            href={`/api/subscription/demo?plan=free&redirectTo=${encodeURIComponent(redirectTo)}`}
            className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200"
          >
            Demo: Back to Free
          </a>
        </div>
      </div>
    </section>
  );
}
