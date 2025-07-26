'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import KaleciKalecilikChart from '@/components/charts/KaleciKalecilikChart';
import KaleciDetayliIstatistikChart from '@/components/charts/KaleciDetayliIstatistikChart';
import KaleciPasChart from '@/components/charts/KaleciPasChart';

// Kaleci istatistik veri tipi
interface KaleciIstatistik {
  blabla: number;
  bklnKrtrs_katsayi: number;
  bklnKrtrs_yzd: number;
  englxgMB: number;
  englxgMB_katsayi: number;
  genel_sira: number;
  isbtPas_katsayi: number;
  isbtPas_yzd: number;
  kalite_sira_katsayi: number;
  kurtaris_katsayi: number;
  kurtaris_yzd: number;
  oyuncu_id: number;
  oyuncu_isim: string;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yas: number;
  performans_skoru: number;
  performans_skor_sirasi: number;
  sürdürülebilirlik_sira: number;
  takim_adi: string;
  takim_id: number;
  ynlgolMB: number;
  ynlgolMB_katsayi: number;
}

// Kaleci grafik veri tipi
interface KaleciGrafik {
  bnzrsz_gk: number;
  englxG: number;
  kurtarisMb: number;
  oyuncu_id: number;
  oyuncu_isim: string;
  pasdnmeMb: number;
  takim_adi: string;
  takim_id: number;
}



export default function KaleciDetayPage() {
  const params = useParams();
  const oyuncuId = params.oyuncu_id as string;
  
  const [oyuncuIstatistikleri, setOyuncuIstatistikleri] = useState<KaleciIstatistik | null>(null);
  const [oyuncuGrafik, setOyuncuGrafik] = useState<KaleciGrafik | null>(null);
  const [tumKaleciler, setTumKaleciler] = useState<KaleciIstatistik[]>([]);
  const [tumGrafikler, setTumGrafikler] = useState<KaleciGrafik[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  // Karşılaştırma için yeni state'ler
  const [karsilastirmaKaleci, setKarsilastirmaKaleci] = useState<KaleciIstatistik | null>(null);
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
          fetch(`/api/kaleci-istatistik?oyuncu_id=${oyuncuId}`),
          fetch(`/api/kaleciler-grafik?oyuncu_id=${oyuncuId}`)
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

        // Tüm kaleci verileri (karşılaştırma için)
        const [tumIstatistikResponse, tumGrafikResponse] = await Promise.all([
          fetch('/api/kaleci-istatistik'),
          fetch('/api/kaleciler-grafik')
        ]);

        const [tumIstatistikResult, tumGrafikResult] = await Promise.all([
          tumIstatistikResponse.json(),
          tumGrafikResponse.json()
        ]);

        if (tumIstatistikResult.success) {
          setTumKaleciler(tumIstatistikResult.data);
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
  const hesaplaLigOrtalamasi = (alan: keyof KaleciIstatistik): number => {
    if (tumKaleciler.length === 0) return 0;
    
    const alanAdi = alan as string;
    if (alanAdi.endsWith('_katsayi') || alanAdi === 'performans_skoru') {
      return 0; // Bu alanlar için ortalama hesaplanmaz
    }

    const toplam = tumKaleciler.reduce((acc, kaleci) => {
      const deger = kaleci[alan];
      return acc + safeNumber(deger);
    }, 0);

    return toplam / tumKaleciler.length;
  };

  // Karşılaştırma kalecisi seçme fonksiyonu
  const karsilastirmaKalecisiSec = (kaleci: KaleciIstatistik) => {
    setKarsilastirmaKaleci(kaleci);
    setKarsilastirmaAcik(true);
  };

  // Karşılaştırma analizi yapma fonksiyonu
  const karsilastirmaAnalizi = useMemo(() => {
    if (!oyuncuIstatistikleri || !karsilastirmaKaleci) return null;

    const oyuncu1 = oyuncuIstatistikleri;
    const oyuncu2 = karsilastirmaKaleci;

    // Süre faktörü (minimum 500 dakika oynayanlar için güvenilir veri)
    const oyuncu1Guvenilir = safeNumber(oyuncu1.oyuncu_sure) >= 500;
    const oyuncu2Guvenilir = safeNumber(oyuncu2.oyuncu_sure) >= 500;

    // Performans karşılaştırması
    const karsilastirmalar = [
      {
        kategori: 'Kurtarış Performansı',
        oyuncu1Deger: safeNumber(oyuncu1.kurtaris_yzd),
        oyuncu2Deger: safeNumber(oyuncu2.kurtaris_yzd),
        birim: '%',
        yuksekIyi: true
      },
      {
        kategori: 'Pas Kalitesi',
        oyuncu1Deger: safeNumber(oyuncu1.isbtPas_yzd),
        oyuncu2Deger: safeNumber(oyuncu2.isbtPas_yzd),
        birim: '%',
        yuksekIyi: true
      },
      {
        kategori: 'Engellenen xG',
        oyuncu1Deger: safeNumber(oyuncu1.englxgMB),
        oyuncu2Deger: safeNumber(oyuncu2.englxgMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Yenilen Gol',
        oyuncu1Deger: safeNumber(oyuncu1.ynlgolMB),
        oyuncu2Deger: safeNumber(oyuncu2.ynlgolMB),
        birim: '/maç',
        yuksekIyi: false
      },
      {
        kategori: 'Beklenen Kurtarış',
        oyuncu1Deger: safeNumber(oyuncu1.bklnKrtrs_yzd),
        oyuncu2Deger: safeNumber(oyuncu2.bklnKrtrs_yzd),
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
      sonuc = 'İki kaleci de benzer performans gösteriyor';
      tercih = 'Eşit';
    }

    // Süre faktörü uyarısı
    let sureUyarisi = '';
    if (!oyuncu1Guvenilir && !oyuncu2Guvenilir) {
      sureUyarisi = 'Her iki kaleci de az süre oynadığı için istatistikler yanıltıcı olabilir.';
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
  }, [oyuncuIstatistikleri, karsilastirmaKaleci]);

  // Kaleci grafik verilerini hazırla (chart bileşenleri için)
  const kaleciGrafikVerileri = useMemo(() => {
    return tumGrafikler.map(grafik => {
      // İlgili kaleci istatistik verisini bul
      const istatistik = tumKaleciler.find(k => k.oyuncu_id === grafik.oyuncu_id);
      
      return {
        bnzrsz_gk: grafik.bnzrsz_gk,
        oyuncu_isim: grafik.oyuncu_isim,
        oyuncu_id: grafik.oyuncu_id,
        kurtarisMb: grafik.kurtarisMb,
        kurtarisYzd: istatistik ? istatistik.kurtaris_yzd : 0,
        englxG: grafik.englxG,
        pasdnmeMb: grafik.pasdnmeMb,
        pasYzd: istatistik ? istatistik.isbtPas_yzd : 0
      };
    });
  }, [tumGrafikler, tumKaleciler]);

  if (yukleniyor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <p className="text-xl text-gray-600">Kaleci Performans Raporu</p>
        </div>

        {/* Kaleci Karşılaştırma Seçimi */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Kaleci Karşılaştırması</h3>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-gray-700 font-medium">Karşılaştırılacak kaleci:</label>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => {
                const secilenKaleci = tumKaleciler.find(k => k.oyuncu_id.toString() === e.target.value);
                if (secilenKaleci) {
                  karsilastirmaKalecisiSec(secilenKaleci);
                }
              }}
              value={karsilastirmaKaleci?.oyuncu_id || ''}
            >
              <option value="">Kaleci seçin...</option>
              {tumKaleciler
                .filter(kaleci => kaleci.oyuncu_id.toString() !== oyuncuId)
                .sort((a, b) => a.oyuncu_isim.localeCompare(b.oyuncu_isim))
                .map(kaleci => (
                  <option key={kaleci.oyuncu_id} value={kaleci.oyuncu_id}>
                    {kaleci.oyuncu_isim} ({kaleci.takim_adi})
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
        </div>

        {/* Karşılaştırma Tablosu */}
        {karsilastirmaAcik && karsilastirmaKaleci && karsilastirmaAnalizi && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Kaleci Karşılaştırması</h3>
            
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
                      {karsilastirmaKaleci.oyuncu_isim}
                      <div className="text-xs text-gray-400 normal-case">
                        {safeNumber(karsilastirmaKaleci.oyuncu_sure)}' oynadı
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
                        kazanan = karsilastirmaKaleci.oyuncu_isim;
                        oyuncu2Kazandi = true;
                      } else {
                        kazanan = 'Eşit';
                      }
                    } else {
                      if (karsilastirma.oyuncu1Deger < karsilastirma.oyuncu2Deger) {
                        kazanan = oyuncuIstatistikleri.oyuncu_isim;
                        oyuncu1Kazandi = true;
                      } else if (karsilastirma.oyuncu2Deger < karsilastirma.oyuncu1Deger) {
                        kazanan = karsilastirmaKaleci.oyuncu_isim;
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
                            <span className="text-blue-600">🏆</span>
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
                      safeNumber(oyuncuIstatistikleri.performans_skoru) > safeNumber(karsilastirmaKaleci.performans_skoru) 
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeToFixed(oyuncuIstatistikleri.performans_skoru)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(karsilastirmaKaleci.performans_skoru) > safeNumber(oyuncuIstatistikleri.performans_skoru)
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeToFixed(karsilastirmaKaleci.performans_skoru)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">
                      {safeNumber(oyuncuIstatistikleri.performans_skoru) > safeNumber(karsilastirmaKaleci.performans_skoru) ? (
                        <span className="text-green-600">🏆</span>
                      ) : safeNumber(karsilastirmaKaleci.performans_skoru) > safeNumber(oyuncuIstatistikleri.performans_skoru) ? (
                        <span className="text-blue-600">🏆</span>
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
                      safeNumber(oyuncuIstatistikleri.genel_sira) < safeNumber(karsilastirmaKaleci.genel_sira) 
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeNumber(oyuncuIstatistikleri.genel_sira)}. sıra
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(karsilastirmaKaleci.genel_sira) < safeNumber(oyuncuIstatistikleri.genel_sira)
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeNumber(karsilastirmaKaleci.genel_sira)}. sıra
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">
                      {safeNumber(oyuncuIstatistikleri.genel_sira) < safeNumber(karsilastirmaKaleci.genel_sira) ? (
                        <span className="text-green-600">🏆</span>
                      ) : safeNumber(karsilastirmaKaleci.genel_sira) < safeNumber(oyuncuIstatistikleri.genel_sira) ? (
                        <span className="text-blue-600">🏆</span>
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
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-blue-800 mb-2">Skor</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {karsilastirmaAnalizi.oyuncu1Skor} - {karsilastirmaAnalizi.oyuncu2Skor}
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {oyuncuIstatistikleri.oyuncu_isim} vs {karsilastirmaKaleci.oyuncu_isim}
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
                  {karsilastirmaKaleci.oyuncu_isim} {safeNumber(karsilastirmaKaleci.oyuncu_sure)} dakika oynadı.
                </p>
                
                {karsilastirmaAnalizi.oyuncu1Skor > karsilastirmaAnalizi.oyuncu2Skor ? (
                  <p>
                    <strong>{oyuncuIstatistikleri.oyuncu_isim}</strong> özellikle kurtarış performansı, pas kalitesi ve gol engelleme konularında{' '} 
                    {karsilastirmaKaleci.oyuncu_isim}'den daha başarılı. Bu kaleci takım için daha değerli bir seçenek olabilir.
                  </p>
                ) : karsilastirmaAnalizi.oyuncu2Skor > karsilastirmaAnalizi.oyuncu1Skor ? (
                  <p>
                    <strong>{karsilastirmaKaleci.oyuncu_isim}</strong> genel performans değerlendirmesinde 
                    {oyuncuIstatistikleri.oyuncu_isim}'den daha iyi sonuçlar elde etmiş. Transfer veya kadro planlamasında 
                    bu kaleci öncelikli seçenek olabilir.
                  </p>
                ) : (
                  <p>
                    Her iki kaleci de benzer seviyede performans gösteriyor. Seçim yaparken takım oyun tarzı, yaş faktörü ve 
                    potansiyel gelişim alanları dikkate alınabilir.
                  </p>
                )}

                <p>
                  <strong>Güvenilirlik Notu:</strong> {
                    karsilastirmaAnalizi.oyuncu1Guvenilir && karsilastirmaAnalizi.oyuncu2Guvenilir 
                      ? 'Her iki kaleci de yeterli süre oynadığı için istatistikler güvenilir.'
                      : karsilastirmaAnalizi.sureUyarisi
                  }
                </p>

                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 font-medium">Öne Çıkan Performans Alanları:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-blue-700 font-medium">{oyuncuIstatistikleri.oyuncu_isim}:</p>
                      <ul className="text-blue-600 text-xs space-y-1">
                        {safeNumber(oyuncuIstatistikleri.kurtaris_yzd) > safeNumber(karsilastirmaKaleci.kurtaris_yzd) && <li>• Daha yüksek kurtarış yüzdesi</li>}
                        {safeNumber(oyuncuIstatistikleri.isbtPas_yzd) > safeNumber(karsilastirmaKaleci.isbtPas_yzd) && <li>• Daha iyi pas kalitesi</li>}
                        {safeNumber(oyuncuIstatistikleri.englxgMB) > safeNumber(karsilastirmaKaleci.englxgMB) && <li>• Daha fazla engellenen xG</li>}
                        {safeNumber(oyuncuIstatistikleri.ynlgolMB) < safeNumber(karsilastirmaKaleci.ynlgolMB) && <li>• Daha az yenilen gol</li>}
                        {safeNumber(oyuncuIstatistikleri.bklnKrtrs_yzd) > safeNumber(karsilastirmaKaleci.bklnKrtrs_yzd) && <li>• Daha yüksek beklenen kurtarış</li>}
                      </ul>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">{karsilastirmaKaleci.oyuncu_isim}:</p>
                      <ul className="text-blue-600 text-xs space-y-1">
                        {safeNumber(karsilastirmaKaleci.kurtaris_yzd) > safeNumber(oyuncuIstatistikleri.kurtaris_yzd) && <li>• Daha yüksek kurtarış yüzdesi</li>}
                        {safeNumber(karsilastirmaKaleci.isbtPas_yzd) > safeNumber(oyuncuIstatistikleri.isbtPas_yzd) && <li>• Daha iyi pas kalitesi</li>}
                        {safeNumber(karsilastirmaKaleci.englxgMB) > safeNumber(oyuncuIstatistikleri.englxgMB) && <li>• Daha fazla engellenen xG</li>}
                        {safeNumber(karsilastirmaKaleci.ynlgolMB) < safeNumber(oyuncuIstatistikleri.ynlgolMB) && <li>• Daha az yenilen gol</li>}
                        {safeNumber(karsilastirmaKaleci.bklnKrtrs_yzd) > safeNumber(oyuncuIstatistikleri.bklnKrtrs_yzd) && <li>• Daha yüksek beklenen kurtarış</li>}
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
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
                <span className="font-semibold">{safeNumber(oyuncuIstatistikleri.sürdürülebilirlik_sira)}</span>
              </div>
            </div>
          </div>

          {/* Performans Skoru */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performans Skoru</h3>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {safeToFixed(oyuncuIstatistikleri.performans_skoru)}
              </div>
              <p className="text-gray-600">Genel Performans</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(safeNumber(oyuncuIstatistikleri.performans_skoru) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistikler Karşılaştırması */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">İstatistik Karşılaştırması (Lig Ortalaması ile)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kurtarış Yüzdesi */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Kurtarış %</h4>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {safeNumber(oyuncuIstatistikleri.kurtaris_yzd)}%
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('kurtaris_yzd').toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.kurtaris_katsayi)}/19
              </div>
            </div>

            {/* İsabetli Pas Yüzdesi */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">İsabetli Pas %</h4>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {safeNumber(oyuncuIstatistikleri.isbtPas_yzd)}%
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('isbtPas_yzd').toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.isbtPas_katsayi)}/19
              </div>
            </div>

            {/* Engellenen xG */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Engellenen xG/Maç</h4>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.englxgMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('englxgMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.englxgMB_katsayi)}/19
              </div>
            </div>

            {/* Yenilen Gol */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Yenilen Gol/Maç</h4>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.ynlgolMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('ynlgolMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.ynlgolMB_katsayi)}/19
              </div>
            </div>

            {/* Beklenen Kurtarışlar */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Beklenen Kurtarış %</h4>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {safeNumber(oyuncuIstatistikleri.bklnKrtrs_yzd)}%
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('bklnKrtrs_yzd').toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.bklnKrtrs_katsayi)}/19
              </div>
            </div>
          </div>
        </div>

        {/* Scatter Plot Grafikleri */}
        <div className="space-y-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900">Performans Grafikleri</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kalecilik Grafiği */}
            {kaleciGrafikVerileri.length > 0 && (
              <KaleciKalecilikChart
                kaleciData={kaleciGrafikVerileri}
                highlightedPlayerId={parseInt(oyuncuId)}
                title="Kalecilik-Kaleciler"
              />
            )}

            {/* Detaylı Kalecilik İstatistikleri */}
            {kaleciGrafikVerileri.length > 0 && (
              <KaleciDetayliIstatistikChart
                kaleciData={kaleciGrafikVerileri}
                highlightedPlayerId={parseInt(oyuncuId)}
                title="Detaylı Kalecilik İstatistikleri-Kaleciler"
              />
            )}

            {/* Pas Grafiği */}
            {kaleciGrafikVerileri.length > 0 && (
              <KaleciPasChart
                kaleciData={kaleciGrafikVerileri}
                highlightedPlayerId={parseInt(oyuncuId)}
                title="Pas-Kaleciler"
              />
            )}
          </div>
        </div>

        {/* Performans Yorumu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Performans Analizi</h3>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              <strong>{oyuncuIstatistikleri.oyuncu_isim}</strong> bu sezon {oyuncuIstatistikleri.takim_adi}{' '} 
              formasıyla {safeNumber(oyuncuIstatistikleri.oyuncu_sure)} dakika oynayarak ligdeki kaleciler arasında 
              <strong> {safeNumber(oyuncuIstatistikleri.genel_sira)}. sırada</strong> yer aldı.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Güçlü Yönleri</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {safeNumber(oyuncuIstatistikleri.kurtaris_yzd) > hesaplaLigOrtalamasi('kurtaris_yzd') && (
                    <li>• Lig ortalamasının üzerinde kurtarış yüzdesi</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.isbtPas_yzd) > hesaplaLigOrtalamasi('isbtPas_yzd') && (
                    <li>• Yüksek isabet oranında pas dağıtımı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.englxgMB) > hesaplaLigOrtalamasi('englxgMB') && (
                    <li>• Beklentinin üzerinde gol engelleme</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) <= 5 && (
                    <li>• Üst sıralarda performans skoru</li>
                  )}
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Gelişim Alanları</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {safeNumber(oyuncuIstatistikleri.kurtaris_yzd) < hesaplaLigOrtalamasi('kurtaris_yzd') && (
                    <li>• Kurtarış yüzdesini artırmalı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.isbtPas_yzd) < hesaplaLigOrtalamasi('isbtPas_yzd') && (
                    <li>• Pas isabeti geliştirilebilir</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.ynlgolMB) > hesaplaLigOrtalamasi('ynlgolMB') && (
                    <li>• Yenilen gol ortalaması yüksek</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) > 15 && (
                    <li>• Genel performans skoru düşük</li>
                  )}
                </ul>
              </div>
            </div>

            <p>
              Performans skoru <strong>{safeToFixed(oyuncuIstatistikleri.performans_skoru)}</strong> ile 
              19 kaleci arasında <strong>{safeNumber(oyuncuIstatistikleri.performans_skor_sirasi)}. sırada</strong> bulunuyor.
              {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) <= 6 && 
                " Bu skör, oyuncunun ligdeki en iyi kaleciler arasında yer aldığını gösteriyor."
              }
              {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) > 13 && 
                " Performansını artırmak için daha fazla çalışma gerekebilir."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 