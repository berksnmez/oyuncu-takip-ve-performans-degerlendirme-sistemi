import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // ofansifortasaha_istatistik tablosundaki tüm verileri çek
    const ofansifOrtasahaIstatistik = await query('SELECT * FROM ofansifortasaha_istatistik');
    return NextResponse.json({ success: true, data: ofansifOrtasahaIstatistik });
  } catch (error: any) {
    console.error('Ofansif Orta Saha istatistikleri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Ofansif Orta Saha istatistikleri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 