import { NextRequest, NextResponse } from 'next/server';

const SUBSCRIPTION_COOKIE = 'kickoff_subscription';

function normalizePlan(plan: string | null): 'premium' | 'free' {
  return plan === 'premium' ? 'premium' : 'free';
}

export async function GET(request: NextRequest) {
  const plan = normalizePlan(request.nextUrl.searchParams.get('plan'));
  const redirectTo = request.nextUrl.searchParams.get('redirectTo') ?? '/pricing';

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(SUBSCRIPTION_COOKIE, plan, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
