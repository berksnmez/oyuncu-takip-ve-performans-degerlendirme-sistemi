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

// Bek veri tipleri
interface BekGrafik {
  bnzrsz_def: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  takim_adi: string;
  takim_id: number;
  "Ao-Io%": number;
  "Drp/90": number;
  "Eng/90": number;
  "HtmG/90": number;
  "Hv%": number;
  "KazanTop/90": number;
  "Mesf/90": number;
  "OrtGrsm/90": number;
  "Pas%": number;
  "PsG/90": number;
  "SPasi/90": number;
  "Sprint/90": number;
  "TopKyb/90": number;
  "Uzk/90": number;
  "xA/90": number;
}

interface BekIstatistik {
  blabla_bek: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yan_mevkii: string;
  oyuncu_yas: number;
  takim_adi: string;
  takim_id: number;
  anhtrpasMB: number;
  anhtrpasMB_katsayi: number;
  astbklntMB: number;
  astbklntMB_katsayi: number;
  bsrlpressMB: number;
  bsrlpressMB_katsayi: number;
  bsrltopmdhMB: number;
  bsrltopmdhMB_katsayi: number;
  bsrltopmdh_yzd: number;
  genel_sira: number;
  isbtlortMB: number;
  isbtlortMB_katsayi: number;
  isbtlpasMB: number;
  kalite_sira_katsayi: number;
  kosumsfMB: number;
  kosumsfMB_katsayi: number;
  performans_skoru: number;
  performans_skor_sirasi: number;
  surdurabilirlik_sira: number;
  sutengllmeMB: number;
  sutengllmeMB_katsayi: number;
  topksmeMB: number;
  topksmeMB_katsayi: number;
  topmdhMB: number;
  yrtclkEtknlk: number;
  yrtclkEtknlk_katsayi: number;
  yrtglfrstMB: number;
  yrtglfrstMB_katsayi: number;
}

interface CombinedBekData extends BekGrafik, BekIstatistik {
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

export default function BekKarsilastir() {
  const { getItemsByCategory } = useTakipListesi();
  const [bekler, setBekler] = useState<CombinedBekData[]>([]);
  const [seciliBekler, setSeciliBekler] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genel' | 'savunma' | 'hucum' | 'fiziksel' | 'radar'>('genel');
  const [sortBy, setSortBy] = useState<string>('performans_skoru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bek verilerini yükle
  useEffect(() => {
    const loadBekler = async () => {
      try {
        setLoading(true);
        
        // Takip listesinden bek blabla_bek değerlerini al
        const takipEdilenBekler = getItemsByCategory('bek');
        console.log("Takip edilen bekler:", takipEdilenBekler);
        const blablaBekList = takipEdilenBekler.map(b => String(b.blabla_bek).trim());
        console.log("Blabla_bek listesi:", blablaBekList);
        
        if (blablaBekList.length === 0) {
          setBekler([]);
          return;
        }

        // Grafik verilerini al
        const grafikResponse = await fetch('/api/defanslar-grafik');
        if (!grafikResponse.ok) throw new Error('Grafik verileri alınamadı');
        const grafikResult = await grafikResponse.json();
        console.log("Grafik result:", grafikResult);

        // İstatistik verilerini al
        const istatistikResponse = await fetch('/api/bek-istatistik');
        if (!istatistikResponse.ok) throw new Error('İstatistik verileri alınamadı');
        const istatistikResult = await istatistikResponse.json();
        console.log("İstatistik result:", istatistikResult);

        // Verileri birleştir
        const combinedData: CombinedBekData[] = [];
        
        blablaBekList.forEach(blablaBek => {
          console.log("Aranan blabla_bek:", blablaBek);
          
          // İstatistik verisini bul
          const istatistikData = istatistikResult.data?.find((i: any) => {
            const istatistikBlabla = String(i.blabla_bek || '').trim();
            console.log("İstatistik blabla_bek:", istatistikBlabla, "Aranan:", blablaBek);
            return istatistikBlabla === blablaBek;
          });

          if (!istatistikData) {
            console.log("İstatistik verisi bulunamadı:", blablaBek);
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
              blabla_bek: blablaBek, // Ensure consistent blabla_bek value
              bnzrsz_def: String(grafikData.bnzrsz_def || ''),
              // Convert numeric fields to ensure they are numbers
              "Ao-Io%": Number(grafikData["Ao-Io%"]) || 0,
              "Drp/90": Number(grafikData["Drp/90"]) || 0,
              "Eng/90": Number(grafikData["Eng/90"]) || 0,
              "HtmG/90": Number(grafikData["HtmG/90"]) || 0,
              "Hv%": Number(grafikData["Hv%"]) || 0,
              "KazanTop/90": Number(grafikData["KazanTop/90"]) || 0,
              "Mesf/90": Number(grafikData["Mesf/90"]) || 0,
              "OrtGrsm/90": Number(grafikData["OrtGrsm/90"]) || 0,
              "Pas%": Number(grafikData["Pas%"]) || 0,
              "PsG/90": Number(grafikData["PsG/90"]) || 0,
              "SPasi/90": Number(grafikData["SPasi/90"]) || 0,
              "Sprint/90": Number(grafikData["Sprint/90"]) || 0,
              "TopKyb/90": Number(grafikData["TopKyb/90"]) || 0,
              "Uzk/90": Number(grafikData["Uzk/90"]) || 0,
              "xA/90": Number(grafikData["xA/90"]) || 0,
              anhtrpasMB: Number(istatistikData.anhtrpasMB) || 0,
              anhtrpasMB_katsayi: Number(istatistikData.anhtrpasMB_katsayi) || 0,
              astbklntMB: Number(istatistikData.astbklntMB) || 0,
              astbklntMB_katsayi: Number(istatistikData.astbklntMB_katsayi) || 0,
              bsrlpressMB: Number(istatistikData.bsrlpressMB) || 0,
              bsrlpressMB_katsayi: Number(istatistikData.bsrlpressMB_katsayi) || 0,
              bsrltopmdhMB: Number(istatistikData.bsrltopmdhMB) || 0,
              bsrltopmdhMB_katsayi: Number(istatistikData.bsrltopmdhMB_katsayi) || 0,
              bsrltopmdh_yzd: Number(istatistikData.bsrltopmdh_yzd) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              isbtlortMB: Number(istatistikData.isbtlortMB) || 0,
              isbtlortMB_katsayi: Number(istatistikData.isbtlortMB_katsayi) || 0,
              isbtlpasMB: Number(istatistikData.isbtlpasMB) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              kosumsfMB: Number(istatistikData.kosumsfMB) || 0,
              kosumsfMB_katsayi: Number(istatistikData.kosumsfMB_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutengllmeMB: Number(istatistikData.sutengllmeMB) || 0,
              sutengllmeMB_katsayi: Number(istatistikData.sutengllmeMB_katsayi) || 0,
              topksmeMB: Number(istatistikData.topksmeMB) || 0,
              topksmeMB_katsayi: Number(istatistikData.topksmeMB_katsayi) || 0,
              topmdhMB: Number(istatistikData.topmdhMB) || 0,
              yrtclkEtknlk: Number(istatistikData.yrtclkEtknlk) || 0,
              yrtclkEtknlk_katsayi: Number(istatistikData.yrtclkEtknlk_katsayi) || 0,
              yrtglfrstMB: Number(istatistikData.yrtglfrstMB) || 0,
              yrtglfrstMB_katsayi: Number(istatistikData.yrtglfrstMB_katsayi) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          } else if (istatistikData) {
            // Sadece istatistik verisi varsa, grafik verilerini varsayılan değerlerle doldur
            combinedData.push({
              ...istatistikData,
              blabla_bek: blablaBek,
              bnzrsz_def: '',
              // Default graphic values
              "Ao-Io%": 0,
              "Drp/90": 0,
              "Eng/90": Number(istatistikData.sutengllmeMB) || 0,
              "HtmG/90": 0,
              "Hv%": 0,
              "KazanTop/90": Number(istatistikData.topksmeMB) || 0,
              "Mesf/90": Number(istatistikData.kosumsfMB) || 0,
              "OrtGrsm/90": Number(istatistikData.isbtlortMB) || 0,
              "Pas%": 0,
              "PsG/90": 0,
              "SPasi/90": 0,
              "Sprint/90": 0,
              "TopKyb/90": 0,
              "Uzk/90": 0,
              "xA/90": Number(istatistikData.astbklntMB) || 0,
              // Convert statistical data to numbers
              anhtrpasMB: Number(istatistikData.anhtrpasMB) || 0,
              anhtrpasMB_katsayi: Number(istatistikData.anhtrpasMB_katsayi) || 0,
              astbklntMB: Number(istatistikData.astbklntMB) || 0,
              astbklntMB_katsayi: Number(istatistikData.astbklntMB_katsayi) || 0,
              bsrlpressMB: Number(istatistikData.bsrlpressMB) || 0,
              bsrlpressMB_katsayi: Number(istatistikData.bsrlpressMB_katsayi) || 0,
              bsrltopmdhMB: Number(istatistikData.bsrltopmdhMB) || 0,
              bsrltopmdhMB_katsayi: Number(istatistikData.bsrltopmdhMB_katsayi) || 0,
              bsrltopmdh_yzd: Number(istatistikData.bsrltopmdh_yzd) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              isbtlortMB: Number(istatistikData.isbtlortMB) || 0,
              isbtlortMB_katsayi: Number(istatistikData.isbtlortMB_katsayi) || 0,
              isbtlpasMB: Number(istatistikData.isbtlpasMB) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              kosumsfMB: Number(istatistikData.kosumsfMB) || 0,
              kosumsfMB_katsayi: Number(istatistikData.kosumsfMB_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutengllmeMB: Number(istatistikData.sutengllmeMB) || 0,
              sutengllmeMB_katsayi: Number(istatistikData.sutengllmeMB_katsayi) || 0,
              topksmeMB: Number(istatistikData.topksmeMB) || 0,
              topksmeMB_katsayi: Number(istatistikData.topksmeMB_katsayi) || 0,
              topmdhMB: Number(istatistikData.topmdhMB) || 0,
              yrtclkEtknlk: Number(istatistikData.yrtclkEtknlk) || 0,
              yrtclkEtknlk_katsayi: Number(istatistikData.yrtclkEtknlk_katsayi) || 0,
              yrtglfrstMB: Number(istatistikData.yrtglfrstMB) || 0,
              yrtglfrstMB_katsayi: Number(istatistikData.yrtglfrstMB_katsayi) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          }
        });

        console.log("Combined data:", combinedData);
        setBekler(combinedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Bek verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBekler();
  }, [getItemsByCategory]);

  // Bek seçimi
  const toggleBekSelection = useCallback((blablaBek: string) => {
    console.log("Toggle bek selection:", blablaBek);
    console.log("Mevcut seçili bekler:", seciliBekler);
    
    setSeciliBekler(prev => {
      if (prev.includes(blablaBek)) {
        console.log("Bek zaten seçili, çıkarılıyor");
        return prev.filter(id => id !== blablaBek);
      } else if (prev.length < 6) { // Maksimum 6 bek karşılaştırılabilir
        console.log("Bek ekleniyor");
        return [...prev, blablaBek];
      } else {
        console.log("Maksimum bek sayısına ulaşıldı");
        return prev;
      }
    });
  }, [seciliBekler]);

  // Sıralama
  const sortedBekler = useMemo(() => {
    return [...bekler].sort((a, b) => {
      const aVal = a[sortBy as keyof CombinedBekData] as number;
      const bVal = b[sortBy as keyof CombinedBekData] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [bekler, sortBy, sortOrder]);

  // Seçili bekler verisi
  const seciliBekData = useMemo(() => {
    return bekler.filter(bek => seciliBekler.includes(bek.blabla_bek));
  }, [bekler, seciliBekler]);

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
          data: seciliBekData.map((bek, index) => ({
            x: bek["KazanTop/90"],
            y: bek["xA/90"],
            label: bek.oyuncu_isim,
            performans: bek.performans_skoru
          })),
          backgroundColor: seciliBekData.map((_, index) => colors[index % colors.length]),
          pointRadius: 8,
          pointHoverRadius: 10,
        }
      ]
    };
  }, [seciliBekData]);

  // Radar chart data
  const radarChartData = useMemo(() => {
    if (seciliBekData.length === 0) return { labels: [], datasets: [] };

    // Metrik etiketleri ve değerlendirme aralıkları
    const metrics = [
      { name: 'Top Kazanma/90', key: 'KazanTop/90', min: 5, max: 20 },
      { name: 'İsabetli Orta/Maç', key: 'isbtlortMB', min: 0, max: 1.2 },
      { name: 'xA/90', key: 'xA/90', min: 0, max: 0.6 },
      { name: 'Pas %', key: 'Pas%', min: 0, max: 100 },
      { name: 'Sprint/90', key: 'Sprint/90', min: 0, max: 18 },
      { name: 'Koşu Mesafesi/Maç', key: 'kosumsfMB', min: 9, max: 16 }
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
      datasets: seciliBekData.map((bek, index) => {
        // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
        const normalizedData = metrics.map(metric => {
          const value = bek[metric.key as keyof CombinedBekData] as number || 0;
          
          // Değeri min-max aralığına göre 0-100 arasına normalize et
          return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
        });

        return {
          label: bek.oyuncu_isim,
          data: normalizedData,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
          pointRadius: 4,
        };
      })
    };
  }, [seciliBekData]);

  // Performance comparison bar chart
  const performanceBarData = useMemo(() => {
    if (seciliBekData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliBekData.map(b => b.oyuncu_isim),
      datasets: [
        {
          label: 'Performans Skoru',
          data: seciliBekData.map(b => b.performans_skoru),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Top Kazanma/90',
          data: seciliBekData.map(b => b["KazanTop/90"] * 5), // Scale for visibility
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'xA/90',
          data: seciliBekData.map(b => b["xA/90"] * 20), // Scale for visibility
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    };
  }, [seciliBekData]);

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
          <Link href="/takip-listesi/bek" className="text-blue-600 hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Bek Karşılaştırması</h1>
      
      {/* Pozisyon Navbar */}
      <TakipListesiNavbar seciliPozisyon="Bek" />
      
            
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

      {bekler.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz takip ettiğiniz bek bulunmuyor.</p>
          <Link 
            href="/oyuncu-arama/bek" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Bek Ara
          </Link>
        </div>
      ) : (
        <>
          {/* Bek Seçimi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                Karşılaştırılacak Bekleri Seçin ({seciliBekler.length}/6)
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
                  <option value="xA/90">xA/90</option>
                  <option value="yrtclkEtknlk">Yaratıcılık Etkinlik</option>
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
              {sortedBekler.map((bek) => (
                <div
                  key={bek.blabla_bek}
                  onClick={() => {
                    console.log("Card clicked for bek:", bek.oyuncu_isim, "blabla_bek:", bek.blabla_bek);
                    toggleBekSelection(bek.blabla_bek);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    seciliBekler.includes(bek.blabla_bek)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${seciliBekler.length >= 6 && !seciliBekler.includes(bek.blabla_bek) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{bek.oyuncu_isim}</h4>
                    <input
                      type="checkbox"
                      checked={seciliBekler.includes(bek.blabla_bek)}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log("Checkbox clicked:", bek.blabla_bek);
                        toggleBekSelection(bek.blabla_bek);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Performans: {safeToFixed(bek.performans_skoru)}</div>
                    <div>Genel Sıra: {safeToInt(bek.genel_sira)}</div>
                    <div>Top Kazanma/90: {safeToFixed(bek["KazanTop/90"])}</div>
                    <div>xA/90: {safeToFixed(bek["xA/90"])}</div>
                    <div className="text-xs text-gray-400">Takım: {bek.takim_adi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {seciliBekData.length > 0 && (
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
                          <th className="text-center py-3 px-2">xA/90</th>
                          <th className="text-center py-3 px-2">Orta Girişimi/90</th>
                          <th className="text-center py-3 px-2">Yaratıcılık Etkinlik</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seciliBekData.map((bek, index) => (
                          <tr key={bek.blabla_bek} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-3 px-2 font-medium">{bek.oyuncu_isim}</td>
                            <td className="py-3 px-2 text-center">{bek.takim_adi}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(bek.oyuncu_yas)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(bek.performans_skoru)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(bek.genel_sira)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(bek["KazanTop/90"])}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(bek["xA/90"])}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(bek["OrtGrsm/90"])}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(bek.yrtclkEtknlk)}</td>
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
                                max: 20
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: 'xA/90 (Hücum)'
                                },
                                min: 0,
                                max: 0.55
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
                            labels: seciliBekData.map(b => b.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Top Kesme/Maç',
                                data: seciliBekData.map(b => b.topksmeMB),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Şut Engelleme/Maç',
                                data: seciliBekData.map(b => b.sutengllmeMB),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Top Müdahale/Maç',
                                data: seciliBekData.map(b => b.topmdhMB),
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
                            <th className="text-center py-3 px-2">Top Müdahale %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliBekData.map((bek, index) => (
                            <tr key={bek.blabla_bek} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{bek.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.topksmeMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.sutengllmeMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.topmdhMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.bsrlpressMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(bek.bsrltopmdh_yzd)}%</td>
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
                            labels: seciliBekData.map(b => b.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Anahtar Pas/Maç',
                                data: seciliBekData.map(b => {
                                  // Anahtar Pas/Maç değerlendirme aralığı: 0.00 - 2.50 (bekler için tipik aralık)
                                  const anhtrPasMin = 2.00;
                                  const anhtrPasMax = 8.50;
                                  const normalizedAnhtrPas = Math.min(100, Math.max(0, ((b.anhtrpasMB - anhtrPasMin) / (anhtrPasMax - anhtrPasMin)) * 100));
                                  return normalizedAnhtrPas;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Asist Beklentisi/Maç',
                                data: seciliBekData.map(b => {
                                  // Asist Beklentisi/Maç değerlendirme aralığı: 0.00 - 0.30 (bekler için tipik aralık)
                                  const astBklntMin = 0.00;
                                  const astBklntMax = 0.25;
                                  const normalizedAstBklnt = Math.min(100, Math.max(0, ((b.astbklntMB - astBklntMin) / (astBklntMax - astBklntMin)) * 100));
                                  return normalizedAstBklnt;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'İsabetli Orta/Maç',
                                data: seciliBekData.map(b => {
                                  // İsabetli Orta/Maç değerlendirme aralığı: 0.00 - 3.00 (bekler için tipik aralık)
                                  const isbtlOrtMin = 0.00;
                                  const isbtlOrtMax = 0.80;
                                  const normalizedIsbtlOrt = Math.min(100, Math.max(0, ((b.isbtlortMB - isbtlOrtMin) / (isbtlOrtMax - isbtlOrtMin)) * 100));
                                  return normalizedIsbtlOrt;
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
                                    const bek = seciliBekData[playerIndex];
                                    
                                    if (datasetLabel === 'Anahtar Pas/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(bek.anhtrpasMB)}`;
                                    } else if (datasetLabel === 'Asist Beklentisi/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(bek.astbklntMB)}`;
                                    } else if (datasetLabel === 'İsabetli Orta/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(bek.isbtlortMB)}`;
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
                        <p><strong>Not:</strong> Hücum Katkısı grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Anahtar Pas/Maç:</strong> 2.00-8.50 aralığına göre normalize edilmiştir</li>
                          <li><strong>Asist Beklentisi/Maç:</strong> 0.00-0.25 aralığına göre normalize edilmiştir</li>
                          <li><strong>İsabetli Orta/Maç:</strong> 0.00-0.80 aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Yaratıcılık & Pas</h4>
                      <div className="h-96">
                        <Scatter
                          data={{
                            datasets: [{
                              label: 'Yaratıcılık Performance',
                              data: seciliBekData.map((bek, index) => ({
                                x: Number(bek.yrtclkEtknlk) || 0,
                                y: Number(bek.anhtrpasMB) || 0,
                                label: bek.oyuncu_isim
                              })),
                              backgroundColor: seciliBekData.map((_, index) => 
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
                                      `Yaratıcılık Etkinlik: ${safeToFixed(point.x)}`,
                                      `Anahtar Pas/Maç: ${safeToFixed(point.y)}`
                                    ];
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                title: { display: true, text: 'Yaratıcılık Etkinlik' },
                                min: 0
                              },
                              y: {
                                title: { display: true, text: 'Anahtar Pas/Maç' },
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
                            <th className="text-center py-3 px-2">Anahtar Pas/Maç</th>
                            <th className="text-center py-3 px-2">Yaratıcılık Etkinlik</th>
                            <th className="text-center py-3 px-2">Asist Beklentisi/Maç</th>
                            <th className="text-center py-3 px-2">İsabetli Orta/Maç</th>
                            <th className="text-center py-3 px-2">Yarı Gol Fırsatı/Maç</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliBekData.map((bek, index) => (
                            <tr key={bek.blabla_bek} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{bek.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.anhtrpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.yrtclkEtknlk)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.astbklntMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.isbtlortMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.yrtglfrstMB)}</td>
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
                            labels: seciliBekData.map(b => b.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Sprint/90',
                                data: seciliBekData.map(b => {
                                  // Sprint/90 değerlendirme aralığı: 0 - 20 (bekler için tipik aralık, stoperlerden daha yüksek)
                                  const sprintMin = 0;
                                  const sprintMax = 20;
                                  const normalizedSprint = Math.min(100, Math.max(0, ((b["Sprint/90"] - sprintMin) / (sprintMax - sprintMin)) * 100));
                                  return normalizedSprint;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Koşu Mesafesi/Maç',
                                data: seciliBekData.map(b => {
                                  // Koşu Mesafesi/Maç değerlendirme aralığı: 10.0 - 13.5 km (bekler için tipik aralık, stoperlerden daha yüksek)
                                  const mesafeMin = 10.0;
                                  const mesafeMax = 13.5;
                                  const normalizedMesafe = Math.min(100, Math.max(0, ((b.kosumsfMB - mesafeMin) / (mesafeMax - mesafeMin)) * 100));
                                  return normalizedMesafe;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Hava Topu %',
                                data: seciliBekData.map(b => {
                                  // Hava Topu % değerlendirme aralığı: 30 - 75% (bekler için tipik aralık, stoperlerden daha düşük)
                                  const havaMin = 30;
                                  const havaMax = 75;
                                  const normalizedHava = Math.min(100, Math.max(0, ((b["Hv%"] - havaMin) / (havaMax - havaMin)) * 100));
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
                                    const bek = seciliBekData[playerIndex];
                                    
                                    if (datasetLabel === 'Sprint/90') {
                                      return `${datasetLabel}: ${safeToFixed(bek["Sprint/90"])}`;
                                    } else if (datasetLabel === 'Koşu Mesafesi/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(bek.kosumsfMB)} km`;
                                    } else if (datasetLabel === 'Hava Topu %') {
                                      return `${datasetLabel}: ${safeToInt(bek["Hv%"])}%`;
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
                          <li><strong>Sprint/90:</strong> 0-20 aralığına göre normalize edilmiştir (bekler için optimize edilmiş)</li>
                          <li><strong>Koşu Mesafesi/Maç:</strong> 10.0-13.5 km aralığına göre normalize edilmiştir</li>
                          <li><strong>Hava Topu %:</strong> 30-75% aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Teknik Beceriler</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliBekData.map(b => b.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Pas %',
                                data: seciliBekData.map(b => {
                                  // Pas % değerlendirme aralığı: 70 - 88% (bekler için tipik aralık, stoperlerden biraz düşük)
                                  const pasMin = 70;
                                  const pasMax = 88;
                                  const normalizedPas = Math.min(100, Math.max(0, ((b["Pas%"] - pasMin) / (pasMax - pasMin)) * 100));
                                  return normalizedPas;
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'İsabetli Pas/Maç',
                                data: seciliBekData.map(b => {
                                  // İsabetli Pas/Maç değerlendirme aralığı: 20 - 65 (bekler için tipik aralık)
                                  const isbtlPasMin = 20;
                                  const isbtlPasMax = 60;
                                  const normalizedIsbtlPas = Math.min(100, Math.max(0, ((b.isbtlpasMB - isbtlPasMin) / (isbtlPasMax - isbtlPasMin)) * 100));
                                  return normalizedIsbtlPas;
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Dribling/90',
                                data: seciliBekData.map(b => {
                                  // Dribling/90 değerlendirme aralığı: 0.0 - 3.0 (bekler için tipik aralık, stoperlerden daha yüksek)
                                  const driblingMin = 0.0;
                                  const driblingMax = 0.9;
                                  const normalizedDribling = Math.min(100, Math.max(0, ((b["Drp/90"] - driblingMin) / (driblingMax - driblingMin)) * 100));
                                  return normalizedDribling;
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
                                    const bek = seciliBekData[playerIndex];
                                    
                                    if (datasetLabel === 'Pas %') {
                                      return `${datasetLabel}: ${safeToInt(bek["Pas%"])}%`;
                                    } else if (datasetLabel === 'İsabetli Pas/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(bek.isbtlpasMB)}`;
                                    } else if (datasetLabel === 'Dribling/90') {
                                      return `${datasetLabel}: ${safeToFixed(bek["Drp/90"])}`;
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
                          <li><strong>Pas %:</strong> 70-88% aralığına göre normalize edilmiştir</li>
                          <li><strong>İsabetli Pas/Maç:</strong> 20-65 aralığına göre normalize edilmiştir</li>
                          <li><strong>Dribling/90:</strong> 0.0-3.0 aralığına göre normalize edilmiştir</li>
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
                            <th className="text-center py-3 px-2">Pas %</th>
                            <th className="text-center py-3 px-2">İsabetli Pas/Maç</th>
                            <th className="text-center py-3 px-2">Dribling/90</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliBekData.map((bek, index) => (
                            <tr key={bek.blabla_bek} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{bek.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(bek.oyuncu_sure)} dk</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek["Sprint/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.kosumsfMB)} km</td>
                              <td className="py-3 px-2 text-center">{safeToInt(bek["Pas%"])}%</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek.isbtlpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(bek["Drp/90"])}</td>
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
                            text: 'Çok Boyutlu Bek Karşılaştırması'
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
                                  { name: 'İsabetli Orta/Maç', key: 'isbtlortMB' },
                                  { name: 'xA/90', key: 'xA/90' },
                                  { name: 'Pas %', key: 'Pas%' },
                                  { name: 'Sprint/90', key: 'Sprint/90' },
                                  { name: 'Koşu Mesafesi/Maç', key: 'kosumsfMB' }
                                ];
                                const metric = metrics[dataIndex];
                                
                                // İlgili bek verilerini bul
                                const bekLabel = context.dataset.label;
                                const bek = seciliBekData.find(b => b.oyuncu_isim === bekLabel);
                                
                                if (bek) {
                                  const originalValue = bek[metric.key as keyof CombinedBekData] as number;
                                  
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
                      <li><strong>Top Kazanma/90:</strong> 0-15 aralığında normalize edilmiştir</li>
                      <li><strong>İsabetli Orta/Maç:</strong> 0-3 aralığında normalize edilmiştir</li>
                      <li><strong>xA/90:</strong> 0-0.5 aralığında normalize edilmiştir</li>
                      <li><strong>Pas %:</strong> 0-100% aralığında normalize edilmiştir</li>
                      <li><strong>Sprint/90:</strong> 0-25 aralığında normalize edilmiştir</li>
                      <li><strong>Koşu Mesafesi/Maç:</strong> 8-12 km aralığında normalize edilmiştir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {seciliBekData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 text-lg">Karşılaştırmak için en az bir bek seçin</p>
              <p className="text-gray-400 text-sm mt-2">Maksimum 6 bek karşılaştırabilirsiniz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 