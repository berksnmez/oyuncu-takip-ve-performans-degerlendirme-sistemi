import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Gelir tablosu verilerini çek
    const gelirData = await query(`
      SELECT 
        madde,
        bu_ay,
        gecen_ay,
        bu_sezon
      FROM gelir_tablosu 
      ORDER BY bu_sezon DESC
    `);
    
    return NextResponse.json({ success: true, data: gelirData });
  } catch (error: any) {
    console.error('Gelir tablosu verileri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Gelir tablosu verileri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 