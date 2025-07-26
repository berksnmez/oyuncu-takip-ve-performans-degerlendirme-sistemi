import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const oyuncuId = searchParams.get('oyuncu_id');

    if (oyuncuId) {
      // Belirli bir oyuncunun grafik verileri
      const oyuncuGrafik = await query(
        'SELECT * FROM defanslar_grafik WHERE oyuncu_id = ?',
        [oyuncuId]
      ) as any[];
      return NextResponse.json({ success: true, data: oyuncuGrafik[0] || null });
    } else {
      // Tüm defans grafik verileri
      const tumGrafikler = await query('SELECT * FROM defanslar_grafik') as any[];
      return NextResponse.json({ success: true, data: tumGrafikler });
    }
  } catch (error: any) {
    console.error('Defans grafik verileri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Defans grafik verileri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 