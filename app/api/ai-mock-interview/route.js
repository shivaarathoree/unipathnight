import { NextResponse } from 'next/server';
import { generateQuestions, evaluateAnswer } from '@/actions/mockInterview';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, domain, question, userAnswer, questionId, sessionId } = body;

    // Action 1: Generate interview questions
    if (action === 'generateQuestions') {
      if (!domain) {
        return NextResponse.json(
          { error: 'Domain is required' },
          { status: 400 }
        );
      }

      const questions = await generateQuestions(domain);
      return NextResponse.json({ questions });
    }

    // Action 2: Evaluate user answer
    if (action === 'evaluateAnswer') {
      if (!question || !userAnswer || !domain) {
        return NextResponse.json(
          { error: 'Question, answer, and domain are required' },
          { status: 400 }
        );
      }

      const evaluation = await evaluateAnswer(question, userAnswer, domain, sessionId);
      return NextResponse.json({ evaluation });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}