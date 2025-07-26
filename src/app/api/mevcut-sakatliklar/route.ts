import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface MevcutSakatlik extends RowDataPacket {
  ayrinti: string;
  oyuncu_id: number;
  oyuncu_isim: string;
  sakatlik: string;
  tahmini_donus_tarihi: string;
  tarih: string;
  tedavi_yapan: string;
}

export async function GET() {
  try {
    const rows = await db.query(
      'SELECT ayrinti, oyuncu_id, oyuncu_isim, sakatlik, tahmini_donus_tarihi, tarih, tedavi_yapan FROM mevcut_sakatliklar ORDER BY tarih DESC'
    ) as MevcutSakatlik[];
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Veri alınırken hata oluştu' },
      { status: 500 }
    );
  }
} 