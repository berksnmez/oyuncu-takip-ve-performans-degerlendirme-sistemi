import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const oyuncuId = searchParams.get('oyuncu_id');

    if (oyuncuId) {
      // Belirli bir oyuncunun istatistikleri
      const oyuncuIstatistikleri = await query(
        'SELECT * FROM santrafor_istatistik WHERE oyuncu_id = ?',
        [oyuncuId]
      ) as any[];
      return NextResponse.json({ success: true, data: oyuncuIstatistikleri[0] || null });
    } else {
      // Tüm santrafor istatistikleri
      const tumIstatistikler = await query('SELECT * FROM santrafor_istatistik') as any[];
      return NextResponse.json({ success: true, data: tumIstatistikler });
    }
  } catch (error: any) {
    console.error('Santrafor istatistikleri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Santrafor istatistikleri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 