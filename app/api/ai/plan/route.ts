import { NextRequest, NextResponse } from 'next/server';
import { aiPlanProject } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, description = '' } = body;

    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json(
        { error: 'projectName is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await aiPlanProject(projectName, description);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in /api/ai/plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate project plan' },
      { status: 500 }
    );
  }
}
