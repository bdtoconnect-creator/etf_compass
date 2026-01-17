import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const expectedAuth = `Bearer ${cronSecret}`;

  return NextResponse.json({
    authHeader,
    authHeaderLength: authHeader?.length,
    cronSecretLength: cronSecret?.length,
    expectedAuthLength: expectedAuth.length,
    cronSecretFirst8: cronSecret?.substring(0, 8),
    matches: authHeader === expectedAuth,
    envLoaded: !!cronSecret,
  });
}
