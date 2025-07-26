import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface SezonOzeti extends RowDataPacket {
  bu_sezonki_sakatliklari: number;
  bu_sezon_forma_giymedigi_sure: string;
  oynamadigi_mac_yuzde: number;
  oyuncu_id: number;
  oyuncu_isim: string;
}

export async function GET() {
  try {
    const rows = await db.query(
      'SELECT bu_sezonki_sakatliklari, bu_sezon_forma_giymedigi_sure, oynamadigi_mac_yuzde, oyuncu_id, oyuncu_isim FROM sezon_ozeti ORDER BY bu_sezonki_sakatliklari DESC, oynamadigi_mac_yuzde DESC'
    ) as SezonOzeti[];
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Veri alınırken hata oluştu' },
      { status: 500 }
    );
  }
} 