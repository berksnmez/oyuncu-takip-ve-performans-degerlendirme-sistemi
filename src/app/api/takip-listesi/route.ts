import { NextResponse } from 'next/server';

// This is a simple API endpoint that returns a success message
// The actual data is stored in localStorage client-side
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Takip listesi API aktif.'
  });
} 