import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Puan tablosundaki verileri çek (id_puan_tablosu kolonu hariç)
    const puanTablosu = await query(`
      SELECT 
        atilan_gol,
        beraberlik,
        gol_averaji,
        kaybedilen_mac,
        kazanilan_mac,
        oynanan_mac,
        puan,
        takim_adi,
        takim_id,
        yenilen_gol
      FROM puan_tablosu 
      ORDER BY puan DESC, gol_averaji DESC
    `);
    
    return NextResponse.json({ success: true, data: puanTablosu });
  } catch (error: any) {
    console.error('Puan tablosu verileri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Puan tablosu verileri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 