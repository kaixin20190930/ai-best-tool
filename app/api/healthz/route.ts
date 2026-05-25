import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      status: 'alive',
      checkedAt: new Date().toISOString(),
    },
    { status: 200 }
  );
}
