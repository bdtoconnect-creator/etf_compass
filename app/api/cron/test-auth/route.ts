import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify CRON_SECRET authentication
 * GET /api/cron/test-auth
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  const receivedSecret = authHeader?.replace('Bearer ', '');

  return NextResponse.json({
    receivedAuth: authHeader?.substring(0, 20) + '...', // Show first 20 chars
    receivedLength: receivedSecret?.length || 0,
    receivedFirst8: receivedSecret?.substring(0, 8) || null,
    envSecretLength: cronSecret?.length || 0,
    envSecretFirst8: cronSecret?.substring(0, 8) || null,
    match: receivedSecret === cronSecret,
    timestamp: new Date().toISOString()
  });
}
