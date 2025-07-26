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

// Santrafor veri tipleri
interface SantraforGrafik {
  bnzrsz_fv: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  takim_adi: string;
  takim_id: number;
  "Ao-Io%": number;
  "Drp/90": number;
  "Gol/90": number;
  "HtmG/90": number;
  "Hv%": number;
  "Mesf/90": number;
  "OrtGrsm/90": number;
  "Pas%": number;
  "PH-xG/90": number;
  "PsG/90": number;
  "SHd/90": number;
  "SPasi/90": number;
  "Sprint/90": number;
  "TopKyb/90": number;
  "xA/90": number;
  "xG/Sut": number;
}

interface SantraforIstatistik {
  blabla_snt: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yan_mevkii: string;
  oyuncu_yas: number;
  takim_adi: string;
  takim_id: number;
  bsrldrplMB: number;
  bsrldrplMB_katsayi: number;
  genel_sira: number;
  golbkltnsMB: number;
  golculukEtknlk: number;
  golculukEtknlk_katsayi: number;
  golMB: number;
  isbtlsutMB: number;
  isbtlsutMB_katsayi: number;
  kalite_sira_katsayi: number;
  kznhtMB: number;
  kznhtMB_katsayi: number;
  performans_skoru: number;
  performans_skor_sirasi: number;
  pnltszxgMB: number;
  pnltszxgMB_katsayi: number;
  stdustuxg: number;
  stdustuxg_katsayi: number;
  surdurabilirlik_sira: number;
  sutbsnagolbkltns: number;
  sutdgrlndrme_yzd: number;
  sutdgrlndrme_yzd_katsayi: number;
  toplamgol: number;
  toplamsut: number;
}

interface CombinedSantraforData extends SantraforGrafik, SantraforIstatistik {
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

export default function SantraforKarsilastir() {
  const { getItemsByCategory } = useTakipListesi();
  const [santraforlar, setSantraforlar] = useState<CombinedSantraforData[]>([]);
  const [seciliSantraforlar, setSeciliSantraforlar] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genel' | 'golculuk' | 'hucum' | 'fiziksel' | 'radar'>('genel');
  const [sortBy, setSortBy] = useState<string>('performans_skoru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Santrafor verilerini yükle
  useEffect(() => {
    const loadSantraforlar = async () => {
      try {
        setLoading(true);
        
        // Takip listesinden santrafor blabla_snt değerlerini al
        const takipEdilenSantraforlar = getItemsByCategory('santrafor');
        console.log("Takip edilen santraforlar:", takipEdilenSantraforlar);
        const blablaSntList = takipEdilenSantraforlar.map(s => String(s.blabla_snt).trim());
        console.log("Blabla_snt listesi:", blablaSntList);
        
        if (blablaSntList.length === 0) {
          setSantraforlar([]);
          return;
        }

        // Grafik verilerini al
        const grafikResponse = await fetch('/api/forvetler-grafik');
        if (!grafikResponse.ok) throw new Error('Grafik verileri alınamadı');
        const grafikResult = await grafikResponse.json();
        console.log("Grafik result:", grafikResult);

        // İstatistik verilerini al
        const istatistikResponse = await fetch('/api/santrafor-istatistik');
        if (!istatistikResponse.ok) throw new Error('İstatistik verileri alınamadı');
        const istatistikResult = await istatistikResponse.json();
        console.log("İstatistik result:", istatistikResult);

        // Verileri birleştir
        const combinedData: CombinedSantraforData[] = [];
        
        blablaSntList.forEach(blablaSnt => {
          console.log("Aranan blabla_snt:", blablaSnt);
          
          // İstatistik verisini bul
          const istatistikData = istatistikResult.data?.find((i: any) => {
            const istatistikBlabla = String(i.blabla_snt || '').trim();
            console.log("İstatistik blabla_snt:", istatistikBlabla, "Aranan:", blablaSnt);
            return istatistikBlabla === blablaSnt;
          });

          if (!istatistikData) {
            console.log("İstatistik verisi bulunamadı:", blablaSnt);
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
              blabla_snt: blablaSnt, // Ensure consistent blabla_snt value
              bnzrsz_fv: String(grafikData.bnzrsz_fv || ''),
              // Convert numeric fields to ensure they are numbers
              "Ao-Io%": Number(grafikData["Ao-Io%"]) || 0,
              "Drp/90": Number(grafikData["Drp/90"]) || 0,
              "Gol/90": Number(grafikData["Gol/90"]) || 0,
              "HtmG/90": Number(grafikData["HtmG/90"]) || 0,
              "Hv%": Number(grafikData["Hv%"]) || 0,
              "Mesf/90": Number(grafikData["Mesf/90"]) || 0,
              "OrtGrsm/90": Number(grafikData["OrtGrsm/90"]) || 0,
              "Pas%": Number(grafikData["Pas%"]) || 0,
              "PH-xG/90": Number(grafikData["PH-xG/90"]) || 0,
              "PsG/90": Number(grafikData["PsG/90"]) || 0,
              "SHd/90": Number(grafikData["SHd/90"]) || 0,
              "SPasi/90": Number(grafikData["SPasi/90"]) || 0,
              "Sprint/90": Number(grafikData["Sprint/90"]) || 0,
              "TopKyb/90": Number(grafikData["TopKyb/90"]) || 0,
              "xA/90": Number(grafikData["xA/90"]) || 0,
              "xG/Sut": Number(grafikData["xG/Sut"]) || 0,
              bsrldrplMB: Number(istatistikData.bsrldrplMB) || 0,
              bsrldrplMB_katsayi: Number(istatistikData.bsrldrplMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              golbkltnsMB: Number(istatistikData.golbkltnsMB) || 0,
              golculukEtknlk: Number(istatistikData.golculukEtknlk) || 0,
              golculukEtknlk_katsayi: Number(istatistikData.golculukEtknlk_katsayi) || 0,
              golMB: Number(istatistikData.golMB) || 0,
              isbtlsutMB: Number(istatistikData.isbtlsutMB) || 0,
              isbtlsutMB_katsayi: Number(istatistikData.isbtlsutMB_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              kznhtMB: Number(istatistikData.kznhtMB) || 0,
              kznhtMB_katsayi: Number(istatistikData.kznhtMB_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              pnltszxgMB: Number(istatistikData.pnltszxgMB) || 0,
              pnltszxgMB_katsayi: Number(istatistikData.pnltszxgMB_katsayi) || 0,
              stdustuxg: Number(istatistikData.stdustuxg) || 0,
              stdustuxg_katsayi: Number(istatistikData.stdustuxg_katsayi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutbsnagolbkltns: Number(istatistikData.sutbsnagolbkltns) || 0,
              sutdgrlndrme_yzd: Number(istatistikData.sutdgrlndrme_yzd) || 0,
              sutdgrlndrme_yzd_katsayi: Number(istatistikData.sutdgrlndrme_yzd_katsayi) || 0,
              toplamgol: Number(istatistikData.toplamgol) || 0,
              toplamsut: Number(istatistikData.toplamsut) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          } else if (istatistikData) {
            // Sadece istatistik verisi varsa, grafik verilerini varsayılan değerlerle doldur
            combinedData.push({
              ...istatistikData,
              blabla_snt: blablaSnt,
              bnzrsz_fv: '',
              // Default graphic values
              "Ao-Io%": 0,
              "Drp/90": 0,
              "Gol/90": Number(istatistikData.golMB) || 0,
              "HtmG/90": 0,
              "Hv%": 0,
              "Mesf/90": 0,
              "OrtGrsm/90": 0,
              "Pas%": 0,
              "PH-xG/90": Number(istatistikData.pnltszxgMB) || 0,
              "PsG/90": 0,
              "SHd/90": 0,
              "SPasi/90": 0,
              "Sprint/90": 0,
              "TopKyb/90": 0,
              "xA/90": 0,
              "xG/Sut": Number(istatistikData.stdustuxg) || 0,
              // Convert statistical data to numbers
              bsrldrplMB: Number(istatistikData.bsrldrplMB) || 0,
              bsrldrplMB_katsayi: Number(istatistikData.bsrldrplMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              golbkltnsMB: Number(istatistikData.golbkltnsMB) || 0,
              golculukEtknlk: Number(istatistikData.golculukEtknlk) || 0,
              golculukEtknlk_katsayi: Number(istatistikData.golculukEtknlk_katsayi) || 0,
              golMB: Number(istatistikData.golMB) || 0,
              isbtlsutMB: Number(istatistikData.isbtlsutMB) || 0,
              isbtlsutMB_katsayi: Number(istatistikData.isbtlsutMB_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              kznhtMB: Number(istatistikData.kznhtMB) || 0,
              kznhtMB_katsayi: Number(istatistikData.kznhtMB_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              pnltszxgMB: Number(istatistikData.pnltszxgMB) || 0,
              pnltszxgMB_katsayi: Number(istatistikData.pnltszxgMB_katsayi) || 0,
              stdustuxg: Number(istatistikData.stdustuxg) || 0,
              stdustuxg_katsayi: Number(istatistikData.stdustuxg_katsayi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutbsnagolbkltns: Number(istatistikData.sutbsnagolbkltns) || 0,
              sutdgrlndrme_yzd: Number(istatistikData.sutdgrlndrme_yzd) || 0,
              sutdgrlndrme_yzd_katsayi: Number(istatistikData.sutdgrlndrme_yzd_katsayi) || 0,
              toplamgol: Number(istatistikData.toplamgol) || 0,
              toplamsut: Number(istatistikData.toplamsut) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          }
        });

        console.log("Combined data:", combinedData);
        setSantraforlar(combinedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Santrafor verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSantraforlar();
  }, [getItemsByCategory]);

  // Santrafor seçimi
  const toggleSantraforSelection = useCallback((blablaSnt: string) => {
    console.log("Toggle santrafor selection:", blablaSnt);
    console.log("Mevcut seçili santraforlar:", seciliSantraforlar);
    
    setSeciliSantraforlar(prev => {
      if (prev.includes(blablaSnt)) {
        console.log("Santrafor zaten seçili, çıkarılıyor");
        return prev.filter(id => id !== blablaSnt);
      } else if (prev.length < 6) { // Maksimum 6 santrafor karşılaştırılabilir
        console.log("Santrafor ekleniyor");
        return [...prev, blablaSnt];
      } else {
        console.log("Maksimum santrafor sayısına ulaşıldı");
        return prev;
      }
    });
  }, [seciliSantraforlar]);

  // Sıralama
  const sortedSantraforlar = useMemo(() => {
    return [...santraforlar].sort((a, b) => {
      const aVal = a[sortBy as keyof CombinedSantraforData] as number;
      const bVal = b[sortBy as keyof CombinedSantraforData] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [santraforlar, sortBy, sortOrder]);

  // Seçili santraforlar verisi
  const seciliSantraforData = useMemo(() => {
    return santraforlar.filter(santrafor => seciliSantraforlar.includes(santrafor.blabla_snt));
  }, [santraforlar, seciliSantraforlar]);

  // Gol vs xG scatter chart data
  const golXgScatterData = useMemo(() => {
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
          label: 'Gol vs xG Performance',
          data: seciliSantraforData.map((santrafor, index) => ({
            x: santrafor["PH-xG/90"],
            y: santrafor["Gol/90"],
            label: santrafor.oyuncu_isim,
            performans: santrafor.performans_skoru
          })),
          backgroundColor: seciliSantraforData.map((_, index) => colors[index % colors.length]),
          pointRadius: 8,
          pointHoverRadius: 10,
        }
      ]
    };
  }, [seciliSantraforData]);

  // Radar chart data
  const radarChartData = useMemo(() => {
    if (seciliSantraforData.length === 0) return { labels: [], datasets: [] };

    // Metrik tanımları ve değerlendirme aralıkları
    const metrics = [
      { name: 'Maç Başına Gol', key: 'Gol/90', min: 0.15, max: 0.6 },
      { name: 'Penaltı Harici Maç Başına Gol Beklentisi', key: 'PH-xG/90', min: 0, max: 1.5 },
      { name: 'Standart Üstü Gol Beklentisi', key: 'stdustuxg', min: -1, max: 2 },
      { name: 'Şutu Gole Çevirme Yüzdesi', key: 'sutdgrlndrme_yzd', min: 5, max: 35 },
      { name: 'Maç Başına Kazanılan Hava Topu', key: 'kznhtMB', min: 0.5, max: 5 },
      { name: 'Golcülük Etkinliği', key: 'golculukEtknlk', min: 0, max: 0.4 }
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
      datasets: seciliSantraforData.map((santrafor, index) => ({
        label: santrafor.oyuncu_isim,
        data: metrics.map(metric => {
          const value = santrafor[metric.key as keyof CombinedSantraforData] as number || 0;
          // Değeri min-max aralığına göre 0-100 arasına normalize et
          const normalizedValue = Math.min(100, Math.max(0, ((value - metric.min) / (metric.max - metric.min)) * 100));
          return normalizedValue;
        }),
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 2,
        pointRadius: 4,
      }))
    };
  }, [seciliSantraforData]);

  // Performance comparison bar chart
  const performanceBarData = useMemo(() => {
    if (seciliSantraforData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliSantraforData.map(s => s.oyuncu_isim),
      datasets: [
        {
          label: 'Performans Skoru',
          data: seciliSantraforData.map(s => s.performans_skoru),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Gol/90',
          data: seciliSantraforData.map(s => s["Gol/90"] * 10), // Scale for visibility
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'xG/90',
          data: seciliSantraforData.map(s => s["PH-xG/90"] * 10), // Scale for visibility
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    };
  }, [seciliSantraforData]);

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
          <Link href="/takip-listesi/santrafor" className="text-blue-600 hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Santrafor Karşılaştırması</h1>
      
      {/* Pozisyon Navbar */}
      <TakipListesiNavbar seciliPozisyon="Santrafor" />
      
            
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'genel', label: 'Genel Bakış' },
            { key: 'golculuk', label: 'Golcülük Analizi' },
            { key: 'hucum', label: 'Hücum Performansı' },
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

      {santraforlar.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz takip ettiğiniz santrafor bulunmuyor.</p>
          <Link 
            href="/oyuncu-arama/santrafor" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Santrafor Ara
          </Link>
        </div>
      ) : (
        <>
          {/* Santrafor Seçimi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                Karşılaştırılacak Santraforları Seçin ({seciliSantraforlar.length}/6)
              </h3>
              <div className="flex items-center space-x-4">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="performans_skoru">Performans Skoru</option>
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="Gol/90">Gol/90</option>
                  <option value="PH-xG/90">xG/90</option>
                  <option value="golculukEtknlk">Golcülük Etkinlik</option>
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
              {sortedSantraforlar.map((santrafor) => (
                <div
                  key={santrafor.blabla_snt}
                  onClick={() => {
                    console.log("Card clicked for santrafor:", santrafor.oyuncu_isim, "blabla_snt:", santrafor.blabla_snt);
                    toggleSantraforSelection(santrafor.blabla_snt);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    seciliSantraforlar.includes(santrafor.blabla_snt)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${seciliSantraforlar.length >= 6 && !seciliSantraforlar.includes(santrafor.blabla_snt) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{santrafor.oyuncu_isim}</h4>
                    <input
                      type="checkbox"
                      checked={seciliSantraforlar.includes(santrafor.blabla_snt)}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log("Checkbox clicked:", santrafor.blabla_snt);
                        toggleSantraforSelection(santrafor.blabla_snt);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Performans: {safeToFixed(santrafor.performans_skoru)}</div>
                    <div>Genel Sıra: {safeToInt(santrafor.genel_sira)}</div>
                    <div>Gol/90: {safeToFixed(santrafor["Gol/90"])}</div>
                    <div>xG/90: {safeToFixed(santrafor["PH-xG/90"])}</div>
                    <div className="text-xs text-gray-400">Takım: {santrafor.takim_adi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {seciliSantraforData.length > 0 && (
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
                          <th className="text-center py-3 px-2">Gol/90</th>
                          <th className="text-center py-3 px-2">xG/90</th>
                          <th className="text-center py-3 px-2">xA/90</th>
                          <th className="text-center py-3 px-2">Toplam Gol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seciliSantraforData.map((santrafor, index) => (
                          <tr key={santrafor.blabla_snt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-3 px-2 font-medium">{santrafor.oyuncu_isim}</td>
                            <td className="py-3 px-2 text-center">{santrafor.takim_adi}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(santrafor.oyuncu_yas)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(santrafor.performans_skoru)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(santrafor.genel_sira)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(santrafor["Gol/90"])}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(santrafor["PH-xG/90"])}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(santrafor["xA/90"])}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(santrafor.toplamgol)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'golculuk' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Golcülük Performansı Analizi</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Gol/90 vs xG/90</h4>
                      <div className="h-96">
                        <Scatter
                          data={golXgScatterData}
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
                                      `Gol/90: ${safeToFixed(point.y)}`,
                                      `xG/90: ${safeToFixed(point.x)}`,
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
                                  text: 'Expected Goals (xG/90)'
                                },
                                min: 0,
                                max: 2
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: 'Gerçek Gol (Gol/90)'
                                },
                                min: 0,
                                max: 2
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Şut Etkinliği</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliSantraforData.map(s => s.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Şut Değerlendirme %',
                                data: seciliSantraforData.map(santrafor => {
                                  // Şut Değerlendirme % değerlendirme aralığı: 5-40% (Santrafor için tipik aralık)
                                  const value = santrafor.sutdgrlndrme_yzd;
                                  const min = 0;
                                  const max = 35;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Şut Başına Gol Beklentisi',
                                data: seciliSantraforData.map(santrafor => {
                                  // xG/Şut değerlendirme aralığı: 0.05-0.35 (Santrafor için tipik aralık)
                                  const value = santrafor["xG/Sut"];
                                  const min = 0.00;
                                  const max = 0.32;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Maç Başına İsabetli Şut',
                                data: seciliSantraforData.map(santrafor => {
                                  // İsabetli Şut/Maç değerlendirme aralığı: 0.5-6.0 (Santrafor için tipik aralık)
                                  const value = santrafor.isbtlsutMB;
                                  const min = 0.3;
                                  const max = 1.5;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
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
                                text: 'Şut Kalitesi ve İsabet Oranı'
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context: any) => {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const santrafor = seciliSantraforData[playerIndex];
                                    
                                    if (datasetLabel === 'Şut Değerlendirme %') {
                                      return `Şut Değerlendirme %: ${safeToFixed(santrafor.sutdgrlndrme_yzd)}%`;
                                    } else if (datasetLabel === 'Şut Başına Gol Beklentisi') {
                                      return `Şut Başına Gol Beklentisi: ${safeToFixed(santrafor["xG/Sut"], 3)}`;
                                    } else if (datasetLabel === 'Maç Başına İsabetli Şut') {
                                      return `Maç Başına İsabetli Şut: ${safeToFixed(santrafor.isbtlsutMB)}`;
                                    }
                                    return `${datasetLabel}: ${context.parsed.y.toFixed(1)}`;
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
                  
                  {/* Golcülük detay tablosu */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Detaylı Golcülük İstatistikleri</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">Golcülük Etkinlik</th>
                            <th className="text-center py-3 px-2">Gol Beklentisi/Maç</th>
                            <th className="text-center py-3 px-2">Şut/Gol Oranı</th>
                            <th className="text-center py-3 px-2">Toplam Şut</th>
                            <th className="text-center py-3 px-2">Şut İsabet %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliSantraforData.map((santrafor, index) => (
                            <tr key={santrafor.blabla_snt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{santrafor.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(santrafor.golculukEtknlk)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(santrafor.golbkltnsMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(santrafor.sutbsnagolbkltns)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(santrafor.toplamsut)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(santrafor.sutdgrlndrme_yzd)}%</td>
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
                  <h3 className="text-xl font-semibold mb-6">Hücum Performansı</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Hücum Katkıları</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliSantraforData.map(s => s.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Gol/90',
                                data: seciliSantraforData.map(santrafor => {
                                  // Gol/90 değerlendirme aralığı: 0.1-1.2 (Santrafor için tipik aralık)
                                  const value = santrafor["Gol/90"];
                                  const min = 0.0;
                                  const max = 0.9;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'xA/90',
                                data: seciliSantraforData.map(santrafor => {
                                  // xA/90 değerlendirme aralığı: 0.02-0.35 (Santrafor için tipik aralık)
                                  const value = santrafor["xA/90"];
                                  const min = 0.00;
                                  const max = 0.50;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Şut Pası/90',
                                data: seciliSantraforData.map(santrafor => {
                                  // Anahtar Pas/90 değerlendirme aralığı: 0.2-3.5 (Santrafor için tipik aralık)
                                  const value = santrafor["SPasi/90"];
                                  const min = 0.1;
                                  const max = 3.0;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
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
                                  label: (context: any) => {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const santrafor = seciliSantraforData[playerIndex];
                                    
                                    if (datasetLabel === 'Gol/90') {
                                      return `Gol/90: ${safeToFixed(santrafor["Gol/90"], 2)}`;
                                    } else if (datasetLabel === 'xA/90') {
                                      return `xA/90: ${safeToFixed(santrafor["xA/90"], 3)}`;
                                    } else if (datasetLabel === 'Şut Pası/90') {
                                      return `Şut Pası/90: ${safeToFixed(santrafor["SPasi/90"])}`;
                                    }
                                    return `${datasetLabel}: ${context.parsed.y.toFixed(1)}`;
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
                    <div>
                      <h4 className="text-lg font-medium mb-4">Hareketlilik & Pozisyon</h4>
                      <div className="h-96">
                        <Scatter
                          data={{
                            datasets: [{
                              label: 'Hareketlilik',
                              data: seciliSantraforData.map((santrafor, index) => ({
                                x: Number(santrafor["Sprint/90"]) || 0,
                                y: Number(santrafor["Mesf/90"]) || 0,
                                label: santrafor.oyuncu_isim
                              })),
                              backgroundColor: seciliSantraforData.map((_, index) => 
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
                                      `Sprint/90: ${safeToFixed(point.x)}`,
                                      `Mesafe/90: ${safeToFixed(point.y)}`
                                    ];
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                title: { display: true, text: 'Sprint/90' },
                                min: 0
                              },
                              y: {
                                title: { display: true, text: 'Mesafe/90 (km)' },
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
                            labels: seciliSantraforData.map(s => s.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Sprint/90',
                                data: seciliSantraforData.map(santrafor => {
                                  // Sprint/90 değerlendirme aralığı: 2-18 (Santrafor için tipik aralık)
                                  const value = santrafor["Sprint/90"];
                                  const min = 0;
                                  const max = 13;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Mesafe/90',
                                data: seciliSantraforData.map(santrafor => {
                                  // Mesafe/90 değerlendirme aralığı: 8.5-11.5 km (Santrafor için tipik aralık)
                                  const value = santrafor["Mesf/90"];
                                  const min = 8;
                                  const max = 13;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Hava Topu %',
                                data: seciliSantraforData.map(santrafor => {
                                  // Hava Topu % değerlendirme aralığı: 25-75% (Santrafor için tipik aralık)
                                  const value = santrafor["Hv%"];
                                  const min = 0;
                                  const max = 70;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
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
                                  label: (context: any) => {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const santrafor = seciliSantraforData[playerIndex];
                                    
                                    if (datasetLabel === 'Sprint/90') {
                                      return `Sprint/90: ${safeToFixed(santrafor["Sprint/90"])}`;
                                    } else if (datasetLabel === 'Mesafe/90') {
                                      return `Mesafe/90: ${safeToFixed(santrafor["Mesf/90"])} km`;
                                    } else if (datasetLabel === 'Hava Topu %') {
                                      return `Hava Topu %: ${safeToFixed(santrafor["Hv%"])}%`;
                                    }
                                    return `${datasetLabel}: ${context.parsed.y.toFixed(1)}`;
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
                    <div>
                      <h4 className="text-lg font-medium mb-4">Teknik Beceriler</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliSantraforData.map(s => s.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Pas %',
                                data: seciliSantraforData.map(santrafor => {
                                  // Pas % değerlendirme aralığı: 50-90% (Santrafor için tipik aralık)
                                  const value = santrafor["Pas%"];
                                  const min = 60;
                                  const max = 95;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'Top Kaybı/90',
                                data: seciliSantraforData.map(santrafor => {
                                  // Top Kaybı/90 değerlendirme aralığı: 8-25 (Santrafor için tipik aralık, düşük daha iyi)
                                  const value = santrafor["TopKyb/90"];
                                  const min = 2;
                                  const max = 14;
                                  // Ters çeviriyoruz çünkü düşük değer daha iyi
                                  return Math.min(100, Math.max(0, ((max - value) / (max - min)) * 100));
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Dribling/90',
                                data: seciliSantraforData.map(santrafor => {
                                  // Dribling/90 değerlendirme aralığı: 0.3-4.5 (Santrafor için tipik aralık)
                                  const value = santrafor["Drp/90"];
                                  const min = 0.2;
                                  const max = 3.0;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
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
                                  label: (context: any) => {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const santrafor = seciliSantraforData[playerIndex];
                                    
                                    if (datasetLabel === 'Pas %') {
                                      return `Pas %: ${safeToFixed(santrafor["Pas%"])}%`;
                                    } else if (datasetLabel === 'Top Kaybı/90') {
                                      return `Top Kaybı/90: ${safeToFixed(santrafor["TopKyb/90"])}`;
                                    } else if (datasetLabel === 'Dribling/90') {
                                      return `Dribling/90: ${safeToFixed(santrafor["Drp/90"])}`;
                                    }
                                    return `${datasetLabel}: ${context.parsed.y.toFixed(1)}`;
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
                          {seciliSantraforData.map((santrafor, index) => (
                            <tr key={santrafor.blabla_snt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{santrafor.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(santrafor.oyuncu_sure)} dk</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(santrafor["Sprint/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(santrafor["Mesf/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(santrafor["Hv%"])}%</td>
                              <td className="py-3 px-2 text-center">{safeToInt(santrafor["Pas%"])}%</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(santrafor["Drp/90"])}</td>
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
                            text: 'Çok Boyutlu Santrafor Karşılaştırması'
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
                                  { name: 'Maç Başına Gol', key: 'Gol/90' },
                                  { name: 'Penaltı Harici Maç Başına Gol Beklentisi', key: 'PH-xG/90' },
                                  { name: 'Standart Üstü Gol Beklentisi', key: 'stdustuxg' },
                                  { name: 'Şutu Gole Çevirme Yüzdesi', key: 'sutdgrlndrme_yzd' },
                                  { name: 'Maç Başına Kazanılan Hava Topu', key: 'kznhtMB' },
                                  { name: 'Golcülük Etkinliği', key: 'golculukEtknlk' }
                                ];
                                const metric = metrics[dataIndex];
                                
                                // İlgili santrafor verilerini bul
                                const santraforLabel = context.dataset.label;
                                const santrafor = seciliSantraforData.find(s => s.oyuncu_isim === santraforLabel);
                                
                                if (santrafor) {
                                  const originalValue = santrafor[metric.key as keyof CombinedSantraforData] as number;
                                  
                                  // Yüzde değerleri için % ekle
                                  if (metric.key === 'sutdgrlndrme_yzd') {
                                    return `${metric.name}: ${Number(originalValue).toFixed(1)}%`;
                                  }
                                  
                                  return `${metric.name}: ${Number(originalValue).toFixed(3)}`;
                                }
                                
                                return `${metric.name}: ${context.raw.toFixed(3)}`;
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
                            },
                            pointLabels: {
                              font: {
                                size: 11
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-4">
                    <p><strong>Not:</strong> Grafikteki değerler belirlenen değerlendirme aralıklarına göre normalize edilmiştir:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Maç Başına Gol:</strong> 0.15-0.6 aralığında değerlendirilir</li>
                      <li><strong>Penaltı Harici Maç Başına Gol Beklentisi:</strong> 0-1.5 aralığında değerlendirilir</li>
                      <li><strong>Standart Üstü Gol Beklentisi:</strong> -1 ile 2 arasında değerlendirilir</li>
                      <li><strong>Şutu Gole Çevirme Yüzdesi:</strong> 0-100% aralığında değerlendirilir</li>
                      <li><strong>Maç Başına Kazanılan Hava Topu:</strong> 0.5-5 aralığında değerlendirilir</li>
                      <li><strong>Golcülük Etkinliği:</strong> 0-0.4 aralığında değerlendirilir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Her metrik kendi değerlendirme aralığına göre 0-100 ölçeğinde gösterilir. Tooltip'te gerçek değerler görüntülenir.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {seciliSantraforData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 text-lg">Karşılaştırmak için en az bir santrafor seçin</p>
              <p className="text-gray-400 text-sm mt-2">Maksimum 6 santrafor karşılaştırabilirsiniz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 