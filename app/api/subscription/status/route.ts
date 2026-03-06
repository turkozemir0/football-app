import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SUBSCRIPTION_COOKIE = 'kickoff_subscription';

export async function GET() {
  const cookieStore = await cookies();
  const plan = cookieStore.get(SUBSCRIPTION_COOKIE)?.value ?? 'free';
  const isPremium = plan === 'premium';

  return NextResponse.json(
    { isPremium, plan },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    }
  );
}
