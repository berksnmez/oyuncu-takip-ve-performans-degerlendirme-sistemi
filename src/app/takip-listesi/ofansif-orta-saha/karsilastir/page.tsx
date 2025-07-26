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

// Ofansif Orta Saha veri tipleri
interface OfansifOrtaSahaGrafik {
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

interface OfansifOrtaSahaIstatistik {
  blabla_oos: string;
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
  genel_sira: number;
  golbkltnsMB: number;
  golculukEtknlk: number;
  golculukEtknlk_katsayi: number;
  golMB: number;
  isbtlpasMB: number;
  isbtlpas_yzd: number;
  isbtlpas_yzd_katsayi: number;
  isbtlsutMB: number;
  isbtlsutMB_katsayi: number;
  kalite_sira_katsayi: number;
  performans_skoru: number;
  performans_skor_sirasi: number;
  pnltszxgMB: number;
  pnltszxgMB_katsayi: number;
  surdurabilirlik_sira: number;
  sutbsnagolbkltns: number;
  toplamsut: number;
  yrtclkEtknlk: number;
  yrtglfrstMB: number;
}

interface CombinedOfansifOrtaSahaData extends OfansifOrtaSahaGrafik, OfansifOrtaSahaIstatistik {
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

export default function OfansifOrtaSahaKarsilastir() {
  const { getItemsByCategory } = useTakipListesi();
  const [ofansifOrtaSahalar, setOfansifOrtaSahalar] = useState<CombinedOfansifOrtaSahaData[]>([]);
  const [seciliOfansifOrtaSahalar, setSeciliOfansifOrtaSahalar] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genel' | 'golculuk' | 'yaraticilik' | 'pas' | 'fiziksel' | 'radar'>('genel');
  const [sortBy, setSortBy] = useState<string>('performans_skoru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Ofansif Orta Saha verilerini yükle
  useEffect(() => {
    const loadOfansifOrtaSahalar = async () => {
      try {
        setLoading(true);
        
        // Takip listesinden Ofansif Orta Saha blabla_oos değerlerini al
        const takipEdilenOfansifOrtaSahalar = getItemsByCategory('oos');
        console.log("Takip edilen Ofansif Orta Sahalar:", takipEdilenOfansifOrtaSahalar);
        const blablaOosList = takipEdilenOfansifOrtaSahalar.map(oos => String(oos.blabla_oos).trim());
        console.log("Blabla_oos listesi:", blablaOosList);
        
        if (blablaOosList.length === 0) {
          setOfansifOrtaSahalar([]);
          return;
        }

        // Grafik verilerini al (ortasahalar_grafik tablosundan)
        const grafikResponse = await fetch('/api/ortasahalar-grafik');
        if (!grafikResponse.ok) throw new Error('Grafik verileri alınamadı');
        const grafikResult = await grafikResponse.json();
        console.log("Grafik result:", grafikResult);

        // İstatistik verilerini al (ofansifortasaha_istatistik tablosundan)
        const istatistikResponse = await fetch('/api/ofansifortasaha-istatistik');
        if (!istatistikResponse.ok) throw new Error('İstatistik verileri alınamadı');
        const istatistikResult = await istatistikResponse.json();
        console.log("İstatistik result:", istatistikResult);

        // Verileri birleştir
        const combinedData: CombinedOfansifOrtaSahaData[] = [];
        
        blablaOosList.forEach(blablaOos => {
          console.log("Aranan blabla_oos:", blablaOos);
          
          // İstatistik verisini bul
          const istatistikData = istatistikResult.data?.find((i: any) => {
            const istatistikBlabla = String(i.blabla_oos || '').trim();
            console.log("İstatistik blabla_oos:", istatistikBlabla, "Aranan:", blablaOos);
            return istatistikBlabla === blablaOos;
          });

          if (!istatistikData) {
            console.log("İstatistik verisi bulunamadı:", blablaOos);
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
              blabla_oos: blablaOos, // Ensure consistent blabla_oos value
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
              genel_sira: Number(istatistikData.genel_sira) || 0,
              golbkltnsMB: Number(istatistikData.golbkltnsMB) || 0,
              golculukEtknlk: Number(istatistikData.golculukEtknlk) || 0,
              golculukEtknlk_katsayi: Number(istatistikData.golculukEtknlk_katsayi) || 0,
              golMB: Number(istatistikData.golMB) || 0,
              isbtlpasMB: Number(istatistikData.isbtlpasMB) || 0,
              isbtlpas_yzd: Number(istatistikData.isbtlpas_yzd) || 0,
              isbtlpas_yzd_katsayi: Number(istatistikData.isbtlpas_yzd_katsayi) || 0,
              isbtlsutMB: Number(istatistikData.isbtlsutMB) || 0,
              isbtlsutMB_katsayi: Number(istatistikData.isbtlsutMB_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              pnltszxgMB: Number(istatistikData.pnltszxgMB) || 0,
              pnltszxgMB_katsayi: Number(istatistikData.pnltszxgMB_katsayi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutbsnagolbkltns: Number(istatistikData.sutbsnagolbkltns) || 0,
              toplamsut: Number(istatistikData.toplamsut) || 0,
              yrtclkEtknlk: Number(istatistikData.yrtclkEtknlk) || 0,
              yrtglfrstMB: Number(istatistikData.yrtglfrstMB) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          } else if (istatistikData) {
            // Sadece istatistik verisi varsa, grafik verilerini varsayılan değerlerle doldur
            combinedData.push({
              ...istatistikData,
              blabla_oos: blablaOos,
              bnzrsz_os: '',
              // Default graphic values
              "Ao-Io%": 0,
              "DikKltPas/90": Number(istatistikData.AOkilitpasMB) || 0,
              "Eng/90": 0,
              "Gol/90": Number(istatistikData.golMB) || 0,
              "HtmG/90": 0,
              "Hv%": 0,
              "KazanTop/90": 0,
              "Mesf/90": 0,
              "OrtGrsm/90": 0,
              "Pas%": Number(istatistikData.isbtlpas_yzd) || 0,
              "PH-xG/90": Number(istatistikData.pnltszxgMB) || 0,
              "PsG/90": 0,
              "SPasi/90": Number(istatistikData.isbtlsutMB) || 0,
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
              genel_sira: Number(istatistikData.genel_sira) || 0,
              golbkltnsMB: Number(istatistikData.golbkltnsMB) || 0,
              golculukEtknlk: Number(istatistikData.golculukEtknlk) || 0,
              golculukEtknlk_katsayi: Number(istatistikData.golculukEtknlk_katsayi) || 0,
              golMB: Number(istatistikData.golMB) || 0,
              isbtlpasMB: Number(istatistikData.isbtlpasMB) || 0,
              isbtlpas_yzd: Number(istatistikData.isbtlpas_yzd) || 0,
              isbtlpas_yzd_katsayi: Number(istatistikData.isbtlpas_yzd_katsayi) || 0,
              isbtlsutMB: Number(istatistikData.isbtlsutMB) || 0,
              isbtlsutMB_katsayi: Number(istatistikData.isbtlsutMB_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              pnltszxgMB: Number(istatistikData.pnltszxgMB) || 0,
              pnltszxgMB_katsayi: Number(istatistikData.pnltszxgMB_katsayi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutbsnagolbkltns: Number(istatistikData.sutbsnagolbkltns) || 0,
              toplamsut: Number(istatistikData.toplamsut) || 0,
              yrtclkEtknlk: Number(istatistikData.yrtclkEtknlk) || 0,
              yrtglfrstMB: Number(istatistikData.yrtglfrstMB) || 0,
              oyuncu_sure: Number(istatistikData.oyuncu_sure) || 0,
              oyuncu_yas: Number(istatistikData.oyuncu_yas) || 0,
              isSelected: false
            });
          }
        });

        console.log("Combined data:", combinedData);
        setOfansifOrtaSahalar(combinedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Ofansif Orta Saha verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOfansifOrtaSahalar();
  }, [getItemsByCategory]);

  // Ofansif Orta Saha seçimi
  const toggleOfansifOrtaSahaSelection = useCallback((blablaOos: string) => {
    console.log("Toggle Ofansif Orta Saha selection:", blablaOos);
    console.log("Mevcut seçili Ofansif Orta Sahalar:", seciliOfansifOrtaSahalar);
    
    setSeciliOfansifOrtaSahalar(prev => {
      if (prev.includes(blablaOos)) {
        console.log("Ofansif Orta Saha zaten seçili, çıkarılıyor");
        return prev.filter(id => id !== blablaOos);
      } else if (prev.length < 6) { // Maksimum 6 Ofansif Orta Saha karşılaştırılabilir
        console.log("Ofansif Orta Saha ekleniyor");
        return [...prev, blablaOos];
      } else {
        console.log("Maksimum Ofansif Orta Saha sayısına ulaşıldı");
        return prev;
      }
    });
  }, [seciliOfansifOrtaSahalar]);

  // Sıralama
  const sortedOfansifOrtaSahalar = useMemo(() => {
    return [...ofansifOrtaSahalar].sort((a, b) => {
      const aVal = a[sortBy as keyof CombinedOfansifOrtaSahaData] as number;
      const bVal = b[sortBy as keyof CombinedOfansifOrtaSahaData] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [ofansifOrtaSahalar, sortBy, sortOrder]);

  // Seçili Ofansif Orta Sahalar verisi
  const seciliOfansifOrtaSahaData = useMemo(() => {
    return ofansifOrtaSahalar.filter(oos => seciliOfansifOrtaSahalar.includes(oos.blabla_oos));
  }, [ofansifOrtaSahalar, seciliOfansifOrtaSahalar]);

  // Gölcülük vs Yaratıcılık scatter chart data
  const golculukYaraticilikScatterData = useMemo(() => {
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
          label: 'Gölcülük vs Yaratıcılık',
          data: seciliOfansifOrtaSahaData.map((oos, index) => ({
            x: oos.golculukEtknlk,
            y: oos.yrtclkEtknlk,
            label: oos.oyuncu_isim,
            performans: oos.performans_skoru
          })),
          backgroundColor: seciliOfansifOrtaSahaData.map((_, index) => colors[index % colors.length]),
          pointRadius: 8,
          pointHoverRadius: 10,
        }
      ]
    };
  }, [seciliOfansifOrtaSahaData]);

  // Radar chart data
  const radarChartData = useMemo(() => {
    if (seciliOfansifOrtaSahaData.length === 0) return { labels: [], datasets: [] };

    // Metrik etiketleri ve değerlendirme aralıkları
    const metrics = [
      { name: 'Gölcülük Etkinlik', key: 'golculukEtknlk', min: 0, max: 0.3 },
      { name: 'Yaratıcılık Etkinlik', key: 'yrtclkEtknlk', min: 0, max: 0.07 },
      { name: 'Pas %', key: 'Pas%', min: 70, max: 95 },
      { name: 'Asist Beklentisi/Maç', key: 'astbklntMB', min: 0, max: 0.3 },
      { name: 'Başarılı Dribling/Maç', key: 'bsrldrplMB', min: 0, max: 3.0 },
      { name: 'İsabetli Şut/Maç', key: 'isbtlsutMB', min: 0, max: 1.4 }
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
      datasets: seciliOfansifOrtaSahaData.map((oos, index) => {
        // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
        const normalizedData = metrics.map(metric => {
          const value = oos[metric.key as keyof CombinedOfansifOrtaSahaData] as number || 0;
          
          // Değeri min-max aralığına göre 0-100 arasına normalize et
          return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
        });

        return {
          label: oos.oyuncu_isim,
          data: normalizedData,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
          pointRadius: 4,
        };
      })
    };
  }, [seciliOfansifOrtaSahaData]);

  // Performance comparison bar chart
  const performanceBarData = useMemo(() => {
    if (seciliOfansifOrtaSahaData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliOfansifOrtaSahaData.map(oos => oos.oyuncu_isim),
      datasets: [
        {
          label: 'Performans Skoru',
          data: seciliOfansifOrtaSahaData.map(oos => oos.performans_skoru),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Gölcülük Etkinlik',
          data: seciliOfansifOrtaSahaData.map(oos => oos.golculukEtknlk),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'Yaratıcılık Etkinlik',
          data: seciliOfansifOrtaSahaData.map(oos => oos.yrtclkEtknlk),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    };
  }, [seciliOfansifOrtaSahaData]);

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
          <Link href="/takip-listesi/ofansif-orta-saha" className="text-blue-600 hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ofansif Orta Saha Karşılaştırması</h1>
      
      {/* Pozisyon Navbar */}
      <TakipListesiNavbar seciliPozisyon="Ofansif Orta Saha" />
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'genel', label: 'Genel Bakış' },
            { key: 'golculuk', label: 'Gölcülük & Şut' },
            { key: 'yaraticilik', label: 'Yaratıcılık & Asist' },
            { key: 'pas', label: 'Pas & Oyun Kurma' },
            { key: 'fiziksel', label: 'Fiziksel' },
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

      {ofansifOrtaSahalar.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz takip ettiğiniz ofansif orta saha bulunmuyor.</p>
          <Link 
            href="/oyuncu-arama/oos" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Ofansif Orta Saha Ara
          </Link>
        </div>
      ) : (
        <>
          {/* Ofansif Orta Saha Seçimi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                Karşılaştırılacak Ofansif Orta Sahaları Seçin ({seciliOfansifOrtaSahalar.length}/6)
              </h3>
              <div className="flex items-center space-x-4">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="performans_skoru">Performans Skoru</option>
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="golculukEtknlk">Gölcülük Etkinlik</option>
                  <option value="yrtclkEtknlk">Yaratıcılık Etkinlik</option>
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
              {sortedOfansifOrtaSahalar.map((oos) => (
                <div
                  key={oos.blabla_oos}
                  onClick={() => {
                    console.log("Card clicked for Ofansif Orta Saha:", oos.oyuncu_isim, "blabla_oos:", oos.blabla_oos);
                    toggleOfansifOrtaSahaSelection(oos.blabla_oos);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    seciliOfansifOrtaSahalar.includes(oos.blabla_oos)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${seciliOfansifOrtaSahalar.length >= 6 && !seciliOfansifOrtaSahalar.includes(oos.blabla_oos) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{oos.oyuncu_isim}</h4>
                    <input
                      type="checkbox"
                      checked={seciliOfansifOrtaSahalar.includes(oos.blabla_oos)}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log("Checkbox clicked:", oos.blabla_oos);
                        toggleOfansifOrtaSahaSelection(oos.blabla_oos);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Performans: {safeToFixed(oos.performans_skoru)}</div>
                    <div>Genel Sıra: {safeToInt(oos.genel_sira)}</div>
                    <div>Gölcülük: {safeToFixed(oos.golculukEtknlk)}</div>
                    <div>Yaratıcılık: {safeToFixed(oos.yrtclkEtknlk)}</div>
                    <div className="text-xs text-gray-400">Takım: {oos.takim_adi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {seciliOfansifOrtaSahaData.length > 0 && (
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
                          <th className="text-center py-3 px-2">Gölcülük</th>
                          <th className="text-center py-3 px-2">Yaratıcılık</th>
                          <th className="text-center py-3 px-2">Pas %</th>
                          <th className="text-center py-3 px-2">Asist Beklentisi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seciliOfansifOrtaSahaData.map((oos, index) => (
                          <tr key={oos.blabla_oos} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-3 px-2 font-medium">{oos.oyuncu_isim}</td>
                            <td className="py-3 px-2 text-center">{oos.takim_adi}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(oos.oyuncu_yas)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(oos.performans_skoru)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(oos.genel_sira)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(oos.golculukEtknlk)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(oos.yrtclkEtknlk)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(oos["Pas%"])}%</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(oos.astbklntMB)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'golculuk' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Gölcülük & Şut Performansı</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Gölcülük vs Yaratıcılık</h4>
                      <div className="h-96">
                        <Scatter
                          data={golculukYaraticilikScatterData}
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
                                      `Gölcülük: ${safeToFixed(point.x)}`,
                                      `Yaratıcılık: ${safeToFixed(point.y)}`,
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
                                  text: 'Gölcülük Etkinlik'
                                },
                                min: 0
                              },
                              y: {
                                title: {
                                  display: true,
                                  text: 'Yaratıcılık Etkinlik'
                                },
                                min: 0
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Şut İstatistikleri</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliOfansifOrtaSahaData.map(oos => oos.oyuncu_isim),
                            datasets: [
                              {
                                label: 'İsabetli Şut/Maç',
                                data: seciliOfansifOrtaSahaData.map(oos => oos.isbtlsutMB),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Gol/Maç',
                                data: seciliOfansifOrtaSahaData.map(oos => oos.golMB),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Gol Beklentisi/Maç',
                                data: seciliOfansifOrtaSahaData.map(oos => oos.golbkltnsMB),
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
                                text: 'Şut ve Gol İstatistikleri'
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
                  
                  {/* Gölcülük detay tablosu */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Detaylı Gölcülük İstatistikleri</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">Gölcülük Etkinlik</th>
                            <th className="text-center py-3 px-2">İsabetli Şut/Maç</th>
                            <th className="text-center py-3 px-2">Gol/Maç</th>
                            <th className="text-center py-3 px-2">Gol Beklentisi/Maç</th>
                            <th className="text-center py-3 px-2">Toplam Şut</th>
                            <th className="text-center py-3 px-2">Penaltısız xG/Maç</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliOfansifOrtaSahaData.map((oos, index) => (
                            <tr key={oos.blabla_oos} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{oos.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.golculukEtknlk)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.isbtlsutMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.golMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.golbkltnsMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(oos.toplamsut)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.pnltszxgMB)}</td>
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
                      <h4 className="text-lg font-medium mb-4">Yaratıcılık Katkıları</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliOfansifOrtaSahaData.map(oos => oos.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Yaratıcılık Etkinlik',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Yaratıcılık Etkinlik değerlendirme aralığı: 0.01-0.07 (Ofansif Orta Saha için tipik aralık)
                                  const yaraticilikMin = 0.00;
                                  const yaraticilikMax = 0.07;
                                  const normalizedYaraticilik = Math.min(100, Math.max(0, ((oos.yrtclkEtknlk - yaraticilikMin) / (yaraticilikMax - yaraticilikMin)) * 100));
                                  return normalizedYaraticilik;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Asist Beklentisi/Maç',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Asist Beklentisi/Maç değerlendirme aralığı: 0.1-0.4 (Ofansif Orta Saha için tipik aralık)
                                  const asistMin = 0.0;
                                  const asistMax = 0.4;
                                  const normalizedAsist = Math.min(100, Math.max(0, ((oos.astbklntMB - asistMin) / (asistMax - asistMin)) * 100));
                                  return normalizedAsist;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Yaratılan Gol Fırsatı/Maç',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Yaratılan Gol Fırsatı/Maç değerlendirme aralığı: 0.1-0.6 (Ofansif Orta Saha için tipik aralık)
                                  const golFirsatiMin = 0.0;
                                  const golFirsatiMax = 1.3;
                                  const normalizedGolFirsati = Math.min(100, Math.max(0, ((oos.yrtglfrstMB - golFirsatiMin) / (golFirsatiMax - golFirsatiMin)) * 100));
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
                                text: 'Yaratıcılık Katkı Karşılaştırması'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const oos = seciliOfansifOrtaSahaData[playerIndex];
                                    
                                    if (datasetLabel === 'Yaratıcılık Etkinlik') {
                                      return `${datasetLabel}: ${safeToFixed(oos.yrtclkEtknlk, 3)}`;
                                    } else if (datasetLabel === 'Asist Beklentisi/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(oos.astbklntMB, 3)}`;
                                    } else if (datasetLabel === 'Yaratılan Gol Fırsatı/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(oos.yrtglfrstMB, 3)}`;
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
                        <p><strong>Not:</strong> Yaratıcılık Katkıları grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Yaratıcılık Etkinlik:</strong> 0.00-0.07 aralığına göre normalize edilmiştir</li>
                          <li><strong>Asist Beklentisi/Maç:</strong> 0.0-0.4 aralığına göre normalize edilmiştir</li>
                          <li><strong>Yaratılan Gol Fırsatı/Maç:</strong> 0.0-1.3 aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Başarılı Dribling & Teknik</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliOfansifOrtaSahaData.map(oos => oos.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Başarılı Dribling/Maç',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Başarılı Dribling/Maç değerlendirme aralığı: 0.5-3.0 (Ofansif Orta Saha için tipik aralık)
                                  const driblingMin = 0.0;
                                  const driblingMax = 3.0;
                                  const normalizedDribling = Math.min(100, Math.max(0, ((oos.bsrldrplMB - driblingMin) / (driblingMax - driblingMin)) * 100));
                                  return normalizedDribling;
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'Top Kaybı/90',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Top Kaybı/90 değerlendirme aralığı: 8-20 (Ofansif Orta Saha için tipik aralık) - Ters çevrilmiş (düşük değer iyi)
                                  const topKaybMin = 5;
                                  const topKaybMax = 12;
                                  const normalizedTopKayb = Math.min(100, Math.max(0, ((topKaybMax - oos["TopKyb/90"]) / (topKaybMax - topKaybMin)) * 100));
                                  return normalizedTopKayb;
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Pas %',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Pas % değerlendirme aralığı: 70-95% (Ofansif Orta Saha için tipik aralık)
                                  const pasMin = 70;
                                  const pasMax = 95;
                                  const normalizedPas = Math.min(100, Math.max(0, ((oos["Pas%"] - pasMin) / (pasMax - pasMin)) * 100));
                                  return normalizedPas;
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
                                    const oos = seciliOfansifOrtaSahaData[playerIndex];
                                    
                                    if (datasetLabel === 'Başarılı Dribling/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(oos.bsrldrplMB)}`;
                                    } else if (datasetLabel === 'Top Kaybı/90') {
                                      return `${datasetLabel}: ${safeToFixed(oos["TopKyb/90"])}`;
                                    } else if (datasetLabel === 'Pas %') {
                                      return `${datasetLabel}: ${safeToInt(oos["Pas%"])}%`;
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
                        <p><strong>Not:</strong> Teknik Beceri grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Başarılı Dribling/Maç:</strong> 0.5-3.0 aralığına göre normalize edilmiştir</li>
                          <li><strong>Top Kaybı/90:</strong> 8-20 aralığına göre ters normalize edilmiştir (düşük değer daha iyi)</li>
                          <li><strong>Pas %:</strong> 70-95% aralığına göre normalize edilmiştir</li>
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
                            <th className="text-center py-3 px-2">Başarılı Dribling/Maç</th>
                            <th className="text-center py-3 px-2">Top Kaybı/90</th>
                            <th className="text-center py-3 px-2">Pas %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliOfansifOrtaSahaData.map((oos, index) => (
                            <tr key={oos.blabla_oos} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{oos.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.yrtclkEtknlk)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.astbklntMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.yrtglfrstMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.bsrldrplMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos["TopKyb/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(oos["Pas%"])}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pas' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Pas & Oyun Kurma</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Pas Kalitesi</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliOfansifOrtaSahaData.map(oos => oos.oyuncu_isim),
                            datasets: [
                              {
                                label: 'İsabetli Pas/Maç',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // İsabetli Pas/Maç değerlendirme aralığı: 20-65 (Ofansif Orta Saha için tipik aralık)
                                  const isbtlPasMin = 10;
                                  const isbtlPasMax = 60;
                                  const normalizedIsbtlPas = Math.min(100, Math.max(0, ((oos.isbtlpasMB - isbtlPasMin) / (isbtlPasMax - isbtlPasMin)) * 100));
                                  return normalizedIsbtlPas;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Dikey Pas/90',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Dikey Pas/90 değerlendirme aralığı: 1-8 (Ofansif Orta Saha için tipik aralık)
                                  const dikeyPasMin = 1;
                                  const dikeyPasMax = 6;
                                  const normalizedDikeyPas = Math.min(100, Math.max(0, ((oos["DikKltPas/90"] - dikeyPasMin) / (dikeyPasMax - dikeyPasMin)) * 100));
                                  return normalizedDikeyPas;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'AO Kilit Pas/Maç',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // AO Kilit Pas/Maç değerlendirme aralığı: 0.1-2.5 (Ofansif Orta Saha için tipik aralık)
                                  const aoKilitMin = 0.1;
                                  const aoKilitMax = 2.5;
                                  const normalizedAoKilit = Math.min(100, Math.max(0, ((oos.AOkilitpasMB - aoKilitMin) / (aoKilitMax - aoKilitMin)) * 100));
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
                                text: 'Pas Performansı Karşılaştırması'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const oos = seciliOfansifOrtaSahaData[playerIndex];
                                    
                                    if (datasetLabel === 'İsabetli Pas/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(oos.isbtlpasMB)}`;
                                    } else if (datasetLabel === 'Dikey Pas/90') {
                                      return `${datasetLabel}: ${safeToFixed(oos["DikKltPas/90"])}`;
                                    } else if (datasetLabel === 'AO Kilit Pas/Maç') {
                                      return `${datasetLabel}: ${safeToFixed(oos.AOkilitpasMB)}`;
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
                          <li><strong>İsabetli Pas/Maç:</strong> 10-60 aralığına göre normalize edilmiştir</li>
                          <li><strong>Dikey Pas/90:</strong> 1-6 aralığına göre normalize edilmiştir</li>
                          <li><strong>AO Kilit Pas/Maç:</strong> 0.1-2.5 aralığına göre normalize edilmiştir</li>
                        </ul>
                        <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4">Oyun Kurma</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliOfansifOrtaSahaData.map(oos => oos.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Dikey Pas/90',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Dikey Pas/90 değerlendirme aralığı: 1-6 (Ofansif Orta Saha için tipik aralık)
                                  const dikeyPasMin = 1;
                                  const dikeyPasMax = 6;
                                  const normalizedDikeyPas = Math.min(100, Math.max(0, ((oos["DikKltPas/90"] - dikeyPasMin) / (dikeyPasMax - dikeyPasMin)) * 100));
                                  return normalizedDikeyPas;
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'Akan Oyunda İsabetli Orta %',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Akan Oyunda İsabetli Orta % değerlendirme aralığı: 0-50% (Ofansif Orta Saha için tipik aralık)
                                  const aoOrtaMin = 0;
                                  const aoOrtaMax = 40;
                                  const normalizedAoOrta = Math.min(100, Math.max(0, ((oos["Ao-Io%"] - aoOrtaMin) / (aoOrtaMax - aoOrtaMin)) * 100));
                                  return normalizedAoOrta;
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Şut Pası/90',
                                data: seciliOfansifOrtaSahaData.map(oos => {
                                  // Şut Pası/90 değerlendirme aralığı: 0-3 (Ofansif Orta Saha için tipik aralık)
                                  const sutPasiMin = 0;
                                  const sutPasiMax = 2.5;
                                  const normalizedSutPasi = Math.min(100, Math.max(0, ((oos["SPasi/90"] - sutPasiMin) / (sutPasiMax - sutPasiMin)) * 100));
                                  return normalizedSutPasi;
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
                                text: 'Oyun Kurma Aktiviteleri'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const oos = seciliOfansifOrtaSahaData[playerIndex];
                                    
                                    if (datasetLabel === 'Dikey Pas/90') {
                                      return `${datasetLabel}: ${safeToFixed(oos["DikKltPas/90"])}`;
                                    } else if (datasetLabel === 'Akan Oyunda İsabetli Orta %') {
                                      return `${datasetLabel}: ${safeToInt(oos["Ao-Io%"])}%`;
                                    } else if (datasetLabel === 'Şut Pası/90') {
                                      return `${datasetLabel}: ${safeToFixed(oos["SPasi/90"])}`;
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
                        <p><strong>Not:</strong> Oyun Kurma grafiğinde normalizasyon uygulanmıştır:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><strong>Dikey Pas/90:</strong> 1-6 aralığına göre normalize edilmiştir</li>
                          <li><strong>Akan Oyunda İsabetli Orta %:</strong> 0-40% aralığına göre normalize edilmiştir</li>
                          <li><strong>Şut Pası/90:</strong> 0-2.5 aralığına göre normalize edilmiştir</li>
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
                            <th className="text-center py-3 px-2">Dikey Pas/90</th>
                            <th className="text-center py-3 px-2">AO Kilit Pas/Maç</th>
                            <th className="text-center py-3 px-2">Akan Oyunda İsabetli Orta %</th>
                            <th className="text-center py-3 px-2">Şut Pası/90</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliOfansifOrtaSahaData.map((oos, index) => (
                            <tr key={oos.blabla_oos} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{oos.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.isbtlpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos["DikKltPas/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos.AOkilitpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(oos["Ao-Io%"])}%</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos["SPasi/90"])}</td>
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
                  <h3 className="text-xl font-semibold mb-6">Fiziksel Performans</h3>
                  <div>
                    <h4 className="text-lg font-medium mb-4">Fiziksel Aktivite</h4>
                    <div className="h-96">
                      <Bar
                        data={{
                          labels: seciliOfansifOrtaSahaData.map(oos => oos.oyuncu_isim),
                          datasets: [
                            {
                              label: 'Sprint/90',
                              data: seciliOfansifOrtaSahaData.map(oos => {
                                // Sprint/90 değerlendirme aralığı: 10-35 (Ofansif Orta Saha için tipik aralık)
                                const sprintMin = 0;
                                const sprintMax = 13;
                                const normalizedSprint = Math.min(100, Math.max(0, ((oos["Sprint/90"] - sprintMin) / (sprintMax - sprintMin)) * 100));
                                return normalizedSprint;
                              }),
                              backgroundColor: 'rgba(255, 99, 132, 0.8)',
                            },
                            {
                              label: 'Mesafe/90 (km)',
                              data: seciliOfansifOrtaSahaData.map(oos => {
                                // Mesafe/90 değerlendirme aralığı: 9-13 km (Ofansif Orta Saha için tipik aralık)
                                const mesafeMin = 9.5;
                                const mesafeMax = 13.5;
                                const normalizedMesafe = Math.min(100, Math.max(0, ((oos["Mesf/90"] - mesafeMin) / (mesafeMax - mesafeMin)) * 100));
                                return normalizedMesafe;
                              }),
                              backgroundColor: 'rgba(54, 162, 235, 0.8)',
                            },
                            {
                              label: 'Hava Topu Kazanma %',
                              data: seciliOfansifOrtaSahaData.map(oos => {
                                // Hava Topu Kazanma % değerlendirme aralığı: 0-70% (Ofansif Orta Saha için tipik aralık)
                                const havaTopuMin = 0;
                                const havaTopuMax = 70;
                                const normalizedHavaTopu = Math.min(100, Math.max(0, ((oos["Hv%"] - havaTopuMin) / (havaTopuMax - havaTopuMin)) * 100));
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
                                  const oos = seciliOfansifOrtaSahaData[playerIndex];
                                  
                                  if (datasetLabel === 'Sprint/90') {
                                    return `${datasetLabel}: ${safeToFixed(oos["Sprint/90"])}`;
                                  } else if (datasetLabel === 'Mesafe/90 (km)') {
                                    return `Mesafe/90: ${safeToFixed(oos["Mesf/90"])} km`;
                                  } else if (datasetLabel === 'Hava Topu Kazanma %') {
                                    return `${datasetLabel}: ${safeToInt(oos["Hv%"])}%`;
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
                        <li><strong>Sprint/90:</strong> 0-13 aralığına göre normalize edilmiştir</li>
                        <li><strong>Mesafe/90:</strong> 9.5-13.5 km aralığına göre normalize edilmiştir</li>
                        <li><strong>Hava Topu Kazanma %:</strong> 0-70% aralığına göre normalize edilmiştir</li>
                      </ul>
                      <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                    </div>
                  </div>
                  
                  {/* Detaylı fiziksel tablo */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Fiziksel İstatistikler</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">Oyun Süresi</th>
                            <th className="text-center py-3 px-2">Sprint/90</th>
                            <th className="text-center py-3 px-2">Mesafe/90</th>
                            <th className="text-center py-3 px-2">Hava Topu %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliOfansifOrtaSahaData.map((oos, index) => (
                            <tr key={oos.blabla_oos} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{oos.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(oos.oyuncu_sure)} dk</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos["Sprint/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(oos["Mesf/90"])} km</td>
                              <td className="py-3 px-2 text-center">{safeToInt(oos["Hv%"])}%</td>
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
                            text: 'Çok Boyutlu Ofansif Orta Saha Karşılaştırması'
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
                                  { name: 'Gölcülük Etkinlik', key: 'golculukEtknlk' },
                                  { name: 'Yaratıcılık Etkinlik', key: 'yrtclkEtknlk' },
                                  { name: 'Pas %', key: 'Pas%' },
                                  { name: 'Asist Beklentisi/Maç', key: 'astbklntMB' },
                                  { name: 'Başarılı Dribling/Maç', key: 'bsrldrplMB' },
                                  { name: 'İsabetli Şut/Maç', key: 'isbtlsutMB' }
                                ];
                                const metric = metrics[dataIndex];
                                
                                // İlgili ofansif orta saha verilerini bul
                                const oosLabel = context.dataset.label;
                                const oos = seciliOfansifOrtaSahaData.find(d => d.oyuncu_isim === oosLabel);
                                
                                if (oos) {
                                  const originalValue = oos[metric.key as keyof CombinedOfansifOrtaSahaData] as number;
                                  
                                  // Yüzde değerleri için
                                  if (metric.key === 'Pas%') {
                                    return `${metric.name}: %${Number(originalValue).toFixed(1)}`;
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
                      <li><strong>Gölcülük Etkinlik:</strong> 0-0.02 aralığında normalize edilmiştir</li>
                      <li><strong>Yaratıcılık Etkinlik:</strong> 0-0.015 aralığında normalize edilmiştir</li>
                      <li><strong>Pas %:</strong> 70-95% aralığında normalize edilmiştir</li>
                      <li><strong>Asist Beklentisi/Maç:</strong> 0-0.3 aralığında normalize edilmiştir</li>
                      <li><strong>Başarılı Dribling/Maç:</strong> 0.2-1.0 aralığında normalize edilmiştir</li>
                      <li><strong>İsabetli Şut/Maç:</strong> 0.5-2.5 aralığında normalize edilmiştir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {seciliOfansifOrtaSahaData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 text-lg">Karşılaştırmak için en az bir ofansif orta saha seçin</p>
              <p className="text-gray-400 text-sm mt-2">Maksimum 6 ofansif orta saha karşılaştırabilirsiniz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 