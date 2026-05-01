import { NextResponse } from 'next/server';
import { db } from '@/db';
import { specialists } from '@/db/schema';

export async function GET() {
  try {
    const result = await db.select().from(specialists);
    return NextResponse.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail,
    }, { status: 500 });
  }
}
