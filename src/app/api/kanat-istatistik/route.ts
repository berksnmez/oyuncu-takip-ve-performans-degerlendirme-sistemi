import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // kanat_istatistik tablosundaki tüm verileri çek
    const kanatIstatistik = await query('SELECT * FROM kanat_istatistik');
    return NextResponse.json({ success: true, data: kanatIstatistik });
  } catch (error: any) {
    console.error('Kanat istatistikleri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Kanat istatistikleri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 