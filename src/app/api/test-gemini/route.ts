import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'GEMINI_API_KEY no está configurada' }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Di hola en una sola palabra');
    const text = result.response.text();
    return NextResponse.json({ success: true, response: text, keyPrefix: apiKey.slice(0, 8) + '...' });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      status: error.status,
      keyPrefix: apiKey.slice(0, 8) + '...',
    }, { status: 500 });
  }
}
