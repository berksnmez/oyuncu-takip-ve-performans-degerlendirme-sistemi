import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // En iyi 5 kanat oyuncusu (farklı oyuncuları göstermek için)
    const enIyiKanatOyunculari = await query(
      'SELECT oyuncu_isim, takim_adi, genel_sira, performans_skoru, oyuncu_mevkii FROM kanat_istatistik WHERE oyuncu_mevkii IN ("OS (Sl)", "OS (Sğ)") ORDER BY genel_sira ASC LIMIT 5'
    ) as any[];

    if (enIyiKanatOyunculari.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Kanat oyuncusu verisi bulunamadı' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: enIyiKanatOyunculari 
    });
  } catch (error: any) {
    console.error('En iyi kanat oyuncusu verisi çekilirken hata oluştu:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'En iyi kanat oyuncusu verisi çekilirken hata oluştu: ' + error.message 
      },
      { status: 500 }
    );
  }
} 