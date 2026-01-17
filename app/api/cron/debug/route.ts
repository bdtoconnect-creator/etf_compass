import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to verify CRON_SECRET is set correctly
 * GET /api/cron/debug
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  return NextResponse.json({
    hasSecret: !!cronSecret,
    secretLength: cronSecret?.length || 0,
    secretFirst8: cronSecret?.substring(0, 8) || null,
    timestamp: new Date().toISOString()
  });
}
