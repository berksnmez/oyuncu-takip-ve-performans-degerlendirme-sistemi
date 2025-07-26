import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // En iyi 5 bek oyuncusu (farklı oyuncuları göstermek için)
    const enIyiBekOyunculari = await query(
      'SELECT oyuncu_isim, takim_adi, genel_sira, performans_skoru, oyuncu_mevkii FROM bek_istatistik WHERE oyuncu_mevkii IN ("D (Sl)", "D (Sğ)") ORDER BY genel_sira ASC LIMIT 5'
    ) as any[];

    if (enIyiBekOyunculari.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Bek oyuncusu verisi bulunamadı' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: enIyiBekOyunculari 
    });
  } catch (error: any) {
    console.error('En iyi bek oyuncusu verisi çekilirken hata oluştu:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'En iyi bek oyuncusu verisi çekilirken hata oluştu: ' + error.message 
      },
      { status: 500 }
    );
  }
} 