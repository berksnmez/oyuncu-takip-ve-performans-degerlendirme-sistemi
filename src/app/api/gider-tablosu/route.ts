import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Gider tablosu verilerini çek
    const giderData = await query(`
      SELECT 
        madde,
        bu_ay,
        gecen_ay,
        bu_sezon
      FROM gider_tablosu 
      ORDER BY bu_sezon DESC
    `);
    
    return NextResponse.json({ success: true, data: giderData });
  } catch (error: any) {
    console.error('Gider tablosu verileri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Gider tablosu verileri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 