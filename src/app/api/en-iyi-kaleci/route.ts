import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'genel_sira';
    const minSure = parseInt(searchParams.get('minSure') || '0');
    
    // Geçerli sıralama kriterlerini kontrol et (kaleci tablosu için özel)
    const validSortCriteria = ['genel_sira', 'kalite_sira_katsayi', 'performans_skor_sirasi', 'sürdürülebilirlik_sira'];
    let sortCriteria = validSortCriteria.includes(sortBy) ? sortBy : 'genel_sira';
    
    // Kaleci tablosunda sürdürülebilirlik sütun adı farklı
    if (sortBy === 'surdurabilirlik_sira') {
      sortCriteria = 'sürdürülebilirlik_sira';
    }
    
    // En düşük sıralama değerine sahip kaleciler (minimum süre filtresi ile)
    const enIyiKaleciler = await query(
      `SELECT takim_adi, oyuncu_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure, genel_sira, performans_skoru FROM kaleci_istatistik WHERE oyuncu_mevkii = "GK" AND oyuncu_sure >= ? ORDER BY ${sortCriteria} ASC LIMIT 5`,
      [minSure]
    ) as any[];

    if (enIyiKaleciler.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Kaleci verisi bulunamadı' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: enIyiKaleciler
    });
  } catch (error: any) {
    console.error('En iyi kaleci verisi çekilirken hata oluştu:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'En iyi kaleci verisi çekilirken hata oluştu: ' + error.message 
      },
      { status: 500 }
    );
  }
} 