import { NextRequest, NextResponse } from 'next/server';
import { aiPrioritizeDailyTasks } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tasks = [] } = body;

    const result = await aiPrioritizeDailyTasks(tasks);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in /api/ai/prioritize:', error);
    return NextResponse.json(
      { error: 'Failed to prioritize tasks' },
      { status: 500 }
    );
  }
}
