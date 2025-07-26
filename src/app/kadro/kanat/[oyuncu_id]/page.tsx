'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import Image from 'next/image';

// Forvet Chart bileşenlerini import et
import ForvetFizikselChart from '@/components/charts/forvet/ForvetFizikselChart';
import ForvetAsistChart from '@/components/charts/forvet/ForvetAsistChart';
import ForvetOrtaChart from '@/components/charts/forvet/ForvetOrtaChart';
import ForvetHareketlilikChart from '@/components/charts/forvet/ForvetHareketlilikChart';
import ForvetPasChart from '@/components/charts/forvet/ForvetPasChart';
import ForvetHavaTopuChart from '@/components/charts/forvet/ForvetHavaTopuChart';
import ForvetAtilanGolChart from '@/components/charts/forvet/ForvetAtilanGolChart';
import ForvetGolculukChart from '@/components/charts/forvet/ForvetGolculukChart';
import ForvetSutChart from '@/components/charts/forvet/ForvetSutChart';
import ForvetGenelHucumBeklentisiChart from '@/components/charts/forvet/ForvetGenelHucumBeklentisiChart';



// Açık kanat istatistik veri tipi
interface AcikKanatIstatistik {
  astbklntMB: number;
  astbklntMB_katsayi: number;
  blabla_acknt: number;
  bsrldrplMB: number;
  bsrldrplMB_katsayi: number;
  genel_sira: number;
  golbkltnsMB: number;
  golculukEtknlk: number;
  golculukEtknlk_katsayi: number;
  golMB: number;
  golMB_katsayi: number;
  isbtlpasMB: number;
  isbtlsut_yzd: number;
  isbtlsut_yzd_katsayi: number;
  kalite_sira_katsayi: number;
  oyuncu_id: number;
  oyuncu_isim: string;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yan_mevkii: string;
  oyuncu_yas: number;
  performans_skoru: number;
  performans_skor_sirasi: number;
  pnltszxgMB: number;
  pnltszxgMB_katsayi: number;
  sprintMB: number;
  sprintMB_katsayi: number;
  stdustuxg: number;
  stdustuxg_katsayi: number;
  surdurabilirlik_sira: number;
  sutbsnagolbkltns: number;
  sutdgrlndrme_yzd: number;
  sutdgrlndrme_yzd_katsayi: number;
  takim_adi: string;
  takim_id: number;
  toplamsut: number;
  yrtclkEtknlk: number;
  yrtclkEtknlk_katsayi: number;
  yrtglfrstMB: number;
  yrtglfrstMB_katsayi: number;
}

// Forvet grafik veri tipi
interface ForvetGrafik {
  'Ao-Io%': number;
  bnzrsz_fv: number;
  'Eng/90': number;
  'Uzk/90': number;
  'HtmG/90': number;
  'Hv%': number;
  'Mesf/90': number;
  'OrtGrsm/90': number;
  oyuncu_id: number;
  oyuncu_isim: string;
  'Pas%': number;
  'PsG/90': number;
  'SHd/90': number;
  'SPasi/90': number;
  'Sprint/90': number;
  takim_adi: string;
  takim_id: number;
  'TopKyb/90': number;
  'xA/90': number;
  'Gol/90': number;
  'PH-xG/90': number;
  'DikKltPas/90': number;
  'KazanTop/90': number;
  'xG/Sut': number;
  'Drp/90': number;
}



export default function KanatDetayPage() {
  const params = useParams();
  const oyuncuId = params.oyuncu_id as string;
  
  const [oyuncuIstatistikleri, setOyuncuIstatistikleri] = useState<AcikKanatIstatistik | null>(null);
  const [oyuncuGrafik, setOyuncuGrafik] = useState<ForvetGrafik | null>(null);
  const [tumKanatlar, setTumKanatlar] = useState<AcikKanatIstatistik[]>([]);
  const [tumGrafikler, setTumGrafikler] = useState<ForvetGrafik[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<number | null>(null);
  // Karşılaştırma için yeni state'ler
  const [karsilastirmaKanat, setKarsilastirmaKanat] = useState<AcikKanatIstatistik | null>(null);
  const [karsilastirmaAcik, setKarsilastirmaAcik] = useState(false);

  // Güvenli number dönüşümü fonksiyonu
  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Güvenli decimal formatı
  const safeToFixed = (value: any, decimals: number = 2): string => {
    const num = safeNumber(value);
    return num.toFixed(decimals);
  };

  // Verileri yükle
  useEffect(() => {
    const verileriYukle = async () => {
      try {
        setYukleniyor(true);
        
        // Oyuncu özel verileri
        const [istatistikResponse, grafikResponse] = await Promise.all([
          fetch(`/api/acikkanat-istatistik?oyuncu_id=${oyuncuId}`),
          fetch(`/api/forvetler-grafik?oyuncu_id=${oyuncuId}`)
        ]);

        const [istatistikResult, grafikResult] = await Promise.all([
          istatistikResponse.json(),
          grafikResponse.json()
        ]);

        if (istatistikResult.success && istatistikResult.data) {
          setOyuncuIstatistikleri(istatistikResult.data);
        } else {
          setHata('Oyuncu istatistikleri bulunamadı');
          return;
        }

        if (grafikResult.success && grafikResult.data) {
          setOyuncuGrafik(grafikResult.data);
        }

        // Tüm kanat verileri (karşılaştırma için)
        const [tumIstatistikResponse, tumGrafikResponse] = await Promise.all([
          fetch('/api/acikkanat-istatistik'),
          fetch('/api/forvetler-grafik')
        ]);

        const [tumIstatistikResult, tumGrafikResult] = await Promise.all([
          tumIstatistikResponse.json(),
          tumGrafikResponse.json()
        ]);

        if (tumIstatistikResult.success) {
          setTumKanatlar(tumIstatistikResult.data);
        }

        if (tumGrafikResult.success) {
          setTumGrafikler(tumGrafikResult.data);
        }

      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
        setHata('Veriler yüklenirken bir hata oluştu');
      } finally {
        setYukleniyor(false);
      }
    };

    if (oyuncuId) {
      verileriYukle();
    }
  }, [oyuncuId]);

  // Lig ortalaması hesaplama fonksiyonu
  const hesaplaLigOrtalamasi = (alan: keyof AcikKanatIstatistik): number => {
    if (tumKanatlar.length === 0) return 0;
    
    const alanAdi = alan as string;
    if (alanAdi.endsWith('_katsayi') || alanAdi === 'performans_skoru') {
      return 0; // Bu alanlar için ortalama hesaplanmaz
    }

    const toplam = tumKanatlar.reduce((acc, kanat) => {
      const deger = kanat[alan];
      return acc + safeNumber(deger);
    }, 0);

    return toplam / tumKanatlar.length;
  };

  // Karşılaştırılabilir kanat oyuncuları (sadece OOS (Sğ) ve OOS (Sl))
  const karsilastirabilirKanatlar = useMemo(() => {
    return tumKanatlar.filter(kanat => 
      (kanat.oyuncu_mevkii === 'OOS (Sğ)' || kanat.oyuncu_mevkii === 'OOS (Sl)') &&
      kanat.oyuncu_id.toString() !== oyuncuId
    );
  }, [tumKanatlar, oyuncuId]);

  // Karşılaştırma kanat oyuncusu seçme fonksiyonu
  const karsilastirmaKanatSec = (kanat: AcikKanatIstatistik) => {
    setKarsilastirmaKanat(kanat);
    setKarsilastirmaAcik(true);
  };

  // Karşılaştırma analizi yapma fonksiyonu
  const karsilastirmaAnalizi = useMemo(() => {
    if (!oyuncuIstatistikleri || !karsilastirmaKanat) return null;

    const oyuncu1 = oyuncuIstatistikleri;
    const oyuncu2 = karsilastirmaKanat;

    // Süre faktörü (minimum 500 dakika oynayanlar için güvenilir veri)
    const oyuncu1Guvenilir = safeNumber(oyuncu1.oyuncu_sure) >= 500;
    const oyuncu2Guvenilir = safeNumber(oyuncu2.oyuncu_sure) >= 500;

    // Performans karşılaştırması
    const karsilastirmalar = [
      {
        kategori: 'Gol',
        oyuncu1Deger: safeNumber(oyuncu1.golMB),
        oyuncu2Deger: safeNumber(oyuncu2.golMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Asist Beklentisi',
        oyuncu1Deger: safeNumber(oyuncu1.astbklntMB),
        oyuncu2Deger: safeNumber(oyuncu2.astbklntMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Yaratıcılık Etkinliği',
        oyuncu1Deger: safeNumber(oyuncu1.yrtclkEtknlk),
        oyuncu2Deger: safeNumber(oyuncu2.yrtclkEtknlk),
        birim: '',
        yuksekIyi: true
      },
      {
        kategori: 'Sprint',
        oyuncu1Deger: safeNumber(oyuncu1.sprintMB),
        oyuncu2Deger: safeNumber(oyuncu2.sprintMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Başarılı Dripling',
        oyuncu1Deger: safeNumber(oyuncu1.bsrldrplMB),
        oyuncu2Deger: safeNumber(oyuncu2.bsrldrplMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'İsabetli Şut %',
        oyuncu1Deger: safeNumber(oyuncu1.isbtlsut_yzd),
        oyuncu2Deger: safeNumber(oyuncu2.isbtlsut_yzd),
        birim: '%',
        yuksekIyi: true
      },
      {
        kategori: 'Penaltısız xG',
        oyuncu1Deger: safeNumber(oyuncu1.pnltszxgMB),
        oyuncu2Deger: safeNumber(oyuncu2.pnltszxgMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Yaratılan Gol Fırsatı',
        oyuncu1Deger: safeNumber(oyuncu1.yrtglfrstMB),
        oyuncu2Deger: safeNumber(oyuncu2.yrtglfrstMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Golcülük Etkinliği',
        oyuncu1Deger: safeNumber(oyuncu1.golculukEtknlk),
        oyuncu2Deger: safeNumber(oyuncu2.golculukEtknlk),
        birim: '',
        yuksekIyi: true
      },
      {
        kategori: 'Şut Değerlendirme %',
        oyuncu1Deger: safeNumber(oyuncu1.sutdgrlndrme_yzd),
        oyuncu2Deger: safeNumber(oyuncu2.sutdgrlndrme_yzd),
        birim: '%',
        yuksekIyi: true
      }
    ];

    // Skorlama sistemi
    let oyuncu1Skor = 0;
    let oyuncu2Skor = 0;

    karsilastirmalar.forEach(k => {
      if (k.yuksekIyi) {
        if (k.oyuncu1Deger > k.oyuncu2Deger) oyuncu1Skor++;
        else if (k.oyuncu2Deger > k.oyuncu1Deger) oyuncu2Skor++;
      } else {
        if (k.oyuncu1Deger < k.oyuncu2Deger) oyuncu1Skor++;
        else if (k.oyuncu2Deger < k.oyuncu1Deger) oyuncu2Skor++;
      }
    });

    // Performans skoru karşılaştırması
    const oyuncu1PerformansSkor = safeNumber(oyuncu1.performans_skoru);
    const oyuncu2PerformansSkor = safeNumber(oyuncu2.performans_skoru);
    
    if (oyuncu1PerformansSkor > oyuncu2PerformansSkor) oyuncu1Skor++;
    else if (oyuncu2PerformansSkor > oyuncu1PerformansSkor) oyuncu2Skor++;

    // Genel sıra karşılaştırması (düşük sıra daha iyi)
    if (safeNumber(oyuncu1.genel_sira) < safeNumber(oyuncu2.genel_sira)) oyuncu1Skor++;
    else if (safeNumber(oyuncu2.genel_sira) < safeNumber(oyuncu1.genel_sira)) oyuncu2Skor++;

    // Pozisyon uyumluluğu analizi
    const aynıPozisyon = oyuncu1.oyuncu_mevkii === oyuncu2.oyuncu_mevkii;
    const pozisyonAnalizi = aynıPozisyon ? 
      `Her iki oyuncu da ${oyuncu1.oyuncu_mevkii} pozisyonunda oynuyor.` :
      `${oyuncu1.oyuncu_isim} ${oyuncu1.oyuncu_mevkii}, ${oyuncu2.oyuncu_isim} ${oyuncu2.oyuncu_mevkii} pozisyonunda oynuyor.`;

    // Sonuç analizi
    let sonuc = '';
    let tercih = '';

    if (oyuncu1Skor > oyuncu2Skor) {
      sonuc = `${oyuncu1.oyuncu_isim} daha iyi performans gösteriyor`;
      tercih = oyuncu1.oyuncu_isim;
    } else if (oyuncu2Skor > oyuncu1Skor) {
      sonuc = `${oyuncu2.oyuncu_isim} daha iyi performans gösteriyor`;
      tercih = oyuncu2.oyuncu_isim;
    } else {
      sonuc = 'İki oyuncu da benzer performans gösteriyor';
      tercih = 'Eşit';
    }

    // Süre faktörü uyarısı
    let sureUyarisi = '';
    if (!oyuncu1Guvenilir && !oyuncu2Guvenilir) {
      sureUyarisi = 'Her iki oyuncu da az süre oynadığı için istatistikler yanıltıcı olabilir.';
    } else if (!oyuncu1Guvenilir) {
      sureUyarisi = `${oyuncu1.oyuncu_isim} az süre oynadığı için istatistikleri yanıltıcı olabilir.`;
    } else if (!oyuncu2Guvenilir) {
      sureUyarisi = `${oyuncu2.oyuncu_isim} az süre oynadığı için istatistikleri yanıltıcı olabilir.`;
    }

    return {
      karsilastirmalar,
      oyuncu1Skor,
      oyuncu2Skor,
      sonuc,
      tercih,
      sureUyarisi,
      oyuncu1Guvenilir,
      oyuncu2Guvenilir,
      aynıPozisyon,
      pozisyonAnalizi
    };
  }, [oyuncuIstatistikleri, karsilastirmaKanat]);

  // Grafik bileşeni


  if (yukleniyor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Oyuncu verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (hata || !oyuncuIstatistikleri) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl">{hata || 'Oyuncu bulunamadı'}</p>
          <Link href="/kadro" className="mt-4 inline-block text-blue-600 hover:underline">
            Kadro sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık ve Geri Dön */}
        <div className="mb-8">
          <Link 
            href="/kadro" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Kadro sayfasına dön
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {oyuncuIstatistikleri.oyuncu_isim}
          </h1>
          <p className="text-xl text-gray-600">Kanat Oyuncusu Performans Raporu</p>
        </div>

        {/* Kanat Karşılaştırma Seçimi */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Kanat Oyuncusu Karşılaştırması</h3>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-gray-700 font-medium">Karşılaştırılacak kanat oyuncusu:</label>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onChange={(e) => {
                const secilenKanat = karsilastirabilirKanatlar.find(k => k.oyuncu_id.toString() === e.target.value);
                if (secilenKanat) {
                  karsilastirmaKanatSec(secilenKanat);
                }
              }}
              value={karsilastirmaKanat?.oyuncu_id || ''}
            >
              <option value="">Kanat oyuncusu seçin...</option>
              {karsilastirabilirKanatlar
                .sort((a, b) => a.oyuncu_isim.localeCompare(b.oyuncu_isim))
                .map(kanat => (
                  <option key={kanat.oyuncu_id} value={kanat.oyuncu_id}>
                    {kanat.oyuncu_isim} ({kanat.takim_adi}) - {kanat.oyuncu_mevkii}
                  </option>
                ))
              }
            </select>
            {karsilastirmaAcik && (
              <button
                onClick={() => setKarsilastirmaAcik(false)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Karşılaştırmayı Kapat
              </button>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            * Sadece "OOS (Sğ)" ve "OOS (Sl)" mevkiindeki oyuncular karşılaştırılabilir
          </div>
        </div>

        {/* Karşılaştırma Tablosu */}
        {karsilastirmaAcik && karsilastirmaKanat && karsilastirmaAnalizi && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Kanat Oyuncusu Karşılaştırması</h3>
            
            {/* Süre Uyarısı */}
            {karsilastirmaAnalizi.sureUyarisi && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <p className="text-yellow-800 text-sm">{karsilastirmaAnalizi.sureUyarisi}</p>
                </div>
              </div>
            )}

            {/* Pozisyon Uyumluluğu */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-blue-600 mr-2">ℹ️</div>
                <p className="text-blue-800 text-sm">
                  {karsilastirmaAnalizi.pozisyonAnalizi}
                  {!karsilastirmaAnalizi.aynıPozisyon && 
                    " Farklı kanat tercihleri takım taktik tercihlerini etkileyebilir."
                  }
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İstatistik
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {oyuncuIstatistikleri.oyuncu_isim}
                      <div className="text-xs text-gray-400 normal-case">
                        {safeNumber(oyuncuIstatistikleri.oyuncu_sure)}' oynadı
                        {!karsilastirmaAnalizi.oyuncu1Guvenilir && ' ⚠️'}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {karsilastirmaKanat.oyuncu_isim}
                      <div className="text-xs text-gray-400 normal-case">
                        {safeNumber(karsilastirmaKanat.oyuncu_sure)}' oynadı
                        {!karsilastirmaAnalizi.oyuncu2Guvenilir && ' ⚠️'}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kazanan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {karsilastirmaAnalizi.karsilastirmalar.map((karsilastirma, index) => {
                    let kazanan = '';
                    let oyuncu1Kazandi = false;
                    let oyuncu2Kazandi = false;

                    if (karsilastirma.yuksekIyi) {
                      if (karsilastirma.oyuncu1Deger > karsilastirma.oyuncu2Deger) {
                        kazanan = oyuncuIstatistikleri.oyuncu_isim;
                        oyuncu1Kazandi = true;
                      } else if (karsilastirma.oyuncu2Deger > karsilastirma.oyuncu1Deger) {
                        kazanan = karsilastirmaKanat.oyuncu_isim;
                        oyuncu2Kazandi = true;
                      } else {
                        kazanan = 'Eşit';
                      }
                    } else {
                      if (karsilastirma.oyuncu1Deger < karsilastirma.oyuncu2Deger) {
                        kazanan = oyuncuIstatistikleri.oyuncu_isim;
                        oyuncu1Kazandi = true;
                      } else if (karsilastirma.oyuncu2Deger < karsilastirma.oyuncu1Deger) {
                        kazanan = karsilastirmaKanat.oyuncu_isim;
                        oyuncu2Kazandi = true;
                      } else {
                        kazanan = 'Eşit';
                      }
                    }

                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {karsilastirma.kategori}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-semibold ${
                          oyuncu1Kazandi ? 'text-green-600 bg-green-50' : 'text-gray-900'
                        }`}>
                          {safeToFixed(karsilastirma.oyuncu1Deger)}{karsilastirma.birim}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-semibold ${
                          oyuncu2Kazandi ? 'text-green-600 bg-green-50' : 'text-gray-900'
                        }`}>
                          {safeToFixed(karsilastirma.oyuncu2Deger)}{karsilastirma.birim}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold">
                          {kazanan === 'Eşit' ? (
                            <span className="text-gray-500">🤝 Eşit</span>
                          ) : oyuncu1Kazandi ? (
                            <span className="text-green-600">🏆</span>
                          ) : (
                            <span className="text-gray-600">🏆</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Performans Skoru */}
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Performans Skoru
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(oyuncuIstatistikleri.performans_skoru) > safeNumber(karsilastirmaKanat.performans_skoru) 
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeToFixed(oyuncuIstatistikleri.performans_skoru)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(karsilastirmaKanat.performans_skoru) > safeNumber(oyuncuIstatistikleri.performans_skoru)
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeToFixed(karsilastirmaKanat.performans_skoru)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">
                      {safeNumber(oyuncuIstatistikleri.performans_skoru) > safeNumber(karsilastirmaKanat.performans_skoru) ? (
                        <span className="text-green-600">🏆</span>
                      ) : safeNumber(karsilastirmaKanat.performans_skoru) > safeNumber(oyuncuIstatistikleri.performans_skoru) ? (
                        <span className="text-gray-600">🏆</span>
                      ) : (
                        <span className="text-gray-500">🤝 Eşit</span>
                      )}
                    </td>
                  </tr>

                  {/* Genel Sıra */}
                  <tr className="bg-purple-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Lig Sıralaması
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(oyuncuIstatistikleri.genel_sira) < safeNumber(karsilastirmaKanat.genel_sira) 
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeNumber(oyuncuIstatistikleri.genel_sira)}. sıra
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(karsilastirmaKanat.genel_sira) < safeNumber(oyuncuIstatistikleri.genel_sira)
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeNumber(karsilastirmaKanat.genel_sira)}. sıra
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">
                      {safeNumber(oyuncuIstatistikleri.genel_sira) < safeNumber(karsilastirmaKanat.genel_sira) ? (
                        <span className="text-green-600">🏆</span>
                      ) : safeNumber(karsilastirmaKanat.genel_sira) < safeNumber(oyuncuIstatistikleri.genel_sira) ? (
                        <span className="text-gray-600">🏆</span>
                      ) : (
                        <span className="text-gray-500">🤝 Eşit</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Karşılaştırma Özeti */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-gray-800 mb-2">Skor</h4>
                <div className="text-2xl font-bold text-gray-600">
                  {karsilastirmaAnalizi.oyuncu1Skor} - {karsilastirmaAnalizi.oyuncu2Skor}
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  {oyuncuIstatistikleri.oyuncu_isim} vs {karsilastirmaKanat.oyuncu_isim}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-green-800 mb-2">Sonuç</h4>
                <div className="text-lg font-bold text-green-600">
                  {karsilastirmaAnalizi.sonuc}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-purple-800 mb-2">Tercih</h4>
                <div className="text-lg font-bold text-purple-600">
                  {karsilastirmaAnalizi.tercih === 'Eşit' ? 'Eşit Performans' : `${karsilastirmaAnalizi.tercih} Daha İyi`}
                </div>
              </div>
            </div>

            {/* Detaylı Analiz */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Detaylı Analiz</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Oyun Süresi Karşılaştırması:</strong> {oyuncuIstatistikleri.oyuncu_isim} {safeNumber(oyuncuIstatistikleri.oyuncu_sure)} dakika,{' '} 
                  {karsilastirmaKanat.oyuncu_isim} {safeNumber(karsilastirmaKanat.oyuncu_sure)} dakika oynadı.
                </p>
                
                <p>
                  <strong>Pozisyon Analizi:</strong> {karsilastirmaAnalizi.pozisyonAnalizi}
                </p>
                
                {karsilastirmaAnalizi.oyuncu1Skor > karsilastirmaAnalizi.oyuncu2Skor ? (
                  <p>
                    <strong>{oyuncuIstatistikleri.oyuncu_isim}</strong> özellikle gol üretimi, yaratıcılık ve bireysel aksiyonlar açısından 
                    {karsilastirmaKanat.oyuncu_isim}'den daha başarılı. Bu oyuncu takım için daha güvenilir bir kanat seçenek olabilir.
                  </p>
                ) : karsilastirmaAnalizi.oyuncu2Skor > karsilastirmaAnalizi.oyuncu1Skor ? (
                  <p>
                    <strong>{karsilastirmaKanat.oyuncu_isim}</strong> genel performans değerlendirmesinde{' '} 
                    {oyuncuIstatistikleri.oyuncu_isim}'den daha iyi sonuçlar elde etmiş. Transfer veya kadro planlamasında 
                    bu oyuncu öncelikli seçenek olabilir.
                  </p>
                ) : (
                  <p>
                    Her iki oyuncu da benzer seviyede performans gösteriyor. Seçim yaparken takım oyun tarzı, kanat tercihi ve 
                    taktiksel uyum dikkate alınabilir.
                  </p>
                )}

                <p>
                  <strong>Güvenilirlik Notu:</strong> {
                    karsilastirmaAnalizi.oyuncu1Guvenilir && karsilastirmaAnalizi.oyuncu2Guvenilir 
                      ? 'Her iki oyuncu da yeterli süre oynadığı için istatistikler güvenilir.'
                      : karsilastirmaAnalizi.sureUyarisi
                  }
                </p>

                <div className="mt-4 bg-indigo-50 p-3 rounded-lg">
                  <p className="text-indigo-800 font-medium">Öne Çıkan Performans Alanları:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-indigo-700 font-medium">{oyuncuIstatistikleri.oyuncu_isim}:</p>
                      <ul className="text-indigo-600 text-xs space-y-1">
                        {safeNumber(oyuncuIstatistikleri.golMB) > safeNumber(karsilastirmaKanat.golMB) && <li>• Daha fazla gol</li>}
                        {safeNumber(oyuncuIstatistikleri.astbklntMB) > safeNumber(karsilastirmaKanat.astbklntMB) && <li>• Daha yüksek asist beklentisi</li>}
                        {safeNumber(oyuncuIstatistikleri.yrtclkEtknlk) > safeNumber(karsilastirmaKanat.yrtclkEtknlk) && <li>• Daha iyi yaratıcılık etkinliği</li>}
                        {safeNumber(oyuncuIstatistikleri.bsrldrplMB) > safeNumber(karsilastirmaKanat.bsrldrplMB) && <li>• Daha fazla başarılı dripling</li>}
                        {safeNumber(oyuncuIstatistikleri.isbtlsut_yzd) > safeNumber(karsilastirmaKanat.isbtlsut_yzd) && <li>• Daha yüksek şut isabeti</li>}
                        {safeNumber(oyuncuIstatistikleri.sprintMB) > safeNumber(karsilastirmaKanat.sprintMB) && <li>• Daha fazla sprint</li>}
                      </ul>
                    </div>
                    <div>
                      <p className="text-indigo-700 font-medium">{karsilastirmaKanat.oyuncu_isim}:</p>
                      <ul className="text-indigo-600 text-xs space-y-1">
                        {safeNumber(karsilastirmaKanat.golMB) > safeNumber(oyuncuIstatistikleri.golMB) && <li>• Daha fazla gol</li>}
                        {safeNumber(karsilastirmaKanat.astbklntMB) > safeNumber(oyuncuIstatistikleri.astbklntMB) && <li>• Daha yüksek asist beklentisi</li>}
                        {safeNumber(karsilastirmaKanat.yrtclkEtknlk) > safeNumber(oyuncuIstatistikleri.yrtclkEtknlk) && <li>• Daha iyi yaratıcılık etkinliği</li>}
                        {safeNumber(karsilastirmaKanat.bsrldrplMB) > safeNumber(oyuncuIstatistikleri.bsrldrplMB) && <li>• Daha fazla başarılı dripling</li>}
                        {safeNumber(karsilastirmaKanat.isbtlsut_yzd) > safeNumber(oyuncuIstatistikleri.isbtlsut_yzd) && <li>• Daha yüksek şut isabeti</li>}
                        {safeNumber(karsilastirmaKanat.sprintMB) > safeNumber(oyuncuIstatistikleri.sprintMB) && <li>• Daha fazla sprint</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Oyuncu Genel Bilgileri */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Oyuncu Fotoğrafı */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 relative">
                <Image
                  src={`/images/${oyuncuId}.png`}
                  alt={oyuncuIstatistikleri.oyuncu_isim}
                  fill
                  className="rounded-full object-cover"
                  onError={(e) => {
                    // Fotoğraf bulunamazsa placeholder göster
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-player.png';
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {oyuncuIstatistikleri.oyuncu_isim}
              </h2>
              <p className="text-gray-600 mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {oyuncuIstatistikleri.oyuncu_mevkii}
                </span>
              </p>
              <p className="text-gray-600">{oyuncuIstatistikleri.takim_adi}</p>
            </div>
          </div>

          {/* Temel İstatistikler */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Yaş:</span>
                <span className="font-semibold">{safeNumber(oyuncuIstatistikleri.oyuncu_yas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Oynanan Süre:</span>
                <span className="font-semibold">{safeNumber(oyuncuIstatistikleri.oyuncu_sure)}'</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Genel Sıra:</span>
                <span className="font-semibold">{safeNumber(oyuncuIstatistikleri.genel_sira)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Performans Skor Sırası:</span>
                <span className="font-semibold">{safeNumber(oyuncuIstatistikleri.performans_skor_sirasi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sürdürülebilirlik Sırası:</span>
                <span className="font-semibold">{safeNumber(oyuncuIstatistikleri.surdurabilirlik_sira)}</span>
              </div>
            </div>
          </div>

          {/* Performans Skoru */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performans Skoru</h3>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {safeToFixed(oyuncuIstatistikleri.performans_skoru)}
              </div>
              <p className="text-gray-600">Genel Performans</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(safeNumber(oyuncuIstatistikleri.performans_skoru) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistikler Karşılaştırması */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">İstatistik Karşılaştırması (Lig Ortalaması ile)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gol/Maç */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Gol/Maç</h4>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.golMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('golMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.golMB_katsayi)}/62
              </div>
            </div>

            {/* Asist Beklentisi */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Asist Beklentisi/Maç</h4>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.astbklntMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('astbklntMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.astbklntMB_katsayi)}/62
              </div>
            </div>

            {/* Yaratıcılık Etkinliği */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Yaratıcılık Etkinliği</h4>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.yrtclkEtknlk)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('yrtclkEtknlk').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.yrtclkEtknlk_katsayi)}/62
              </div>
            </div>

            {/* Sprint/Maç */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Sprint/Maç</h4>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.sprintMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('sprintMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.sprintMB_katsayi)}/62
              </div>
            </div>

            {/* Başarılı Dripling */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Başarılı Dripling/Maç</h4>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.bsrldrplMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('bsrldrplMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.bsrldrplMB_katsayi)}/62
              </div>
            </div>

            {/* İsabetli Şut % */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">İsabetli Şut %</h4>
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {safeNumber(oyuncuIstatistikleri.isbtlsut_yzd)}%
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('isbtlsut_yzd').toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.isbtlsut_yzd_katsayi)}/62
              </div>
            </div>

            {/* Penaltısız xG */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Penaltısız xG/Maç</h4>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.pnltszxgMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('pnltszxgMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.pnltszxgMB_katsayi)}/62
              </div>
            </div>

            {/* Yaratılan Gol Fırsatı */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Yaratılan Gol Fırsatı/Maç</h4>
              <div className="text-3xl font-bold text-pink-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.yrtglfrstMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('yrtglfrstMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.yrtglfrstMB_katsayi)}/62
              </div>
            </div>
          </div>
        </div>

        {/* Performans Grafikleri */}
        <div className="space-y-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900">Performans Grafikleri</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Genel Fiziksel İstatistik */}
            <ForvetFizikselChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 1}
              onToggleExpand={() => setExpandedChart(expandedChart === 1 ? null : 1)}
            />

            {/* Asist */}
            <ForvetAsistChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 2}
              onToggleExpand={() => setExpandedChart(expandedChart === 2 ? null : 2)}
            />

            {/* Orta */}
            <ForvetOrtaChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 3}
              onToggleExpand={() => setExpandedChart(expandedChart === 3 ? null : 3)}
            />

            {/* Hareketlilik */}
            <ForvetHareketlilikChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 4}
              onToggleExpand={() => setExpandedChart(expandedChart === 4 ? null : 4)}
            />

            {/* Pas */}
            <ForvetPasChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 5}
              onToggleExpand={() => setExpandedChart(expandedChart === 5 ? null : 5)}
            />

            {/* Hava Topu */}
            <ForvetHavaTopuChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 6}
              onToggleExpand={() => setExpandedChart(expandedChart === 6 ? null : 6)}
            />

            {/* Atılan Gol */}
            <ForvetAtilanGolChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 7}
              onToggleExpand={() => setExpandedChart(expandedChart === 7 ? null : 7)}
            />

            {/* Golcülük */}
            <ForvetGolculukChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 8}
              onToggleExpand={() => setExpandedChart(expandedChart === 8 ? null : 8)}
            />

            {/* Şut */}
            <ForvetSutChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 9}
              onToggleExpand={() => setExpandedChart(expandedChart === 9 ? null : 9)}
            />

            {/* Genel Hücum Beklentisi */}
            <ForvetGenelHucumBeklentisiChart 
              forvetData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 10}
              onToggleExpand={() => setExpandedChart(expandedChart === 10 ? null : 10)}
            />
          </div>
        </div>

        {/* Performans Yorumu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Performans Analizi</h3>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              <strong>{oyuncuIstatistikleri.oyuncu_isim}</strong> bu sezon {oyuncuIstatistikleri.takim_adi}{' '} 
              formasıyla {safeNumber(oyuncuIstatistikleri.oyuncu_sure)} dakika oynayarak ligdeki kanat oyuncuları arasında 
              <strong> {safeNumber(oyuncuIstatistikleri.genel_sira)}. sırada</strong> yer aldı.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Güçlü Yönleri</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  {safeNumber(oyuncuIstatistikleri.golMB) > hesaplaLigOrtalamasi('golMB') && (
                    <li>• Lig ortalamasının üzerinde gol üretimi</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.astbklntMB) > hesaplaLigOrtalamasi('astbklntMB') && (
                    <li>• Yüksek asist beklentisi</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.yrtclkEtknlk) > hesaplaLigOrtalamasi('yrtclkEtknlk') && (
                    <li>• Üstün yaratıcılık etkinliği</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.sprintMB) > hesaplaLigOrtalamasi('sprintMB') && (
                    <li>• Yüksek sprint kapasitesi</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.bsrldrplMB) > hesaplaLigOrtalamasi('bsrldrplMB') && (
                    <li>• Başarılı bireysel aksiyonlar</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) <= 15 && (
                    <li>• Üst sıralarda performans skoru</li>
                  )}
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Gelişim Alanları</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {safeNumber(oyuncuIstatistikleri.golMB) < hesaplaLigOrtalamasi('golMB') && (
                    <li>• Gol üretimini artırmalı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.astbklntMB) < hesaplaLigOrtalamasi('astbklntMB') && (
                    <li>• Asist katkısını geliştirmeli</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.isbtlsut_yzd) < hesaplaLigOrtalamasi('isbtlsut_yzd') && (
                    <li>• Şut isabetini artırmalı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.yrtglfrstMB) < hesaplaLigOrtalamasi('yrtglfrstMB') && (
                    <li>• Daha fazla gol fırsatı yaratmalı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) > 45 && (
                    <li>• Genel performans skoru düşük</li>
                  )}
                </ul>
              </div>
            </div>

            <p>
              Performans skoru <strong>{safeToFixed(oyuncuIstatistikleri.performans_skoru)}</strong> ile 
              62 kanat oyuncusu arasında <strong>{safeNumber(oyuncuIstatistikleri.performans_skor_sirasi)}. sırada</strong> bulunuyor.
              {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) <= 15 && 
                " Bu skör, oyuncunun ligdeki en iyi kanat oyuncuları arasında yer aldığını gösteriyor."
              }
              {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) > 45 && 
                " Performansını artırmak için daha fazla çalışma gerekebilir."
              }
            </p>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Sezon Özeti</h4>
              <p className="text-sm text-blue-700">
                Bu sezon maç başına <strong>{safeToFixed(oyuncuIstatistikleri.golMB)} gol</strong> ve 
                <strong> {safeToFixed(oyuncuIstatistikleri.astbklntMB)} asist beklentisi</strong> üretmiştir.
                Toplamda <strong>{safeNumber(oyuncuIstatistikleri.toplamsut)} şut</strong> çeken oyuncu, 
                yaratıcılık etkinliği <strong>{safeToFixed(oyuncuIstatistikleri.yrtclkEtknlk)}</strong> ve 
                sprint performansı ile <strong>{safeNumber(oyuncuIstatistikleri.sprintMB_katsayi)}. sırada</strong> yer alıyor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 