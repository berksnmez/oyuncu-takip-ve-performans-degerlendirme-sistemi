import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // İlk olarak gol_asist tablosundan en çok maçın adamı olan 5 oyuncuyu çek
    const motmQuery = `
      SELECT oyuncu_id, macin_adami 
      FROM gol_asist 
      WHERE macin_adami > 0 
      ORDER BY macin_adami DESC 
      LIMIT 5
    `;
    
    const motmResult = await query(motmQuery) as any[];
    
    if (motmResult.length === 0) {
      return NextResponse.json({ success: false, message: 'Maçın adamı verisi bulunamadı' });
    }
    
    const topMotm = [];
    
    // Her oyuncu için detay bilgilerini çek
    for (const motmData of motmResult) {
      const oyuncuId = motmData.oyuncu_id;
      const macinAdami = motmData.macin_adami;
      
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
        topMotm.push({
          ...playerData,
          macin_adami: macinAdami,
          oyuncu_id: oyuncuId
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      data: topMotm
    });
    
  } catch (error: any) {
    console.error('Maçın adamı verisi çekilirken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Veritabanı hatası: ' + error.message },
      { status: 500 }
    );
  }
} 