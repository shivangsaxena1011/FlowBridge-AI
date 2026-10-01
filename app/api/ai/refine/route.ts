import { NextRequest, NextResponse } from 'next/server';
import { aiRefineTask } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskTitle, currentDescription = '' } = body;

    if (!taskTitle || typeof taskTitle !== 'string') {
      return NextResponse.json(
        { error: 'taskTitle is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await aiRefineTask(taskTitle, currentDescription);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in /api/ai/refine:', error);
    return NextResponse.json(
      { error: 'Failed to refine task with AI engine' },
      { status: 500 }
    );
  }
}
