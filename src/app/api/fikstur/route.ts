import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Fikstür tablosundaki verileri çek (id kolonu hariç)
    const fikstur = await query(`
      SELECT 
        ev_mi_deplasman_mi,
        organizasyon,
        rakip,
        saat,
        skor,
        tarih
      FROM fikstur 
      ORDER BY id ASC
    `);
    
    return NextResponse.json({ success: true, data: fikstur });
  } catch (error: any) {
    console.error('Fikstür verileri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Fikstür verileri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 