import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // ortasaha_istatistik tablosundaki tüm verileri çek
    const ortasahaIstatistik = await query('SELECT * FROM ortasaha_istatistik');
    return NextResponse.json({ success: true, data: ortasahaIstatistik });
  } catch (error: any) {
    console.error('Orta Saha istatistikleri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Orta Saha istatistikleri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 