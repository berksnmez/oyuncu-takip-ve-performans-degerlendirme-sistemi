import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'genel_sira';
    const minSure = parseInt(searchParams.get('minSure') || '0');
    
    // Geçerli sıralama kriterlerini kontrol et
    const validSortCriteria = ['genel_sira', 'kalite_sira_katsayi', 'performans_skor_sirasi', 'surdurabilirlik_sira'];
    const sortCriteria = validSortCriteria.includes(sortBy) ? sortBy : 'genel_sira';
    
    // En iyi 5 sağ kanat oyuncusu (minimum süre filtresi ile)
    const enIyiSagKanatOyunculari = await query(
      `SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure, genel_sira FROM kanat_istatistik WHERE oyuncu_mevkii = "OS (Sğ)" AND oyuncu_sure >= ? ORDER BY ${sortCriteria} ASC LIMIT 5`,
      [minSure]
    ) as any[];

    if (enIyiSagKanatOyunculari.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Sağ kanat oyuncusu verisi bulunamadı' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: enIyiSagKanatOyunculari 
    });
  } catch (error: any) {
    console.error('En iyi sağ kanat oyuncusu verisi çekilirken hata oluştu:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'En iyi sağ kanat oyuncusu verisi çekilirken hata oluştu: ' + error.message 
      },
      { status: 500 }
    );
  }
} 