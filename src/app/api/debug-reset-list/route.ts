import { NextResponse } from 'next/server';

// This is a simple API endpoint that manually clears the localStorage
// This helps when testing and debugging the watch list
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Debug API endpoint for resetting the takip listesi. Please run the following in your browser console: localStorage.removeItem("takipListesi"); window.location.reload();'
  });
} 