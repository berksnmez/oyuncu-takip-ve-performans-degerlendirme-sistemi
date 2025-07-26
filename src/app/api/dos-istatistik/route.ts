import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const oyuncuId = searchParams.get('oyuncu_id');

    if (oyuncuId) {
      // Belirli bir oyuncunun istatistikleri
      const oyuncuIstatistikleri = await query(
        'SELECT * FROM dos_istatistik WHERE oyuncu_id = ?',
        [oyuncuId]
      ) as any[];
      return NextResponse.json({ success: true, data: oyuncuIstatistikleri[0] || null });
    } else {
      // Tüm defansif orta saha istatistikleri
      const tumIstatistikler = await query('SELECT * FROM dos_istatistik') as any[];
      return NextResponse.json({ success: true, data: tumIstatistikler });
    }
  } catch (error: any) {
    console.error('Defansif orta saha istatistikleri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Defansif orta saha istatistikleri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 