import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Oyuncu tablosundaki tüm verileri çek
    const oyuncular = await query('SELECT * FROM oyuncu');
    return NextResponse.json({ success: true, data: oyuncular });
  } catch (error: any) {
    console.error('Oyuncular çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Oyuncular çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 