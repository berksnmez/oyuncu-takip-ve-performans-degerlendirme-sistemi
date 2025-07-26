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

// Stoper veri tipleri
interface StoperGrafik {
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

interface StoperIstatistik {
  blabla_stp: string;
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
  performans_skoru: number;
  performans_skor_sirasi: number;
  surdurabilirlik_sira: number;
  topkesMB: number;
  topkesMB_katsayi: number;
  topkpm_yzd: number;
  topmdhMB: number;
  uzklstrmaMB: number;
  uzklstrmaMB_katsayi: number;
}

interface CombinedStoperData extends StoperGrafik, StoperIstatistik {
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

export default function StoperKarsilastir() {
  const { getItemsByCategory } = useTakipListesi();
  const [stoperler, setStoperler] = useState<CombinedStoperData[]>([]);
  const [seciliStoperler, setSeciliStoperler] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genel' | 'savunma' | 'hucum' | 'fiziksel' | 'radar'>('genel');
  const [sortBy, setSortBy] = useState<string>('performans_skoru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Stoper verilerini yükle
  useEffect(() => {
    const loadStoperler = async () => {
      try {
        setLoading(true);
        
        // Takip listesinden stoper blabla_stp değerlerini al
        const takipEdilenStoperler = getItemsByCategory('stoper');
        console.log("Takip edilen stoperler:", takipEdilenStoperler);
        const blablaStpList = takipEdilenStoperler.map(s => String(s.blabla_stp).trim());
        console.log("Blabla_stp listesi:", blablaStpList);
        
        if (blablaStpList.length === 0) {
          setStoperler([]);
          return;
        }

        // Grafik verilerini al
        const grafikResponse = await fetch('/api/defanslar-grafik');
        if (!grafikResponse.ok) throw new Error('Grafik verileri alınamadı');
        const grafikResult = await grafikResponse.json();
        console.log("Grafik result:", grafikResult);

        // İstatistik verilerini al
        const istatistikResponse = await fetch('/api/stoper-istatistik');
        if (!istatistikResponse.ok) throw new Error('İstatistik verileri alınamadı');
        const istatistikResult = await istatistikResponse.json();
        console.log("İstatistik result:", istatistikResult);

        // Verileri birleştir
        const combinedData: CombinedStoperData[] = [];
        
        blablaStpList.forEach(blablaStp => {
          console.log("Aranan blabla_stp:", blablaStp);
          
          // İstatistik verisini bul
          const istatistikData = istatistikResult.data?.find((i: any) => {
            const istatistikBlabla = String(i.blabla_stp || '').trim();
            console.log("İstatistik blabla_stp:", istatistikBlabla, "Aranan:", blablaStp);
            return istatistikBlabla === blablaStp;
          });

          if (!istatistikData) {
            console.log("İstatistik verisi bulunamadı:", blablaStp);
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
              blabla_stp: blablaStp, // Ensure consistent blabla_stp value
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
              anhtmudMB: Number(istatistikData.anhtmudMB) || 0,
              anhtmudMB_katsayi: Number(istatistikData.anhtmudMB_katsayi) || 0,
              bloklamaMB: Number(istatistikData.bloklamaMB) || 0,
              bloklamaMB_katsayi: Number(istatistikData.bloklamaMB_katsayi) || 0,
              bsrmudMB: Number(istatistikData.bsrmudMB) || 0,
              englsutMB: Number(istatistikData.englsutMB) || 0,
              englsutMB_katsayi: Number(istatistikData.englsutMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              kznht_yzd: Number(istatistikData.kznht_yzd) || 0,
              kznht_yzd_katsayi: Number(istatistikData.kznht_yzd_katsayi) || 0,
              kznTopMB: Number(istatistikData.kznTopMB) || 0,
              kznTopMB_katsayi: Number(istatistikData.kznTopMB_katsayi) || 0,
              mdhle_yzd_katsayi: Number(istatistikData.mdhle_yzd_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              topkesMB: Number(istatistikData.topkesMB) || 0,
              topkesMB_katsayi: Number(istatistikData.topkesMB_katsayi) || 0,
              topkpm_yzd: Number(istatistikData.topkpm_yzd) || 0,
              topmdhMB: Number(istatistikData.topmdhMB) || 0,
              uzklstrmaMB: Number(istatistikData.uzklstrmaMB) || 0,
              uzklstrmaMB_katsayi: Number(istatistikData.uzklstrmaMB_katsayi) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          } else if (istatistikData) {
            // Sadece istatistik verisi varsa, grafik verilerini varsayılan değerlerle doldur
            combinedData.push({
              ...istatistikData,
              blabla_stp: blablaStp,
              bnzrsz_def: '',
              // Default graphic values
              "Ao-Io%": 0,
              "Drp/90": 0,
              "Eng/90": Number(istatistikData.englsutMB) || 0,
              "HtmG/90": 0,
              "Hv%": 0,
              "KazanTop/90": Number(istatistikData.kznTopMB) || 0,
              "Mesf/90": 0,
              "OrtGrsm/90": 0,
              "Pas%": 0,
              "PsG/90": 0,
              "SPasi/90": 0,
              "Sprint/90": 0,
              "TopKyb/90": 0,
              "Uzk/90": Number(istatistikData.uzklstrmaMB) || 0,
              "xA/90": 0,
              // Convert statistical data to numbers
              anhtmudMB: Number(istatistikData.anhtmudMB) || 0,
              anhtmudMB_katsayi: Number(istatistikData.anhtmudMB_katsayi) || 0,
              bloklamaMB: Number(istatistikData.bloklamaMB) || 0,
              bloklamaMB_katsayi: Number(istatistikData.bloklamaMB_katsayi) || 0,
              bsrmudMB: Number(istatistikData.bsrmudMB) || 0,
              englsutMB: Number(istatistikData.englsutMB) || 0,
              englsutMB_katsayi: Number(istatistikData.englsutMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              kznht_yzd: Number(istatistikData.kznht_yzd) || 0,
              kznht_yzd_katsayi: Number(istatistikData.kznht_yzd_katsayi) || 0,
              kznTopMB: Number(istatistikData.kznTopMB) || 0,
              kznTopMB_katsayi: Number(istatistikData.kznTopMB_katsayi) || 0,
              mdhle_yzd_katsayi: Number(istatistikData.mdhle_yzd_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              topkesMB: Number(istatistikData.topkesMB) || 0,
              topkesMB_katsayi: Number(istatistikData.topkesMB_katsayi) || 0,
              topkpm_yzd: Number(istatistikData.topkpm_yzd) || 0,
              topmdhMB: Number(istatistikData.topmdhMB) || 0,
              uzklstrmaMB: Number(istatistikData.uzklstrmaMB) || 0,
              uzklstrmaMB_katsayi: Number(istatistikData.uzklstrmaMB_katsayi) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          }
        });

        console.log("Combined data:", combinedData);
        setStoperler(combinedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Stoper verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStoperler();
  }, [getItemsByCategory]);

  // Stoper seçimi
  const toggleStoperSelection = useCallback((blablaStp: string) => {
    console.log("Toggle stoper selection:", blablaStp);
    console.log("Mevcut seçili stoperler:", seciliStoperler);
    
    setSeciliStoperler(prev => {
      if (prev.includes(blablaStp)) {
        console.log("Stoper zaten seçili, çıkarılıyor");
        return prev.filter(id => id !== blablaStp);
      } else if (prev.length < 6) { // Maksimum 6 stoper karşılaştırılabilir
        console.log("Stoper ekleniyor");
        return [...prev, blablaStp];
      } else {
        console.log("Maksimum stoper sayısına ulaşıldı");
        return prev;
      }
    });
  }, [seciliStoperler]);

  // Sıralama
  const sortedStoperler = useMemo(() => {
    return [...stoperler].sort((a, b) => {
      const aVal = a[sortBy as keyof CombinedStoperData] as number;
      const bVal = b[sortBy as keyof CombinedStoperData] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [stoperler, sortBy, sortOrder]);

  // Seçili stoperler verisi
  const seciliStoperData = useMemo(() => {
    return stoperler.filter(stoper => seciliStoperler.includes(stoper.blabla_stp));
  }, [stoperler, seciliStoperler]);

  // Savunma performansı scatter chart data
  const savunmaScatterData = useMemo(() => {
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
          label: 'Savunma Performance',
          data: seciliStoperData.map((stoper, index) => ({
            x: stoper["KazanTop/90"],
            y: stoper["Eng/90"],
            label: stoper.oyuncu_isim,
            performans: stoper.performans_skoru
          })),
          backgroundColor: seciliStoperData.map((_, index) => colors[index % colors.length]),
          pointRadius: 8,
          pointHoverRadius: 10,
        }
      ]
    };
  }, [seciliStoperData]);

  // Radar chart data
  const radarChartData = useMemo(() => {
    if (seciliStoperData.length === 0) return { labels: [], datasets: [] };

    // Metrik etiketleri ve değerlendirme aralıkları
    const metrics = [
      { name: 'Top Kazanma/90', key: 'KazanTop/90', min: 0, max: 15 },
      { name: 'Engelleme/90', key: 'Eng/90', min: 0, max: 1.6 },
      { name: 'Pas %', key: 'Pas%', min: 0, max: 100 },
      { name: 'Hava Topu %', key: 'Hv%', min: 0, max: 100 },
      { name: 'Uzaklaştırma/90', key: 'Uzk/90', min: 0, max: 5.2 },
      { name: 'Anahtar Müdahale/Maç', key: 'anhtmudMB', min: 0, max: 1.4 }
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
      datasets: seciliStoperData.map((stoper, index) => {
        // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
        const normalizedData = metrics.map(metric => {
          const value = stoper[metric.key as keyof CombinedStoperData] as number || 0;
          
          // Değeri min-max aralığına göre 0-100 arasına normalize et
          return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
        });

        return {
          label: stoper.oyuncu_isim,
          data: normalizedData,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
          pointRadius: 4,
        };
      })
    };
  }, [seciliStoperData]);

  // Performance comparison bar chart
  const performanceBarData = useMemo(() => {
    if (seciliStoperData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliStoperData.map(s => s.oyuncu_isim),
      datasets: [
        {
          label: 'Performans Skoru',
          data: seciliStoperData.map(s => s.performans_skoru),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Top Kazanma/90',
          data: seciliStoperData.map(s => s["KazanTop/90"] * 5), // Scale for visibility
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'Engelleme/90',
          data: seciliStoperData.map(s => s["Eng/90"] * 5), // Scale for visibility
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    };
  }, [seciliStoperData]);

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
          <Link href="/takip-listesi/stoper" className="text-blue-600 hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Stoper Karşılaştırması</h1>
      
      {/* Pozisyon Navbar */}
      <TakipListesiNavbar seciliPozisyon="Stoper" />
      
            
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

      {stoperler.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz takip ettiğiniz stoper bulunmuyor.</p>
          <Link 
            href="/oyuncu-arama/stoper" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Stoper Ara
          </Link>
        </div>
      ) : (
        <>
          {/* Stoper Seçimi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                Karşılaştırılacak Stoperleri Seçin ({seciliStoperler.length}/6)
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
                  <option value="Eng/90">Engelleme/90</option>
                  <option value="Pas%">Pas %</option>
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
              {sortedStoperler.map((stoper) => (
                <div
                  key={stoper.blabla_stp}
                  onClick={() => {
                    console.log("Card clicked for stoper:", stoper.oyuncu_isim, "blabla_stp:", stoper.blabla_stp);
                    toggleStoperSelection(stoper.blabla_stp);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    seciliStoperler.includes(stoper.blabla_stp)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${seciliStoperler.length >= 6 && !seciliStoperler.includes(stoper.blabla_stp) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{stoper.oyuncu_isim}</h4>
                    <input
                      type="checkbox"
                      checked={seciliStoperler.includes(stoper.blabla_stp)}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log("Checkbox clicked:", stoper.blabla_stp);
                        toggleStoperSelection(stoper.blabla_stp);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Performans: {safeToFixed(stoper.performans_skoru)}</div>
                    <div>Genel Sıra: {safeToInt(stoper.genel_sira)}</div>
                    <div>Top Kazanma/90: {safeToFixed(stoper["KazanTop/90"])}</div>
                    <div>Engelleme/90: {safeToFixed(stoper["Eng/90"])}</div>
                    <div className="text-xs text-gray-400">Takım: {stoper.takim_adi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {seciliStoperData.length > 0 && (
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
                          <th className="text-center py-3 px-2">Engelleme/90</th>
                          <th className="text-center py-3 px-2">Pas %</th>
                          <th className="text-center py-3 px-2">Hava Topu %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seciliStoperData.map((stoper, index) => (
                          <tr key={stoper.blabla_stp} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-3 px-2 font-medium">{stoper.oyuncu_isim}</td>
                            <td className="py-3 px-2 text-center">{stoper.takim_adi}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(stoper.oyuncu_yas)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(stoper.performans_skoru)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(stoper.genel_sira)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(stoper["KazanTop/90"])}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(stoper["Eng/90"])}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(stoper["Pas%"])}%</td>
                            <td className="py-3 px-2 text-center">{safeToInt(stoper["Hv%"])}%</td>
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
                      <h4 className="text-lg font-medium mb-4">Top Kazanma vs Engelleme</h4>
                      <div className="h-96">
                        <Scatter
                          data={savunmaScatterData}
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
                                      `Engelleme/90: ${safeToFixed(point.y)}`,
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
                                  text: 'Top Kazanma/90'
                                },
                                min: 0,
                                max: 15
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: 'Engelleme/90'
                                },
                                min: 0,
                                max: 10
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Savunma Etkinliği</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliStoperData.map(s => s.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Blokaj/Maç',
                                data: seciliStoperData.map(s => {
                                  // Blokaj değerlendirme aralığı: 0.15 - 1.10
                                  const blokajMin = 0.15;
                                  const blokajMax = 1.10;
                                  const normalizedBlokaj = Math.min(100, Math.max(0, ((s.bloklamaMB - blokajMin) / (blokajMax - blokajMin)) * 100));
                                  return normalizedBlokaj;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Top Kesme/Maç',
                                data: seciliStoperData.map(s => {
                                  // Top kesme değerlendirme aralığı: 0.50 - 2.30
                                  const topKesmeMin = 0.50;
                                  const topKesmeMax = 2.30;
                                  const normalizedTopKesme = Math.min(100, Math.max(0, ((s.topkesMB - topKesmeMin) / (topKesmeMax - topKesmeMin)) * 100));
                                  return normalizedTopKesme;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Kazanılan Hava Topu %',
                                data: seciliStoperData.map(s => s.kznht_yzd),
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
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const stoper = seciliStoperData[playerIndex];
                                    
                                    if (datasetLabel === 'Blokaj/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(stoper.bloklamaMB)}`;
                                    } else if (datasetLabel === 'Top Kesme/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(stoper.topkesMB)}`;
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
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>Not:</strong> Savunma Etkinliği grafiğinde normalizasyon uygulanmıştır:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Blokaj/Maç:</strong> 0.15-1.10 aralığına göre 0-100 ölçeğinde normalize edilmiştir</li>
                      <li><strong>Top Kesme/Maç:</strong> 0.50-2.30 aralığına göre 0-100 ölçeğinde normalize edilmiştir</li>
                      <li><strong>Kazanılan Hava Topu %:</strong> Orijinal yüzde değerleri kullanılmıştır</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                  
                  {/* Savunma detay tablosu */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Detaylı Savunma İstatistikleri</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">Blokaj/Maç</th>
                            <th className="text-center py-3 px-2">Top Kesme/Maç</th>
                            <th className="text-center py-3 px-2">Şut Engelleme/Maç</th>
                            <th className="text-center py-3 px-2">Kazanılan Hava Topu %</th>
                            <th className="text-center py-3 px-2">Top Müdahale/Maç</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliStoperData.map((stoper, index) => (
                            <tr key={stoper.blabla_stp} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{stoper.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(stoper.bloklamaMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(stoper.topkesMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(stoper.englsutMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(stoper.kznht_yzd)}%</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(stoper.topmdhMB)}</td>
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
                            labels: seciliStoperData.map(s => s.oyuncu_isim),
                            datasets: [
                              {
                                label: 'xA/90',
                                data: seciliStoperData.map(s => {
                                  // xA/90 değerlendirme aralığı: 0.00 - 0.15 (stoperler için tipik aralık)
                                  const xAMin = 0.00;
                                  const xAMax = 0.09;
                                  const normalizedXA = Math.min(100, Math.max(0, ((s["xA/90"] - xAMin) / (xAMax - xAMin)) * 100));
                                  return normalizedXA;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Anahtar Pas/90',
                                data: seciliStoperData.map(s => {
                                  // Anahtar Pas/90 değerlendirme aralığı: 0.00 - 1.50 (stoperler için tipik aralık)
                                  const sPasMin = 0.00;
                                  const sPasMax = 0.90;
                                  const normalizedSPas = Math.min(100, Math.max(0, ((s["SPasi/90"] - sPasMin) / (sPasMax - sPasMin)) * 100));
                                  return normalizedSPas;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Orta Girişimi/90',
                                data: seciliStoperData.map(s => {
                                  // Orta Girişimi/90 değerlendirme aralığı: 0.00 - 2.00 (stoperler için tipik aralık)
                                  const ortaMin = 0.00;
                                  const ortaMax = 2.00;
                                  const normalizedOrta = Math.min(100, Math.max(0, ((s["OrtGrsm/90"] - ortaMin) / (ortaMax - ortaMin)) * 100));
                                  return normalizedOrta;
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
                                    const stoper = seciliStoperData[playerIndex];
                                    
                                    if (datasetLabel === 'xA/90') {
                                      return `${datasetLabel}: ${safeToFixed(stoper["xA/90"], 3)}`;
                                    } else if (datasetLabel === 'Anahtar Pas/90') {
                                      return `${datasetLabel}: ${safeToFixed(stoper["SPasi/90"])}`;
                                    } else if (datasetLabel === 'Orta Girişimi/90') {
                                      return `${datasetLabel}: ${safeToFixed(stoper["OrtGrsm/90"])}`;
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
                          <li><strong>xA/90:</strong> 0.00-0.15 aralığına göre normalize edilmiştir</li>
                          <li><strong>Anahtar Pas/90:</strong> 0.00-1.50 aralığına göre normalize edilmiştir</li>
                          <li><strong>Orta Girişimi/90:</strong> 0.00-2.00 aralığına göre normalize edilmiştir</li>
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
                              data: seciliStoperData.map((stoper, index) => ({
                                x: Number(stoper["Pas%"]) || 0,
                                y: Number(stoper["Uzk/90"]) || 0,
                                label: stoper.oyuncu_isim
                              })),
                              backgroundColor: seciliStoperData.map((_, index) => 
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
                                      `Uzaklaştırma/90: ${safeToFixed(point.y)}`
                                    ];
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                title: { display: true, text: 'Pas İsabet %' },
                                min: 70, max: 100
                              },
                              y: {
                                title: { display: true, text: 'Uzaklaştırma/90' },
                                min: 0
                              }
                            }
                          }}
                        />
                      </div>
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
                            labels: seciliStoperData.map(s => s.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Sprint/90',
                                data: seciliStoperData.map(s => {
                                  // Sprint/90 değerlendirme aralığı: 8 - 18 (stoperler için optimize edilmiş aralık)
                                  const sprintMin = 0;
                                  const sprintMax = 14;
                                  const normalizedSprint = Math.min(100, Math.max(0, ((s["Sprint/90"] - sprintMin) / (sprintMax - sprintMin)) * 100));
                                  return normalizedSprint;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Mesafe/90',
                                data: seciliStoperData.map(s => {
                                  // Mesafe/90 değerlendirme aralığı: 9.0 - 12.0 km (stoperler için tipik aralık)
                                  const mesafeMin = 9.0;
                                  const mesafeMax = 12.0;
                                  const normalizedMesafe = Math.min(100, Math.max(0, ((s["Mesf/90"] - mesafeMin) / (mesafeMax - mesafeMin)) * 100));
                                  return normalizedMesafe;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Hava Topu %',
                                data: seciliStoperData.map(s => {
                                  // Hava Topu % değerlendirme aralığı: 40 - 85% (stoperler için tipik aralık)
                                  const havaMin = 40;
                                  const havaMax = 85;
                                  const normalizedHava = Math.min(100, Math.max(0, ((s["Hv%"] - havaMin) / (havaMax - havaMin)) * 100));
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
                                    const stoper = seciliStoperData[playerIndex];
                                    
                                    if (datasetLabel === 'Sprint/90') {
                                      return `${datasetLabel}: ${safeToFixed(stoper["Sprint/90"])}`;
                                    } else if (datasetLabel === 'Mesafe/90') {
                                      return `${datasetLabel}: ${safeToFixed(stoper["Mesf/90"])} km`;
                                    } else if (datasetLabel === 'Hava Topu %') {
                                      return `${datasetLabel}: ${safeToInt(stoper["Hv%"])}%`;
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
                          <li><strong>Sprint/90:</strong> 0-14 aralığına göre normalize edilmiştir (stoperler için optimize edilmiş)</li>
                          <li><strong>Mesafe/90:</strong> 9.0-12.0 km aralığına göre normalize edilmiştir</li>
                          <li><strong>Hava Topu %:</strong> 40-85% aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Teknik Beceriler</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliStoperData.map(s => s.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Pas %',
                                data: seciliStoperData.map(s => {
                                  // Pas % değerlendirme aralığı: 75 - 95% (stoperler için tipik aralık)
                                  const pasMin = 65;
                                  const pasMax = 90;
                                  const normalizedPas = Math.min(100, Math.max(0, ((s["Pas%"] - pasMin) / (pasMax - pasMin)) * 100));
                                  return normalizedPas;
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'Top Kaybı/90',
                                data: seciliStoperData.map(s => {
                                  // Top Kaybı/90 değerlendirme aralığı: 5 - 15 (stoperler için tipik aralık, ters normalizasyon)
                                  const topKaybMin = 5;
                                  const topKaybMax = 15;
                                  // Ters normalizasyon: düşük top kaybı = yüksek skor
                                  const normalizedTopKayb = Math.min(100, Math.max(0, ((topKaybMax - s["TopKyb/90"]) / (topKaybMax - topKaybMin)) * 100));
                                  return normalizedTopKayb;
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Dribling/90',
                                data: seciliStoperData.map(s => {
                                  // Dribling/90 değerlendirme aralığı: 0.0 - 2.5 (stoperler için tipik aralık)
                                  const driblingMin = 0.0;
                                  const driblingMax = 0.5;
                                  const normalizedDribling = Math.min(100, Math.max(0, ((s["Drp/90"] - driblingMin) / (driblingMax - driblingMin)) * 100));
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
                                    const stoper = seciliStoperData[playerIndex];
                                    
                                    if (datasetLabel === 'Pas %') {
                                      return `${datasetLabel}: ${safeToInt(stoper["Pas%"])}%`;
                                    } else if (datasetLabel === 'Top Kaybı/90') {
                                      return `${datasetLabel}: ${safeToFixed(stoper["TopKyb/90"])} (Düşük = İyi)`;
                                    } else if (datasetLabel === 'Dribling/90') {
                                      return `${datasetLabel}: ${safeToFixed(stoper["Drp/90"])}`;
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
                          <li><strong>Pas %:</strong> 75-95% aralığına göre normalize edilmiştir</li>
                          <li><strong>Top Kaybı/90:</strong> 5-15 aralığına göre ters normalize edilmiştir (düşük değer = yüksek skor)</li>
                          <li><strong>Dribling/90:</strong> 0.0-2.5 aralığına göre normalize edilmiştir</li>
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
                            <th className="text-center py-3 px-2">Mesafe/90</th>
                            <th className="text-center py-3 px-2">Hava Topu %</th>
                            <th className="text-center py-3 px-2">Pas %</th>
                            <th className="text-center py-3 px-2">Dribling/90</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliStoperData.map((stoper, index) => (
                            <tr key={stoper.blabla_stp} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{stoper.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(stoper.oyuncu_sure)} dk</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(stoper["Sprint/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(stoper["Mesf/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(stoper["Hv%"])}%</td>
                              <td className="py-3 px-2 text-center">{safeToInt(stoper["Pas%"])}%</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(stoper["Drp/90"])}</td>
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
                            text: 'Çok Boyutlu Stoper Karşılaştırması'
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
                                  { name: 'Engelleme/90', key: 'Eng/90' },
                                  { name: 'Pas %', key: 'Pas%' },
                                  { name: 'Hava Topu %', key: 'Hv%' },
                                  { name: 'Uzaklaştırma/90', key: 'Uzk/90' },
                                  { name: 'Anlamlı Müdahale/Maç', key: 'anhtmudMB' }
                                ];
                                const metric = metrics[dataIndex];
                                
                                // İlgili stoper verilerini bul
                                const stoperLabel = context.dataset.label;
                                const stoper = seciliStoperData.find(s => s.oyuncu_isim === stoperLabel);
                                
                                if (stoper) {
                                  const originalValue = stoper[metric.key as keyof CombinedStoperData] as number;
                                  
                                  // Yüzde değerleri için
                                  if (metric.key === 'Pas%' || metric.key === 'Hv%') {
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
                      <li><strong>Top Kazanma/90:</strong> 0-15 aralığında normalize edilmiştir</li>
                      <li><strong>Engelleme/90:</strong> 0-10 aralığında normalize edilmiştir</li>
                      <li><strong>Pas %:</strong> 0-100% aralığında normalize edilmiştir</li>
                      <li><strong>Hava Topu %:</strong> 0-100% aralığında normalize edilmiştir</li>
                      <li><strong>Uzaklaştırma/90:</strong> 0-20 aralığında normalize edilmiştir</li>
                      <li><strong>Anlamlı Müdahale/Maç:</strong> 0-15 aralığında normalize edilmiştir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {seciliStoperData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 text-lg">Karşılaştırmak için en az bir stoper seçin</p>
              <p className="text-gray-400 text-sm mt-2">Maksimum 6 stoper karşılaştırabilirsiniz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 