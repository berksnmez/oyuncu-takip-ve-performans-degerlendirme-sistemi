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

// Kanat veri tipleri
interface ForvetlerGrafik {
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

interface KanatIstatistik {
  blabla_knt: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yan_mevkii: string;
  oyuncu_yas: number;
  takim_adi: string;
  takim_id: number;
  AObsrlorta_yzd: number;
  AObsrlorta_yzd_katsayi: number;
  AOkilitpasMB: number;
  AOkilitpasMB_katsayi: number;
  astbklntMB: number;
  astbklntMB_katsayi: number;
  bsrldrplMB: number;
  bsrldrplMB_katsayi: number;
  diKkilitpasMB: number;
  diKkilitpasMB_katsayi: number;
  genel_sira: number;
  isbtlpasMB: number;
  isbtlpas_yzd: number;
  isbtlpas_yzd_katsayi: number;
  kalite_sira_katsayi: number;
  performans_skoru: number;
  performans_skor_sirasi: number;
  sprintMB: number;
  sprintMB_katsayi: number;
  surdurabilirlik_sira: number;
  yrtclkEtknlk: number;
  yrtclkEtknlk_katsayi: number;
  yrtglfrstMB: number;
  yrtglfrstMB_katsayi: number;
}

interface CombinedKanatData extends ForvetlerGrafik, KanatIstatistik {
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

export default function KanatKarsilastir() {
  const { getItemsByCategory } = useTakipListesi();
  const [kanatlar, setKanatlar] = useState<CombinedKanatData[]>([]);
  const [seciliKanatlar, setSeciliKanatlar] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genel' | 'hucum' | 'yaraticilik' | 'fiziksel' | 'radar'>('genel');
  const [sortBy, setSortBy] = useState<string>('performans_skoru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Kanat verilerini yükle
  useEffect(() => {
    const loadKanatlar = async () => {
      try {
        setLoading(true);
        
        // Takip listesinden Kanat blabla_knt değerlerini al
        const takipEdilenKanatlar = getItemsByCategory('kanat');
        console.log("Takip edilen Kanatlar:", takipEdilenKanatlar);
        const blablaKntList = takipEdilenKanatlar.map(knt => String(knt.blabla_knt).trim());
        console.log("Blabla_knt listesi:", blablaKntList);
        
        if (blablaKntList.length === 0) {
          setKanatlar([]);
          return;
        }

        // Grafik verilerini al
        const grafikResponse = await fetch('/api/forvetler-grafik');
        if (!grafikResponse.ok) throw new Error('Grafik verileri alınamadı');
        const grafikResult = await grafikResponse.json();
        console.log("Grafik result:", grafikResult);

        // İstatistik verilerini al
        const istatistikResponse = await fetch('/api/kanat-istatistik');
        if (!istatistikResponse.ok) throw new Error('İstatistik verileri alınamadı');
        const istatistikResult = await istatistikResponse.json();
        console.log("İstatistik result:", istatistikResult);

        // Verileri birleştir
        const combinedData: CombinedKanatData[] = [];
        
        blablaKntList.forEach(blablaKnt => {
          console.log("Aranan blabla_knt:", blablaKnt);
          
          // İstatistik verisini bul
          const istatistikData = istatistikResult.data?.find((i: any) => {
            const istatistikBlabla = String(i.blabla_knt || '').trim();
            console.log("İstatistik blabla_knt:", istatistikBlabla, "Aranan:", blablaKnt);
            return istatistikBlabla === blablaKnt;
          });

          if (!istatistikData) {
            console.log("İstatistik verisi bulunamadı:", blablaKnt);
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
              blabla_knt: blablaKnt, // Ensure consistent blabla_knt value
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
              AObsrlorta_yzd: Number(istatistikData.AObsrlorta_yzd) || 0,
              AObsrlorta_yzd_katsayi: Number(istatistikData.AObsrlorta_yzd_katsayi) || 0,
              AOkilitpasMB: Number(istatistikData.AOkilitpasMB) || 0,
              AOkilitpasMB_katsayi: Number(istatistikData.AOkilitpasMB_katsayi) || 0,
              astbklntMB: Number(istatistikData.astbklntMB) || 0,
              astbklntMB_katsayi: Number(istatistikData.astbklntMB_katsayi) || 0,
              bsrldrplMB: Number(istatistikData.bsrldrplMB) || 0,
              bsrldrplMB_katsayi: Number(istatistikData.bsrldrplMB_katsayi) || 0,
              diKkilitpasMB: Number(istatistikData.diKkilitpasMB) || 0,
              diKkilitpasMB_katsayi: Number(istatistikData.diKkilitpasMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              isbtlpasMB: Number(istatistikData.isbtlpasMB) || 0,
              isbtlpas_yzd: Number(istatistikData.isbtlpas_yzd) || 0,
              isbtlpas_yzd_katsayi: Number(istatistikData.isbtlpas_yzd_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              sprintMB: Number(istatistikData.sprintMB) || 0,
              sprintMB_katsayi: Number(istatistikData.sprintMB_katsayi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
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
              blabla_knt: blablaKnt,
              bnzrsz_fv: '',
              // Default graphic values
              "Ao-Io%": 0,
              "Drp/90": Number(istatistikData.bsrldrplMB) || 0,
              "Gol/90": 0,
              "HtmG/90": 0,
              "Hv%": 0,
              "Mesf/90": 0,
              "OrtGrsm/90": Number(istatistikData.AObsrlorta_yzd) || 0,
              "Pas%": Number(istatistikData.isbtlpas_yzd) || 0,
              "PH-xG/90": 0,
              "PsG/90": 0,
              "SHd/90": 0,
              "SPasi/90": Number(istatistikData.AOkilitpasMB) || 0,
              "Sprint/90": Number(istatistikData.sprintMB) || 0,
              "TopKyb/90": 0,
              "xA/90": Number(istatistikData.astbklntMB) || 0,
              "xG/Sut": 0,
              // Convert statistical data to numbers
              AObsrlorta_yzd: Number(istatistikData.AObsrlorta_yzd) || 0,
              AObsrlorta_yzd_katsayi: Number(istatistikData.AObsrlorta_yzd_katsayi) || 0,
              AOkilitpasMB: Number(istatistikData.AOkilitpasMB) || 0,
              AOkilitpasMB_katsayi: Number(istatistikData.AOkilitpasMB_katsayi) || 0,
              astbklntMB: Number(istatistikData.astbklntMB) || 0,
              astbklntMB_katsayi: Number(istatistikData.astbklntMB_katsayi) || 0,
              bsrldrplMB: Number(istatistikData.bsrldrplMB) || 0,
              bsrldrplMB_katsayi: Number(istatistikData.bsrldrplMB_katsayi) || 0,
              diKkilitpasMB: Number(istatistikData.diKkilitpasMB) || 0,
              diKkilitpasMB_katsayi: Number(istatistikData.diKkilitpasMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              isbtlpasMB: Number(istatistikData.isbtlpasMB) || 0,
              isbtlpas_yzd: Number(istatistikData.isbtlpas_yzd) || 0,
              isbtlpas_yzd_katsayi: Number(istatistikData.isbtlpas_yzd_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              sprintMB: Number(istatistikData.sprintMB) || 0,
              sprintMB_katsayi: Number(istatistikData.sprintMB_katsayi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
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
        setKanatlar(combinedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Kanat verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadKanatlar();
  }, [getItemsByCategory]);

  // Kanat seçimi
  const toggleKanatSelection = useCallback((blablaKnt: string) => {
    console.log("Toggle Kanat selection:", blablaKnt);
    console.log("Mevcut seçili Kanatlar:", seciliKanatlar);
    
    setSeciliKanatlar(prev => {
      if (prev.includes(blablaKnt)) {
        console.log("Kanat zaten seçili, çıkarılıyor");
        return prev.filter(id => id !== blablaKnt);
      } else if (prev.length < 6) { // Maksimum 6 Kanat karşılaştırılabilir
        console.log("Kanat ekleniyor");
        return [...prev, blablaKnt];
      } else {
        console.log("Maksimum Kanat sayısına ulaşıldı");
        return prev;
      }
    });
  }, [seciliKanatlar]);

  // Sıralama
  const sortedKanatlar = useMemo(() => {
    return [...kanatlar].sort((a, b) => {
      const aVal = a[sortBy as keyof CombinedKanatData] as number;
      const bVal = b[sortBy as keyof CombinedKanatData] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [kanatlar, sortBy, sortOrder]);

  // Seçili Kanatlar verisi
  const seciliKanatData = useMemo(() => {
    return kanatlar.filter(knt => seciliKanatlar.includes(knt.blabla_knt));
  }, [kanatlar, seciliKanatlar]);

  // Yaratıcılık vs Orta scatter chart data
  const yaraticilikOrtaScatterData = useMemo(() => {
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
          label: 'Yaratıcılık vs Orta',
          data: seciliKanatData.map((knt, index) => ({
            x: knt.yrtclkEtknlk,
            y: knt.AObsrlorta_yzd,
            label: knt.oyuncu_isim,
            performans: knt.performans_skoru
          })),
          backgroundColor: seciliKanatData.map((_, index) => colors[index % colors.length]),
          pointRadius: 8,
          pointHoverRadius: 10,
        }
      ]
    };
  }, [seciliKanatData]);

  // Radar chart data
  const radarChartData = useMemo(() => {
    if (seciliKanatData.length === 0) return { labels: [], datasets: [] };

    // Metrik etiketleri ve değerlendirme aralıkları
    const metrics = [
      { name: 'Yaratıcılık Etkinlik', key: 'yrtclkEtknlk', min: 0.005, max: 0.031 },
      { name: 'Asist Beklentisi/Maç', key: 'astbklntMB', min: 0, max: 0.4 },
      { name: 'Başarılı Dribling/Maç', key: 'bsrldrplMB', min: 0.4, max: 3 },
      { name: 'Sprint/Maç', key: 'sprintMB', min: 2, max: 12 },
      { name: 'Akan Oyunda Başarılı Orta %', key: 'AObsrlorta_yzd', min: 5, max: 30 },
      { name: 'Yaratılan Gol Fırsatı/Maç', key: 'yrtglfrstMB', min: 0.2, max: 1.2 }
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
      datasets: seciliKanatData.map((knt, index) => {
        // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
        const normalizedData = metrics.map(metric => {
          const value = knt[metric.key as keyof CombinedKanatData] as number || 0;
          
          // Değeri min-max aralığına göre 0-100 arasına normalize et
          return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
        });

        return {
          label: knt.oyuncu_isim,
          data: normalizedData,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
          pointRadius: 4,
        };
      })
    };
  }, [seciliKanatData]);

  // Performance comparison bar chart
  const performanceBarData = useMemo(() => {
    if (seciliKanatData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliKanatData.map(knt => knt.oyuncu_isim),
      datasets: [
        {
          label: 'Performans Skoru',
          data: seciliKanatData.map(knt => knt.performans_skoru),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Yaratıcılık Etkinlik',
          data: seciliKanatData.map(knt => knt.yrtclkEtknlk),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'Asist Beklentisi',
          data: seciliKanatData.map(knt => knt.astbklntMB * 20), // Scale for visibility
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    };
  }, [seciliKanatData]);

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
          <Link href="/takip-listesi/kanat" className="text-blue-600 hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Kanat Karşılaştırması</h1>
      
      {/* Pozisyon Navbar */}
      <TakipListesiNavbar seciliPozisyon="Kanat" />
      
            
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'genel', label: 'Genel Bakış' },
            { key: 'hucum', label: 'Hücum & Gol' },
            { key: 'yaraticilik', label: 'Yaratıcılık & Asist' },
            { key: 'fiziksel', label: 'Fiziksel & Hareketlilik' },
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

      {kanatlar.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz takip ettiğiniz kanat bulunmuyor.</p>
          <Link 
            href="/oyuncu-arama/kanat" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Kanat Ara
          </Link>
        </div>
      ) : (
        <>
          {/* Kanat Seçimi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                Karşılaştırılacak Kanatları Seçin ({seciliKanatlar.length}/6)
              </h3>
              <div className="flex items-center space-x-4">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="performans_skoru">Performans Skoru</option>
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="yrtclkEtknlk">Yaratıcılık Etkinlik</option>
                  <option value="astbklntMB">Asist Beklentisi</option>
                  <option value="sprintMB">Sprint/Maç</option>
                  <option value="AObsrlorta_yzd">Orta Girişimi</option>
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
              {sortedKanatlar.map((knt) => (
                <div
                  key={knt.blabla_knt}
                  onClick={() => {
                    console.log("Card clicked for Kanat:", knt.oyuncu_isim, "blabla_knt:", knt.blabla_knt);
                    toggleKanatSelection(knt.blabla_knt);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    seciliKanatlar.includes(knt.blabla_knt)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${seciliKanatlar.length >= 6 && !seciliKanatlar.includes(knt.blabla_knt) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{knt.oyuncu_isim}</h4>
                    <input
                      type="checkbox"
                      checked={seciliKanatlar.includes(knt.blabla_knt)}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log("Checkbox clicked:", knt.blabla_knt);
                        toggleKanatSelection(knt.blabla_knt);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Performans: {safeToFixed(knt.performans_skoru)}</div>
                    <div>Genel Sıra: {safeToInt(knt.genel_sira)}</div>
                    <div>Yaratıcılık: {safeToFixed(knt.yrtclkEtknlk)}</div>
                    <div>Sprint/Maç: {safeToFixed(knt.sprintMB)}</div>
                    <div className="text-xs text-gray-400">Takım: {knt.takim_adi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {seciliKanatData.length > 0 && (
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
                          <th className="text-center py-3 px-2">Yaratıcılık</th>
                          <th className="text-center py-3 px-2">Asist Beklentisi</th>
                          <th className="text-center py-3 px-2">Sprint/Maç</th>
                          <th className="text-center py-3 px-2">Orta Girişimi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seciliKanatData.map((knt, index) => (
                          <tr key={knt.blabla_knt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-3 px-2 font-medium">{knt.oyuncu_isim}</td>
                            <td className="py-3 px-2 text-center">{knt.takim_adi}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(knt.oyuncu_yas)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(knt.performans_skoru)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(knt.genel_sira)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(knt.yrtclkEtknlk)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(knt.astbklntMB)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(knt.sprintMB)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(knt.AObsrlorta_yzd)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'hucum' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Hücum & Gol Performansı</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Hücum Katkıları</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliKanatData.map(knt => knt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Gol/90',
                                data: seciliKanatData.map(knt => {
                                  // Gol/90 değerlendirme aralığı: 0.0-0.5 (Kanat için tipik aralık)
                                  const golMin = 0.0;
                                  const golMax = 0.9;
                                  const normalizedGol = Math.min(100, Math.max(0, ((knt["Gol/90"] - golMin) / (golMax - golMin)) * 100));
                                  return normalizedGol;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'xA/90',
                                data: seciliKanatData.map(knt => {
                                  // xA/90 değerlendirme aralığı: 0.0-0.4 (Kanat için tipik aralık)
                                  const xaMin = 0.0;
                                  const xaMax = 0.5;
                                  const normalizedXa = Math.min(100, Math.max(0, ((knt["xA/90"] - xaMin) / (xaMax - xaMin)) * 100));
                                  return normalizedXa;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'SPasi/90',
                                data: seciliKanatData.map(knt => {
                                  // SPasi/90 değerlendirme aralığı: 0-20 (Kanat için tipik aralık)
                                  const spasiMin = 0;
                                  const spasiMax = 2.5;
                                  const normalizedSpasi = Math.min(100, Math.max(0, ((knt["SPasi/90"] - spasiMin) / (spasiMax - spasiMin)) * 100));
                                  return normalizedSpasi;
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
                                text: 'Hücum Performansı Karşılaştırması'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const knt = seciliKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'Gol/90') {
                                      return `${datasetLabel}: ${safeToFixed(knt["Gol/90"], 3)}`;
                                    } else if (datasetLabel === 'xA/90') {
                                      return `${datasetLabel}: ${safeToFixed(knt["xA/90"], 3)}`;
                                    } else if (datasetLabel === 'SPasi/90') {
                                      return `${datasetLabel}: ${safeToFixed(knt["SPasi/90"])}`;
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
                        <p><strong>Not:</strong> Hücum Katkıları grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Gol/90:</strong> 0.0-0.5 aralığına göre normalize edilmiştir</li>
                          <li><strong>xA/90:</strong> 0.0-0.4 aralığına göre normalize edilmiştir</li>
                          <li><strong>SPasi/90:</strong> 0-20 aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Şut & Gol Etkinliği</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliKanatData.map(knt => knt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'xG/Şut',
                                data: seciliKanatData.map(knt => {
                                  // xG/Şut değerlendirme aralığı: 0.05-0.25 (Kanat için tipik aralık)
                                  const xgSutMin = 0.00;
                                  const xgSutMax = 0.30;
                                  const normalizedXgSut = Math.min(100, Math.max(0, ((knt["xG/Sut"] - xgSutMin) / (xgSutMax - xgSutMin)) * 100));
                                  return normalizedXgSut;
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'İsabetli Şut/90',
                                data: seciliKanatData.map(knt => {
                                  // İsabetli Şut/90 değerlendirme aralığı: 0.5-3.0 (Kanat için tipik aralık)
                                  const sutHiziMin = 0.0;
                                  const sutHiziMax = 1.6;
                                  const normalizedSutHizi = Math.min(100, Math.max(0, ((knt["SHd/90"] - sutHiziMin) / (sutHiziMax - sutHiziMin)) * 100));
                                  return normalizedSutHizi;
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Penaltı Harici Gol Beklentisi/90',
                                data: seciliKanatData.map(knt => {
                                  // Penaltı Harici Gol Beklentisi/90 değerlendirme aralığı: 0.0-0.5 (Kanat için tipik aralık)
                                  const phxgMin = 0.0;
                                  const phxgMax = 0.5;
                                  const normalizedPhxg = Math.min(100, Math.max(0, ((knt["PH-xG/90"] - phxgMin) / (phxgMax - phxgMin)) * 100));
                                  return normalizedPhxg;
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
                                text: 'Şut & Gol Analizi'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const knt = seciliKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'xG/Şut') {
                                      return `${datasetLabel}: ${safeToFixed(knt["xG/Sut"], 3)}`;
                                    } else if (datasetLabel === 'İsabetli Şut/90') {
                                      return `${datasetLabel}: ${safeToFixed(knt["SHd/90"])}`;
                                    } else if (datasetLabel === 'Penaltı Harici Gol Beklentisi/90') {
                                      return `${datasetLabel}: ${safeToFixed(knt["PH-xG/90"])}`;
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
                        <p><strong>Not:</strong> Şut & Gol Etkinliği grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>xG/Şut:</strong> 0.05-0.25 aralığına göre normalize edilmiştir</li>
                          <li><strong>İsabetli Şut/90:</strong> 0.5-3.0 aralığına göre normalize edilmiştir</li>
                          <li><strong>Penaltı Harici Gol Beklentisi/90:</strong> 0.0-0.5 aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
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
                            <th className="text-center py-3 px-2">Gol/90</th>
                            <th className="text-center py-3 px-2">xA/90</th>
                            <th className="text-center py-3 px-2">SPasi/90</th>
                            <th className="text-center py-3 px-2">xG/Şut</th>
                            <th className="text-center py-3 px-2">İsabetli Şut/90</th>
                            <th className="text-center py-3 px-2">Penaltı Harici Gol Beklentisi/90</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliKanatData.map((knt, index) => (
                            <tr key={knt.blabla_knt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{knt.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt["Gol/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt["xA/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt["SPasi/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt["xG/Sut"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt["SHd/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt["PH-xG/90"])}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'yaraticilik' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Yaratıcılık & Asist</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Yaratıcılık vs Orta Girişimi</h4>
                      <div className="h-96">
                        <Scatter
                          data={yaraticilikOrtaScatterData}
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
                                      `Yaratıcılık: ${safeToFixed(point.x)}`,
                                      `Orta Girişimi: ${safeToFixed(point.y)}`,
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
                                  text: 'Yaratıcılık Etkinlik'
                                },
                                min: 0
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: 'Orta Girişimi %'
                                },
                                min: 0
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Pas & Yaratıcılık Performansı</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliKanatData.map(knt => knt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Yaratıcılık Etkinlik',
                                data: seciliKanatData.map(knt => {
                                  // Yaratıcılık Etkinlik değerlendirme aralığı: 0.005-0.031 (Kanat için tipik aralık)
                                  const yaraticilikMin = 0.000;
                                  const yaraticilikMax = 0.060;
                                  const normalizedYaraticilik = Math.min(100, Math.max(0, ((knt.yrtclkEtknlk - yaraticilikMin) / (yaraticilikMax - yaraticilikMin)) * 100));
                                  return normalizedYaraticilik;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Yaratılan Gol Fırsatı/Maç',
                                data: seciliKanatData.map(knt => {
                                  // Yaratılan Gol Fırsatı/Maç değerlendirme aralığı: 0.2-1.2 (Kanat için tipik aralık)
                                  const golFirsatiMin = 0.0;
                                  const golFirsatiMax = 1.35;
                                  const normalizedGolFirsati = Math.min(100, Math.max(0, ((knt.yrtglfrstMB - golFirsatiMin) / (golFirsatiMax - golFirsatiMin)) * 100));
                                  return normalizedGolFirsati;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'AO Kilit Pas/Maç',
                                data: seciliKanatData.map(knt => {
                                  // AO Kilit Pas/Maç değerlendirme aralığı: 0.1-2.5 (Kanat için tipik aralık)
                                  const aoKilitPasMin = 0.0;
                                  const aoKilitPasMax = 3.0;
                                  const normalizedAoKilitPas = Math.min(100, Math.max(0, ((knt.AOkilitpasMB - aoKilitPasMin) / (aoKilitPasMax - aoKilitPasMin)) * 100));
                                  return normalizedAoKilitPas;
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
                                text: 'Yaratıcılık & Pas Analizi'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const knt = seciliKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'Yaratıcılık Etkinlik') {
                                      return `${datasetLabel}: ${safeToFixed(knt.yrtclkEtknlk, 3)}`;
                                    } else if (datasetLabel === 'Yaratılan Gol Fırsatı/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(knt.yrtglfrstMB)}`;
                                    } else if (datasetLabel === 'AO Kilit Pas/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(knt.AOkilitpasMB)}`;
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
                        <p><strong>Not:</strong> Pas & Yaratıcılık Performansı grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Yaratıcılık Etkinlik:</strong> 0.005-0.031 aralığına göre normalize edilmiştir</li>
                          <li><strong>Yaratılan Gol Fırsatı/Maç:</strong> 0.2-1.2 aralığına göre normalize edilmiştir</li>
                          <li><strong>AO Kilit Pas/Maç:</strong> 0.1-2.5 aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Yaratıcılık detay tablosu */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Detaylı Yaratıcılık İstatistikleri</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">Yaratıcılık Etkinlik</th>
                            <th className="text-center py-3 px-2">Asist Beklentisi/Maç</th>
                            <th className="text-center py-3 px-2">Yaratılan Gol Fırsatı/Maç</th>
                            <th className="text-center py-3 px-2">AO Kilit Pas/Maç</th>
                            <th className="text-center py-3 px-2">Dikey Kilit Pas/Maç</th>
                            <th className="text-center py-3 px-2">Orta Girişimi %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliKanatData.map((knt, index) => (
                            <tr key={knt.blabla_knt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{knt.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt.yrtclkEtknlk)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt.astbklntMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt.yrtglfrstMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt.AOkilitpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt.diKkilitpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(knt.AObsrlorta_yzd)}%</td>
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
                  <h3 className="text-xl font-semibold mb-6">Fiziksel & Hareketlilik</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Fiziksel Aktivite</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliKanatData.map(knt => knt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Sprint/90',
                                data: seciliKanatData.map(knt => {
                                  // Sprint/90 değerlendirme aralığı: 0-15 (Kanat için tipik aralık)
                                  const sprintMin = 0;
                                  const sprintMax = 12;
                                  const normalizedSprint = Math.min(100, Math.max(0, ((knt["Sprint/90"] - sprintMin) / (sprintMax - sprintMin)) * 100));
                                  return normalizedSprint;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Hava Topu %',
                                data: seciliKanatData.map(knt => {
                                  // Hava Topu % değerlendirme aralığı: 0-80% (Kanat için tipik aralık)
                                  const havaTopuMin = 0;
                                  const havaTopuMax = 60;
                                  const normalizedHavaTopu = Math.min(100, Math.max(0, ((knt["Hv%"] - havaTopuMin) / (havaTopuMax - havaTopuMin)) * 100));
                                  return normalizedHavaTopu;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Mesafe/90',
                                data: seciliKanatData.map(knt => {
                                  // Mesafe/90 değerlendirme aralığı: 9-12 km (Kanat için tipik aralık)
                                  const mesafeMin = 9;
                                  const mesafeMax = 13.2;
                                  const normalizedMesafe = Math.min(100, Math.max(0, ((knt["Mesf/90"] - mesafeMin) / (mesafeMax - mesafeMin)) * 100));
                                  return normalizedMesafe;
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
                                    const knt = seciliKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'Sprint/90') {
                                      return `${datasetLabel}: ${safeToFixed(knt["Sprint/90"])}`;
                                    } else if (datasetLabel === 'Hava Topu %') {
                                      return `${datasetLabel}: ${safeToInt(knt["Hv%"])}%`;
                                    } else if (datasetLabel === 'Mesafe/90') {
                                      return `${datasetLabel}: ${safeToFixed(knt["Mesf/90"])} km`;
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
                          <li><strong>Sprint/90:</strong> 0-15 aralığına göre normalize edilmiştir</li>
                          <li><strong>Hava Topu %:</strong> 0-80% aralığına göre normalize edilmiştir</li>
                          <li><strong>Mesafe/90:</strong> 9-12 km aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Teknik Beceriler</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliKanatData.map(knt => knt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Başarılı Dribling/Maç',
                                data: seciliKanatData.map(knt => {
                                  // Başarılı Dribling/Maç değerlendirme aralığı: 0-5 (Kanat için tipik aralık)
                                  const driblingMin = 0;
                                  const driblingMax = 4.2;
                                  const normalizedDribling = Math.min(100, Math.max(0, ((knt.bsrldrplMB - driblingMin) / (driblingMax - driblingMin)) * 100));
                                  return normalizedDribling;
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'Pas %',
                                data: seciliKanatData.map(knt => {
                                  // Pas % değerlendirme aralığı: 60-95% (Kanat için tipik aralık)
                                  const pasMin = 60;
                                  const pasMax = 95;
                                  const normalizedPas = Math.min(100, Math.max(0, ((knt["Pas%"] - pasMin) / (pasMax - pasMin)) * 100));
                                  return normalizedPas;
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Top Kaybı/90',
                                data: seciliKanatData.map(knt => {
                                  // Top Kaybı/90 değerlendirme aralığı: 5-25 (Kanat için tipik aralık)
                                  // Düşük değer daha iyi olduğundan ters çeviriyoruz
                                  const topKaybiMin = 2;
                                  const topKaybiMax = 18;
                                  const normalizedTopKaybi = Math.min(100, Math.max(0, ((topKaybiMax - knt["TopKyb/90"]) / (topKaybiMax - topKaybiMin)) * 100));
                                  return normalizedTopKaybi;
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
                                    const knt = seciliKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'Top Kaybı/90') {
                                      return `Top Kaybı/90: ${safeToFixed(knt["TopKyb/90"])}`;
                                    } else if (datasetLabel === 'Pas %') {
                                      return `${datasetLabel}: ${safeToInt(knt["Pas%"])}%`;
                                    } else if (datasetLabel === 'Başarılı Dribling/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(knt.bsrldrplMB)}`;
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
                            <th className="text-center py-3 px-2">Hava Topu %</th>
                            <th className="text-center py-3 px-2">Mesafe/90</th>
                            <th className="text-center py-3 px-2">Dribling/Maç</th>
                            <th className="text-center py-3 px-2">Pas İsabet %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliKanatData.map((knt, index) => (
                            <tr key={knt.blabla_knt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{knt.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(knt.oyuncu_sure)} dk</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt["Sprint/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt["Hv%"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt["Mesf/90"])} km</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(knt.bsrldrplMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(knt.isbtlpas_yzd)}%</td>
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
                            text: 'Çok Boyutlu Kanat Karşılaştırması'
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
                                  { name: 'Yaratıcılık Etkinlik', key: 'yrtclkEtknlk' },
                                  { name: 'Asist Beklentisi/Maç', key: 'astbklntMB' },
                                  { name: 'Başarılı Dribling/Maç', key: 'bsrldrplMB' },
                                  { name: 'Sprint/Maç', key: 'sprintMB' },
                                  { name: 'Akan Oyunda Başarılı Orta %', key: 'AObsrlorta_yzd' },
                                  { name: 'Yaratılan Gol Fırsatı/Maç', key: 'yrtglfrstMB' }
                                ];
                                const metric = metrics[dataIndex];
                                
                                // İlgili kanat verilerini bul
                                const kanatLabel = context.dataset.label;
                                const kanat = seciliKanatData.find(d => d.oyuncu_isim === kanatLabel);
                                
                                if (kanat) {
                                  const originalValue = kanat[metric.key as keyof CombinedKanatData] as number;
                                  
                                  // Yüzde değerleri için
                                  if (metric.key === 'AObsrlorta_yzd') {
                                    return `${metric.name}: ${Number(originalValue).toFixed(1)}%`;
                                  }
                                  
                                  // Diğer metrikler için
                                  return `${metric.name}: ${Number(originalValue).toFixed(3)}`;
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
                      <li><strong>Yaratıcılık Etkinlik:</strong> 0.005-0.031 aralığında normalize edilmiştir</li>
                      <li><strong>Asist Beklentisi/Maç:</strong> 0-0.4 aralığında normalize edilmiştir</li>
                      <li><strong>Başarılı Dribling/Maç:</strong> 0-3 aralığında normalize edilmiştir</li>
                      <li><strong>Sprint/Maç:</strong> 0-20 aralığında normalize edilmiştir</li>
                      <li><strong>Akan Oyunda Başarılı Orta %:</strong> 0-100% aralığında normalize edilmiştir</li>
                      <li><strong>Yaratılan Gol Fırsatı/Maç:</strong> 0-2 aralığında normalize edilmiştir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {seciliKanatData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 text-lg">Karşılaştırmak için en az bir kanat seçin</p>
              <p className="text-gray-400 text-sm mt-2">Maksimum 6 kanat karşılaştırabilirsiniz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 