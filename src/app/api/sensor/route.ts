import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://ocean-pact-api.perfomax.tech/api/v1/analytics/sensor';
const API_KEY = 'pfx_9a785a281e011e8113e8765ac4f0575c89cdaa69412067d5';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const imo = searchParams.get('imo');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!imo || !from || !to) {
    return NextResponse.json(
      { error: 'Missing required query parameters: imo, from, to' },
      { status: 400 }
    );
  }

  const url = new URL(API_BASE);
  url.searchParams.set('imo', imo);
  url.searchParams.set('from', from);
  url.searchParams.set('to', to);

  const res = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
      'X-API-Key': API_KEY,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream API error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
