import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Spesifik takımların performans verilerini çek (blabla_tkm değeri 8 ve 12 olanlar)
    const performansVerileri = await query(`
      SELECT 
        takim_id,
        takim_adi,
        blabla_tkm,
        golMb_gnlprf,
        pnltszxg_gnlprf,
        ynlgolMb_gnlprf,
        klsndexgMb_gnlprf,
        sutMb_gnlprf,
        isbtlsutyzd_gnlprf,
        isbtlpasyzd_gnlprf,
        topmdhlkznmyzd_gnlprf
      FROM 
        takim_istatistik
      WHERE
        blabla_tkm IN (8, 12)
    `);
    
    return NextResponse.json(performansVerileri);
  } catch (error: any) {
    console.error('Takım performans verisi çekme hatası:', error);
    return NextResponse.json(
      { error: 'Veri çekme hatası', details: error.message },
      { status: 500 }
    );
  }
} 