import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface SakatlikGecmisi extends RowDataPacket {
  mac: string;
  oynamadigi_sure: string;
  oyuncu_id: number;
  oyuncu_isim: string;
  sakatlik_derece: string;
  sakatlik_detay: string;
  tarih: string;
  tedavi_doktor: string;
  yer: string;
}

export async function GET() {
  try {
    const rows = await db.query(
      'SELECT mac, oynamadigi_sure, oyuncu_id, oyuncu_isim, sakatlik_derece, sakatlik_detay, tarih, tedavi_doktor, yer FROM sakatlik_gecmisi ORDER BY tarih DESC'
    ) as SakatlikGecmisi[];
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Veri alınırken hata oluştu' },
      { status: 500 }
    );
  }
} 