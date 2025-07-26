import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Kadro tablosundan verileri çek ve mevkiiye göre istatistik tablolarıyla JOIN yap
    const kadroVerileri = await query(`
      SELECT 
        k.oyuncu_id,
        k.oyuncu_mevkii,
        k.oyuncu_yan_mevkii,
        k.oyuncu_isim,
        k.oyuncu_yas,
        k.oyuncu_sure,
        k.gol,
        k.asist,
        k.xG,
        k.macin_adami,
        k.isbtlPasYzd,
        k.topaMudhleMb,
        k.bsrliDriplingMb,
        k.isbtlSutYzd,
        k.golYnlmedenTmmMac,
        k.yenilen_goller,
        k.kurtarisYuzdesi,
        k.kurtarisBkltnsYzd,
        k.sari_kart,
        k.kirmizi_kart,
        COALESCE(
          kaleci.performans_skoru,
          bek.performans_skoru,
          stoper.performans_skoru,
          dos.performans_skoru,
          kanat.performans_skoru,
          ortasaha.performans_skoru,
          ofansifortasaha.performans_skoru,
          acikkanat.performans_skoru,
          santrafor.performans_skoru
        ) as performans_skoru,
        COALESCE(
          kaleci.kalite_sira_katsayi,
          bek.kalite_sira_katsayi,
          stoper.kalite_sira_katsayi,
          dos.kalite_sira_katsayi,
          kanat.kalite_sira_katsayi,
          ortasaha.kalite_sira_katsayi,
          ofansifortasaha.kalite_sira_katsayi,
          acikkanat.kalite_sira_katsayi,
          santrafor.kalite_sira_katsayi
        ) as kalite_sira_katsayi,
        COALESCE(
          kaleci.performans_skor_sirasi,
          bek.performans_skor_sirasi,
          stoper.performans_skor_sirasi,
          dos.performans_skor_sirasi,
          kanat.performans_skor_sirasi,
          ortasaha.performans_skor_sirasi,
          ofansifortasaha.performans_skor_sirasi,
          acikkanat.performans_skor_sirasi,
          santrafor.performans_skor_sirasi
        ) as performans_skor_sirasi,
        COALESCE(
          kaleci.sürdürülebilirlik_sira,
          bek.surdurabilirlik_sira,
          stoper.surdurabilirlik_sira,
          dos.surdurabilirlik_sira,
          kanat.surdurabilirlik_sira,
          ortasaha.surdurabilirlik_sira,
          ofansifortasaha.surdurabilirlik_sira,
          acikkanat.surdurabilirlik_sira,
          santrafor.surdurabilirlik_sira
        ) as surdurabilirlik_sira,
        COALESCE(
          kaleci.genel_sira,
          bek.genel_sira,
          stoper.genel_sira,
          dos.genel_sira,
          kanat.genel_sira,
          ortasaha.genel_sira,
          ofansifortasaha.genel_sira,
          acikkanat.genel_sira,
          santrafor.genel_sira
        ) as genel_sira
      FROM kadro k
      LEFT JOIN kaleci_istatistik kaleci ON k.oyuncu_id = kaleci.oyuncu_id AND k.oyuncu_mevkii = 'K'
      LEFT JOIN bek_istatistik bek ON k.oyuncu_id = bek.oyuncu_id AND k.oyuncu_mevkii IN ('D (Sl)', 'D (Sğ)')
      LEFT JOIN stoper_istatistik stoper ON k.oyuncu_id = stoper.oyuncu_id AND k.oyuncu_mevkii = 'D (M)'
      LEFT JOIN dos_istatistik dos ON k.oyuncu_id = dos.oyuncu_id AND k.oyuncu_mevkii = 'DOS' 
      LEFT JOIN kanat_istatistik kanat ON k.oyuncu_id = kanat.oyuncu_id AND k.oyuncu_mevkii IN ('OS (Sl)', 'OS (Sğ)')
      LEFT JOIN ortasaha_istatistik ortasaha ON k.oyuncu_id = ortasaha.oyuncu_id AND k.oyuncu_mevkii = 'OS (M)'
      LEFT JOIN ofansifortasaha_istatistik ofansifortasaha ON k.oyuncu_id = ofansifortasaha.oyuncu_id AND k.oyuncu_mevkii = 'OOS (M)'
      LEFT JOIN acikkanat_istatistik acikkanat ON k.oyuncu_id = acikkanat.oyuncu_id AND k.oyuncu_mevkii IN ('OOS (Sl)', 'OOS (Sğ)')
      LEFT JOIN santrafor_istatistik santrafor ON k.oyuncu_id = santrafor.oyuncu_id AND k.oyuncu_mevkii = 'ST (M)'
    `);
    
    return NextResponse.json({ success: true, data: kadroVerileri });
  } catch (error: any) {
    console.error('Kadro verileri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Kadro verileri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 