'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';

// Chart bileşenlerini import et
import DefansSavunmaChart from '@/components/charts/DefansSavunmaChart';
import DefansFizikselChart from '@/components/charts/DefansFizikselChart';
import DefansAsistChart from '@/components/charts/DefansAsistChart';
import DefansOrtaChart from '@/components/charts/DefansOrtaChart';
import DefansHareketlilikChart from '@/components/charts/DefansHareketlilikChart';
import DefansPasChart from '@/components/charts/DefansPasChart';
import DefansTopaSahipOlmaChart from '@/components/charts/DefansTopaSahipOlmaChart';
import DefansHavaTopuChart from '@/components/charts/DefansHavaTopuChart';

// Stoper istatistik veri tipi
interface StoperIstatistik {
  anhtmudMB: number;
  anhtmudMB_katsayi: number;
  blabla_stp: number;
  bloklamaMB: number;
  bloklamaMB_katsayi: number;
  bsrmudMB: number;
  englsutMB: number;
  englsutMB_katsayi: number;
  genel_sira: number;
  kalite_sira_katsayi: number;
  kznht_yzd: number;
  kznht_yzd_katsayi: number;
  kznTopMB: number;
  kznTopMB_katsayi: number;
  mdhle_yzd_katsayi: number;
  oyuncu_id: number;
  oyuncu_isim: string;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yan_mevkii: string;
  oyuncu_yas: number;
  performans_skoru: number;
  performans_skor_sirasi: number;
  surdurabilirlik_sira: number;
  takim_adi: string;
  takim_id: number;
  topkesMB: number;
  topkesMB_katsayi: number;
  topkpm_yzd: number;
  topmdhMB: number;
  uzklstrmaMB: number;
  uzklstrmaMB_katsayi: number;
}

// Defans grafik veri tipi
interface DefansGrafik {
  'Ao-Io%': number;
  bnzrsz_def: number;
  'Drp/90': number;
  'Eng/90': number;
  'HtmG/90': number;
  'Hv%': number;
  'KazanTop/90': number;
  'Mesf/90': number;
  'OrtGrsm/90': number;
  oyuncu_id: number;
  oyuncu_isim: string;
  'Pas%': number;
  'PsG/90': number;
  'SPasi/90': number;
  'Sprint/90': number;
  takim_adi: string;
  takim_id: number;
  'TopKyb/90': number;
  'Uzk/90': number;
  'xA/90': number;
}



export default function StoperDetayPage() {
  const params = useParams();
  const oyuncuId = params.oyuncu_id as string;
  
  const [oyuncuIstatistikleri, setOyuncuIstatistikleri] = useState<StoperIstatistik | null>(null);
  const [oyuncuGrafik, setOyuncuGrafik] = useState<DefansGrafik | null>(null);
  const [tumStoperler, setTumStoperler] = useState<StoperIstatistik[]>([]);
  const [tumGrafikler, setTumGrafikler] = useState<DefansGrafik[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<number | null>(null);
  // Karşılaştırma için yeni state'ler
  const [karsilastirmaStoper, setKarsilastirmaStoper] = useState<StoperIstatistik | null>(null);
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
          fetch(`/api/stoper-istatistik?oyuncu_id=${oyuncuId}`),
          fetch(`/api/defanslar-grafik?oyuncu_id=${oyuncuId}`)
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

        // Tüm stoper verileri (karşılaştırma için)
        const [tumIstatistikResponse, tumGrafikResponse] = await Promise.all([
          fetch('/api/stoper-istatistik'),
          fetch('/api/defanslar-grafik')
        ]);

        const [tumIstatistikResult, tumGrafikResult] = await Promise.all([
          tumIstatistikResponse.json(),
          tumGrafikResponse.json()
        ]);

        if (tumIstatistikResult.success) {
          setTumStoperler(tumIstatistikResult.data);
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
  const hesaplaLigOrtalamasi = (alan: keyof StoperIstatistik): number => {
    if (tumStoperler.length === 0) return 0;
    
    const alanAdi = alan as string;
    if (alanAdi.endsWith('_katsayi') || alanAdi === 'performans_skoru') {
      return 0; // Bu alanlar için ortalama hesaplanmaz
    }

    const toplam = tumStoperler.reduce((acc, stoper) => {
      const deger = stoper[alan];
      return acc + safeNumber(deger);
    }, 0);

    return toplam / tumStoperler.length;
  };

  // Karşılaştırılabilir stoperler (sadece D (M))
  const karsilastirabilirStoperler = useMemo(() => {
    return tumStoperler.filter(stoper => 
      stoper.oyuncu_mevkii === 'D (M)' &&
      stoper.oyuncu_id.toString() !== oyuncuId
    );
  }, [tumStoperler, oyuncuId]);

  // Karşılaştırma stoper oyuncusu seçme fonksiyonu
  const karsilastirmaStoperSec = (stoper: StoperIstatistik) => {
    setKarsilastirmaStoper(stoper);
    setKarsilastirmaAcik(true);
  };

  // Karşılaştırma analizi yapma fonksiyonu
  const karsilastirmaAnalizi = useMemo(() => {
    if (!oyuncuIstatistikleri || !karsilastirmaStoper) return null;

    const oyuncu1 = oyuncuIstatistikleri;
    const oyuncu2 = karsilastirmaStoper;

    // Süre faktörü (minimum 500 dakika oynayanlar için güvenilir veri)
    const oyuncu1Guvenilir = safeNumber(oyuncu1.oyuncu_sure) >= 500;
    const oyuncu2Guvenilir = safeNumber(oyuncu2.oyuncu_sure) >= 500;

    // Performans karşılaştırması
    const karsilastirmalar = [
      {
        kategori: 'Kazanılan Top',
        oyuncu1Deger: safeNumber(oyuncu1.kznTopMB),
        oyuncu2Deger: safeNumber(oyuncu2.kznTopMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Top Kesme',
        oyuncu1Deger: safeNumber(oyuncu1.topkesMB),
        oyuncu2Deger: safeNumber(oyuncu2.topkesMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Blok',
        oyuncu1Deger: safeNumber(oyuncu1.bloklamaMB),
        oyuncu2Deger: safeNumber(oyuncu2.bloklamaMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Şut Engelleme',
        oyuncu1Deger: safeNumber(oyuncu1.englsutMB),
        oyuncu2Deger: safeNumber(oyuncu2.englsutMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Uzaklaştırma',
        oyuncu1Deger: safeNumber(oyuncu1.uzklstrmaMB),
        oyuncu2Deger: safeNumber(oyuncu2.uzklstrmaMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Kazanılan Hava Topu %',
        oyuncu1Deger: safeNumber(oyuncu1.kznht_yzd),
        oyuncu2Deger: safeNumber(oyuncu2.kznht_yzd),
        birim: '%',
        yuksekIyi: true
      },
      {
        kategori: 'Anahtar Müdahale',
        oyuncu1Deger: safeNumber(oyuncu1.anhtmudMB),
        oyuncu2Deger: safeNumber(oyuncu2.anhtmudMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Top Müdahale %',
        oyuncu1Deger: safeNumber(oyuncu1.topkpm_yzd),
        oyuncu2Deger: safeNumber(oyuncu2.topkpm_yzd),
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
      oyuncu2Guvenilir
    };
  }, [oyuncuIstatistikleri, karsilastirmaStoper]);



  if (yukleniyor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
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
          <p className="text-xl text-gray-600">Stoper Performans Raporu</p>
        </div>

        {/* Stoper Karşılaştırma Seçimi */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Stoper Oyuncusu Karşılaştırması</h3>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-gray-700 font-medium">Karşılaştırılacak stoper oyuncusu:</label>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              onChange={(e) => {
                const secilenStoper = karsilastirabilirStoperler.find(s => s.oyuncu_id.toString() === e.target.value);
                if (secilenStoper) {
                  karsilastirmaStoperSec(secilenStoper);
                }
              }}
              value={karsilastirmaStoper?.oyuncu_id || ''}
            >
              <option value="">Stoper oyuncusu seçin...</option>
              {karsilastirabilirStoperler
                .sort((a, b) => a.oyuncu_isim.localeCompare(b.oyuncu_isim))
                .map(stoper => (
                  <option key={stoper.oyuncu_id} value={stoper.oyuncu_id}>
                    {stoper.oyuncu_isim} ({stoper.takim_adi})
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
            * Sadece "D (M)" mevkiindeki oyuncular karşılaştırılabilir
          </div>
        </div>

        {/* Karşılaştırma Tablosu */}
        {karsilastirmaAcik && karsilastirmaStoper && karsilastirmaAnalizi && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Stoper Oyuncusu Karşılaştırması</h3>
            
            {/* Süre Uyarısı */}
            {karsilastirmaAnalizi.sureUyarisi && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <p className="text-yellow-800 text-sm">{karsilastirmaAnalizi.sureUyarisi}</p>
                </div>
              </div>
            )}

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
                      {karsilastirmaStoper.oyuncu_isim}
                      <div className="text-xs text-gray-400 normal-case">
                        {safeNumber(karsilastirmaStoper.oyuncu_sure)}' oynadı
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
                        kazanan = karsilastirmaStoper.oyuncu_isim;
                        oyuncu2Kazandi = true;
                      } else {
                        kazanan = 'Eşit';
                      }
                    } else {
                      if (karsilastirma.oyuncu1Deger < karsilastirma.oyuncu2Deger) {
                        kazanan = oyuncuIstatistikleri.oyuncu_isim;
                        oyuncu1Kazandi = true;
                      } else if (karsilastirma.oyuncu2Deger < karsilastirma.oyuncu1Deger) {
                        kazanan = karsilastirmaStoper.oyuncu_isim;
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
                      safeNumber(oyuncuIstatistikleri.performans_skoru) > safeNumber(karsilastirmaStoper.performans_skoru) 
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeToFixed(oyuncuIstatistikleri.performans_skoru)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(karsilastirmaStoper.performans_skoru) > safeNumber(oyuncuIstatistikleri.performans_skoru)
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeToFixed(karsilastirmaStoper.performans_skoru)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">
                      {safeNumber(oyuncuIstatistikleri.performans_skoru) > safeNumber(karsilastirmaStoper.performans_skoru) ? (
                        <span className="text-green-600">🏆</span>
                      ) : safeNumber(karsilastirmaStoper.performans_skoru) > safeNumber(oyuncuIstatistikleri.performans_skoru) ? (
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
                      safeNumber(oyuncuIstatistikleri.genel_sira) < safeNumber(karsilastirmaStoper.genel_sira) 
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeNumber(oyuncuIstatistikleri.genel_sira)}. sıra
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(karsilastirmaStoper.genel_sira) < safeNumber(oyuncuIstatistikleri.genel_sira)
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeNumber(karsilastirmaStoper.genel_sira)}. sıra
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">
                      {safeNumber(oyuncuIstatistikleri.genel_sira) < safeNumber(karsilastirmaStoper.genel_sira) ? (
                        <span className="text-green-600">🏆</span>
                      ) : safeNumber(karsilastirmaStoper.genel_sira) < safeNumber(oyuncuIstatistikleri.genel_sira) ? (
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
                  {oyuncuIstatistikleri.oyuncu_isim} vs {karsilastirmaStoper.oyuncu_isim}
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
                  {karsilastirmaStoper.oyuncu_isim} {safeNumber(karsilastirmaStoper.oyuncu_sure)} dakika oynadı.
                </p>
                
                {karsilastirmaAnalizi.oyuncu1Skor > karsilastirmaAnalizi.oyuncu2Skor ? (
                  <p>
                    <strong>{oyuncuIstatistikleri.oyuncu_isim}</strong> özellikle savunma müdahaleleri, top kazanma ve hava topu mücadelesinde{' '} 
                    {karsilastirmaStoper.oyuncu_isim}'den daha başarılı. Bu oyuncu takım için daha güvenilir bir stoper seçenek olabilir.
                  </p>
                ) : karsilastirmaAnalizi.oyuncu2Skor > karsilastirmaAnalizi.oyuncu1Skor ? (
                  <p>
                    <strong>{karsilastirmaStoper.oyuncu_isim}</strong> genel performans değerlendirmesinde 
                    {oyuncuIstatistikleri.oyuncu_isim}'den daha iyi sonuçlar elde etmiş. Transfer veya kadro planlamasında 
                    bu oyuncu öncelikli seçenek olabilir.
                  </p>
                ) : (
                  <p>
                    Her iki oyuncu da benzer seviyede performans gösteriyor. Seçim yaparken takım oyun tarzı, yaş faktörü ve 
                    potansiyel gelişim alanları dikkate alınabilir.
                  </p>
                )}

                <p>
                  <strong>Güvenilirlik Notu:</strong> {
                    karsilastirmaAnalizi.oyuncu1Guvenilir && karsilastirmaAnalizi.oyuncu2Guvenilir 
                      ? 'Her iki oyuncu da yeterli süre oynadığı için istatistikler güvenilir.'
                      : karsilastirmaAnalizi.sureUyarisi
                  }
                </p>

                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 font-medium">Öne Çıkan Performans Alanları:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-blue-700 font-medium">{oyuncuIstatistikleri.oyuncu_isim}:</p>
                      <ul className="text-blue-600 text-xs space-y-1">
                        {safeNumber(oyuncuIstatistikleri.kznTopMB) > safeNumber(karsilastirmaStoper.kznTopMB) && <li>• Daha fazla kazanılan top</li>}
                        {safeNumber(oyuncuIstatistikleri.topkesMB) > safeNumber(karsilastirmaStoper.topkesMB) && <li>• Daha fazla top kesme</li>}
                        {safeNumber(oyuncuIstatistikleri.bloklamaMB) > safeNumber(karsilastirmaStoper.bloklamaMB) && <li>• Daha fazla blok</li>}
                        {safeNumber(oyuncuIstatistikleri.englsutMB) > safeNumber(karsilastirmaStoper.englsutMB) && <li>• Daha fazla şut engelleme</li>}
                        {safeNumber(oyuncuIstatistikleri.kznht_yzd) > safeNumber(karsilastirmaStoper.kznht_yzd) && <li>• Daha yüksek hava topu %</li>}
                        {safeNumber(oyuncuIstatistikleri.anhtmudMB) > safeNumber(karsilastirmaStoper.anhtmudMB) && <li>• Daha fazla anahtar müdahale</li>}
                      </ul>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">{karsilastirmaStoper.oyuncu_isim}:</p>
                      <ul className="text-blue-600 text-xs space-y-1">
                        {safeNumber(karsilastirmaStoper.kznTopMB) > safeNumber(oyuncuIstatistikleri.kznTopMB) && <li>• Daha fazla kazanılan top</li>}
                        {safeNumber(karsilastirmaStoper.topkesMB) > safeNumber(oyuncuIstatistikleri.topkesMB) && <li>• Daha fazla top kesme</li>}
                        {safeNumber(karsilastirmaStoper.bloklamaMB) > safeNumber(oyuncuIstatistikleri.bloklamaMB) && <li>• Daha fazla blok</li>}
                        {safeNumber(karsilastirmaStoper.englsutMB) > safeNumber(oyuncuIstatistikleri.englsutMB) && <li>• Daha fazla şut engelleme</li>}
                        {safeNumber(karsilastirmaStoper.kznht_yzd) > safeNumber(oyuncuIstatistikleri.kznht_yzd) && <li>• Daha yüksek hava topu %</li>}
                        {safeNumber(karsilastirmaStoper.anhtmudMB) > safeNumber(oyuncuIstatistikleri.anhtmudMB) && <li>• Daha fazla anahtar müdahale</li>}
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
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
              <div className="text-5xl font-bold text-gray-600 mb-2">
                {safeToFixed(oyuncuIstatistikleri.performans_skoru)}
              </div>
              <p className="text-gray-600">Genel Performans</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
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
            {/* Kazanılan Top */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Kazanılan Top/Maç</h4>
              <div className="text-3xl font-bold text-gray-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.kznTopMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('kznTopMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.kznTopMB_katsayi)}/58
              </div>
            </div>

            {/* Top Kesme */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Top Kesme/Maç</h4>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.topkesMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('topkesMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.topkesMB_katsayi)}/58
              </div>
            </div>

            {/* Blok */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Blok/Maç</h4>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.bloklamaMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('bloklamaMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.bloklamaMB_katsayi)}/58
              </div>
            </div>

            {/* Şut Engelleme */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Şut Engelleme/Maç</h4>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.englsutMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('englsutMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.englsutMB_katsayi)}/58
              </div>
            </div>

            {/* Uzaklaştırma */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Uzaklaştırma/Maç</h4>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.uzklstrmaMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('uzklstrmaMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.uzklstrmaMB_katsayi)}/58
              </div>
            </div>

            {/* Kazanılan Hava Topu % */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Kazanılan Hava Topu %</h4>
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {safeNumber(oyuncuIstatistikleri.kznht_yzd)}%
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('kznht_yzd').toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.kznht_yzd_katsayi)}/58
              </div>
            </div>

            {/* Anahtar Müdahale */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Anahtar Müdahale/Maç</h4>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.anhtmudMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('anhtmudMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.anhtmudMB_katsayi)}/58
              </div>
            </div>

            {/* Top Müdahale */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Top Müdahale/Maç</h4>
              <div className="text-3xl font-bold text-pink-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.topmdhMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('topmdhMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Müdahale Yüzdesi: {safeNumber(oyuncuIstatistikleri.topkpm_yzd)}%
              </div>
            </div>
          </div>
        </div>

        {/* Performans Grafikleri */}
        <div className="space-y-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900">Performans Grafikleri</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Savunma */}
            <DefansSavunmaChart 
              defansData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 1}
              onToggleExpand={() => setExpandedChart(expandedChart === 1 ? null : 1)}
            />

            {/* Genel Fiziksel İstatistik */}
            <DefansFizikselChart 
              defansData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 2}
              onToggleExpand={() => setExpandedChart(expandedChart === 2 ? null : 2)}
            />

            {/* Asist */}
            <DefansAsistChart 
              defansData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 3}
              onToggleExpand={() => setExpandedChart(expandedChart === 3 ? null : 3)}
            />

            {/* Orta */}
            <DefansOrtaChart 
              defansData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 4}
              onToggleExpand={() => setExpandedChart(expandedChart === 4 ? null : 4)}
            />

            {/* Hareketlilik */}
            <DefansHareketlilikChart 
              defansData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 5}
              onToggleExpand={() => setExpandedChart(expandedChart === 5 ? null : 5)}
            />

            {/* Pas */}
            <DefansPasChart 
              defansData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 6}
              onToggleExpand={() => setExpandedChart(expandedChart === 6 ? null : 6)}
            />

            {/* Topa Sahip Olma */}
            <DefansTopaSahipOlmaChart 
              defansData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 7}
              onToggleExpand={() => setExpandedChart(expandedChart === 7 ? null : 7)}
            />

            {/* Hava Topu */}
            <DefansHavaTopuChart 
              defansData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 8}
              onToggleExpand={() => setExpandedChart(expandedChart === 8 ? null : 8)}
            />
          </div>
        </div>

        {/* Performans Yorumu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Performans Analizi</h3>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              <strong>{oyuncuIstatistikleri.oyuncu_isim}</strong> bu sezon {oyuncuIstatistikleri.takim_adi}{' '}
              formasıyla {safeNumber(oyuncuIstatistikleri.oyuncu_sure)} dakika oynayarak ligdeki stoper oyuncuları arasında 
              <strong> {safeNumber(oyuncuIstatistikleri.genel_sira)}. sırada</strong> yer aldı.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Güçlü Yönleri</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {safeNumber(oyuncuIstatistikleri.kznTopMB) > hesaplaLigOrtalamasi('kznTopMB') && (
                    <li>• Lig ortalamasının üzerinde top kazanma</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.topkesMB) > hesaplaLigOrtalamasi('topkesMB') && (
                    <li>• Yüksek top kesme kapasitesi</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.bloklamaMB) > hesaplaLigOrtalamasi('bloklamaMB') && (
                    <li>• Etkili blok performansı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.englsutMB) > hesaplaLigOrtalamasi('englsutMB') && (
                    <li>• Yüksek şut engelleme</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.uzklstrmaMB) > hesaplaLigOrtalamasi('uzklstrmaMB') && (
                    <li>• İyi uzaklaştırma performansı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.kznht_yzd) > hesaplaLigOrtalamasi('kznht_yzd') && (
                    <li>• Yüksek hava topu başarısı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) <= 15 && (
                    <li>• Üst sıralarda performans skoru</li>
                  )}
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Gelişim Alanları</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {safeNumber(oyuncuIstatistikleri.kznTopMB) < hesaplaLigOrtalamasi('kznTopMB') && (
                    <li>• Top kazanma sayısını artırmalı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.bloklamaMB) < hesaplaLigOrtalamasi('bloklamaMB') && (
                    <li>• Blok performansını geliştirmeli</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.englsutMB) < hesaplaLigOrtalamasi('englsutMB') && (
                    <li>• Şut engelleme sayısını artırmalı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.kznht_yzd) < hesaplaLigOrtalamasi('kznht_yzd') && (
                    <li>• Hava topu mücadelesini geliştirmeli</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) > 40 && (
                    <li>• Genel performans skoru düşük</li>
                  )}
                </ul>
              </div>
            </div>

            <p>
              Performans skoru <strong>{safeToFixed(oyuncuIstatistikleri.performans_skoru)}</strong> ile 
              58 stoper oyuncusu arasında <strong>{safeNumber(oyuncuIstatistikleri.performans_skor_sirasi)}. sırada</strong> bulunuyor.
              {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) <= 15 && 
                " Bu skör, oyuncunun ligdeki en iyi stoper oyuncuları arasında yer aldığını gösteriyor."
              }
              {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) > 40 && 
                " Performansını artırmak için daha fazla çalışma gerekebilir."
              }
            </p>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Sezon Özeti</h4>
              <p className="text-sm text-blue-700">
                Bu sezon maç başına <strong>{safeToFixed(oyuncuIstatistikleri.kznTopMB)} kazanılan top</strong> ve 
                <strong> {safeToFixed(oyuncuIstatistikleri.topkesMB)} top kesme</strong> ile takımının savunma hattının temelini oluşturmuştur.
                <strong> {safeToFixed(oyuncuIstatistikleri.bloklamaMB)} blok</strong> ve 
                <strong> {safeToFixed(oyuncuIstatistikleri.englsutMB)} şut engelleme</strong> ile kalenin korunmasına katkı sağlamıştır.
                Hava toplarında <strong>%{safeNumber(oyuncuIstatistikleri.kznht_yzd)}</strong> başarı oranı ile güçlü bir görüntü sergilemiştir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 