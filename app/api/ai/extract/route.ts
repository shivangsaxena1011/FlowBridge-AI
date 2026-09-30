import { NextRequest, NextResponse } from 'next/server';
import { aiExtractWork } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawInput, inputType = 'text' } = body;

    if (!rawInput || typeof rawInput !== 'string') {
      return NextResponse.json(
        { error: 'rawInput is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await aiExtractWork(rawInput, inputType);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in /api/ai/extract:', error);
    return NextResponse.json(
      { error: 'Failed to process input through AI engine' },
      { status: 500 }
    );
  }
}
