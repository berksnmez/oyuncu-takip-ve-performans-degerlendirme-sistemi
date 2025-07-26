'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import Image from 'next/image';
import OrtaSahaSavunmaChart from '@/components/charts/ortasaha/OrtaSahaSavunmaChart';
import OrtaSahaFizikselChart from '@/components/charts/ortasaha/OrtaSahaFizikselChart';
import OrtaSahaAsistChart from '@/components/charts/ortasaha/OrtaSahaAsistChart';
import OrtaSahaOrtaChart from '@/components/charts/ortasaha/OrtaSahaOrtaChart';
import OrtaSahaGolculukChart from '@/components/charts/ortasaha/OrtaSahaGolculukChart';
import OrtaSahaPasChart from '@/components/charts/ortasaha/OrtaSahaPasChart';
import OrtaSahaPasSablonuChart from '@/components/charts/ortasaha/OrtaSahaPasSablonuChart';
import OrtaSahaTopaSahipOlmaChart from '@/components/charts/ortasaha/OrtaSahaTopaSahipOlmaChart';
import OrtaSahaHavaTopuChart from '@/components/charts/ortasaha/OrtaSahaHavaTopuChart';

// ChartJS kayıt işlemleri
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// DOS istatistik veri tipi
interface DOSIstatistik {
  anhtmudMB: number;
  anhtmudMB_katsayi: number;
  blabla_dos: number;
  bsrlpressMB: number;
  bsrlpressMB_katsayi: number;
  bsrltopmdhMB: number;
  bsrltopmdhMB_katsayi: number;
  genel_sira: number;
  isbtlpas_yzd: number;
  isbtlpas_yzd_katsayi: number;
  kalite_sira_katsayi: number;
  kosumsfMB: number;
  kosumsfMB_katsayi: number;
  kznTopMB: number;
  kznTopMB_katsayi: number;
  oyuncu_id: number;
  oyuncu_isim: string;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yan_mevkii: string;
  oyuncu_yas: number;
  performans_skoru: number;
  performans_skor_sirasi: number;
  surdurabilirlik_sira: number;
  sutengllmeMB: number;
  sutengllmeMB_katsayi: number;
  takim_adi: string;
  takim_id: number;
  topkpm_yzd: number;
  topksmeMB: number;
  topksmeMB_katsayi: number;
  topmdhMB: number;
}

// Orta saha grafik veri tipi
interface OrtasahaGrafik {
  'Ao-Io%': number;
  bnzrsz_os: number;
  'DikKltPas/90': number;
  'Eng/90': number;
  'Gol/90': number;
  'HtmG/90': number;
  'Hv%': number;
  'KazanTop/90': number;
  'Mesf/90': number;
  'OrtGrsm/90': number;
  oyuncu_id: number;
  oyuncu_isim: string;
  'Pas%': number;
  'PH-xG/90': number;
  'PsG/90': number;
  'SPasi/90': number;
  'Sprint/90': number;
  takim_adi: string;
  takim_id: number;
  'TopKyb/90': number;
  'Uzk/90': number;
  'xA/90': number;
}

// Nokta veri tipi
interface PointData {
  x: number;
  y: number;
  oyuncuIsim: string;
  oyuncu_id: number;
  type: string;
}

export default function DOSDetayPage() {
  const params = useParams();
  const oyuncuId = params.oyuncu_id as string;
  
  const [oyuncuIstatistikleri, setOyuncuIstatistikleri] = useState<DOSIstatistik | null>(null);
  const [oyuncuGrafik, setOyuncuGrafik] = useState<OrtasahaGrafik | null>(null);
  const [tumDOSlar, setTumDOSlar] = useState<DOSIstatistik[]>([]);
  const [tumGrafikler, setTumGrafikler] = useState<OrtasahaGrafik[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<number | null>(null);
  // Karşılaştırma için yeni state'ler
  const [karsilastirmaDOS, setKarsilastirmaDOS] = useState<DOSIstatistik | null>(null);
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
          fetch(`/api/dos-istatistik?oyuncu_id=${oyuncuId}`),
          fetch(`/api/ortasahalar-grafik?oyuncu_id=${oyuncuId}`)
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

        // Tüm DOS verileri (karşılaştırma için)
        const [tumIstatistikResponse, tumGrafikResponse] = await Promise.all([
          fetch('/api/dos-istatistik'),
          fetch('/api/ortasahalar-grafik')
        ]);

        const [tumIstatistikResult, tumGrafikResult] = await Promise.all([
          tumIstatistikResponse.json(),
          tumGrafikResponse.json()
        ]);

        if (tumIstatistikResult.success) {
          setTumDOSlar(tumIstatistikResult.data);
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
  const hesaplaLigOrtalamasi = (alan: keyof DOSIstatistik): number => {
    if (tumDOSlar.length === 0) return 0;
    
    const alanAdi = alan as string;
    if (alanAdi.endsWith('_katsayi') || alanAdi === 'performans_skoru') {
      return 0; // Bu alanlar için ortalama hesaplanmaz
    }

    const toplam = tumDOSlar.reduce((acc, dos) => {
      const deger = dos[alan];
      return acc + safeNumber(deger);
    }, 0);

    return toplam / tumDOSlar.length;
  };

  // Karşılaştırılabilir DOS oyuncuları (sadece DOS)
  const karsilastirabilirDOSlar = useMemo(() => {
    return tumDOSlar.filter(dos => 
      dos.oyuncu_mevkii === 'DOS' &&
      dos.oyuncu_id.toString() !== oyuncuId
    );
  }, [tumDOSlar, oyuncuId]);

  // Karşılaştırma DOS oyuncusu seçme fonksiyonu
  const karsilastirmaDOSSec = (dos: DOSIstatistik) => {
    setKarsilastirmaDOS(dos);
    setKarsilastirmaAcik(true);
  };

  // Karşılaştırma analizi yapma fonksiyonu
  const karsilastirmaAnalizi = useMemo(() => {
    if (!oyuncuIstatistikleri || !karsilastirmaDOS) return null;

    const oyuncu1 = oyuncuIstatistikleri;
    const oyuncu2 = karsilastirmaDOS;

    // Süre faktörü (minimum 500 dakika oynayanlar için güvenilir veri)
    const oyuncu1Guvenilir = safeNumber(oyuncu1.oyuncu_sure) >= 500;
    const oyuncu2Guvenilir = safeNumber(oyuncu2.oyuncu_sure) >= 500;

    // Performans karşılaştırması
    const karsilastirmalar = [
      {
        kategori: 'Başarılı Top Müdahalesi',
        oyuncu1Deger: safeNumber(oyuncu1.bsrltopmdhMB),
        oyuncu2Deger: safeNumber(oyuncu2.bsrltopmdhMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Kazanılan Top',
        oyuncu1Deger: safeNumber(oyuncu1.kznTopMB),
        oyuncu2Deger: safeNumber(oyuncu2.kznTopMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Başarılı Press',
        oyuncu1Deger: safeNumber(oyuncu1.bsrlpressMB),
        oyuncu2Deger: safeNumber(oyuncu2.bsrlpressMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'İsabetli Pas %',
        oyuncu1Deger: safeNumber(oyuncu1.isbtlpas_yzd),
        oyuncu2Deger: safeNumber(oyuncu2.isbtlpas_yzd),
        birim: '%',
        yuksekIyi: true
      },
      {
        kategori: 'Koşum Mesafesi',
        oyuncu1Deger: safeNumber(oyuncu1.kosumsfMB),
        oyuncu2Deger: safeNumber(oyuncu2.kosumsfMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Şut Engelleme',
        oyuncu1Deger: safeNumber(oyuncu1.sutengllmeMB),
        oyuncu2Deger: safeNumber(oyuncu2.sutengllmeMB),
        birim: '/maç',
        yuksekIyi: true
      },
      {
        kategori: 'Top Kesme',
        oyuncu1Deger: safeNumber(oyuncu1.topksmeMB),
        oyuncu2Deger: safeNumber(oyuncu2.topksmeMB),
        birim: '/maç',
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
        kategori: 'Top Kapma %',
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
  }, [oyuncuIstatistikleri, karsilastirmaDOS]);



  if (yukleniyor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
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
          <p className="text-xl text-gray-600">Defansif Orta Saha Performans Raporu</p>
        </div>

        {/* DOS Karşılaştırma Seçimi */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Defansif Orta Saha Oyuncusu Karşılaştırması</h3>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-gray-700 font-medium">Karşılaştırılacak DOS oyuncusu:</label>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              onChange={(e) => {
                const secilenDOS = karsilastirabilirDOSlar.find(d => d.oyuncu_id.toString() === e.target.value);
                if (secilenDOS) {
                  karsilastirmaDOSSec(secilenDOS);
                }
              }}
              value={karsilastirmaDOS?.oyuncu_id || ''}
            >
              <option value="">DOS oyuncusu seçin...</option>
              {karsilastirabilirDOSlar
                .sort((a, b) => a.oyuncu_isim.localeCompare(b.oyuncu_isim))
                .map(dos => (
                  <option key={dos.oyuncu_id} value={dos.oyuncu_id}>
                    {dos.oyuncu_isim} ({dos.takim_adi})
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
            * Sadece "DOS" mevkiindeki oyuncular karşılaştırılabilir
          </div>
        </div>

        {/* Karşılaştırma Tablosu */}
        {karsilastirmaAcik && karsilastirmaDOS && karsilastirmaAnalizi && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Defansif Orta Saha Oyuncusu Karşılaştırması</h3>
            
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
                      {karsilastirmaDOS.oyuncu_isim}
                      <div className="text-xs text-gray-400 normal-case">
                        {safeNumber(karsilastirmaDOS.oyuncu_sure)}' oynadı
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
                        kazanan = karsilastirmaDOS.oyuncu_isim;
                        oyuncu2Kazandi = true;
                      } else {
                        kazanan = 'Eşit';
                      }
                    } else {
                      if (karsilastirma.oyuncu1Deger < karsilastirma.oyuncu2Deger) {
                        kazanan = oyuncuIstatistikleri.oyuncu_isim;
                        oyuncu1Kazandi = true;
                      } else if (karsilastirma.oyuncu2Deger < karsilastirma.oyuncu1Deger) {
                        kazanan = karsilastirmaDOS.oyuncu_isim;
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
                      safeNumber(oyuncuIstatistikleri.performans_skoru) > safeNumber(karsilastirmaDOS.performans_skoru) 
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeToFixed(oyuncuIstatistikleri.performans_skoru)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(karsilastirmaDOS.performans_skoru) > safeNumber(oyuncuIstatistikleri.performans_skoru)
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeToFixed(karsilastirmaDOS.performans_skoru)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">
                      {safeNumber(oyuncuIstatistikleri.performans_skoru) > safeNumber(karsilastirmaDOS.performans_skoru) ? (
                        <span className="text-green-600">🏆</span>
                      ) : safeNumber(karsilastirmaDOS.performans_skoru) > safeNumber(oyuncuIstatistikleri.performans_skoru) ? (
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
                      safeNumber(oyuncuIstatistikleri.genel_sira) < safeNumber(karsilastirmaDOS.genel_sira) 
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeNumber(oyuncuIstatistikleri.genel_sira)}. sıra
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${
                      safeNumber(karsilastirmaDOS.genel_sira) < safeNumber(oyuncuIstatistikleri.genel_sira)
                        ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {safeNumber(karsilastirmaDOS.genel_sira)}. sıra
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">
                      {safeNumber(oyuncuIstatistikleri.genel_sira) < safeNumber(karsilastirmaDOS.genel_sira) ? (
                        <span className="text-green-600">🏆</span>
                      ) : safeNumber(karsilastirmaDOS.genel_sira) < safeNumber(oyuncuIstatistikleri.genel_sira) ? (
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
                  {oyuncuIstatistikleri.oyuncu_isim} vs {karsilastirmaDOS.oyuncu_isim}
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
                  {karsilastirmaDOS.oyuncu_isim} {safeNumber(karsilastirmaDOS.oyuncu_sure)} dakika oynadı.
                </p>
                
                {karsilastirmaAnalizi.oyuncu1Skor > karsilastirmaAnalizi.oyuncu2Skor ? (
                  <p>
                    <strong>{oyuncuIstatistikleri.oyuncu_isim}</strong> özellikle top müdahaleleri, ball winning ve pressing açısından 
                    {karsilastirmaDOS.oyuncu_isim}'den daha başarılı. Bu oyuncu takım için daha güvenilir bir DOS seçenek olabilir.
                  </p>
                ) : karsilastirmaAnalizi.oyuncu2Skor > karsilastirmaAnalizi.oyuncu1Skor ? (
                  <p>
                    <strong>{karsilastirmaDOS.oyuncu_isim}</strong> genel performans değerlendirmesinde{' '} 
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
                        {safeNumber(oyuncuIstatistikleri.bsrltopmdhMB) > safeNumber(karsilastirmaDOS.bsrltopmdhMB) && <li>• Daha fazla top müdahalesi</li>}
                        {safeNumber(oyuncuIstatistikleri.kznTopMB) > safeNumber(karsilastirmaDOS.kznTopMB) && <li>• Daha fazla kazanılan top</li>}
                        {safeNumber(oyuncuIstatistikleri.bsrlpressMB) > safeNumber(karsilastirmaDOS.bsrlpressMB) && <li>• Daha etkili pressing</li>}
                        {safeNumber(oyuncuIstatistikleri.isbtlpas_yzd) > safeNumber(karsilastirmaDOS.isbtlpas_yzd) && <li>• Daha yüksek pas isabeti</li>}
                        {safeNumber(oyuncuIstatistikleri.kosumsfMB) > safeNumber(karsilastirmaDOS.kosumsfMB) && <li>• Daha fazla koşum mesafesi</li>}
                        {safeNumber(oyuncuIstatistikleri.topkpm_yzd) > safeNumber(karsilastirmaDOS.topkpm_yzd) && <li>• Daha yüksek top kapma %</li>}
                      </ul>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">{karsilastirmaDOS.oyuncu_isim}:</p>
                      <ul className="text-blue-600 text-xs space-y-1">
                        {safeNumber(karsilastirmaDOS.bsrltopmdhMB) > safeNumber(oyuncuIstatistikleri.bsrltopmdhMB) && <li>• Daha fazla top müdahalesi</li>}
                        {safeNumber(karsilastirmaDOS.kznTopMB) > safeNumber(oyuncuIstatistikleri.kznTopMB) && <li>• Daha fazla kazanılan top</li>}
                        {safeNumber(karsilastirmaDOS.bsrlpressMB) > safeNumber(oyuncuIstatistikleri.bsrlpressMB) && <li>• Daha etkili pressing</li>}
                        {safeNumber(karsilastirmaDOS.isbtlpas_yzd) > safeNumber(oyuncuIstatistikleri.isbtlpas_yzd) && <li>• Daha yüksek pas isabeti</li>}
                        {safeNumber(karsilastirmaDOS.kosumsfMB) > safeNumber(oyuncuIstatistikleri.kosumsfMB) && <li>• Daha fazla koşum mesafesi</li>}
                        {safeNumber(karsilastirmaDOS.topkpm_yzd) > safeNumber(oyuncuIstatistikleri.topkpm_yzd) && <li>• Daha yüksek top kapma %</li>}
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
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
              <div className="text-5xl font-bold text-amber-600 mb-2">
                {safeToFixed(oyuncuIstatistikleri.performans_skoru)}
              </div>
              <p className="text-gray-600">Genel Performans</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-600 h-2 rounded-full" 
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
            {/* Başarılı Top Müdahalesi */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Başarılı Top Müdahalesi/Maç</h4>
              <div className="text-3xl font-bold text-amber-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.bsrltopmdhMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('bsrltopmdhMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.bsrltopmdhMB_katsayi)}/17
              </div>
            </div>

            {/* Kazanılan Top */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Kazanılan Top/Maç</h4>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.kznTopMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('kznTopMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.kznTopMB_katsayi)}/17
              </div>
            </div>

            {/* Başarılı Press */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Başarılı Press/Maç</h4>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.bsrlpressMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('bsrlpressMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.bsrlpressMB_katsayi)}/17
              </div>
            </div>

            {/* İsabetli Pas % */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">İsabetli Pas %</h4>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {safeNumber(oyuncuIstatistikleri.isbtlpas_yzd)}%
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('isbtlpas_yzd').toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.isbtlpas_yzd_katsayi)}/17
              </div>
            </div>

            {/* Koşum Mesafesi */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Koşum Mesafesi/Maç</h4>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.kosumsfMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('kosumsfMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.kosumsfMB_katsayi)}/17
              </div>
            </div>

            {/* Şut Engelleme */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Şut Engelleme/Maç</h4>
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.sutengllmeMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('sutengllmeMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.sutengllmeMB_katsayi)}/17
              </div>
            </div>

            {/* Top Kesme */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Top Kesme/Maç</h4>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.topksmeMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('topksmeMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.topksmeMB_katsayi)}/17
              </div>
            </div>

            {/* Anahtar Müdahale */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Anahtar Müdahale/Maç</h4>
              <div className="text-3xl font-bold text-pink-600 mb-1">
                {safeToFixed(oyuncuIstatistikleri.anhtmudMB)}
              </div>
              <div className="text-sm text-gray-500">
                Lig Ort: {hesaplaLigOrtalamasi('anhtmudMB').toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                Sıralama: {safeNumber(oyuncuIstatistikleri.anhtmudMB_katsayi)}/17
              </div>
            </div>
          </div>
        </div>

        {/* Performans Grafikleri */}
        <div className="space-y-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900">Performans Grafikleri</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Savunma */}
            <OrtaSahaSavunmaChart 
              ortaSahaData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 1}
              onToggleExpand={() => setExpandedChart(expandedChart === 1 ? null : 1)}
            />

            {/* Genel Fiziksel İstatistik */}
            <OrtaSahaFizikselChart 
              ortaSahaData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 2}
              onToggleExpand={() => setExpandedChart(expandedChart === 2 ? null : 2)}
            />

            {/* Asist */}
            <OrtaSahaAsistChart 
              ortaSahaData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 3}
              onToggleExpand={() => setExpandedChart(expandedChart === 3 ? null : 3)}
            />

            {/* Orta */}
            <OrtaSahaOrtaChart 
              ortaSahaData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 4}
              onToggleExpand={() => setExpandedChart(expandedChart === 4 ? null : 4)}
            />

            {/* Golcülük */}
            <OrtaSahaGolculukChart 
              ortaSahaData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 5}
              onToggleExpand={() => setExpandedChart(expandedChart === 5 ? null : 5)}
            />

            {/* Pas */}
            <OrtaSahaPasChart 
              ortaSahaData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 6}
              onToggleExpand={() => setExpandedChart(expandedChart === 6 ? null : 6)}
            />

            {/* Pas Şablonu */}
            <OrtaSahaPasSablonuChart 
              ortaSahaData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 7}
              onToggleExpand={() => setExpandedChart(expandedChart === 7 ? null : 7)}
            />

            {/* Topa Sahip Olma */}
            <OrtaSahaTopaSahipOlmaChart 
              ortaSahaData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 8}
              onToggleExpand={() => setExpandedChart(expandedChart === 8 ? null : 8)}
            />

            {/* Hava Topu */}
            <OrtaSahaHavaTopuChart 
              ortaSahaData={tumGrafikler}
              currentPlayerId={parseInt(oyuncuId)}
              isExpanded={expandedChart === 9}
              onToggleExpand={() => setExpandedChart(expandedChart === 9 ? null : 9)}
            />
          </div>
        </div>

        {/* Performans Yorumu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Performans Analizi</h3>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              <strong>{oyuncuIstatistikleri.oyuncu_isim}</strong> bu sezon {oyuncuIstatistikleri.takim_adi}{' '} 
              formasıyla {safeNumber(oyuncuIstatistikleri.oyuncu_sure)} dakika oynayarak ligdeki defansif orta saha oyuncuları arasında 
              <strong> {safeNumber(oyuncuIstatistikleri.genel_sira)}. sırada</strong> yer aldı.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">Güçlü Yönleri</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  {safeNumber(oyuncuIstatistikleri.bsrltopmdhMB) > hesaplaLigOrtalamasi('bsrltopmdhMB') && (
                    <li>• Lig ortalamasının üzerinde top müdahalesi</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.kznTopMB) > hesaplaLigOrtalamasi('kznTopMB') && (
                    <li>• Yüksek top kazanma kapasitesi</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.bsrlpressMB) > hesaplaLigOrtalamasi('bsrlpressMB') && (
                    <li>• Etkili pressing performansı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.isbtlpas_yzd) > hesaplaLigOrtalamasi('isbtlpas_yzd') && (
                    <li>• Yüksek pas isabeti</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.kosumsfMB) > hesaplaLigOrtalamasi('kosumsfMB') && (
                    <li>• Güçlü fiziksel kondisyon</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) <= 5 && (
                    <li>• Üst sıralarda performans skoru</li>
                  )}
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Gelişim Alanları</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {safeNumber(oyuncuIstatistikleri.bsrltopmdhMB) < hesaplaLigOrtalamasi('bsrltopmdhMB') && (
                    <li>• Top müdahalesini geliştirmeli</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.isbtlpas_yzd) < hesaplaLigOrtalamasi('isbtlpas_yzd') && (
                    <li>• Pas isabetini artırmalı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.sutengllmeMB) < hesaplaLigOrtalamasi('sutengllmeMB') && (
                    <li>• Şut engelleme sayısını artırmalı</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.anhtmudMB) < hesaplaLigOrtalamasi('anhtmudMB') && (
                    <li>• Hava topu mücadelesini geliştirmeli</li>
                  )}
                  {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) > 12 && (
                    <li>• Genel performans skoru düşük</li>
                  )}
                </ul>
              </div>
            </div>

            <p>
              Performans skoru <strong>{safeToFixed(oyuncuIstatistikleri.performans_skoru)}</strong> ile 
              17 defansif orta saha oyuncusu arasında <strong>{safeNumber(oyuncuIstatistikleri.performans_skor_sirasi)}. sırada</strong> bulunuyor.
              {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) <= 5 && 
                " Bu skör, oyuncunun ligdeki en iyi defansif orta saha oyuncuları arasında yer aldığını gösteriyor."
              }
              {safeNumber(oyuncuIstatistikleri.performans_skor_sirasi) > 12 && 
                " Performansını artırmak için daha fazla çalışma gerekebilir."
              }
            </p>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Sezon Özeti</h4>
              <p className="text-sm text-blue-700">
                Bu sezon maç başına <strong>{safeToFixed(oyuncuIstatistikleri.bsrltopmdhMB)} başarılı top müdahalesi</strong> ve 
                <strong> {safeToFixed(oyuncuIstatistikleri.kznTopMB)} kazanılan top</strong> ile takımının savunma dengesine katkı sağlamıştır.
                <strong> {safeNumber(oyuncuIstatistikleri.isbtlpas_yzd)}%</strong> pas isabeti ile oyun kurma görevini başarılı şekilde yerine getirmiş,
                <strong> {safeToFixed(oyuncuIstatistikleri.kosumsfMB)}</strong> koşum mesafesi ile fiziksel performansını ortaya koymuştur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 