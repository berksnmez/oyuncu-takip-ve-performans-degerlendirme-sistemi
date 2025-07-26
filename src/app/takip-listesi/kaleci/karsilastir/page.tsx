"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTakipListesi } from "@/contexts/TakipListesiContext";
import Link from "next/link";
import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, ArcElement, BarElement } from 'chart.js';
import { Scatter, Radar, Bar, Doughnut } from 'react-chartjs-2';

// ChartJS kayıt işlemleri
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement,
  BarElement
);

// Navbar Bileşeni
const TakipListesiNavbar = ({ seciliPozisyon }: { seciliPozisyon: string }) => {
  const pozisyonlar = [
    { isim: "Kaleci", rota: "/takip-listesi/kaleci" },
    { isim: "Stoper", rota: "/takip-listesi/stoper" },
    { isim: "Bek", rota: "/takip-listesi/bek" },
    { isim: "DOS", rota: "/takip-listesi/dos" },
    { isim: "Orta Saha", rota: "/takip-listesi/orta-saha" },
    { isim: "Ofansif Orta Saha", rota: "/takip-listesi/ofansif-orta-saha" },
    { isim: "Kanat", rota: "/takip-listesi/kanat" },
    { isim: "Açık Kanat", rota: "/takip-listesi/acik-kanat" },
    { isim: "Santrafor", rota: "/takip-listesi/santrafor" }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
      <div className="flex p-1 min-w-max">
        {pozisyonlar.map((pozisyon) => (
          <Link
            key={pozisyon.isim}
            href={pozisyon.rota}
            className={`px-4 py-2 mx-1 rounded-md transition-colors whitespace-nowrap text-center ${
              seciliPozisyon === pozisyon.isim 
                ? 'bg-blue-600 text-white font-medium' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {pozisyon.isim}
          </Link>
        ))}
      </div>
    </div>
  );
};

// Kaleci veri tipleri
interface KaleciGrafik {
  blabla: string;
  bnzrsz_gk: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  kurtarisMb: number;
  kurtarisYzd: number;
  englxG: number;
  pasdnmeMb: number;
  pasYzd: number;
}

interface KaleciIstatistik {
  blabla: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  englxgMB: number;
  ynlgolMB: number;
  bklnKrtrs_yzd: number;
  kurtaris_yzd: number;
  isbtPas_yzd: number;
  englxgMB_katsayi: number;
  ynlgolMB_katsayi: number;
  bklnKrtrs_katsayi: number;
  kurtaris_katsayi: number;
  isbtPas_katsayi: number;
  performans_skoru: number;
  kalite_sira_katsayi: number;
  performans_skor_sirasi: number;
  sürdürülebilirlik_sira: number;
  genel_sira: number;
}

interface CombinedKaleciData extends KaleciGrafik, KaleciIstatistik {
  isSelected?: boolean;
}

// Helper function to safely convert to number and format
const safeToFixed = (value: any, decimals: number = 1): string => {
  const num = Number(value);
  return isNaN(num) ? 'N/A' : num.toFixed(decimals);
};

// Helper function to safely get integer value
const safeToInt = (value: any): string => {
  const num = Number(value);
  return isNaN(num) ? 'N/A' : Math.round(num).toString();
};

export default function KaleciKarsilastir() {
  const { getItemsByCategory } = useTakipListesi();
  const [kaleciler, setKaleciler] = useState<CombinedKaleciData[]>([]);
  const [seciliKaleciler, setSeciliKaleciler] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genel' | 'grafik' | 'performans' | 'radar'>('genel');
  const [sortBy, setSortBy] = useState<string>('performans_skoru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Kaleci verilerini yükle
  useEffect(() => {
    const loadKaleciler = async () => {
      try {
        setLoading(true);
        
        // Takip listesinden kaleci blabla değerlerini al
        const takipEdilenKaleciler = getItemsByCategory('kaleci');
        console.log("Takip edilen kaleciler:", takipEdilenKaleciler);
        const blablaList = takipEdilenKaleciler.map(k => String(k.blabla).trim());
        console.log("Blabla listesi:", blablaList);
        
        if (blablaList.length === 0) {
          setKaleciler([]);
          return;
        }

        // Grafik verilerini al
        const grafikResponse = await fetch('/api/kaleciler-grafik');
        if (!grafikResponse.ok) throw new Error('Grafik verileri alınamadı');
        const grafikResult = await grafikResponse.json();
        console.log("Grafik result:", grafikResult);

        // İstatistik verilerini al
        const istatistikResponse = await fetch('/api/kaleci-istatistik');
        if (!istatistikResponse.ok) throw new Error('İstatistik verileri alınamadı');
        const istatistikResult = await istatistikResponse.json();
        console.log("İstatistik result:", istatistikResult);

        // Verileri birleştir - oyuncu_id'yi anahtar olarak kullan
        const combinedData: CombinedKaleciData[] = [];
        
        blablaList.forEach(blabla => {
          console.log("Aranan blabla:", blabla);
          
          // İstatistik verisini blabla ile bul
          const istatistikData = istatistikResult.data?.find((i: any) => {
            const istatistikBlabla = String(i.blabla || '').trim();
            console.log("İstatistik blabla:", istatistikBlabla, "Aranan:", blabla);
            return istatistikBlabla === blabla;
          });

          console.log("Bulunan istatistik data:", istatistikData);

          if (istatistikData) {
            // İstatistik verisindeki oyuncu_id ile grafik verisini bul
            const oyuncuId = istatistikData.oyuncu_id;
            console.log("Aranan oyuncu_id:", oyuncuId);
            
            const grafikData = grafikResult.data?.find((g: any) => {
              const grafikOyuncuId = g.oyuncu_id;
              console.log("Grafik oyuncu_id:", grafikOyuncuId, "Aranan:", oyuncuId);
              return grafikOyuncuId === oyuncuId;
            });

            console.log("Bulunan grafik data:", grafikData);

            if (grafikData) {
              combinedData.push({
                ...grafikData,
                ...istatistikData,
                blabla: blabla, // İstatistik tablosundan gelen blabla değerini kullan
                bnzrsz_gk: grafikData.bnzrsz_gk, // Grafik tablosundan gelen benzersiz ID
                // Convert numeric fields to ensure they are numbers
                kurtarisMb: Number(grafikData.kurtarisMb) || 0,
                kurtarisYzd: Number(grafikData.kurtarisYzd) || 0,
                englxG: Number(grafikData.englxG) || 0,
                pasdnmeMb: Number(grafikData.pasdnmeMb) || 0,
                pasYzd: Number(grafikData.pasYzd) || 0,
                englxgMB: Number(istatistikData.englxgMB) || 0,
                ynlgolMB: Number(istatistikData.ynlgolMB) || 0,
                bklnKrtrs_yzd: Number(istatistikData.bklnKrtrs_yzd) || 0,
                kurtaris_yzd: Number(istatistikData.kurtaris_yzd) || 0,
                isbtPas_yzd: Number(istatistikData.isbtPas_yzd) || 0,
                englxgMB_katsayi: Number(istatistikData.englxgMB_katsayi) || 0,
                ynlgolMB_katsayi: Number(istatistikData.ynlgolMB_katsayi) || 0,
                bklnKrtrs_katsayi: Number(istatistikData.bklnKrtrs_katsayi) || 0,
                kurtaris_katsayi: Number(istatistikData.kurtaris_katsayi) || 0,
                isbtPas_katsayi: Number(istatistikData.isbtPas_katsayi) || 0,
                performans_skoru: Number(istatistikData.performans_skoru) || 0,
                kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
                performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
                sürdürülebilirlik_sira: Number(istatistikData.sürdürülebilirlik_sira) || 0,
                genel_sira: Number(istatistikData.genel_sira) || 0,
                isSelected: false
              });
            } else {
              // Sadece istatistik verisi varsa, grafik verilerini varsayılan değerlerle doldur
              console.log("Grafik verisi bulunamadı, varsayılan değerler kullanılıyor");
              combinedData.push({
                blabla: blabla,
                bnzrsz_gk: '', // Grafik verisi olmadığı için boş
                oyuncu_isim: istatistikData.oyuncu_isim,
                oyuncu_id: istatistikData.oyuncu_id,
                // Default graphic values
                kurtarisMb: 0,
                kurtarisYzd: Number(istatistikData.kurtaris_yzd) || 0,
                englxG: Number(istatistikData.englxgMB) || 0,
                pasdnmeMb: 0,
                pasYzd: Number(istatistikData.isbtPas_yzd) || 0,
                // Statistical values
                englxgMB: Number(istatistikData.englxgMB) || 0,
                ynlgolMB: Number(istatistikData.ynlgolMB) || 0,
                bklnKrtrs_yzd: Number(istatistikData.bklnKrtrs_yzd) || 0,
                kurtaris_yzd: Number(istatistikData.kurtaris_yzd) || 0,
                isbtPas_yzd: Number(istatistikData.isbtPas_yzd) || 0,
                englxgMB_katsayi: Number(istatistikData.englxgMB_katsayi) || 0,
                ynlgolMB_katsayi: Number(istatistikData.ynlgolMB_katsayi) || 0,
                bklnKrtrs_katsayi: Number(istatistikData.bklnKrtrs_katsayi) || 0,
                kurtaris_katsayi: Number(istatistikData.kurtaris_katsayi) || 0,
                isbtPas_katsayi: Number(istatistikData.isbtPas_katsayi) || 0,
                performans_skoru: Number(istatistikData.performans_skoru) || 0,
                kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
                performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
                sürdürülebilirlik_sira: Number(istatistikData.sürdürülebilirlik_sira) || 0,
                genel_sira: Number(istatistikData.genel_sira) || 0,
                isSelected: false
              });
            }
          }
        });

        console.log("Combined data:", combinedData);
        setKaleciler(combinedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Kaleci verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadKaleciler();
  }, [getItemsByCategory]);

  // Kaleci seçimi
  const toggleKaleciSelection = useCallback((blabla: string) => {
    console.log("Toggle kaleci selection:", blabla);
    console.log("Mevcut seçili kaleciler:", seciliKaleciler);
    
    setSeciliKaleciler(prev => {
      if (prev.includes(blabla)) {
        console.log("Kaleci zaten seçili, çıkarılıyor");
        return prev.filter(id => id !== blabla);
      } else if (prev.length < 6) { // Maksimum 6 kaleci karşılaştırılabilir
        console.log("Kaleci ekleniyor");
        return [...prev, blabla];
      } else {
        console.log("Maksimum kaleci sayısına ulaşıldı");
        return prev;
      }
    });
  }, [seciliKaleciler]);

  // Sıralama
  const sortedKaleciler = useMemo(() => {
    return [...kaleciler].sort((a, b) => {
      const aVal = a[sortBy as keyof CombinedKaleciData] as number;
      const bVal = b[sortBy as keyof CombinedKaleciData] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [kaleciler, sortBy, sortOrder]);

  // Seçili kaleciler verisi
  const seciliKaleciData = useMemo(() => {
    return kaleciler.filter(kaleci => seciliKaleciler.includes(kaleci.blabla));
  }, [kaleciler, seciliKaleciler]);

  // Scatter chart data
  const scatterChartData = useMemo(() => {
    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 205, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)'
    ];

    return {
      datasets: [
        {
          label: 'Kalecilik Performance',
          data: seciliKaleciData.map((kaleci, index) => ({
            x: kaleci.kurtarisYzd,
            y: kaleci.kurtarisMb,
            label: kaleci.oyuncu_isim,
            performans: kaleci.performans_skoru
          })),
          backgroundColor: seciliKaleciData.map((_, index) => colors[index % colors.length]),
          pointRadius: 8,
          pointHoverRadius: 10,
        }
      ]
    };
  }, [seciliKaleciData]);

  // Radar chart data
  const radarChartData = useMemo(() => {
    if (seciliKaleciData.length === 0) return { labels: [], datasets: [] };

    // Metrik etiketleri ve normalizasyon parametreleri
    const metrics = [
      { name: 'Kurtarış %', key: 'kurtarisYzd', min: 0, max: 100 },
      { name: 'Engellenen xG', key: 'englxgMB', min: -2, max: 1 },
      { name: 'Pas %', key: 'isbtPas_yzd', min: 0, max: 100 },
      { name: 'Yenilen Gol/Maç', key: 'ynlgolMB', min: 0, max: 3 },
      { name: 'Beklenen Kurtarış %', key: 'bklnKrtrs_yzd', min: 0, max: 100 },
      { name: 'Kurtarış/Maç', key: 'kurtarisMb', min: 0, max: 6 }
    ];

    const labels = metrics.map(m => m.name);

    const colors = [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)'
    ];

    const borderColors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 205, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)'
    ];

    return {
      labels,
      datasets: seciliKaleciData.map((kaleci, index) => {
        // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
        const normalizedData = metrics.map(metric => {
          const value = kaleci[metric.key as keyof CombinedKaleciData] as number || 0;
          
          // Yenilen Gol/Maç için tersine çevirme (düşük değer = daha iyi)
          if (metric.key === 'ynlgolMB') {
            const invertedValue = metric.max - value;
            return Math.min(100, Math.max(0, (invertedValue - 0) / (metric.max - 0) * 100));
          }
          
          // Diğer değerleri normalizasyon parametrelerine göre ölçekle
          return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
        });

        return {
          label: kaleci.oyuncu_isim,
          data: normalizedData,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
          pointRadius: 4,
        };
      })
    };
  }, [seciliKaleciData]);

  // Performance comparison bar chart
  const performanceBarData = useMemo(() => {
    if (seciliKaleciData.length === 0) return { labels: [], datasets: [] };

    // Performans skoru değerlendirme aralığı: 1.500 - 4.500
    const performansMin = 1.500;
    const performansMax = 4.500;

    return {
      labels: seciliKaleciData.map(k => k.oyuncu_isim),
      datasets: [
        {
          label: 'Performans Skoru',
          data: seciliKaleciData.map(k => {
            // Performans skorunu 1.500-4.500 aralığına göre 0-100 ölçeğinde normalize et
            const normalizedScore = Math.min(100, Math.max(0, ((k.performans_skoru - performansMin) / (performansMax - performansMin)) * 100));
            return normalizedScore;
          }),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Genel Sıra (Ters)',
          data: seciliKaleciData.map(k => 100 - k.genel_sira),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        }
      ]
    };
  }, [seciliKaleciData]);

  // Kurtarış Performansı Bar Chart
  const kurtarisBarData = useMemo(() => {
    if (seciliKaleciData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliKaleciData.map(k => k.oyuncu_isim),
      datasets: [
        {
          label: 'Kurtarış %',
          data: seciliKaleciData.map(kaleci => {
            const value = kaleci.kurtarisYzd;
            const min = 45;
            const max = 87;
            return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
          }),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        },
        {
          label: 'Beklenen Kurtarış %',
          data: seciliKaleciData.map(kaleci => {
            const value = kaleci.bklnKrtrs_yzd;
            const min = 55;
            const max = 90;
            return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
          }),
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
        },
        {
          label: 'Maç Başına Kurtarış',
          data: seciliKaleciData.map(kaleci => {
            const value = kaleci.kurtarisMb;
            const min = 1;
            const max = 8;
            return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
          }),
          backgroundColor: 'rgba(255, 206, 86, 0.8)',
        }
      ]
    };
  }, [seciliKaleciData]);

  // Gol Önleme Performansı Bar Chart
  const golOnlemeBarData = useMemo(() => {
    if (seciliKaleciData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliKaleciData.map(k => k.oyuncu_isim),
      datasets: [
        {
          label: 'Engellenen xG/Maç',
          data: seciliKaleciData.map(kaleci => {
            const value = kaleci.englxgMB;
            const min = -1;
            const max = 0.2;
            return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
          }),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'Yenilen Gol/Maç (Ters)',
          data: seciliKaleciData.map(kaleci => {
            const value = kaleci.ynlgolMB;
            const min = 0.4;
            const max = 2;
            // Ters çeviriyoruz çünkü düşük değer daha iyi
            return Math.min(100, Math.max(0, ((max - value) / (max - min)) * 100));
          }),
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
        }
      ]
    };
  }, [seciliKaleciData]);

  // Pas Performansı Bar Chart
  const pasPerformansBarData = useMemo(() => {
    if (seciliKaleciData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliKaleciData.map(k => k.oyuncu_isim),
      datasets: [
        {
          label: 'İsabetli Pas %',
          data: seciliKaleciData.map(kaleci => {
            const value = kaleci.isbtPas_yzd;
            const min = 30;
            const max = 85;
            return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
          }),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Maç Başına Pas Denemesi',
          data: seciliKaleciData.map(kaleci => {
            const value = kaleci.pasdnmeMb;
            const min = 10;
            const max = 30;
            return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
          }),
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
        }
      ]
    };
  }, [seciliKaleciData]);

  if (loading) {
    return (
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Hata: {error}</p>
          <Link href="/takip-listesi/kaleci" className="text-blue-600 hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Kaleci Karşılaştırması</h1>
      
      {/* Pozisyon Navbar */}
      <TakipListesiNavbar seciliPozisyon="Kaleci" />
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'genel', label: 'Genel Bakış' },
            { key: 'grafik', label: 'Scatter Analiz' },
            { key: 'performans', label: 'Performans Karşılaştırması' },
            { key: 'radar', label: 'Radar Analiz' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {kaleciler.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz takip ettiğiniz kaleci bulunmuyor.</p>
          <Link 
            href="/oyuncu-arama/kaleci" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Kaleci Ara
          </Link>
        </div>
      ) : (
        <>
          {/* Kaleci Seçimi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                Karşılaştırılacak Kalecileri Seçin ({seciliKaleciler.length}/6)
              </h3>
              <div className="flex items-center space-x-4">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="performans_skoru">Performans Skoru</option>
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kurtarisYzd">Kurtarış %</option>
                  <option value="englxgMB">Engellenen xG</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedKaleciler.map((kaleci) => (
                <div
                  key={kaleci.blabla}
                  onClick={() => {
                    console.log("Card clicked for kaleci:", kaleci.oyuncu_isim, "blabla:", kaleci.blabla);
                    toggleKaleciSelection(kaleci.blabla);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    seciliKaleciler.includes(kaleci.blabla)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${seciliKaleciler.length >= 6 && !seciliKaleciler.includes(kaleci.blabla) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{kaleci.oyuncu_isim}</h4>
                    <input
                      type="checkbox"
                      checked={seciliKaleciler.includes(kaleci.blabla)}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log("Checkbox clicked:", kaleci.blabla);
                        toggleKaleciSelection(kaleci.blabla);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Performans: {safeToFixed(kaleci.performans_skoru)}</div>
                    <div>Genel Sıra: {safeToInt(kaleci.genel_sira)}</div>
                    <div>Kurtarış %: {safeToFixed(kaleci.kurtarisYzd)}%</div>
                    <div className="text-xs text-gray-400">ID: {kaleci.blabla}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {seciliKaleciData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'genel' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Genel Karşılaştırma</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Oyuncu</th>
                          <th className="text-center py-3 px-2">Performans</th>
                          <th className="text-center py-3 px-2">Genel Sıra</th>
                          <th className="text-center py-3 px-2">Kurtarış %</th>
                          <th className="text-center py-3 px-2">Engellenen xG</th>
                          <th className="text-center py-3 px-2">Pas %</th>
                          <th className="text-center py-3 px-2">Kalite Sırası</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seciliKaleciData.map((kaleci, index) => (
                          <tr key={kaleci.blabla} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-3 px-2 font-medium">{kaleci.oyuncu_isim}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(kaleci.performans_skoru)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(kaleci.genel_sira)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(kaleci.kurtarisYzd)}%</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(kaleci.englxgMB)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(kaleci.isbtPas_yzd)}%</td>
                            <td className="py-3 px-2 text-center">{safeToInt(kaleci.kalite_sira_katsayi)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'grafik' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Kurtarış Performansı Analizi</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Kurtarış % vs Maç Başına Kurtarış</h4>
                      <div className="h-96">
                        <Scatter
                          data={scatterChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false,
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context: any) => {
                                    const point = context.raw;
                                    return [
                                      `${point.label}`,
                                      `Kurtarış %: ${safeToFixed(point.x)}%`,
                                      `Maç/Kurtarış: ${safeToFixed(point.y)}`,
                                      `Performans: ${safeToFixed(point.performans)}`
                                    ];
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                title: {
                                  display: true,
                                  text: 'Kurtarış Yüzdesi (%)'
                                },
                                min: 50,
                                max: 100
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: 'Maç Başına Kurtarış'
                                },
                                min: 1,
                                max: 6
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Pas % vs Maç Başına Pas</h4>
                      <div className="h-96">
                        <Scatter
                          data={{
                            datasets: [{
                              label: 'Pas Performance',
                              data: seciliKaleciData.map((kaleci, index) => ({
                                x: Number(kaleci.pasYzd) || 0,
                                y: Number(kaleci.pasdnmeMb) || 0,
                                label: kaleci.oyuncu_isim
                              })),
                              backgroundColor: seciliKaleciData.map((_, index) => 
                                ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 205, 86, 0.8)', 
                                 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'][index % 6]
                              ),
                              pointRadius: 8,
                              pointHoverRadius: 10,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (context: any) => {
                                    const point = context.raw;
                                    return [
                                      `${point.label}`,
                                      `Pas %: ${safeToFixed(point.x)}%`,
                                      `Maç/Pas: ${safeToFixed(point.y)}`
                                    ];
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                title: { display: true, text: 'İsabetli Pas Yüzdesi (%)' },
                                min: 15, max: 100
                              },
                              y: {
                                title: { display: true, text: 'Maç Başına Pas Denemesi' },
                                min: 10, max: 40
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performans' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Performans Karşılaştırması</h3>
                  
                  {/* Kurtarış Performansı */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium mb-4">Kurtarış Performansı</h4>
                    <div className="h-96">
                      <Bar
                        data={kurtarisBarData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            title: {
                              display: true,
                              text: 'Kurtarış Performansı Analizi'
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context: any) {
                                  const datasetLabel = context.dataset.label;
                                  const playerIndex = context.dataIndex;
                                  const kaleci = seciliKaleciData[playerIndex];
                                  
                                  if (datasetLabel === 'Kurtarış %') {
                                    return `Kurtarış %: ${safeToFixed(kaleci.kurtarisYzd)}%`;
                                  } else if (datasetLabel === 'Beklenen Kurtarış %') {
                                    return `Beklenen Kurtarış %: ${safeToFixed(kaleci.bklnKrtrs_yzd)}%`;
                                  } else if (datasetLabel === 'Maç Başına Kurtarış') {
                                    return `Maç Başına Kurtarış: ${safeToFixed(kaleci.kurtarisMb)}`;
                                  }
                                  return `${datasetLabel}: ${context.raw.toFixed(1)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              title: {
                                display: true,
                                text: 'Normalize Edilmiş Değer (0-100)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Gol Önleme Performansı */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium mb-4">Gol Önleme Performansı</h4>
                    <div className="h-96">
                      <Bar
                        data={golOnlemeBarData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            title: {
                              display: true,
                              text: 'Gol Önleme Etkinliği'
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context: any) {
                                  const datasetLabel = context.dataset.label;
                                  const playerIndex = context.dataIndex;
                                  const kaleci = seciliKaleciData[playerIndex];
                                  
                                  if (datasetLabel === 'Engellenen xG/Maç') {
                                    return `Engellenen xG/Maç: ${safeToFixed(kaleci.englxgMB)}`;
                                  } else if (datasetLabel === 'Yenilen Gol/Maç (Ters)') {
                                    return `Yenilen Gol/Maç: ${safeToFixed(kaleci.ynlgolMB)}`;
                                  }
                                  return `${datasetLabel}: ${context.raw.toFixed(1)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              title: {
                                display: true,
                                text: 'Normalize Edilmiş Değer (0-100)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Pas Performansı */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium mb-4">Pas Performansı</h4>
                    <div className="h-96">
                      <Bar
                        data={pasPerformansBarData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            title: {
                              display: true,
                              text: 'Pas Etkinliği ve Dağıtım'
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context: any) {
                                  const datasetLabel = context.dataset.label;
                                  const playerIndex = context.dataIndex;
                                  const kaleci = seciliKaleciData[playerIndex];
                                  
                                  if (datasetLabel === 'İsabetli Pas %') {
                                    return `İsabetli Pas %: ${safeToFixed(kaleci.isbtPas_yzd)}%`;
                                  } else if (datasetLabel === 'Maç Başına Pas Denemesi') {
                                    return `Maç Başına Pas Denemesi: ${safeToFixed(kaleci.pasdnmeMb)}`;
                                  }
                                  return `${datasetLabel}: ${context.raw.toFixed(1)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              title: {
                                display: true,
                                text: 'Normalize Edilmiş Değer (0-100)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>Not:</strong> Tüm değerler karşılaştırma için normalize edilmiştir:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Performans Skoru:</strong> 1.500-4.500 aralığında normalize edilmiştir</li>
                      <li><strong>Kurtarış %:</strong> 50-100% aralığında değerlendirilir</li>
                      <li><strong>Engellenen xG:</strong> -2 ile +2 aralığında değerlendirilir (pozitif = daha iyi)</li>
                      <li><strong>Yenilen Gol/Maç:</strong> 0-3 aralığında tersine çevrilmiştir (düşük = daha iyi)</li>
                      <li><strong>Pas %:</strong> 20-100% aralığında değerlendirilir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                  
                  {/* Detailed stats grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seciliKaleciData.map((kaleci) => (
                      <div key={kaleci.blabla} className="border rounded-lg p-4">
                        <h4 className="font-medium text-lg mb-3">{kaleci.oyuncu_isim}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="border-b pb-2 mb-2">
                            <div className="text-xs text-gray-500 mb-1">Genel Performans</div>
                            <div className="flex justify-between">
                              <span>Performans Skoru:</span>
                              <span className="font-medium">{safeToFixed(kaleci.performans_skoru)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Genel Sıra:</span>
                              <span className="font-medium">{safeToInt(kaleci.genel_sira)}</span>
                            </div>
                          </div>
                          <div className="border-b pb-2 mb-2">
                            <div className="text-xs text-gray-500 mb-1">Kurtarış</div>
                            <div className="flex justify-between">
                              <span>Kurtarış %:</span>
                              <span className="font-medium">{safeToFixed(kaleci.kurtarisYzd)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Beklenen Kurtarış %:</span>
                              <span className="font-medium">{safeToFixed(kaleci.bklnKrtrs_yzd)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Kurtarış/Maç:</span>
                              <span className="font-medium">{safeToFixed(kaleci.kurtarisMb)}</span>
                            </div>
                          </div>
                          <div className="border-b pb-2 mb-2">
                            <div className="text-xs text-gray-500 mb-1">Gol Önleme</div>
                            <div className="flex justify-between">
                              <span>Engellenen xG/Maç:</span>
                              <span className="font-medium">{safeToFixed(kaleci.englxgMB)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Yenilen Gol/Maç:</span>
                              <span className="font-medium">{safeToFixed(kaleci.ynlgolMB)}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Pas Dağıtımı</div>
                            <div className="flex justify-between">
                              <span>İsabetli Pas %:</span>
                              <span className="font-medium">{safeToFixed(kaleci.isbtPas_yzd)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pas %:</span>
                              <span className="font-medium">{safeToFixed(kaleci.pasYzd)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pas Denemesi/Maç:</span>
                              <span className="font-medium">{safeToFixed(kaleci.pasdnmeMb)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'radar' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Radar Analizi</h3>
                  <div className="h-96 mb-6">
                    <Radar
                      data={radarChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                          title: {
                            display: true,
                            text: 'Çok Boyutlu Kaleci Karşılaştırması'
                          },
                          tooltip: {
                            enabled: true,
                            titleAlign: 'center' as const,
                            bodyAlign: 'center' as const,
                            titleFont: {
                              size: 14,
                              weight: 'bold' as const
                            },
                            bodyFont: {
                              size: 12
                            },
                            padding: 10,
                            callbacks: {
                              title: function(tooltipItems: any[]) {
                                const item = tooltipItems[0];
                                return item.dataset.label;
                              },
                              label: function(context: any) {
                                const dataIndex = context.dataIndex;
                                const metrics = [
                                  { name: 'Kurtarış %', key: 'kurtarisYzd', min: 50, max: 100 },
                                  { name: 'Engellenen xG', key: 'englxgMB', min: -2, max: 2 },
                                  { name: 'Pas %', key: 'isbtPas_yzd', min: 20, max: 100 },
                                  { name: 'Yenilen Gol/Maç', key: 'ynlgolMB', min: 0, max: 3 },
                                  { name: 'Beklenen Kurtarış %', key: 'bklnKrtrs_yzd', min: 50, max: 100 },
                                  { name: 'Kurtarış/Maç', key: 'kurtarisMb', min: 1, max: 8 }
                                ];
                                const metric = metrics[dataIndex];
                                
                                // İlgili kaleci verilerini bul
                                const kaleciLabel = context.dataset.label;
                                const kaleci = seciliKaleciData.find(k => k.oyuncu_isim === kaleciLabel);
                                
                                if (kaleci) {
                                  const originalValue = kaleci[metric.key as keyof CombinedKaleciData] as number;
                                  
                                  // Yüzde değerleri için
                                  if (metric.key === 'kurtarisYzd' || metric.key === 'isbtPas_yzd' || metric.key === 'bklnKrtrs_yzd') {
                                    return `${metric.name}: %${Number(originalValue).toFixed(1)}`;
                                  }
                                  
                                  // Diğer metrikler için
                                  return `${metric.name}: ${Number(originalValue).toFixed(2)}`;
                                }
                                
                                return `${metric.name}: ${context.raw.toFixed(1)}`;
                              }
                            }
                          }
                        },
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              stepSize: 20
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-4">
                    <p><strong>Not:</strong> Grafikteki değerler karşılaştırma için normalize edilmiştir:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Kurtarış %:</strong> 50-100% aralığında normalize edilmiştir</li>
                      <li><strong>Engellenen xG:</strong> -2 ile +2 aralığında normalize edilmiştir</li>
                      <li><strong>Pas %:</strong> 20-100% aralığında normalize edilmiştir</li>
                      <li><strong>Yenilen Gol/Maç:</strong> 0-3 aralığında tersine çevrilmiştir (düşük = daha iyi)</li>
                      <li><strong>Beklenen Kurtarış %:</strong> 50-100% aralığında normalize edilmiştir</li>
                      <li><strong>Kurtarış/Maç:</strong> 1-8 aralığında normalize edilmiştir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {seciliKaleciData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 text-lg">Karşılaştırmak için en az bir kaleci seçin</p>
              <p className="text-gray-400 text-sm mt-2">Maksimum 6 kaleci karşılaştırabilirsiniz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 