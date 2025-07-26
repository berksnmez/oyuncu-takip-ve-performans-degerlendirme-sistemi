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
    
    // En iyi 5 sol bek oyuncusu (minimum süre filtresi ile)
    const enIyiSolBekOyunculari = await query(
      `SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure, genel_sira FROM bek_istatistik WHERE oyuncu_mevkii = "D (Sl)" AND oyuncu_sure >= ? ORDER BY ${sortCriteria} ASC LIMIT 5`,
      [minSure]
    ) as any[];

    if (enIyiSolBekOyunculari.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Sol bek oyuncusu verisi bulunamadı' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: enIyiSolBekOyunculari 
    });
  } catch (error: any) {
    console.error('En iyi sol bek oyuncusu verisi çekilirken hata oluştu:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'En iyi sol bek oyuncusu verisi çekilirken hata oluştu: ' + error.message 
      },
      { status: 500 }
    );
  }
} 