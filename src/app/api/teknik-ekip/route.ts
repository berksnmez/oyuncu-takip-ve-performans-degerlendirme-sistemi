import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Teknik ekip tablosundan verileri çek - takim_id kolonunu hariç tut
    const teknikEkipVerileri = await query(`
      SELECT 
        gorev,
        isim,
        sozlesme_tur,
        sozlesme_bitis_trh,
        antrenorluk_derece
      FROM teknik_ekip
      ORDER BY 
        CASE 
          WHEN gorev = 'Teknik Direktör' THEN 1
          WHEN gorev = 'Antrenör' THEN 2
          WHEN gorev = 'Kaleci Antrenörü' THEN 3
          WHEN gorev = 'Kondisyoner' THEN 4
          WHEN gorev = 'Fizyoterapist' THEN 5
          WHEN gorev = 'Masaj' THEN 6
          WHEN gorev = 'Doktor' THEN 7
          WHEN gorev = 'Malzemeci' THEN 8
          ELSE 9
        END,
        isim ASC
    `);
    
    return NextResponse.json({ success: true, data: teknikEkipVerileri });
  } catch (error: any) {
    console.error('Teknik ekip verileri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Teknik ekip verileri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 