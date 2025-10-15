import { textToSpeech } from '@/ai/flows/text-to-speech';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const result = await textToSpeech(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in text-to-speech API:', error);
    return NextResponse.json({ error: 'Failed to process text-to-speech' }, { status: 500 });
  }
}

    