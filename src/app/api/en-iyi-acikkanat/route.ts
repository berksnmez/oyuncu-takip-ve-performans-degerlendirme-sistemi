import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // En iyi 5 açık kanat oyuncusu (farklı oyuncuları göstermek için)
    const enIyiAcikKanatOyunculari = await query(
      'SELECT oyuncu_isim, takim_adi, genel_sira, performans_skoru, oyuncu_mevkii FROM acikkanat_istatistik WHERE oyuncu_mevkii IN ("OOS (Sl)", "OOS (Sğ)") ORDER BY genel_sira ASC LIMIT 5'
    ) as any[];

    if (enIyiAcikKanatOyunculari.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Açık kanat oyuncusu verisi bulunamadı' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: enIyiAcikKanatOyunculari 
    });
  } catch (error: any) {
    console.error('En iyi açık kanat oyuncusu verisi çekilirken hata oluştu:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'En iyi açık kanat oyuncusu verisi çekilirken hata oluştu: ' + error.message 
      },
      { status: 500 }
    );
  }
} 