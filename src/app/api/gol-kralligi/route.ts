import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // İlk olarak gol_asist tablosundan en çok gol atan 5 oyuncuyu çek
    const goalQuery = `
      SELECT oyuncu_id, gol 
      FROM gol_asist 
      WHERE gol > 0 
      ORDER BY gol DESC 
      LIMIT 5
    `;
    
    const goalResult = await query(goalQuery) as any[];
    
    if (goalResult.length === 0) {
      return NextResponse.json({ success: false, message: 'Gol verisi bulunamadı' });
    }
    
    const topScorers = [];
    
    // Her oyuncu için detay bilgilerini çek
    for (const goalData of goalResult) {
      const oyuncuId = goalData.oyuncu_id;
      const gol = goalData.gol;
      
      // Önce oyuncunun hangi mevkide olduğunu bul
      let playerData = null;
      
      // Kaleci kontrolü
      const kalecıQuery = `
        SELECT takim_adi, oyuncu_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure
        FROM kaleci_istatistik 
        WHERE oyuncu_id = ?
      `;
      let result = await query(kalecıQuery, [oyuncuId]) as any[];
      if (result.length > 0) {
        playerData = result[0];
        playerData.oyuncu_yan_mevkii = null; // Kalecilerde yan mevki yok
      }
      
      // Bek kontrolü
      if (!playerData) {
        const bekQuery = `
          SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure
          FROM bek_istatistik 
          WHERE oyuncu_id = ?
        `;
        result = await query(bekQuery, [oyuncuId]) as any[];
        if (result.length > 0) {
          playerData = result[0];
        }
      }
      
      // Stoper kontrolü
      if (!playerData) {
        const stoperQuery = `
          SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure
          FROM stoper_istatistik 
          WHERE oyuncu_id = ?
        `;
        result = await query(stoperQuery, [oyuncuId]) as any[];
        if (result.length > 0) {
          playerData = result[0];
        }
      }
      
      // DOS kontrolü
      if (!playerData) {
        const dosQuery = `
          SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure
          FROM dos_istatistik 
          WHERE oyuncu_id = ?
        `;
        result = await query(dosQuery, [oyuncuId]) as any[];
        if (result.length > 0) {
          playerData = result[0];
        }
      }
      
      // Kanat kontrolü
      if (!playerData) {
        const kanatQuery = `
          SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure
          FROM kanat_istatistik 
          WHERE oyuncu_id = ?
        `;
        result = await query(kanatQuery, [oyuncuId]) as any[];
        if (result.length > 0) {
          playerData = result[0];
        }
      }
      
      // Orta saha kontrolü
      if (!playerData) {
        const ortasahaQuery = `
          SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure
          FROM ortasaha_istatistik 
          WHERE oyuncu_id = ?
        `;
        result = await query(ortasahaQuery, [oyuncuId]) as any[];
        if (result.length > 0) {
          playerData = result[0];
        }
      }
      
      // Ofansif orta saha kontrolü
      if (!playerData) {
        const oosQuery = `
          SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure
          FROM ofansifortasaha_istatistik 
          WHERE oyuncu_id = ?
        `;
        result = await query(oosQuery, [oyuncuId]) as any[];
        if (result.length > 0) {
          playerData = result[0];
        }
      }
      
      // Açık kanat kontrolü
      if (!playerData) {
        const acikKanatQuery = `
          SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure
          FROM acikkanat_istatistik 
          WHERE oyuncu_id = ?
        `;
        result = await query(acikKanatQuery, [oyuncuId]) as any[];
        if (result.length > 0) {
          playerData = result[0];
        }
      }
      
      // Santrafor kontrolü
      if (!playerData) {
        const santraforQuery = `
          SELECT takim_adi, oyuncu_mevkii, oyuncu_yan_mevkii, oyuncu_isim, oyuncu_yas, oyuncu_sure
          FROM santrafor_istatistik 
          WHERE oyuncu_id = ?
        `;
        result = await query(santraforQuery, [oyuncuId]) as any[];
        if (result.length > 0) {
          playerData = result[0];
        }
      }
      
      if (playerData) {
        topScorers.push({
          ...playerData,
          gol: gol,
          oyuncu_id: oyuncuId
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      data: topScorers
    });
    
  } catch (error: any) {
    console.error('Gol krallığı verisi çekilirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Veritabanı hatası: ' + error.message },
      { status: 500 }
    );
  }
} 