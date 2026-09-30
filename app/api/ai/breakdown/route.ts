import { NextRequest, NextResponse } from 'next/server';
import { aiBreakdownTask } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskTitle, description = '' } = body;

    if (!taskTitle || typeof taskTitle !== 'string') {
      return NextResponse.json(
        { error: 'taskTitle is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await aiBreakdownTask(taskTitle, description);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in /api/ai/breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to break down task' },
      { status: 500 }
    );
  }
}
