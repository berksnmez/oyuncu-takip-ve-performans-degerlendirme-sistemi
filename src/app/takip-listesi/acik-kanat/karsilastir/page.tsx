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

// Açık Kanat veri tipleri
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

interface AcikKanatIstatistik {
  blabla_acknt: string;
  oyuncu_isim: string;
  oyuncu_id: number;
  oyuncu_mevkii: string;
  oyuncu_sure: number;
  oyuncu_yan_mevkii: string;
  oyuncu_yas: number;
  takim_adi: string;
  takim_id: number;
  astbklntMB: number;
  astbklntMB_katsayi: number;
  bsrldrplMB: number;
  bsrldrplMB_katsayi: number;
  genel_sira: number;
  golbkltnsMB: number;
  golculukEtknlk: number;
  golculukEtknlk_katsayi: number;
  golMB: number;
  golMB_katsayi: number;
  isbtlpasMB: number;
  isbtlsut_yzd: number;
  isbtlsut_yzd_katsayi: number;
  kalite_sira_katsayi: number;
  performans_skoru: number;
  performans_skor_sirasi: number;
  pnltszxgMB: number;
  pnltszxgMB_katsayi: number;
  sprintMB: number;
  sprintMB_katsayi: number;
  stdustuxg: number;
  stdustuxg_katsayi: number;
  surdurabilirlik_sira: number;
  sutbsnagolbkltns: number;
  sutdgrlndrme_yzd: number;
  sutdgrlndrme_yzd_katsayi: number;
  toplamsut: number;
  yrtclkEtknlk: number;
  yrtclkEtknlk_katsayi: number;
  yrtglfrstMB: number;
  yrtglfrstMB_katsayi: number;
}

interface CombinedAcikKanatData extends ForvetlerGrafik, AcikKanatIstatistik {
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

export default function AcikKanatKarsilastir() {
  const { getItemsByCategory } = useTakipListesi();
  const [acikKanatlar, setAcikKanatlar] = useState<CombinedAcikKanatData[]>([]);
  const [seciliAcikKanatlar, setSeciliAcikKanatlar] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genel' | 'golculuk' | 'yaraticilik' | 'fiziksel' | 'radar'>('genel');
  const [sortBy, setSortBy] = useState<string>('performans_skoru');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Açık Kanat verilerini yükle
  useEffect(() => {
    const loadAcikKanatlar = async () => {
      try {
        setLoading(true);
        
        // Takip listesinden Açık Kanat blabla_acknt değerlerini al
        const takipEdilenAcikKanatlar = getItemsByCategory('acik-kanat');
        console.log("Takip edilen Açık Kanatlar:", takipEdilenAcikKanatlar);
        const blablaAckntList = takipEdilenAcikKanatlar.map(acknt => String(acknt.blabla_acknt).trim());
        console.log("Blabla_acknt listesi:", blablaAckntList);
        
        if (blablaAckntList.length === 0) {
          setAcikKanatlar([]);
          return;
        }

        // Grafik verilerini al
        const grafikResponse = await fetch('/api/forvetler-grafik');
        if (!grafikResponse.ok) throw new Error('Grafik verileri alınamadı');
        const grafikResult = await grafikResponse.json();
        console.log("Grafik result:", grafikResult);

        // İstatistik verilerini al
        const istatistikResponse = await fetch('/api/acikkanat-istatistik');
        if (!istatistikResponse.ok) throw new Error('İstatistik verileri alınamadı');
        const istatistikResult = await istatistikResponse.json();
        console.log("İstatistik result:", istatistikResult);

        // Verileri birleştir
        const combinedData: CombinedAcikKanatData[] = [];
        
        blablaAckntList.forEach(blablaAcknt => {
          console.log("Aranan blabla_acknt:", blablaAcknt);
          
          // İstatistik verisini bul
          const istatistikData = istatistikResult.data?.find((i: any) => {
            const istatistikBlabla = String(i.blabla_acknt || '').trim();
            console.log("İstatistik blabla_acknt:", istatistikBlabla, "Aranan:", blablaAcknt);
            return istatistikBlabla === blablaAcknt;
          });

          if (!istatistikData) {
            console.log("İstatistik verisi bulunamadı:", blablaAcknt);
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
              blabla_acknt: blablaAcknt, // Ensure consistent blabla_acknt value
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
              astbklntMB: Number(istatistikData.astbklntMB) || 0,
              astbklntMB_katsayi: Number(istatistikData.astbklntMB_katsayi) || 0,
              bsrldrplMB: Number(istatistikData.bsrldrplMB) || 0,
              bsrldrplMB_katsayi: Number(istatistikData.bsrldrplMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              golbkltnsMB: Number(istatistikData.golbkltnsMB) || 0,
              golculukEtknlk: Number(istatistikData.golculukEtknlk) || 0,
              golculukEtknlk_katsayi: Number(istatistikData.golculukEtknlk_katsayi) || 0,
              golMB: Number(istatistikData.golMB) || 0,
              golMB_katsayi: Number(istatistikData.golMB_katsayi) || 0,
              isbtlpasMB: Number(istatistikData.isbtlpasMB) || 0,
              isbtlsut_yzd: Number(istatistikData.isbtlsut_yzd) || 0,
              isbtlsut_yzd_katsayi: Number(istatistikData.isbtlsut_yzd_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              pnltszxgMB: Number(istatistikData.pnltszxgMB) || 0,
              pnltszxgMB_katsayi: Number(istatistikData.pnltszxgMB_katsayi) || 0,
              sprintMB: Number(istatistikData.sprintMB) || 0,
              sprintMB_katsayi: Number(istatistikData.sprintMB_katsayi) || 0,
              stdustuxg: Number(istatistikData.stdustuxg) || 0,
              stdustuxg_katsayi: Number(istatistikData.stdustuxg_katsayi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutbsnagolbkltns: Number(istatistikData.sutbsnagolbkltns) || 0,
              sutdgrlndrme_yzd: Number(istatistikData.sutdgrlndrme_yzd) || 0,
              sutdgrlndrme_yzd_katsayi: Number(istatistikData.sutdgrlndrme_yzd_katsayi) || 0,
              toplamsut: Number(istatistikData.toplamsut) || 0,
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
              blabla_acknt: blablaAcknt,
              bnzrsz_fv: '',
              // Default graphic values
              "Ao-Io%": 0,
              "Drp/90": Number(istatistikData.bsrldrplMB) || 0,
              "Gol/90": Number(istatistikData.golMB) || 0,
              "HtmG/90": 0,
              "Hv%": 0,
              "Mesf/90": 0,
              "OrtGrsm/90": 0,
              "Pas%": Number(istatistikData.isbtlsut_yzd) || 0,
              "PH-xG/90": Number(istatistikData.pnltszxgMB) || 0,
              "PsG/90": 0,
              "SHd/90": 0,
              "SPasi/90": Number(istatistikData.isbtlpasMB) || 0,
              "Sprint/90": Number(istatistikData.sprintMB) || 0,
              "TopKyb/90": 0,
              "xA/90": Number(istatistikData.astbklntMB) || 0,
              "xG/Sut": Number(istatistikData.stdustuxg) || 0,
              // Convert statistical data to numbers
              astbklntMB: Number(istatistikData.astbklntMB) || 0,
              astbklntMB_katsayi: Number(istatistikData.astbklntMB_katsayi) || 0,
              bsrldrplMB: Number(istatistikData.bsrldrplMB) || 0,
              bsrldrplMB_katsayi: Number(istatistikData.bsrldrplMB_katsayi) || 0,
              genel_sira: Number(istatistikData.genel_sira) || 0,
              golbkltnsMB: Number(istatistikData.golbkltnsMB) || 0,
              golculukEtknlk: Number(istatistikData.golculukEtknlk) || 0,
              golculukEtknlk_katsayi: Number(istatistikData.golculukEtknlk_katsayi) || 0,
              golMB: Number(istatistikData.golMB) || 0,
              golMB_katsayi: Number(istatistikData.golMB_katsayi) || 0,
              isbtlpasMB: Number(istatistikData.isbtlpasMB) || 0,
              isbtlsut_yzd: Number(istatistikData.isbtlsut_yzd) || 0,
              isbtlsut_yzd_katsayi: Number(istatistikData.isbtlsut_yzd_katsayi) || 0,
              kalite_sira_katsayi: Number(istatistikData.kalite_sira_katsayi) || 0,
              performans_skoru: Number(istatistikData.performans_skoru) || 0,
              performans_skor_sirasi: Number(istatistikData.performans_skor_sirasi) || 0,
              pnltszxgMB: Number(istatistikData.pnltszxgMB) || 0,
              pnltszxgMB_katsayi: Number(istatistikData.pnltszxgMB_katsayi) || 0,
              sprintMB: Number(istatistikData.sprintMB) || 0,
              sprintMB_katsayi: Number(istatistikData.sprintMB_katsayi) || 0,
              stdustuxg: Number(istatistikData.stdustuxg) || 0,
              stdustuxg_katsayi: Number(istatistikData.stdustuxg_katsayi) || 0,
              surdurabilirlik_sira: Number(istatistikData.surdurabilirlik_sira) || 0,
              sutbsnagolbkltns: Number(istatistikData.sutbsnagolbkltns) || 0,
              sutdgrlndrme_yzd: Number(istatistikData.sutdgrlndrme_yzd) || 0,
              sutdgrlndrme_yzd_katsayi: Number(istatistikData.sutdgrlndrme_yzd_katsayi) || 0,
              toplamsut: Number(istatistikData.toplamsut) || 0,
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
        setAcikKanatlar(combinedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Açık Kanat verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAcikKanatlar();
  }, [getItemsByCategory]);

  // Açık Kanat seçimi
  const toggleAcikKanatSelection = useCallback((blablaAcknt: string) => {
    console.log("Toggle Açık Kanat selection:", blablaAcknt);
    console.log("Mevcut seçili Açık Kanatlar:", seciliAcikKanatlar);
    
    setSeciliAcikKanatlar(prev => {
      if (prev.includes(blablaAcknt)) {
        console.log("Açık Kanat zaten seçili, çıkarılıyor");
        return prev.filter(id => id !== blablaAcknt);
      } else if (prev.length < 6) { // Maksimum 6 Açık Kanat karşılaştırılabilir
        console.log("Açık Kanat ekleniyor");
        return [...prev, blablaAcknt];
      } else {
        console.log("Maksimum Açık Kanat sayısına ulaşıldı");
        return prev;
      }
    });
  }, [seciliAcikKanatlar]);

  // Sıralama
  const sortedAcikKanatlar = useMemo(() => {
    return [...acikKanatlar].sort((a, b) => {
      const aVal = a[sortBy as keyof CombinedAcikKanatData] as number;
      const bVal = b[sortBy as keyof CombinedAcikKanatData] as number;
      
      if (sortOrder === 'asc') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [acikKanatlar, sortBy, sortOrder]);

  // Seçili Açık Kanatlar verisi
  const seciliAcikKanatData = useMemo(() => {
    return acikKanatlar.filter(acknt => seciliAcikKanatlar.includes(acknt.blabla_acknt));
  }, [acikKanatlar, seciliAcikKanatlar]);

  // Golcülük vs Yaratıcılık scatter chart data
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
          label: 'Golcülük vs Yaratıcılık',
          data: seciliAcikKanatData.map((acknt, index) => ({
            x: acknt.golculukEtknlk,
            y: acknt.yrtclkEtknlk,
            label: acknt.oyuncu_isim,
            performans: acknt.performans_skoru
          })),
          backgroundColor: seciliAcikKanatData.map((_, index) => colors[index % colors.length]),
          pointRadius: 8,
          pointHoverRadius: 10,
        }
      ]
    };
  }, [seciliAcikKanatData]);

  // Radar chart data
  const radarChartData = useMemo(() => {
    if (seciliAcikKanatData.length === 0) return { labels: [], datasets: [] };

    // Metrik etiketleri ve değerlendirme aralıkları
    const metrics = [
      { name: 'Golcülük Etkinlik', key: 'golculukEtknlk', min: 0.05, max: 0.3 },
      { name: 'Yaratıcılık Etkinlik', key: 'yrtclkEtknlk', min: 0.005, max: 0.031 },
      { name: 'Asist Beklentisi/Maç', key: 'astbklntMB', min: 0, max: 0.4 },
      { name: 'Başarılı Dribling/Maç', key: 'bsrldrplMB', min: 0.4, max: 3 },
      { name: 'Sprint/Maç', key: 'sprintMB', min: 2, max: 12 },
      { name: 'Gol/Maç', key: 'golMB', min: 0, max: 1 }
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
      datasets: seciliAcikKanatData.map((acknt, index) => {
        // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
        const normalizedData = metrics.map(metric => {
          const value = acknt[metric.key as keyof CombinedAcikKanatData] as number || 0;
          
          // Değeri min-max aralığına göre 0-100 arasına normalize et
          return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
        });

        return {
          label: acknt.oyuncu_isim,
          data: normalizedData,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 2,
          pointRadius: 4,
        };
      })
    };
  }, [seciliAcikKanatData]);

  // Performance comparison bar chart
  const performanceBarData = useMemo(() => {
    if (seciliAcikKanatData.length === 0) return { labels: [], datasets: [] };

    return {
      labels: seciliAcikKanatData.map(acknt => acknt.oyuncu_isim),
      datasets: [
        {
          label: 'Performans Skoru',
          data: seciliAcikKanatData.map(acknt => acknt.performans_skoru),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Golcülük Etkinlik',
          data: seciliAcikKanatData.map(acknt => acknt.golculukEtknlk),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'Yaratıcılık Etkinlik',
          data: seciliAcikKanatData.map(acknt => acknt.yrtclkEtknlk),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    };
  }, [seciliAcikKanatData]);

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
          <Link href="/takip-listesi/acik-kanat" className="text-blue-600 hover:underline">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Açık Kanat Karşılaştırması</h1>
      
      {/* Pozisyon Navbar */}
      <TakipListesiNavbar seciliPozisyon="Açık Kanat" />
      
            
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'genel', label: 'Genel Bakış' },
            { key: 'golculuk', label: 'Golcülük & Şut' },
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

      {acikKanatlar.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz takip ettiğiniz açık kanat bulunmuyor.</p>
          <Link 
            href="/oyuncu-arama/acik-kanat" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Açık Kanat Ara
          </Link>
        </div>
      ) : (
        <>
          {/* Açık Kanat Seçimi */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">
                Karşılaştırılacak Açık Kanatları Seçin ({seciliAcikKanatlar.length}/6)
              </h3>
              <div className="flex items-center space-x-4">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="performans_skoru">Performans Skoru</option>
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="golculukEtknlk">Golcülük Etkinlik</option>
                  <option value="yrtclkEtknlk">Yaratıcılık Etkinlik</option>
                  <option value="golMB">Gol/Maç</option>
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
              {sortedAcikKanatlar.map((acknt) => (
                <div
                  key={acknt.blabla_acknt}
                  onClick={() => {
                    console.log("Card clicked for Açık Kanat:", acknt.oyuncu_isim, "blabla_acknt:", acknt.blabla_acknt);
                    toggleAcikKanatSelection(acknt.blabla_acknt);
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    seciliAcikKanatlar.includes(acknt.blabla_acknt)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${seciliAcikKanatlar.length >= 6 && !seciliAcikKanatlar.includes(acknt.blabla_acknt) ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{acknt.oyuncu_isim}</h4>
                    <input
                      type="checkbox"
                      checked={seciliAcikKanatlar.includes(acknt.blabla_acknt)}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log("Checkbox clicked:", acknt.blabla_acknt);
                        toggleAcikKanatSelection(acknt.blabla_acknt);
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Performans: {safeToFixed(acknt.performans_skoru)}</div>
                    <div>Genel Sıra: {safeToInt(acknt.genel_sira)}</div>
                    <div>Golcülük: {safeToFixed(acknt.golculukEtknlk)}</div>
                    <div>Yaratıcılık: {safeToFixed(acknt.yrtclkEtknlk)}</div>
                    <div className="text-xs text-gray-400">Takım: {acknt.takim_adi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {seciliAcikKanatData.length > 0 && (
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
                          <th className="text-center py-3 px-2">Golcülük</th>
                          <th className="text-center py-3 px-2">Yaratıcılık</th>
                          <th className="text-center py-3 px-2">Gol/Maç</th>
                          <th className="text-center py-3 px-2">Asist Beklentisi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seciliAcikKanatData.map((acknt, index) => (
                          <tr key={acknt.blabla_acknt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-3 px-2 font-medium">{acknt.oyuncu_isim}</td>
                            <td className="py-3 px-2 text-center">{acknt.takim_adi}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(acknt.oyuncu_yas)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(acknt.performans_skoru)}</td>
                            <td className="py-3 px-2 text-center">{safeToInt(acknt.genel_sira)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(acknt.golculukEtknlk)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(acknt.yrtclkEtknlk)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(acknt.golMB)}</td>
                            <td className="py-3 px-2 text-center">{safeToFixed(acknt.astbklntMB)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'golculuk' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Golcülük & Şut Performansı</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-4">Golcülük vs Yaratıcılık Dengesi</h4>
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
                                      `Golcülük: ${safeToFixed(point.x)}`,
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
                                  text: 'Golcülük Etkinlik'
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
                      <h4 className="text-lg font-medium mb-4">Şut Performansı</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliAcikKanatData.map(acknt => acknt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Toplam Şut',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Toplam Şut değerlendirme aralığı: 15-120 (Açık Kanat için tipik aralık)
                                  const value = acknt.toplamsut;
                                  const min = 0;
                                  const max = 40;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'İsabetli Şut %',
                                data: seciliAcikKanatData.map(acknt => {
                                  // İsabetli Şut % değerlendirme aralığı: 20-60% (Açık Kanat için tipik aralık)
                                  const value = acknt.isbtlsut_yzd;
                                  const min = 10;
                                  const max = 75;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'xG/Şut',
                                data: seciliAcikKanatData.map(acknt => {
                                  // xG/Şut değerlendirme aralığı: 0.05-0.25 (Açık Kanat için tipik aralık)
                                  const value = acknt["xG/Sut"];
                                  const min = 0.00;
                                  const max = 0.32;
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
                                text: 'Şut Analizi Karşılaştırması'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const acknt = seciliAcikKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'Toplam Şut') {
                                      return `Toplam Şut: ${safeToInt(acknt.toplamsut)}`;
                                    } else if (datasetLabel === 'İsabetli Şut %') {
                                      return `İsabetli Şut %: ${safeToInt(acknt.isbtlsut_yzd)}%`;
                                    } else if (datasetLabel === 'xG/Şut') {
                                      return `xG/Şut: ${safeToFixed(acknt["xG/Sut"], 3)}`;
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
                            <th className="text-center py-3 px-2">Gol/Maç</th>
                            <th className="text-center py-3 px-2">Toplam Şut</th>
                            <th className="text-center py-3 px-2">İsabetli Şut %</th>
                            <th className="text-center py-3 px-2">Penaltısız xG/Maç</th>
                            <th className="text-center py-3 px-2">Şut Başına Gol Beklentisi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliAcikKanatData.map((acknt, index) => (
                            <tr key={acknt.blabla_acknt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{acknt.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.golculukEtknlk)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.golMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(acknt.toplamsut)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(acknt.isbtlsut_yzd)}%</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.pnltszxgMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.sutbsnagolbkltns)}</td>
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
                      <h4 className="text-lg font-medium mb-4">Yaratıcılık Analizi</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliAcikKanatData.map(acknt => acknt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Yaratıcılık Etkinlik',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Yaratıcılık Etkinlik değerlendirme aralığı: 0.005-0.050 (Açık Kanat için tipik aralık)
                                  const value = acknt.yrtclkEtknlk;
                                  const min = 0.000;
                                  const max = 0.050;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Yaratılan Gol Fırsatı/Maç',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Yaratılan Gol Fırsatı/Maç değerlendirme aralığı: 0.5-3.0 (Açık Kanat için tipik aralık)
                                  const value = acknt.yrtglfrstMB;
                                  const min = 0.0;
                                  const max = 1.3;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'xA/90',
                                data: seciliAcikKanatData.map(acknt => {
                                  // xA/90 değerlendirme aralığı: 0.05-0.40 (Açık Kanat için tipik aralık)
                                  const value = acknt["xA/90"];
                                  const min = 0.00;
                                  const max = 0.50;
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
                                text: 'Yaratıcılık Karşılaştırması'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const acknt = seciliAcikKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'Yaratıcılık Etkinlik') {
                                      return `Yaratıcılık Etkinlik: ${safeToFixed(acknt.yrtclkEtknlk, 3)}`;
                                    } else if (datasetLabel === 'Yaratılan Gol Fırsatı/Maç') {
                                      return `Yaratılan Gol Fırsatı/Maç: ${safeToFixed(acknt.yrtglfrstMB)}`;
                                    } else if (datasetLabel === 'xA/90') {
                                      return `xA/90: ${safeToFixed(acknt["xA/90"], 3)}`;
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
                      <h4 className="text-lg font-medium mb-4">Pas & Asist Performansı</h4>
                      <div className="h-96">
                        <Bar
                          data={{
                            labels: seciliAcikKanatData.map(acknt => acknt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Asist Beklentisi/Maç',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Asist Beklentisi/Maç değerlendirme aralığı: 0.05-0.4 (Açık Kanat için tipik aralık)
                                  const value = acknt.astbklntMB;
                                  const min = 0.00;
                                  const max = 0.55;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'İsabetli Pas/Maç',
                                data: seciliAcikKanatData.map(acknt => {
                                  // İsabetli Pas/Maç değerlendirme aralığı: 20-50 (Açık Kanat için tipik aralık)
                                  const value = acknt.isbtlpasMB;
                                  const min = 8;
                                  const max = 50;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Başarılı Dribling/Maç',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Başarılı Dribling/Maç değerlendirme aralığı: 0.5-3.0 (Açık Kanat için tipik aralık)
                                  const value = acknt.bsrldrplMB;
                                  const min = 0.0;
                                  const max = 4.0;
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
                                text: 'Pas & Asist Analizi'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const acknt = seciliAcikKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'Asist Beklentisi/Maç') {
                                      return `Asist Beklentisi/Maç: ${safeToFixed(acknt.astbklntMB, 3)}`;
                                    } else if (datasetLabel === 'İsabetli Pas/Maç') {
                                      return `İsabetli Pas/Maç: ${safeToFixed(acknt.isbtlpasMB)}`;
                                    } else if (datasetLabel === 'Başarılı Dribling/Maç') {
                                      return `Başarılı Dribling/Maç: ${safeToFixed(acknt.bsrldrplMB)}`;
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
                  
                  {/* Yaratıcılık detay tablosu */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Detaylı Yaratıcılık İstatistikleri</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Oyuncu</th>
                            <th className="text-center py-3 px-2">Yaratıcılık Etkinlik</th>
                            <th className="text-center py-3 px-2">xA/90</th>
                            <th className="text-center py-3 px-2">Asist Beklentisi/Maç</th>
                            <th className="text-center py-3 px-2">Yaratılan Gol Fırsatı/Maç</th>
                            <th className="text-center py-3 px-2">İsabetli Pas/Maç</th>
                            <th className="text-center py-3 px-2">Başarılı Dribling/Maç</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliAcikKanatData.map((acknt, index) => (
                            <tr key={acknt.blabla_acknt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{acknt.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.yrtclkEtknlk)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt["xA/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.astbklntMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.yrtglfrstMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.isbtlpasMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.bsrldrplMB)}</td>
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
                            labels: seciliAcikKanatData.map(acknt => acknt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Sprint/90',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Sprint/90 değerlendirme aralığı: 2-15 (Açık Kanat için tipik aralık)
                                  const value = acknt["Sprint/90"];
                                  const min = 0;
                                  const max = 13;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                              },
                              {
                                label: 'Hava Topu %',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Hava Topu % değerlendirme aralığı: 20-80% (Açık Kanat için tipik aralık)
                                  const value = acknt["Hv%"];
                                  const min = 0;
                                  const max = 70;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                              },
                              {
                                label: 'Mesafe/90',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Mesafe/90 değerlendirme aralığı: 8-12 km (Açık Kanat için tipik aralık)
                                  const value = acknt["Mesf/90"];
                                  const min = 8;
                                  const max = 13;
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
                                  label: function(context: any) {
                                    const datasetLabel = context.dataset.label;
                                    const playerIndex = context.dataIndex;
                                    const acknt = seciliAcikKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'Sprint/90') {
                                      return `Sprint/90: ${safeToFixed(acknt["Sprint/90"])}`;
                                    } else if (datasetLabel === 'Hava Topu %') {
                                      return `Hava Topu %: ${safeToFixed(acknt["Hv%"])}`;
                                    } else if (datasetLabel === 'Mesafe/90') {
                                      return `Mesafe/90: ${safeToFixed(acknt["Mesf/90"])} km`;
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
                            labels: seciliAcikKanatData.map(acknt => acknt.oyuncu_isim),
                            datasets: [
                              {
                                label: 'Başarılı Dribling/Maç',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Başarılı Dribling/Maç değerlendirme aralığı: 0.4-3.5 (Açık Kanat için tipik aralık)
                                  const value = acknt.bsrldrplMB;
                                  const min = 0.0;
                                  const max = 5.0;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                              },
                              {
                                label: 'Pas %',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Pas % değerlendirme aralığı: 60-90% (Açık Kanat için tipik aralık)
                                  const value = acknt["Pas%"];
                                  const min = 70;
                                  const max = 95;
                                  return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
                                }),
                                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                              },
                              {
                                label: 'Top Kaybı/90',
                                data: seciliAcikKanatData.map(acknt => {
                                  // Top Kaybı/90 değerlendirme aralığı: 5-25 (Açık Kanat için tipik aralık)
                                  // Düşük top kaybı iyi olduğu için ters çevrilmiş
                                  const value = acknt["TopKyb/90"];
                                  const min = 2;
                                  const max = 14;
                                  return Math.min(100, Math.max(0, 100 - ((value - min) / (max - min) * 100)));
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
                                    const acknt = seciliAcikKanatData[playerIndex];
                                    
                                    if (datasetLabel === 'Başarılı Dribling/Maç') {
                                      return `Başarılı Dribling/Maç: ${safeToFixed(acknt.bsrldrplMB)}`;
                                    } else if (datasetLabel === 'Pas %') {
                                      return `Pas %: ${safeToFixed(acknt["Pas%"])}`;
                                    } else if (datasetLabel === 'Top Kaybı/90') {
                                      return `Top Kaybı/90: ${safeToFixed(acknt["TopKyb/90"])}`;
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
                            <th className="text-center py-3 px-2">Sprint/Maç</th>
                            <th className="text-center py-3 px-2">Mesafe/90</th>
                            <th className="text-center py-3 px-2">Dribling/Maç</th>
                            <th className="text-center py-3 px-2">Şut Doğruluğu %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seciliAcikKanatData.map((acknt, index) => (
                            <tr key={acknt.blabla_acknt} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="py-3 px-2 font-medium">{acknt.oyuncu_isim}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(acknt.oyuncu_sure)} dk</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt["Sprint/90"])}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.sprintMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt["Mesf/90"])} km</td>
                              <td className="py-3 px-2 text-center">{safeToFixed(acknt.bsrldrplMB)}</td>
                              <td className="py-3 px-2 text-center">{safeToInt(acknt.sutdgrlndrme_yzd)}%</td>
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
                            text: 'Çok Boyutlu Açık Kanat Karşılaştırması'
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
                                  { name: 'Golcülük Etkinlik', key: 'golculukEtknlk' },
                                  { name: 'Yaratıcılık Etkinlik', key: 'yrtclkEtknlk' },
                                  { name: 'Asist Beklentisi/Maç', key: 'astbklntMB' },
                                  { name: 'Başarılı Dribling/Maç', key: 'bsrldrplMB' },
                                  { name: 'Sprint/Maç', key: 'sprintMB' },
                                  { name: 'Gol/Maç', key: 'golMB' }
                                ];
                                const metric = metrics[dataIndex];
                                
                                // İlgili açık kanat verilerini bul
                                const acikKanatLabel = context.dataset.label;
                                const acikKanat = seciliAcikKanatData.find(d => d.oyuncu_isim === acikKanatLabel);
                                
                                if (acikKanat) {
                                  const originalValue = acikKanat[metric.key as keyof CombinedAcikKanatData] as number;
                                  
                                  // Tüm metrikler için aynı format
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
                      <li><strong>Golcülük Etkinlik:</strong> 0.05-0.03 aralığında normalize edilmiştir</li>
                      <li><strong>Yaratıcılık Etkinlik:</strong> 0.005-0.031 aralığında normalize edilmiştir</li>
                      <li><strong>Asist Beklentisi/Maç:</strong> 0-0.4 aralığında normalize edilmiştir</li>
                      <li><strong>Başarılı Dribling/Maç:</strong> 0.4-3 aralığında normalize edilmiştir</li>
                      <li><strong>Sprint/Maç:</strong> 2-12 aralığında normalize edilmiştir</li>
                      <li><strong>Gol/Maç:</strong> 0-1 aralığında normalize edilmiştir</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500">Tooltip'te gerçek değerler gösterilmektedir.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {seciliAcikKanatData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 text-lg">Karşılaştırmak için en az bir açık kanat seçin</p>
              <p className="text-gray-400 text-sm mt-2">Maksimum 6 açık kanat karşılaştırabilirsiniz</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}