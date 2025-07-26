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

// Orta Saha veri tipleri
interface OrtaSahaGrafik {
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

interface OrtaSahaIstatistik {
  blabla_os: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yan_mevkii: string;
  oyuncu_yas: number;
  takim_adi: string;
  takim_id: number;
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
  surdurabilirlik_sira: number;
  yrtclkEtknlk: number;
  yrtclkEtknlk_katsayi: number;
  yrtglfrstMB: number;
  yrtglfrstMB_katsayi: number;
}

interface CombinedOrtaSahaData extends OrtaSahaGrafik, OrtaSahaIstatistik {
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

export default function OrtaSahaKarsilastir() {
  const { getItemsByCategory } = useTakipListesi();
  const [ortaSahalar, setOrtaSahalar] = useState<CombinedOrtaSahaData[]>([]);
  const [seciliOrtaSahalar, setSeciliOrtaSahalar] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genel' | 'savunma' | 'hucum' | 'fiziksel' | 'radar'>('genel');
  const [sortBy, setSortBy] = useState<string>('performans_skoru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Orta Saha verilerini yükle
  useEffect(() => {
    const loadOrtaSahalar = async () => {
      try {
        setLoading(true);
        
        // Takip listesinden Orta Saha blabla_os değerlerini al
        const takipEdilenOrtaSahalar = getItemsByCategory('orta-saha');
        console.log("Takip edilen Orta Sahalar:", takipEdilenOrtaSahalar);
        const blablaOsList = takipEdilenOrtaSahalar.map(os => String(os.blabla_os).trim());
        console.log("Blabla_os listesi:", blablaOsList);
        
        if (blablaOsList.length === 0) {
          setOrtaSahalar([]);
          return;
        }

        // Grafik verilerini al
        const grafikResponse = await fetch('/api/ortasahalar-grafik');
        if (!grafikResponse.ok) throw new Error('Grafik verileri alınamadı');
        const grafikResult = await grafikResponse.json();
        console.log("Grafik result:", grafikResult);

        // İstatistik verilerini al
        const istatistikResponse = await fetch('/api/ortasaha-istatistik');
        if (!istatistikResponse.ok) throw new Error('İstatistik verileri alınamadı');
        const istatistikResult = await istatistikResponse.json();
        console.log("İstatistik result:", istatistikResult);

        // Verileri birleştir
        const combinedData: CombinedOrtaSahaData[] = [];
        
        blablaOsList.forEach(blablaOs => {
          console.log("Aranan blabla_os:", blablaOs);
          
          // İstatistik verisini bul
          const istatistikData = istatistikResult.data?.find((i: any) => {
            const istatistikBlabla = String(i.blabla_os || '').trim();
            console.log("İstatistik blabla_os:", istatistikBlabla, "Aranan:", blablaOs);
            return istatistikBlabla === blablaOs;
          });

          if (!istatistikData) {
            console.log("İstatistik verisi bulunamadı:", blablaOs);
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
              blabla_os: blablaOs, // Ensure consistent blabla_os value
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
              blabla_os: blablaOs,
              bnzrsz_os: '',
              // Default graphic values
              "Ao-Io%": 0,
              "DikKltPas/90": Number(istatistikData.diKkilitpasMB) || 0,
              "Eng/90": 0,
              "Gol/90": 0,
              "HtmG/90": 0,
              "Hv%": 0,
              "KazanTop/90": 0,
              "Mesf/90": 0,
              "OrtGrsm/90": 0,
              "Pas%": Number(istatistikData.isbtlpas_yzd) || 0,
              "PH-xG/90": 0,
              "PsG/90": 0,
              "SPasi/90": Number(istatistikData.AOkilitpasMB) || 0,
              "Sprint/90": 0,
              "TopKyb/90": 0,
              "Uzk/90": 0,
              "xA/90": Number(istatistikData.astbklntMB) || 0,
              // Convert statistical data to numbers
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
        setOrtaSahalar(combinedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Orta Saha verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrtaSahalar();
  }, [getItemsByCategory]);

  // Orta Saha seçimi
  const toggleOrtaSahaSelection = useCallback((blablaOs: string) => {
    console.log("Toggle Orta Saha selection:", blablaOs);
    console.log("Mevcut seçili Orta Sahalar:", seciliOrtaSahalar);
    
    setSeciliOrtaSahalar(prev => {
      if (prev.includes(blablaOs)) {
        console.log("Orta Saha zaten seçili, çıkarılıyor");
        return prev.filter(id => id !== blablaOs);
      } else if (prev.length < 6) { // Maksimum 6 Orta Saha karşılaştırılabilir
        console.log("Orta Saha ekleniyor");
        return [...prev, blablaOs];
      } else {
        console.log("Maksimum Orta Saha sayısına ulaşıldı");
        return prev;
      }
    });
  }, [seciliOrtaSahalar]);

  // Sıralama
  const sortedOrtaSahalar = useMemo(() => {
    return [...ortaSahalar].sort((a, b) => {
      const aVal = a[sortBy as keyof CombinedOrtaSahaData] as number;
      const bVal = b[sortBy as keyof CombinedOrtaSahaData] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [ortaSahalar, sortBy, sortOrder]);

  // Seçili Orta Sahalar verisi
  const seciliOrtaSahaData = useMemo(() => {
    return ortaSahalar.filter(os => seciliOrtaSahalar.includes(os.blabla_os));
  }, [ortaSahalar, seciliOrtaSahalar]);

  // Yaratıcılık vs Pas scatter chart data
  const yaraticilikPasScatterData = useMemo(() => {
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
          label: 'Yaratıcılık vs Pas',
          data: seciliOrtaSahaData.map((os, index) => ({
            x: os.yrtclkEtknlk,
            y: os["Pas%"],
            label: os.oyuncu_isim,
            performans: os.performans_skoru
          })),
          backgroundColor: seciliOrtaSahaData.map((_, index) => colors[index % colors.length]),
          pointRadius: 8,
          pointHoverRadius: 10,
        }
      ]
    };
  }, [seciliOrtaSahaData]);

  // Radar chart data
  const radarChartData = useMemo(() => {
    if (seciliOrtaSahaData.length === 0) return { labels: [], datasets: [] };

    // Metrik etiketleri ve değerlendirme aralıkları
    const metrics = [
      { name: 'Yaratıcılık Etkinlik', key: 'yrtclkEtknlk', min: 0, max: 0.015 },
      { name: 'Pas %', key: 'Pas%', min: 70, max: 95 },
      { name: 'Dikey Pas/90', key: 'DikKltPas/90', min: 1, max: 6 },
      { name: 'Asist Beklentisi/Maç', key: 'astbklntMB', min: 0, max: 0.2 },
      { name: 'Başarılı Dribling/Maç', key: 'bsrldrplMB', min: 0.2, max: 0.7 },
      { name: 'Yaratılan Gol Fırsatı', key: 'yrtglfrstMB', min: 0.15, max: 0.6 }
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
      datasets: seciliOrtaSahaData.map((os, index) => {
        // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
        const normalizedData = metrics.map(metric => {
          const value = os[metric.key as keyof CombinedOrtaSahaData] as number || 0;
          
          // Değeri min-max aralığına göre 0-100 arasına normalize et
          return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
        });

        return {
          label: os.oyuncu_isim,
          data: normalizedData,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
          pointRadius: 4,
        };
      })
    };
  }, [seciliOrtaSahaData]);

  // Performance comparison bar chart
  const performanceBarData = useMemo(() => {
    if (seciliOrtaSahaData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliOrtaSahaData.map(os => os.oyuncu_isim),
      datasets: [
        {
          label: 'Performans Skoru',
          data: seciliOrtaSahaData.map(os => os.performans_skoru),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Yaratıcılık Etkinlik',
          data: seciliOrtaSahaData.map(os => os.yrtclkEtknlk),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'Pas %',
          data: seciliOrtaSahaData.map(os => os["Pas%"]),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    };
  }, [seciliOrtaSahaData]);

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
          <Link href="/takip-listesi/orta-saha" className="text-blue-600 hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Orta Saha Karşılaştırması</h1>
      
      {/* Pozisyon Navbar */}
      <TakipListesiNavbar seciliPozisyon="Orta Saha" />
      
            
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'genel', label: 'Genel Bakış' },
            { key: 'savunma', label: 'Savunma & Pas' },
            { key: 'hucum', label: 'Hücum & Yaratıcılık' },
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

      {ortaSahalar.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz takip ettiğiniz orta saha bulunmuyor.</p>
          <Link 
            href="/oyuncu-arama/orta-saha" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Orta Saha Ara
          </Link>
        </div>
      ) : (
        <>
          {/* Orta Saha Seçimi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                Karşılaştırılacak Orta Sahaları Seçin ({seciliOrtaSahalar.length}/6)
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
                  <option value="Pas%">Pas %</option>
                  <option value="astbklntMB">Asist Beklentisi</option>
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
              {sortedOrtaSahalar.map((os) => (
                <div
                  key={os.blabla_os}
                  onClick={() => {
                    console.log("Card clicked for Orta Saha:", os.oyuncu_isim, "blabla_os:", os.blabla_os);
                    toggleOrtaSahaSelection(os.blabla_os);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    seciliOrtaSahalar.includes(os.blabla_os)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${seciliOrtaSahalar.length >= 6 && !seciliOrtaSahalar.includes(os.blabla_os) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{os.oyuncu_isim}</h4>
                    <input
                      type="checkbox"
                      checked={seciliOrtaSahalar.includes(os.blabla_os)}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log("Checkbox clicked:", os.blabla_os);
                        toggleOrtaSahaSelection(os.blabla_os);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Performans: {safeToFixed(os.performans_skoru)}</div>
                    <div>Genel Sıra: {safeToInt(os.genel_sira)}</div>
                    <div>Yaratıcılık: {safeToFixed(os.yrtclkEtknlk)}</div>
                    <div>Pas %: {safeToInt(os["Pas%"])}%</div>
                    <div className="text-xs text-gray-400">Takım: {os.takim_adi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {seciliOrtaSahaData.length > 0 && (
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
                          <th className="text-center py-3 px-2">Pas %</th>
                          <th className="text-center py-3 px-2">Asist Beklentisi</th>
                          <th className="text-center py-3 px-2">Dribling</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seciliOrtaSahaData.map((os, index) => (
                          <tr key={os.blabla_os} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-3 px-2 font-medium">{os.oyuncu_isim}</td>
                            <td className="py-3 px-2 text-center">{os.takim_adi}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(os.oyuncu_yas)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(os.performans_skoru)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(os.genel_sira)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(os.yrtclkEtknlk)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(os["Pas%"])}%</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(os.astbklntMB)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(os.bsrldrplMB)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'savunma' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Savunma & Pas Performansı</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Pas Kalitesi Analizi</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliOrtaSahaData.map(os => os.oyuncu_isim),
                            datasets: [
                              {
                                label: 'İsabetli Pas/Maç',
                                data: seciliOrtaSahaData.map(os => {
                                  // İsabetli Pas/Maç değerlendirme aralığı: 30-80 (Orta Saha için tipik aralık)
                                  const isbtlPasMin = 20;
                                  const isbtlPasMax = 70;
                                  const normalizedIsbtlPas = Math.min(100, Math.max(0, ((os.isbtlpasMB - isbtlPasMin) / (isbtlPasMax - isbtlPasMin)) * 100));
                                  return normalizedIsbtlPas;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Dikey Pas/Maç',
                                data: seciliOrtaSahaData.map(os => {
                                  // Dikey Pas/Maç değerlendirme aralığı: 1-8 (Orta Saha için tipik aralık)
                                  const dikPasMin = 1;
                                  const dikPasMax = 7;
                                  const normalizedDikPas = Math.min(100, Math.max(0, ((os.diKkilitpasMB - dikPasMin) / (dikPasMax - dikPasMin)) * 100));
                                  return normalizedDikPas;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'AO Kilit Pas/Maç',
                                data: seciliOrtaSahaData.map(os => {
                                  // AO Kilit Pas/Maç değerlendirme aralığı: 0.1-2.0 (Orta Saha için tipik aralık)
                                  const aoKilitMin = 0.0;
                                  const aoKilitMax = 2.6;
                                  const normalizedAoKilit = Math.min(100, Math.max(0, ((os.AOkilitpasMB - aoKilitMin) / (aoKilitMax - aoKilitMin)) * 100));
                                  return normalizedAoKilit;
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
                                text: 'Pas Türleri Karşılaştırması'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const os = seciliOrtaSahaData[playerIndex];
                                    
                                    if (datasetLabel === 'İsabetli Pas/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(os.isbtlpasMB)}`;
                                    } else if (datasetLabel === 'Dikey Pas/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(os.diKkilitpasMB)}`;
                                    } else if (datasetLabel === 'AO Kilit Pas/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(os.AOkilitpasMB)}`;
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
                        <p><strong>Not:</strong> Pas Kalitesi grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>İsabetli Pas/Maç:</strong> 30-80 aralığına göre normalize edilmiştir</li>
                          <li><strong>Dikey Pas/Maç:</strong> 1-8 aralığına göre normalize edilmiştir</li>
                          <li><strong>AO Kilit Pas/Maç:</strong> 0.1-2.0 aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Top Kazanma & Savunma</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliOrtaSahaData.map(os => os.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Top Kazanma/90',
                                data: seciliOrtaSahaData.map(os => {
                                  // Top Kazanma/90 değerlendirme aralığı: 3-15 (Orta Saha için tipik aralık)
                                  const topKazanmaMin = 2.25;
                                  const topKazanmaMax = 8;
                                  const normalizedTopKazanma = Math.min(100, Math.max(0, ((os["KazanTop/90"] - topKazanmaMin) / (topKazanmaMax - topKazanmaMin)) * 100));
                                  return normalizedTopKazanma;
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'Engelleme/90',
                                data: seciliOrtaSahaData.map(os => {
                                  // Engelleme/90 değerlendirme aralığı: 0.5-4 (Orta Saha için tipik aralık)
                                  const engellemeMin = 0;
                                  const engellemeMax = 0.7;
                                  const normalizedEngelleme = Math.min(100, Math.max(0, ((os["Eng/90"] - engellemeMin) / (engellemeMax - engellemeMin)) * 100));
                                  return normalizedEngelleme;
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Hava Topu %',
                                data: seciliOrtaSahaData.map(os => {
                                  // Hava Topu % değerlendirme aralığı: 30-80% (Orta Saha için tipik aralık)
                                  const havaTopuMin = 0;
                                  const havaTopuMax = 80;
                                  const normalizedHavaTopu = Math.min(100, Math.max(0, ((os["Hv%"] - havaTopuMin) / (havaTopuMax - havaTopuMin)) * 100));
                                  return normalizedHavaTopu;
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
                                text: 'Savunma Aktiviteleri'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const os = seciliOrtaSahaData[playerIndex];
                                    
                                    if (datasetLabel === 'Top Kazanma/90') {
                                      return `${datasetLabel}: ${safeToFixed(os["KazanTop/90"])}`;
                                    } else if (datasetLabel === 'Engelleme/90') {
                                      return `${datasetLabel}: ${safeToFixed(os["Eng/90"])}`;
                                    } else if (datasetLabel === 'Hava Topu %') {
                                      return `${datasetLabel}: ${safeToInt(os["Hv%"])}%`;
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
                        <p><strong>Not:</strong> Savunma Aktiviteleri grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Top Kazanma/90:</strong> 3-15 aralığına göre normalize edilmiştir</li>
                          <li><strong>Engelleme/90:</strong> 0.5-4 aralığına göre normalize edilmiştir</li>
                          <li><strong>Hava Topu %:</strong> 30-80% aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pas detay tablosu */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Detaylı Pas İstatistikleri</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">İsabetli Pas/Maç</th>
                            <th className="text-center py-3 px-2">Pas İsabet %</th>
                            <th className="text-center py-3 px-2">Dikey Pas/Maç</th>
                            <th className="text-center py-3 px-2">AO Kilit Pas/Maç</th>
                            <th className="text-center py-3 px-2">Top Kazanma/90</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliOrtaSahaData.map((os, index) => (
                            <tr key={os.blabla_os} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{os.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os.isbtlpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(os.isbtlpas_yzd)}%</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os.diKkilitpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os.AOkilitpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os["KazanTop/90"])}</td>
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
                  <h3 className="text-xl font-semibold mb-6">Hücum & Yaratıcılık</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Yaratıcılık vs Pas Kalitesi</h4>
                      <div className="h-96">
                        <Scatter
                          data={yaraticilikPasScatterData}
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
                                      `Pas %: ${safeToFixed(point.y)}%`,
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
                                  text: 'Pas İsabet %'
                                },
                                min: 70,
                                max: 100
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Hücum Katkıları</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliOrtaSahaData.map(os => os.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Şut Pası/90',
                                data: seciliOrtaSahaData.map(os => {
                                  // Şut Pası/90 değerlendirme aralığı: 0.5-3.0 (Orta Saha için tipik aralık)
                                  const sutPasiMin = 0.0;
                                  const sutPasiMax = 3.0;
                                  const normalizedSutPasi = Math.min(100, Math.max(0, ((os["SPasi/90"] - sutPasiMin) / (sutPasiMax - sutPasiMin)) * 100));
                                  return normalizedSutPasi;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Asist Beklentisi/Maç',
                                data: seciliOrtaSahaData.map(os => {
                                  // Asist Beklentisi/Maç değerlendirme aralığı: 0.05-0.25 (Orta Saha için tipik aralık)
                                  const asistBeklentisiMin = 0.05;
                                  const asistBeklentisiMax = 0.25;
                                  const normalizedAsistBeklentisi = Math.min(100, Math.max(0, ((os.astbklntMB - asistBeklentisiMin) / (asistBeklentisiMax - asistBeklentisiMin)) * 100));
                                  return normalizedAsistBeklentisi;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Yaratılan Gol Fırsatı/Maç',
                                data: seciliOrtaSahaData.map(os => {
                                  // Yaratılan Gol Fırsatı/Maç değerlendirme aralığı: 0.1-0.6 (Orta Saha için tipik aralık)
                                  const golFirsatiMin = 0.0;
                                  const golFirsatiMax = 1.5;
                                  const normalizedGolFirsati = Math.min(100, Math.max(0, ((os.yrtglfrstMB - golFirsatiMin) / (golFirsatiMax - golFirsatiMin)) * 100));
                                  return normalizedGolFirsati;
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
                                    const os = seciliOrtaSahaData[playerIndex];
                                    
                                    if (datasetLabel === 'Şut Pası/90') {
                                      return `${datasetLabel}: ${safeToFixed(os["SPasi/90"])}`;
                                    } else if (datasetLabel === 'Asist Beklentisi/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(os.astbklntMB)}`;
                                    } else if (datasetLabel === 'Yaratılan Gol Fırsatı/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(os.yrtglfrstMB)}`;
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
                          <li><strong>Şut Pası/90:</strong> 0.5-3.0 aralığına göre normalize edilmiştir</li>
                          <li><strong>Asist Beklentisi/Maç:</strong> 0.05-0.25 aralığına göre normalize edilmiştir</li>
                          <li><strong>Yaratılan Gol Fırsatı/Maç:</strong> 0.1-0.6 aralığına göre normalize edilmiştir</li>
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
                            <th className="text-center py-3 px-2">Yaratıcılık Etkinlik</th>
                            <th className="text-center py-3 px-2">Şut Pası/90</th>
                            <th className="text-center py-3 px-2">Asist Beklentisi/Maç</th>
                            <th className="text-center py-3 px-2">Yaratılan Gol Fırsatı/Maç</th>
                            <th className="text-center py-3 px-2">Gol/90</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliOrtaSahaData.map((os, index) => (
                            <tr key={os.blabla_os} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{os.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os.yrtclkEtknlk)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os["SPasi/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os.astbklntMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os.yrtglfrstMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os["Gol/90"])}</td>
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
                            labels: seciliOrtaSahaData.map(os => os.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Sprint/90',
                                data: seciliOrtaSahaData.map(os => {
                                  // Sprint/90 değerlendirme aralığı: 15-40 (Orta Saha için tipik aralık)
                                  const sprintMin = 0;
                                  const sprintMax = 13;
                                  const normalizedSprint = Math.min(100, Math.max(0, ((os["Sprint/90"] - sprintMin) / (sprintMax - sprintMin)) * 100));
                                  return normalizedSprint;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Mesafe/90 (km)',
                                data: seciliOrtaSahaData.map(os => {
                                  // Mesafe/90 değerlendirme aralığı: 10-12 km (Orta Saha için tipik aralık)
                                  const mesafeMin = 8.5;
                                  const mesafeMax = 13.5;
                                  const normalizedMesafe = Math.min(100, Math.max(0, ((os["Mesf/90"] - mesafeMin) / (mesafeMax - mesafeMin)) * 100));
                                  return normalizedMesafe;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Hava Topu Kazanma %',
                                data: seciliOrtaSahaData.map(os => {
                                  // Hava Topu Kazanma % değerlendirme aralığı: 0-80% (Orta Saha için tipik aralık)
                                  const havaTopuMin = 0;
                                  const havaTopuMax = 65;
                                  const normalizedHavaTopu = Math.min(100, Math.max(0, ((os["Hv%"] - havaTopuMin) / (havaTopuMax - havaTopuMin)) * 100));
                                  return normalizedHavaTopu;
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
                                    const os = seciliOrtaSahaData[playerIndex];
                                    
                                    if (datasetLabel === 'Sprint/90') {
                                      return `${datasetLabel}: ${safeToFixed(os["Sprint/90"])}`;
                                    } else if (datasetLabel === 'Mesafe/90 (km)') {
                                      return `Mesafe/90: ${safeToFixed(os["Mesf/90"])} km`;
                                    } else if (datasetLabel === 'Hava Topu Kazanma %') {
                                      return `${datasetLabel}: ${safeToInt(os["Hv%"])}%`;
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
                          <li><strong>Sprint/90:</strong> 15-40 aralığına göre normalize edilmiştir</li>
                          <li><strong>Mesafe/90:</strong> 10-12 km aralığına göre normalize edilmiştir</li>
                          <li><strong>Hava Topu Kazanma %:</strong> 0-80% aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Teknik Beceriler</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliOrtaSahaData.map(os => os.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Başarılı Dribling/Maç',
                                data: seciliOrtaSahaData.map(os => {
                                  // Başarılı Dribling/Maç değerlendirme aralığı: 0.2-2.0 (Orta Saha için tipik aralık)
                                  const driblingMin = 0.0;
                                  const driblingMax = 2.0;
                                  const normalizedDribling = Math.min(100, Math.max(0, ((os.bsrldrplMB - driblingMin) / (driblingMax - driblingMin)) * 100));
                                  return normalizedDribling;
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'Top Kaybı/90',
                                data: seciliOrtaSahaData.map(os => {
                                  // Top Kaybı/90 değerlendirme aralığı: 8-20 (Orta Saha için tipik aralık) - Ters normalize (düşük değer daha iyi)
                                  const topKaybiMin = 4;
                                  const topKaybiMax = 12;
                                  const normalizedTopKaybi = Math.min(100, Math.max(0, ((topKaybiMax - os["TopKyb/90"]) / (topKaybiMax - topKaybiMin)) * 100));
                                  return normalizedTopKaybi;
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Akan Oyunda İsabetli Orta %',
                                data: seciliOrtaSahaData.map(os => {
                                  // Akan Oyunda İsabetli Orta % değerlendirme aralığı: 20-80% (Orta Saha için tipik aralık)
                                  const aoIoMin = 0;
                                  const aoIoMax = 40;
                                  const normalizedAoIo = Math.min(100, Math.max(0, ((os["Ao-Io%"] - aoIoMin) / (aoIoMax - aoIoMin)) * 100));
                                  return normalizedAoIo;
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
                                    const os = seciliOrtaSahaData[playerIndex];
                                    
                                    if (datasetLabel === 'Başarılı Dribling/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(os.bsrldrplMB)}`;
                                    } else if (datasetLabel === 'Top Kaybı/90') {
                                      return `${datasetLabel}: ${safeToFixed(os["TopKyb/90"])}`;
                                    } else if (datasetLabel === 'Akan Oyunda İsabetli Orta %') {
                                      return `${datasetLabel}: ${safeToInt(os["Ao-Io%"])}%`;
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
                          <li><strong>Başarılı Dribling/Maç:</strong> 0.2-2.0 aralığına göre normalize edilmiştir</li>
                          <li><strong>Top Kaybı/90:</strong> 8-20 aralığına göre ters normalize edilmiştir (düşük değer daha iyi)</li>
                          <li><strong>Akan Oyunda İsabetli Orta %:</strong> 20-80% aralığına göre normalize edilmiştir</li>
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
                            <th className="text-center py-3 px-2">Dribling/Maç</th>
                            <th className="text-center py-3 px-2">Top Kaybı/90</th>
                            <th className="text-center py-3 px-2">Hava Topu %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliOrtaSahaData.map((os, index) => (
                            <tr key={os.blabla_os} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{os.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(os.oyuncu_sure)} dk</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os["Sprint/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os["Mesf/90"])} km</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os.bsrldrplMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(os["TopKyb/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(os["Hv%"])}%</td>
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
                            text: 'Çok Boyutlu Orta Saha Karşılaştırması'
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
                                  { name: 'Pas %', key: 'Pas%' },
                                  { name: 'Dikey Pas/90', key: 'DikKltPas/90' },
                                  { name: 'Asist Beklentisi/Maç', key: 'astbklntMB' },
                                  { name: 'Başarılı Dribling/Maç', key: 'bsrldrplMB' },
                                  { name: 'Yaratılan Gol Fırsatı', key: 'yrtglfrstMB' }
                                ];
                                const metric = metrics[dataIndex];
                                
                                // İlgili orta saha verilerini bul
                                const osLabel = context.dataset.label;
                                const os = seciliOrtaSahaData.find(d => d.oyuncu_isim === osLabel);
                                
                                if (os) {
                                  const originalValue = os[metric.key as keyof CombinedOrtaSahaData] as number;
                                  
                                  // Yüzde değerleri için
                                  if (metric.key === 'Pas%') {
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
                      <li><strong>Yaratıcılık Etkinlik:</strong> 0-100 aralığında normalize edilmiştir</li>
                      <li><strong>Pas %:</strong> 70-95% aralığında normalize edilmiştir</li>
                      <li><strong>Dikey Pas/90:</strong> 0-8 aralığında normalize edilmiştir</li>
                      <li><strong>Asist Beklentisi/Maç:</strong> 0-0.3 aralığında normalize edilmiştir</li>
                      <li><strong>Başarılı Dribling/Maç:</strong> 0-3 aralığında normalize edilmiştir</li>
                      <li><strong>Yaratılan Gol Fırsatı:</strong> 0-2 aralığında normalize edilmiştir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {seciliOrtaSahaData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 text-lg">Karşılaştırmak için en az bir orta saha seçin</p>
              <p className="text-gray-400 text-sm mt-2">Maksimum 6 orta saha karşılaştırabilirsiniz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 