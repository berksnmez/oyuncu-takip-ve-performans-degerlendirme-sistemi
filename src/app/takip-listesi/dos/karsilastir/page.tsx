"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTakipListesi } from "@/contexts/TakipListesiContext";
import Link from "next/link";
import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, ArcElement, BarElement } from 'chart.js';
import { Scatter, Radar, Bar, Line } from 'react-chartjs-2';

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

// DOS veri tipleri
interface DOSGrafik {
  bnzrsz_os: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  takim_adi: string;
  takim_id: number;
  "Ao-Io%": number;
  "DikKltPas/90": number;
  "Eng/90": number;
  "Gol/90": number;
  "HtmG/90": number;
  "Hv%": number;
  "KazanTop/90": number;
  "Mesf/90": number;
  "OrtGrsm/90": number;
  "Pas%": number;
  "PH-xG/90": number;
  "PsG/90": number;
  "SPasi/90": number;
  "Sprint/90": number;
  "TopKyb/90": number;
  "Uzk/90": number;
  "xA/90": number;
}

interface DOSIstatistik {
  blabla_dos: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yan_mevkii: string;
  oyuncu_yas: number;
  takim_adi: string;
  takim_id: number;
  anhtmudMB: number;
  anhtmudMB_katsayi: number;
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
  performans_skoru: number;
  performans_skor_sirasi: number;
  surdurabilirlik_sira: number;
  sutengllmeMB: number;
  sutengllmeMB_katsayi: number;
  topkpm_yzd: number;
  topksmeMB: number;
  topksmeMB_katsayi: number;
  topmdhMB: number;
}

interface CombinedDOSData extends DOSGrafik, DOSIstatistik {
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

export default function DOSKarsilastir() {
  const { getItemsByCategory } = useTakipListesi();
  const [doslar, setDoslar] = useState<CombinedDOSData[]>([]);
  const [seciliDoslar, setSeciliDoslar] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genel' | 'savunma' | 'hucum' | 'fiziksel' | 'radar'>('genel');
  const [sortBy, setSortBy] = useState<string>('performans_skoru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // DOS verilerini yükle
  useEffect(() => {
    const loadDoslar = async () => {
      try {
        setLoading(true);
        
        // Takip listesinden DOS blabla_dos değerlerini al
        const takipEdilenDoslar = getItemsByCategory('dos');
        console.log("Takip edilen DOS'lar:", takipEdilenDoslar);
        const blablaDosList = takipEdilenDoslar.map(d => String(d.blabla_dos).trim());
        console.log("Blabla_dos listesi:", blablaDosList);
        
        if (blablaDosList.length === 0) {
          setDoslar([]);
          return;
        }

        // Grafik verilerini al
        const grafikResponse = await fetch('/api/ortasahalar-grafik');
        if (!grafikResponse.ok) throw new Error('Grafik verileri alınamadı');
        const grafikResult = await grafikResponse.json();
        console.log("Grafik result:", grafikResult);

        // İstatistik verilerini al
        const istatistikResponse = await fetch('/api/dos-istatistik');
        if (!istatistikResponse.ok) throw new Error('İstatistik verileri alınamadı');
        const istatistikResult = await istatistikResponse.json();
        console.log("İstatistik result:", istatistikResult);

        // Verileri birleştir
        const combinedData: CombinedDOSData[] = [];
        
        blablaDosList.forEach(blablaDos => {
          console.log("Aranan blabla_dos:", blablaDos);
          
          // İstatistik verisini bul
          const istatistikData = istatistikResult.data?.find((i: any) => {
            const istatistikBlabla = String(i.blabla_dos || '').trim();
            console.log("İstatistik blabla_dos:", istatistikBlabla, "Aranan:", blablaDos);
            return istatistikBlabla === blablaDos;
          });

          if (!istatistikData) {
            console.log("İstatistik verisi bulunamadı:", blablaDos);
            return;
          }

          // Grafik verisini oyuncu_id ile bul
          const grafikData = grafikResult.data?.find((g: any) => {
            const grafikOyuncuId = Number(g.oyuncu_id);
            const istatistikOyuncuId = Number(istatistikData.oyuncu_id);
            console.log("Grafik oyuncu_id:", grafikOyuncuId, "İstatistik oyuncu_id:", istatistikOyuncuId);
            return grafikOyuncuId === istatistikOyuncuId;
          });

          console.log("Bulunan grafik data:", grafikData);
          console.log("Bulunan istatistik data:", istatistikData);

          if (grafikData && istatistikData) {
            combinedData.push({
              ...grafikData,
              ...istatistikData,
              blabla_dos: blablaDos, // Ensure consistent blabla_dos value
              bnzrsz_os: String(grafikData.bnzrsz_os || ''),
              // Convert numeric fields to ensure they are numbers
              "Ao-Io%": Number(grafikData["Ao-Io%"]) || 0,
              "DikKltPas/90": Number(grafikData["DikKltPas/90"]) || 0,
              "Eng/90": Number(grafikData["Eng/90"]) || 0,
              "Gol/90": Number(grafikData["Gol/90"]) || 0,
              "HtmG/90": Number(grafikData["HtmG/90"]) || 0,
              "Hv%": Number(grafikData["Hv%"]) || 0,
              "KazanTop/90": Number(grafikData["KazanTop/90"]) || 0,
              "Mesf/90": Number(grafikData["Mesf/90"]) || 0,
              "OrtGrsm/90": Number(grafikData["OrtGrsm/90"]) || 0,
              "Pas%": Number(grafikData["Pas%"]) || 0,
              "PH-xG/90": Number(grafikData["PH-xG/90"]) || 0,
              "PsG/90": Number(grafikData["PsG/90"]) || 0,
              "SPasi/90": Number(grafikData["SPasi/90"]) || 0,
              "Sprint/90": Number(grafikData["Sprint/90"]) || 0,
              "TopKyb/90": Number(grafikData["TopKyb/90"]) || 0,
              "Uzk/90": Number(grafikData["Uzk/90"]) || 0,
              "xA/90": Number(grafikData["xA/90"]) || 0,
              anhtmudMB: Number(istatistikData.anhtmudMB) || 0,
              anhtmudMB_katsayi: Number(istatistikData.anhtmudMB_katsayi) || 0,
              bsrlpressMB: Number(istatistikData.bsrlpressMB) || 0,
              bsrlpressMB_katsayi: Number(istatistikData.bsrlpressMB_katsayi) || 0,
              bsrltopmdhMB: Number(istatistikData.bsrltopmdhMB) || 0,
              bsrltopmdhMB_katsayi: Number(istatistikData.bsrltopmdhMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              isbtlpas_yzd: Number(istatistikData.isbtlpas_yzd) || 0,
              isbtlpas_yzd_katsayi: Number(istatistikData.isbtlpas_yzd_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              kosumsfMB: Number(istatistikData.kosumsfMB) || 0,
              kosumsfMB_katsayi: Number(istatistikData.kosumsfMB_katsayi) || 0,
              kznTopMB: Number(istatistikData.kznTopMB) || 0,
              kznTopMB_katsayi: Number(istatistikData.kznTopMB_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutengllmeMB: Number(istatistikData.sutengllmeMB) || 0,
              sutengllmeMB_katsayi: Number(istatistikData.sutengllmeMB_katsayi) || 0,
              topkpm_yzd: Number(istatistikData.topkpm_yzd) || 0,
              topksmeMB: Number(istatistikData.topksmeMB) || 0,
              topksmeMB_katsayi: Number(istatistikData.topksmeMB_katsayi) || 0,
              topmdhMB: Number(istatistikData.topmdhMB) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          } else if (istatistikData) {
            // Sadece istatistik verisi varsa, grafik verilerini varsayılan değerlerle doldur
            combinedData.push({
              ...istatistikData,
              blabla_dos: blablaDos,
              bnzrsz_os: '',
              // Default graphic values
              "Ao-Io%": 0,
              "DikKltPas/90": 0,
              "Eng/90": Number(istatistikData.sutengllmeMB) || 0,
              "Gol/90": 0,
              "HtmG/90": 0,
              "Hv%": 0,
              "KazanTop/90": Number(istatistikData.kznTopMB) || 0,
              "Mesf/90": Number(istatistikData.kosumsfMB) || 0,
              "OrtGrsm/90": 0,
              "Pas%": Number(istatistikData.isbtlpas_yzd) || 0,
              "PH-xG/90": 0,
              "PsG/90": 0,
              "SPasi/90": 0,
              "Sprint/90": 0,
              "TopKyb/90": Number(istatistikData.topkpm_yzd) || 0,
              "Uzk/90": 0,
              "xA/90": 0,
              // Convert statistical data to numbers
              anhtmudMB: Number(istatistikData.anhtmudMB) || 0,
              anhtmudMB_katsayi: Number(istatistikData.anhtmudMB_katsayi) || 0,
              bsrlpressMB: Number(istatistikData.bsrlpressMB) || 0,
              bsrlpressMB_katsayi: Number(istatistikData.bsrlpressMB_katsayi) || 0,
              bsrltopmdhMB: Number(istatistikData.bsrltopmdhMB) || 0,
              bsrltopmdhMB_katsayi: Number(istatistikData.bsrltopmdhMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              isbtlpas_yzd: Number(istatistikData.isbtlpas_yzd) || 0,
              isbtlpas_yzd_katsayi: Number(istatistikData.isbtlpas_yzd_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              kosumsfMB: Number(istatistikData.kosumsfMB) || 0,
              kosumsfMB_katsayi: Number(istatistikData.kosumsfMB_katsayi) || 0,
              kznTopMB: Number(istatistikData.kznTopMB) || 0,
              kznTopMB_katsayi: Number(istatistikData.kznTopMB_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutengllmeMB: Number(istatistikData.sutengllmeMB) || 0,
              sutengllmeMB_katsayi: Number(istatistikData.sutengllmeMB_katsayi) || 0,
              topkpm_yzd: Number(istatistikData.topkpm_yzd) || 0,
              topksmeMB: Number(istatistikData.topksmeMB) || 0,
              topksmeMB_katsayi: Number(istatistikData.topksmeMB_katsayi) || 0,
              topmdhMB: Number(istatistikData.topmdhMB) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          }
        });

        console.log("Combined data:", combinedData);
        setDoslar(combinedData);
      } catch (err: any) {
        setError(err.message);
        console.error('DOS verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDoslar();
  }, [getItemsByCategory]);

  // DOS seçimi
  const toggleDosSelection = useCallback((blablaDos: string) => {
    console.log("Toggle DOS selection:", blablaDos);
    console.log("Mevcut seçili DOS'lar:", seciliDoslar);
    
    setSeciliDoslar(prev => {
      if (prev.includes(blablaDos)) {
        console.log("DOS zaten seçili, çıkarılıyor");
        return prev.filter(id => id !== blablaDos);
      } else if (prev.length < 6) { // Maksimum 6 DOS karşılaştırılabilir
        console.log("DOS ekleniyor");
        return [...prev, blablaDos];
      } else {
        console.log("Maksimum DOS sayısına ulaşıldı");
        return prev;
      }
    });
  }, [seciliDoslar]);

  // Sıralama
  const sortedDoslar = useMemo(() => {
    return [...doslar].sort((a, b) => {
      const aVal = a[sortBy as keyof CombinedDOSData] as number;
      const bVal = b[sortBy as keyof CombinedDOSData] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [doslar, sortBy, sortOrder]);

  // Seçili DOS'lar verisi
  const seciliDosData = useMemo(() => {
    return doslar.filter(dos => seciliDoslar.includes(dos.blabla_dos));
  }, [doslar, seciliDoslar]);

  // Savunma vs Hücum scatter chart data
  const savunmaHucumScatterData = useMemo(() => {
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
          label: 'Savunma vs Hücum',
          data: seciliDosData.map((dos, index) => ({
            x: dos["KazanTop/90"],
            y: dos["xA/90"],
            label: dos.oyuncu_isim,
            performans: dos.performans_skoru
          })),
          backgroundColor: seciliDosData.map((_, index) => colors[index % colors.length]),
          pointRadius: 8,
          pointHoverRadius: 10,
        }
      ]
    };
  }, [seciliDosData]);

  // Radar chart data
  const radarChartData = useMemo(() => {
    if (seciliDosData.length === 0) return { labels: [], datasets: [] };

    // Metrik etiketleri ve değerlendirme aralıkları (DOS için optimize edilmiş)
    const metrics = [
      { name: 'Top Kazanma/90', key: 'KazanTop/90', min: 2, max: 10 },
      { name: 'Başarılı Press/Maç', key: 'bsrlpressMB', min: 0.75, max: 3.5 },
      { name: 'Anahtar Müdahale/Maç', key: 'anhtmudMB', min: 0, max: 0.15 },
      { name: 'Pas %', key: 'Pas%', min: 75, max: 95 },
      { name: 'Sprint/90', key: 'Sprint/90', min: 2, max: 11 },
      { name: 'Koşu Mesafesi/Maç', key: 'kosumsfMB', min: 10, max: 13 }
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
      datasets: seciliDosData.map((dos, index) => {
        // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
        const normalizedData = metrics.map(metric => {
          const value = dos[metric.key as keyof CombinedDOSData] as number || 0;
          
          // Değeri min-max aralığına göre 0-100 arasına normalize et
          return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
        });

        return {
          label: dos.oyuncu_isim,
          data: normalizedData,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
          pointRadius: 4,
        };
      })
    };
  }, [seciliDosData]);

  // Performance comparison bar chart
  const performanceBarData = useMemo(() => {
    if (seciliDosData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliDosData.map(d => d.oyuncu_isim),
      datasets: [
        {
          label: 'Performans Skoru',
          data: seciliDosData.map(d => d.performans_skoru),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Top Kazanma/90',
          data: seciliDosData.map(d => d["KazanTop/90"] * 3), // Scale for visibility
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'Başarılı Press/Maç',
          data: seciliDosData.map(d => d.bsrlpressMB * 5), // Scale for visibility
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    };
  }, [seciliDosData]);

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
          <Link href="/takip-listesi/dos" className="text-blue-600 hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">DOS Karşılaştırması</h1>
      
      {/* Pozisyon Navbar */}
      <TakipListesiNavbar seciliPozisyon="DOS" />
      
            
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'genel', label: 'Genel Bakış' },
            { key: 'savunma', label: 'Savunma Analizi' },
            { key: 'hucum', label: 'Hücum Katkısı' },
            { key: 'fiziksel', label: 'Fiziksel & Teknik' },
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

      {doslar.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz takip ettiğiniz DOS bulunmuyor.</p>
          <Link 
            href="/oyuncu-arama/dos" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
          >
            DOS Ara
          </Link>
        </div>
      ) : (
        <>
          {/* DOS Seçimi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                Karşılaştırılacak DOS'ları Seçin ({seciliDoslar.length}/6)
              </h3>
              <div className="flex items-center space-x-4">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="performans_skoru">Performans Skoru</option>
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="KazanTop/90">Top Kazanma/90</option>
                  <option value="bsrlpressMB">Başarılı Press/Maç</option>
                  <option value="anhtmudMB">Anahtar Müdahale/Maç</option>
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
              {sortedDoslar.map((dos) => (
                <div
                  key={dos.blabla_dos}
                  onClick={() => {
                    console.log("Card clicked for DOS:", dos.oyuncu_isim, "blabla_dos:", dos.blabla_dos);
                    toggleDosSelection(dos.blabla_dos);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    seciliDoslar.includes(dos.blabla_dos)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${seciliDoslar.length >= 6 && !seciliDoslar.includes(dos.blabla_dos) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{dos.oyuncu_isim}</h4>
                    <input
                      type="checkbox"
                      checked={seciliDoslar.includes(dos.blabla_dos)}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log("Checkbox clicked:", dos.blabla_dos);
                        toggleDosSelection(dos.blabla_dos);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Performans: {safeToFixed(dos.performans_skoru)}</div>
                    <div>Genel Sıra: {safeToInt(dos.genel_sira)}</div>
                    <div>Top Kazanma/90: {safeToFixed(dos["KazanTop/90"])}</div>
                    <div>Başarılı Press/Maç: {safeToFixed(dos.bsrlpressMB)}</div>
                    <div className="text-xs text-gray-400">Takım: {dos.takim_adi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {seciliDosData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'genel' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Genel Karşılaştırma</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Oyuncu</th>
                          <th className="text-center py-3 px-2">Takım</th>
                          <th className="text-center py-3 px-2">Yaş</th>
                          <th className="text-center py-3 px-2">Performans</th>
                          <th className="text-center py-3 px-2">Genel Sıra</th>
                          <th className="text-center py-3 px-2">Top Kazanma/90</th>
                          <th className="text-center py-3 px-2">Başarılı Press/Maç</th>
                          <th className="text-center py-3 px-2">Anahtar Müdahale/Maç</th>
                          <th className="text-center py-3 px-2">Pas %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seciliDosData.map((dos, index) => (
                          <tr key={dos.blabla_dos} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-3 px-2 font-medium">{dos.oyuncu_isim}</td>
                            <td className="py-3 px-2 text-center">{dos.takim_adi}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(dos.oyuncu_yas)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(dos.performans_skoru)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(dos.genel_sira)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(dos["KazanTop/90"])}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(dos.bsrlpressMB)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(dos.anhtmudMB)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(dos["Pas%"])}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'savunma' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Savunma Performansı Analizi</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Savunma vs Hücum Dengesi</h4>
                      <div className="h-96">
                        <Scatter
                          data={savunmaHucumScatterData}
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
                                      `Top Kazanma/90: ${safeToFixed(point.x)}`,
                                      `xA/90: ${safeToFixed(point.y)}`,
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
                                  text: 'Top Kazanma/90 (Savunma)'
                                },
                                min: 0,
                                max: 25
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: 'xA/90 (Hücum)'
                                },
                                min: 0,
                                max: 0.3
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Savunma Aktiviteleri</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliDosData.map(d => d.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Top Kesme/Maç',
                                data: seciliDosData.map(d => d.topksmeMB),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Şut Engelleme/Maç',
                                data: seciliDosData.map(d => d.sutengllmeMB),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Top Müdahale/Maç',
                                data: seciliDosData.map(d => d.topmdhMB),
                                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'top' as const },
                              title: {
                                display: true,
                                text: 'Savunma Aktiviteleri Karşılaştırması'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: { display: true, text: 'Maç Başına' }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Savunma detay tablosu */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Detaylı Savunma İstatistikleri</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">Top Kesme/Maç</th>
                            <th className="text-center py-3 px-2">Şut Engelleme/Maç</th>
                            <th className="text-center py-3 px-2">Top Müdahale/Maç</th>
                            <th className="text-center py-3 px-2">Başarılı Press/Maç</th>
                            <th className="text-center py-3 px-2">Top Kazanma/Maç</th>
                            <th className="text-center py-3 px-2">Top Kaybetme %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliDosData.map((dos, index) => (
                            <tr key={dos.blabla_dos} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{dos.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos.topksmeMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos.sutengllmeMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos.topmdhMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos.bsrlpressMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos.kznTopMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(dos.topkpm_yzd)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hucum' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Hücum Katkısı</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Hücum Katkıları</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliDosData.map(d => d.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Şut Pası/90',
                                data: seciliDosData.map(d => {
                                  // Şut Pası/90 değerlendirme aralığı: 0.00 - 5.00 (DOS için tipik aralık)
                                  const sPasMin = 0.00;
                                  const sPasMax = 2.00;
                                  const normalizedSPas = Math.min(100, Math.max(0, ((d["SPasi/90"] - sPasMin) / (sPasMax - sPasMin)) * 100));
                                  return normalizedSPas;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Dikey Kilit Pas/90',
                                data: seciliDosData.map(d => {
                                  // Dikey Kilit Pas/90 değerlendirme aralığı: 0.00 - 8.00 (DOS için tipik aralık)
                                  const dikKltPasMin = 0.00;
                                  const dikKltPasMax = 6.00;
                                  const normalizedDikKltPas = Math.min(100, Math.max(0, ((d["DikKltPas/90"] - dikKltPasMin) / (dikKltPasMax - dikKltPasMin)) * 100));
                                  return normalizedDikKltPas;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'xA/90',
                                data: seciliDosData.map(d => {
                                  // xA/90 değerlendirme aralığı: 0.00 - 0.30 (DOS için tipik aralık)
                                  const xAMin = 0.00;
                                  const xAMax = 0.25;
                                  const normalizedXA = Math.min(100, Math.max(0, ((d["xA/90"] - xAMin) / (xAMax - xAMin)) * 100));
                                  return normalizedXA;
                                }),
                                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'top' as const },
                              title: {
                                display: true,
                                text: 'Hücum Katkı Karşılaştırması'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const dos = seciliDosData[playerIndex];
                                    
                                    if (datasetLabel === 'Şut Pası/90') {
                                      return `${datasetLabel}: ${safeToFixed(dos["SPasi/90"])}`;
                                    } else if (datasetLabel === 'Dikey Kilit Pas/90') {
                                      return `${datasetLabel}: ${safeToFixed(dos["DikKltPas/90"])}`;
                                    } else if (datasetLabel === 'xA/90') {
                                      return `${datasetLabel}: ${safeToFixed(dos["xA/90"])}`;
                                    } else {
                                      return `${datasetLabel}: ${context.raw.toFixed(1)}`;
                                    }
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                title: { display: true, text: 'Normalize Edilmiş Değer (0-100)' }
                              }
                            }
                          }}
                        />
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-4">
                        <p><strong>Not:</strong> Hücum Katkısı grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Şut Pası/90:</strong> 0.00-5.00 aralığına göre normalize edilmiştir</li>
                          <li><strong>Dikey Kilit Pas/90:</strong> 0.00-8.00 aralığına göre normalize edilmiştir</li>
                          <li><strong>xA/90:</strong> 0.00-0.30 aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Pas Performansı</h4>
                      <div className="h-96">
                        <Scatter
                          data={{
                            datasets: [{
                              label: 'Pas Performance',
                              data: seciliDosData.map((dos, index) => ({
                                x: Number(dos["Pas%"]) || 0,
                                y: Number(dos["DikKltPas/90"]) || 0,
                                label: dos.oyuncu_isim
                              })),
                              backgroundColor: seciliDosData.map((_, index) => 
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
                                      `Pas %: ${safeToInt(point.x)}%`,
                                      `Dikey Kilit Pas/90: ${safeToFixed(point.y)}`
                                    ];
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                title: { display: true, text: 'Pas %' },
                                min: 70,
                                max: 100
                              },
                              y: {
                                title: { display: true, text: 'Dikey Kilit Pas/90' },
                                min: 0
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Hücum detay tablosu */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Detaylı Hücum İstatistikleri</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">Şut Pası/90</th>
                            <th className="text-center py-3 px-2">Dikey Kilit Pas/90</th>
                            <th className="text-center py-3 px-2">xA/90</th>
                            <th className="text-center py-3 px-2">Gol/90</th>
                            <th className="text-center py-3 px-2">Orta Girişimi/90</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliDosData.map((dos, index) => (
                            <tr key={dos.blabla_dos} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{dos.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos["SPasi/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos["DikKltPas/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos["xA/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos["Gol/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos["OrtGrsm/90"])}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fiziksel' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Fiziksel & Teknik Performans</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Fiziksel Aktivite</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliDosData.map(d => d.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Sprint/90',
                                data: seciliDosData.map(d => {
                                  // Sprint/90 değerlendirme aralığı: 8 - 25 (DOS için tipik aralık)
                                  const sprintMin = 3;
                                  const sprintMax = 11;
                                  const normalizedSprint = Math.min(100, Math.max(0, ((d["Sprint/90"] - sprintMin) / (sprintMax - sprintMin)) * 100));
                                  return normalizedSprint;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Koşu Mesafesi/Maç',
                                data: seciliDosData.map(d => {
                                  // Koşu Mesafesi/Maç değerlendirme aralığı: 10.0 - 14.0 km (DOS için tipik aralık)
                                  const mesafeMin = 10.0;
                                  const mesafeMax = 13.0;
                                  const normalizedMesafe = Math.min(100, Math.max(0, ((d.kosumsfMB - mesafeMin) / (mesafeMax - mesafeMin)) * 100));
                                  return normalizedMesafe;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Hava Topu %',
                                data: seciliDosData.map(d => {
                                  // Hava Topu % değerlendirme aralığı: 40 - 80% (DOS için tipik aralık)
                                  const havaMin = 20;
                                  const havaMax = 70;
                                  const normalizedHava = Math.min(100, Math.max(0, ((d["Hv%"] - havaMin) / (havaMax - havaMin)) * 100));
                                  return normalizedHava;
                                }),
                                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'top' as const },
                              title: {
                                display: true,
                                text: 'Fiziksel Performans Karşılaştırması'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const dos = seciliDosData[playerIndex];
                                    
                                    if (datasetLabel === 'Sprint/90') {
                                      return `${datasetLabel}: ${safeToFixed(dos["Sprint/90"])}`;
                                    } else if (datasetLabel === 'Koşu Mesafesi/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(dos.kosumsfMB)} km`;
                                    } else if (datasetLabel === 'Hava Topu %') {
                                      return `${datasetLabel}: ${safeToInt(dos["Hv%"])}%`;
                                    } else {
                                      return `${datasetLabel}: ${context.raw.toFixed(1)}`;
                                    }
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                title: { display: true, text: 'Değer' }
                              }
                            }
                          }}
                        />
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-4">
                        <p><strong>Not:</strong> Fiziksel Aktivite grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Sprint/90:</strong> 8-25 aralığına göre normalize edilmiştir (DOS için optimize edilmiş)</li>
                          <li><strong>Koşu Mesafesi/Maç:</strong> 10.0-14.0 km aralığına göre normalize edilmiştir</li>
                          <li><strong>Hava Topu %:</strong> 40-80% aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Teknik Beceriler</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliDosData.map(d => d.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Akan Oyunda İsabetli Orta %',
                                data: seciliDosData.map(d => {
                                  // Akan Oyunda İsabetli Orta % değerlendirme aralığı: 20 - 80% (DOS için tipik aralık)
                                  const aoIoMin = 0;
                                  const aoIoMax = 35;
                                  const normalizedAoIo = Math.min(100, Math.max(0, ((d["Ao-Io%"] - aoIoMin) / (aoIoMax - aoIoMin)) * 100));
                                  return normalizedAoIo;
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'İsabetli Pas %',
                                data: seciliDosData.map(d => {
                                  // İsabetli Pas % değerlendirme aralığı: 75 - 95% (DOS için tipik aralık)
                                  const isbtlPasMin = 75;
                                  const isbtlPasMax = 95;
                                  const normalizedIsbtlPas = Math.min(100, Math.max(0, ((d.isbtlpas_yzd - isbtlPasMin) / (isbtlPasMax - isbtlPasMin)) * 100));
                                  return normalizedIsbtlPas;
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Top Kaybetme %',
                                data: seciliDosData.map(d => {
                                  // Top Kaybetme % değerlendirme aralığı: 5 - 25% (düşük daha iyi, ters normalizasyon)
                                  const topKybMin = 5;
                                  const topKybMax = 25;
                                  const normalizedTopKyb = Math.min(100, Math.max(0, ((topKybMax - d["TopKyb/90"]) / (topKybMax - topKybMin)) * 100));
                                  return normalizedTopKyb;
                                }),
                                backgroundColor: 'rgba(255, 205, 86, 0.8)',
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'top' as const },
                              title: {
                                display: true,
                                text: 'Teknik Beceri Karşılaştırması'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const dos = seciliDosData[playerIndex];
                                    
                                    if (datasetLabel === 'Akan Oyunda İsabetli Orta %') {
                                      return `${datasetLabel}: ${safeToInt(dos["Ao-Io%"])}%`;
                                    } else if (datasetLabel === 'İsabetli Pas %') {
                                      return `${datasetLabel}: ${safeToInt(dos.isbtlpas_yzd)}%`;
                                    } else if (datasetLabel === 'Top Kaybetme %') {
                                      return `${datasetLabel}: ${safeToFixed(dos["TopKyb/90"])}%`;
                                    } else {
                                      return `${datasetLabel}: ${context.raw.toFixed(1)}`;
                                    }
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                title: { display: true, text: 'Değer' }
                              }
                            }
                          }}
                        />
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-4">
                        <p><strong>Not:</strong> Teknik Beceriler grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Akan Oyunda İsabetli Orta %:</strong> 20-80% aralığına göre normalize edilmiştir</li>
                          <li><strong>İsabetli Pas %:</strong> 75-95% aralığına göre normalize edilmiştir</li>
                          <li><strong>Top Kaybetme %:</strong> 5-25% aralığına göre ters normalize edilmiştir (düşük değer daha iyi)</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detaylı fiziksel tablo */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Detaylı Fiziksel & Teknik İstatistikler</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">Oyun Süresi</th>
                            <th className="text-center py-3 px-2">Sprint/90</th>
                            <th className="text-center py-3 px-2">Koşu Mesafesi/Maç</th>
                            <th className="text-center py-3 px-2">Akan Oyunda İsabetli Orta %</th>
                            <th className="text-center py-3 px-2">İsabetli Pas %</th>
                            <th className="text-center py-3 px-2">Top Kaybetme/90</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliDosData.map((dos, index) => (
                            <tr key={dos.blabla_dos} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{dos.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(dos.oyuncu_sure)} dk</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos["Sprint/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos.kosumsfMB)} km</td>
                              <td className="py-3 px-2 text-center">{safeToInt(dos["Ao-Io%"])}%</td>
                              <td className="py-3 px-2 text-center">{safeToInt(dos.isbtlpas_yzd)}%</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(dos["TopKyb/90"])}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                            text: 'Çok Boyutlu DOS Karşılaştırması'
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
                                  { name: 'Top Kazanma/90', key: 'KazanTop/90' },
                                  { name: 'Başarılı Press/Maç', key: 'bsrlpressMB' },
                                  { name: 'Anahtar Müdahale/Maç', key: 'anhtmudMB' },
                                  { name: 'Pas %', key: 'Pas%' },
                                  { name: 'Sprint/90', key: 'Sprint/90' },
                                  { name: 'Koşu Mesafesi/Maç', key: 'kosumsfMB' }
                                ];
                                const metric = metrics[dataIndex];
                                
                                // İlgili DOS verilerini bul
                                const dosLabel = context.dataset.label;
                                const dos = seciliDosData.find(d => d.oyuncu_isim === dosLabel);
                                
                                if (dos) {
                                  const originalValue = dos[metric.key as keyof CombinedDOSData] as number;
                                  
                                  // Yüzde değerleri için
                                  if (metric.key === 'Pas%') {
                                    return `${metric.name}: %${Number(originalValue).toFixed(1)}`;
                                  }
                                  
                                  // Koşu mesafesi için
                                  if (metric.key === 'kosumsfMB') {
                                    return `${metric.name}: ${Number(originalValue).toFixed(1)} km`;
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
                      <li><strong>Top Kazanma/90:</strong> 8-25 aralığında normalize edilmiştir</li>
                      <li><strong>Başarılı Press/Maç:</strong> 5-20 aralığında normalize edilmiştir</li>
                      <li><strong>Anahtar Müdahale/Maç:</strong> 0-3 aralığında normalize edilmiştir</li>
                      <li><strong>Pas %:</strong> 75-95% aralığında normalize edilmiştir</li>
                      <li><strong>Sprint/90:</strong> 8-25 aralığında normalize edilmiştir</li>
                      <li><strong>Koşu Mesafesi/Maç:</strong> 10-14 km aralığında normalize edilmiştir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {seciliDosData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 text-lg">Karşılaştırmak için en az bir DOS seçin</p>
              <p className="text-gray-400 text-sm mt-2">Maksimum 6 DOS karşılaştırabilirsiniz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 