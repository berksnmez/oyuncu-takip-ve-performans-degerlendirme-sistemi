'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';

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

// Kaleci grafik veri tipi
type KaleciData = {
  bnzrsz_gk: number;
  oyuncu_isim: string;
  oyuncu_id?: number; // Oyuncu ID'si eklendi
  kurtarisMb: number;
  kurtarisYzd: number;
  englxG: number;
  pasdnmeMb: number;
  pasYzd: number;
};

// Defans grafik veri tipi
type DefansData = {
  bnzrsz_def: number;
  oyuncu_isim: string;
  oyuncu_id?: number; // Oyuncu ID'si eklendi
  "Eng/90": number;
  "Uzk/90": number;
  "Mesf/90": number;
  "Sprint/90": number;
  "SPasi/90": number;
  "xA/90": number;
  "OrtGrsm/90": number;
  "Ao-Io%": number;
  "Drp/90": number;
  "TopKyb/90": number;
  "PsG/90": number;
  "Pas%": number;
  "KazanTop/90": number;
  "HtmG/90": number;
  "Hv%": number;
};

// Orta saha grafik veri tipi
type OrtaSahaData = {
  bnzrsz_os: number;
  oyuncu_isim: string;
  oyuncu_id?: number; // Oyuncu ID'si eklendi
  "Eng/90": number;
  "Uzk/90": number;
  "Mesf/90": number;
  "Sprint/90": number;
  "SPasi/90": number;
  "xA/90": number;
  "OrtGrsm/90": number;
  "Ao-Io%": number;
  "Gol/90": number;
  "PH-xG/90": number;
  "PsG/90": number;
  "Pas%": number;
  "DikKltPas/90": number;
  "KazanTop/90": number;
  "TopKyb/90": number;
  "HtmG/90": number;
  "Hv%": number;
};

// Forvet grafik veri tipi
type ForvetData = {
  bnzrsz_fv: number;
  oyuncu_isim: string;
  oyuncu_id?: number; // Oyuncu ID'si eklendi
  "Eng/90": number;
  "Uzk/90": number;
  "Mesf/90": number;
  "Sprint/90": number;
  "SPasi/90": number;
  "xA/90": number;
  "OrtGrsm/90": number;
  "Ao-Io%": number;
  "Gol/90": number;
  "PH-xG/90": number;
  "PsG/90": number;
  "Pas%": number;
  "DikKltPas/90": number;
  "KazanTop/90": number;
  "TopKyb/90": number;
  "HtmG/90": number;
  "Hv%": number;
  "SHd/90": number;
  "xG/Sut": number;
  "Drp/90": number; // Eklenen dripling veri alanı
};

// Ortak nokta veri tipi
type PointData = {
  x: number;
  y: number;
  oyuncuIsim: string;
  oyuncu_id?: number; // Oyuncu ID'si eklendi
  type: string;
  [key: string]: any; // Farklı benzersiz ID'ler için esnek yapı (bnzrsz_gk, bnzrsz_def vs.)
};

// Grafik konteyneri bileşeni
function ChartContainer({ 
  title, 
  index, 
  kaleciData,
  defansData,
  ortaSahaData,
  forvetData,
  expandedChart, 
  setExpandedChart 
}: { 
  title: string; 
  index: number; 
  kaleciData: KaleciData[];
  defansData: DefansData[];
  ortaSahaData: OrtaSahaData[];
  forvetData: ForvetData[];
  expandedChart: number | null;
  setExpandedChart: (index: number | null) => void;
}) {
  const chartRef = useRef<any>(null);
  const isExpanded = expandedChart === index;
  
  // Genişletme/daraltma işlemlerini işle
  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedChart(null);
    } else {
      setExpandedChart(index);
    }
  };
  
  // Referans çizgileri plugin'i
  const referenceLinePlugin = useMemo(() => {
    return {
      id: `referenceLines-${index}`,
      afterDatasetsDraw(chart: any) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x || !scales.y) return; // Grafik alanı henüz hazır değilse çık
        
        const { top, bottom, left, right } = chartArea;
        
        if (title === "Kalecilik-Kaleciler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(3.0); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('3.0', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(69); // 70'den 69'a değiştirildi
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('69', xPos, top - 5);
          }
        }
        
        if (title === "Detaylı Kalecilik İstatistikleri-Kaleciler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(-1.5); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('-1.5', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(69); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('69', xPos, top - 5);
          }
        }
        
        if (title === "Pas-Kaleciler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(24); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('24', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(59); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('59', xPos, top - 5);
          }
        }

        if (title === "Savunma-Defanslar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(0.5); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('0.5', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(1.78); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('1.78', xPos, top - 5);
          }
        }
        
        if (title === "Genel Fiziksel İstatistik-Defanslar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(11.0); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('11.0', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(7.70); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('7.70', xPos, top - 5);
          }
        }

        if (title === "Asist-Defanslar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(0.7); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('0.7', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(0.05); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('0.05', xPos, top - 5);
          }
        }

        if (title === "Orta-Defanslar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(3.25); // Kullanıcının istediği değer
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('3.25', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(18); // Kullanıcının istediği değer
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('18', xPos, top - 5);
          }
        }

        if (title === "Hareketlilik-Defanslar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(0.3); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('0.3', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(9.5); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('9.5', xPos, top - 5);
          }
        }

        if (title === "Pas-Defanslar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(47); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('47', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(83); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('83', xPos, top - 5);
          }
        }

        if (title === "Topa Sahip Olma-Defanslar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(12); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('12', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(9.8); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('9.8', xPos, top - 5);
          }
        }
        
        if (title === "Hava Topu-Defanslar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(6.1); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('6.1', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(68); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('68', xPos, top - 5);
          }
        }
        
        if (title === "Savunma-Orta Sahalar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(0.25); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('0.25', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(1.3); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('1.3', xPos, top - 5);
          }
        }

        if (title === "Genel Fiziksel İstatistik-Orta Sahalar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(11.5); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('11.5', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(7); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('7', xPos, top - 5);
          }
        }

        if (title === "Asist-Orta Sahalar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(1.2); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('1.2', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(0.10); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('0.10', xPos, top - 5);
          }
        }

        if (title === "Orta-Orta Sahalar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(2.5); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('2.5', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(20); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('20', xPos, top - 5);
          }
        }

        if (title === "Golcülük-Orta Sahalar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(0.2); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('0.2', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(0.12); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('0.12', xPos, top - 5);
          }
        }

        if (title === "Pas-Orta Sahalar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(46); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('46', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(87); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('87', xPos, top - 5);
          }
        }

        if (title === "Pas Şablonu-Orta Sahalar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(87); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('87%', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(3.5); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('3.5', xPos, top - 5);
          }
        }

        if (title === "Topa Sahip Olma-Orta Sahalar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(5.9); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('5.9', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(8.0); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('8.0', xPos, top - 5);
          }
        }

        if (title === "Hava Topu-Orta Sahalar") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(4.0); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('4.0', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(42); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('42', xPos, top - 5);
          }
        }
        
        if (title === "Genel Fiziksel İstatistik-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(11.25); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('11.25', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(7); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('7', xPos, top - 5);
          }
        }
        
        if (title === "Asist-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(1.22); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('1.22', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(0.15); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('0.15', xPos, top - 5);
          }
        }
        
        if (title === "Orta-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(5.0); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('5.0', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(16); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('16', xPos, top - 5);
          }
        }
        
        if (title === "Atılan Gol-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(0.25); // xG ile aynı seviyede gol atan oyuncular
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('0.25', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(0.15); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('0.15', xPos, top - 5);
          }
        }
        
        if (title === "Golcülük-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(0.35); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('0.35', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(0.25); // Beklenilen gol değeri kadar gol atan oyuncular
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('0.25', xPos, top - 5);
          }
        }
        
        if (title === "Şut-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(0.85); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('0.85', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(0.15); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('0.15', xPos, top - 5);
          }
        }
        
        if (title === "Genel Hücum Beklentisi-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(0.25); // xG ile aynı seviyede gol atan oyuncular
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('0.25', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(0.15); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('0.15', xPos, top - 5);
          }
        }
        
        if (title === "Hareketlilik-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(1.8); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('1.8', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(9.5); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('9.5', xPos, top - 5);
          }
        }
        
        if (title === "Pas-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(28); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('28', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(86.5); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('86.5', xPos, top - 5);
          }
        }
        
        if (title === "Hava Topu-Forvetler") {
          // Yatay çizgi için (ortalama değer)
          const yPos = scales.y.getPixelForValue(7.5); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          
          // Yatay çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(255, 99, 132, 1)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('7.5', right + 5, yPos + 4);
          }
          
          // Dikey çizgi için (ortalama değer)
          const xPos = scales.x.getPixelForValue(28); // Örnek değer - veri ortalamasına göre ayarlanabilir
          
          ctx.beginPath();
          ctx.moveTo(xPos, top);
          ctx.lineTo(xPos, bottom);
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
          ctx.stroke();
          
          // Dikey çizgi etiketi
          if (isExpanded) {
            ctx.fillStyle = 'rgba(54, 162, 235, 1)';
            ctx.textAlign = 'center';
            ctx.fillText('28', xPos, top - 5);
          }
        }
      }
    };
  }, [index, title, isExpanded]);

  // Özel oyuncu görseli plugin'i
  const customImagePlugin = useMemo(() => {
    // Görselleri önceden yükle
    const playerImages = {
      2002100789: new Image(),
      2002100790: new Image(),
      2002100792: new Image(),
      2002100793: new Image(),
      2002100796: new Image(),
      2002100799: new Image(),
      2002100801: new Image(),
      2002100802: new Image(),
      2002100803: new Image(),
      2002100804: new Image(),
      2002121287: new Image(),
      2002153139: new Image(),
      2002153140: new Image(),
      2002153141: new Image(),
      2002153142: new Image(),
      2002153143: new Image(),
      2002153147: new Image(),
      2002153148: new Image(),
      2002153149: new Image(),
      2002153150: new Image(),
      2002153152: new Image()
    };
    
    playerImages[2002100789].src = '/images/2002100789.png';
    playerImages[2002100790].src = '/images/2002100790.png';
    playerImages[2002100792].src = '/images/2002100792.png';
    playerImages[2002100793].src = '/images/2002100793.png';
    playerImages[2002100796].src = '/images/2002100796.png';
    playerImages[2002100799].src = '/images/2002100799.png';
    playerImages[2002100801].src = '/images/2002100801.png';
    playerImages[2002100802].src = '/images/2002100802.png';
    playerImages[2002100803].src = '/images/2002100803.png';
    playerImages[2002100804].src = '/images/2002100804.png';
    playerImages[2002121287].src = '/images/2002121287.png';
    playerImages[2002153139].src = '/images/2002153139.png';
    playerImages[2002153140].src = '/images/2002153140.png';
    playerImages[2002153141].src = '/images/2002153141.png';
    playerImages[2002153142].src = '/images/2002153142.png';
    playerImages[2002153143].src = '/images/2002153143.png';
    playerImages[2002153147].src = '/images/2002153147.png';
    playerImages[2002153148].src = '/images/2002153148.png';
    playerImages[2002153149].src = '/images/2002153149.png';
    playerImages[2002153150].src = '/images/2002153150.png';
    playerImages[2002153152].src = '/images/2002153152.png';
    
    const imageLoadedStatus = {
      2002100789: false,
      2002100790: false,
      2002100792: false,
      2002100793: false,
      2002100796: false,
      2002100799: false,
      2002100801: false,
      2002100802: false,
      2002100803: false,
      2002100804: false,
      2002121287: false,
      2002153139: false,
      2002153140: false,
      2002153141: false,
      2002153142: false,
      2002153143: false,
      2002153147: false,
      2002153148: false,
      2002153149: false,
      2002153150: false,
      2002153152: false
    };
    
    playerImages[2002100789].onload = () => {
      imageLoadedStatus[2002100789] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002100790].onload = () => {
      imageLoadedStatus[2002100790] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002100792].onload = () => {
      imageLoadedStatus[2002100792] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002100793].onload = () => {
      imageLoadedStatus[2002100793] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002100796].onload = () => {
      imageLoadedStatus[2002100796] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002100799].onload = () => {
      imageLoadedStatus[2002100799] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002100801].onload = () => {
      imageLoadedStatus[2002100801] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002100802].onload = () => {
      imageLoadedStatus[2002100802] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002100803].onload = () => {
      imageLoadedStatus[2002100803] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002100804].onload = () => {
      imageLoadedStatus[2002100804] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002121287].onload = () => {
      imageLoadedStatus[2002121287] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153139].onload = () => {
      imageLoadedStatus[2002153139] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153140].onload = () => {
      imageLoadedStatus[2002153140] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153141].onload = () => {
      imageLoadedStatus[2002153141] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153142].onload = () => {
      imageLoadedStatus[2002153142] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153143].onload = () => {
      imageLoadedStatus[2002153143] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153147].onload = () => {
      imageLoadedStatus[2002153147] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153148].onload = () => {
      imageLoadedStatus[2002153148] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153149].onload = () => {
      imageLoadedStatus[2002153149] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153150].onload = () => {
      imageLoadedStatus[2002153150] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    playerImages[2002153152].onload = () => {
      imageLoadedStatus[2002153152] = true;
      // Görsel yüklendiğinde grafiği yeniden çiz
      if (chartRef.current) {
        chartRef.current.update();
      }
    };
    
    return {
      id: `customImages-${index}`,
      afterDatasetsDraw(chart: any) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x || !scales.y) return;
        
        // Her veri setini kontrol et
        chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
          dataset.data.forEach((point: any, pointIndex: number) => {
            // Eğer bu nokta özel oyuncu ID'lerinden birine sahipse, görsel çiz
            if (point.oyuncu_id === 2002100789 || point.oyuncu_id === 2002100790 || point.oyuncu_id === 2002100792 || point.oyuncu_id === 2002100793 || point.oyuncu_id === 2002100796 || point.oyuncu_id === 2002100799 || point.oyuncu_id === 2002100801 || point.oyuncu_id === 2002100802 || point.oyuncu_id === 2002100803 || point.oyuncu_id === 2002100804 || point.oyuncu_id === 2002121287 || point.oyuncu_id === 2002153139 || point.oyuncu_id === 2002153140 || point.oyuncu_id === 2002153141 || point.oyuncu_id === 2002153142 || point.oyuncu_id === 2002153143 || point.oyuncu_id === 2002153147 || point.oyuncu_id === 2002153148 || point.oyuncu_id === 2002153149 || point.oyuncu_id === 2002153150 || point.oyuncu_id === 2002153152) {
              const playerId = point.oyuncu_id as 2002100789 | 2002100790 | 2002100792 | 2002100793 | 2002100796 | 2002100799 | 2002100801 | 2002100802 | 2002100803 | 2002100804 | 2002121287 | 2002153139 | 2002153140 | 2002153141 | 2002153142 | 2002153143 | 2002153147 | 2002153148 | 2002153149 | 2002153150 | 2002153152;
              
              // İlgili görselin yüklenip yüklenmediğini kontrol et
              if (!imageLoadedStatus[playerId]) return;
              
              const x = scales.x.getPixelForValue(point.x);
              const y = scales.y.getPixelForValue(point.y);
              
              // Görsel boyutu (genişletilmiş durumda daha büyük)
              const imageSize = isExpanded ? 24 : 16;
              const radius = imageSize / 2;
              
              ctx.save();
              
              // Dairesel klip oluştur
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, 2 * Math.PI);
              ctx.clip();
              
              // Görseli çiz
              ctx.drawImage(
                playerImages[playerId],
                x - radius,
                y - radius,
                imageSize,
                imageSize
              );
              
              ctx.restore();
            }
          });
        });
      }
    };
  }, [index, isExpanded]);

  // Grafik verilerini hazırla
  const chartData = useMemo(() => {
    // Her grafik için kullanılacak x ve y eksenlerini belirle
    let xKey = 'kurtarisYzd';
    let yKey = 'kurtarisMb';
    
    // "Detaylı Kalecilik İstatistikleri-Kaleciler" grafiği için özel veri kolonu kullan
    if (title === "Detaylı Kalecilik İstatistikleri-Kaleciler") {
      xKey = 'kurtarisYzd';
      yKey = 'englxG';
    }
    
    // "Pas-Kaleciler" grafiği için özel veri kolonu kullan
    if (title === "Pas-Kaleciler") {
      xKey = 'pasYzd';
      yKey = 'pasdnmeMb';
    }

    // "Savunma-Defanslar" grafiği için özel veri kolonu kullan
    if (title === "Savunma-Defanslar") {
      return {
        datasets: [
          {
            label: 'Defans İstatistikleri',
            data: defansData
              .filter(defans => {
                const engValue = Number(defans["Eng/90"]);
                return engValue !== 0 && !isNaN(engValue) && engValue !== null;
              })
              .map(defans => {
                return {
                  x: defans["Uzk/90"],
                  y: defans["Eng/90"],
                  bnzrsz_def: defans.bnzrsz_def,
                  oyuncuIsim: defans.oyuncu_isim,
                  oyuncu_id: defans.oyuncu_id,
                  type: 'defans'
                } as PointData;
              }),
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
          },
        ],
      };
    }
    
    // "Genel Fiziksel İstatistik-Defanslar" grafiği için özel veri kolonu kullan
    if (title === "Genel Fiziksel İstatistik-Defanslar") {
      return {
        datasets: [
          {
            label: 'Fiziksel İstatistikler',
            data: defansData.map(defans => {
              return {
                x: defans["Sprint/90"],
                y: defans["Mesf/90"],
                bnzrsz_def: defans.bnzrsz_def,
                oyuncuIsim: defans.oyuncu_isim,
                oyuncu_id: defans.oyuncu_id,
                type: 'defans'
              } as PointData;
            }),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 159, 64, 1)',
          },
        ],
      };
    }

    // "Asist-Defanslar" grafiği için özel veri kolonu kullan
    if (title === "Asist-Defanslar") {
      return {
        datasets: [
          {
            label: 'Asist İstatistikleri',
            data: defansData
              .filter(defans => {
                const spasiValue = Number(defans["SPasi/90"]);
                const xaValue = Number(defans["xA/90"]);
                return spasiValue !== 0 && !isNaN(spasiValue) && spasiValue !== null &&
                       xaValue !== 0 && !isNaN(xaValue) && xaValue !== null;
              })
              .map(defans => {
                return {
                  x: defans["xA/90"],
                  y: defans["SPasi/90"],
                  bnzrsz_def: defans.bnzrsz_def,
                  oyuncuIsim: defans.oyuncu_isim,
                  oyuncu_id: defans.oyuncu_id,
                  type: 'defans'
                } as PointData;
              }),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      };
    }

    // "Orta-Defanslar" grafiği için özel veri kolonu kullan
    if (title === "Orta-Defanslar") {
      return {
        datasets: [
          {
            label: 'Orta Saha İstatistikleri',
            data: defansData
              .filter(defans => 
                defans["Ao-Io%"] !== 0 && 
                defans["Ao-Io%"] !== 0.0 && 
                defans["Ao-Io%"] !== 0.00 && 
                defans["OrtGrsm/90"] !== 0 && 
                defans["OrtGrsm/90"] !== 0.0 && 
                defans["OrtGrsm/90"] !== 0.00
              )
              .map(defans => {
                return {
                  x: defans["Ao-Io%"],
                  y: defans["OrtGrsm/90"],
                  bnzrsz_def: defans.bnzrsz_def,
                  oyuncuIsim: defans.oyuncu_isim,
                  oyuncu_id: defans.oyuncu_id,
                  type: 'defans'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
          },
        ],
      };
    }

    // "Hareketlilik-Defanslar" grafiği için özel veri kolonu kullan
    if (title === "Hareketlilik-Defanslar") {
      return {
        datasets: [
          {
            label: 'Hareketlilik İstatistikleri',
            data: defansData
              .filter(defans => {
                const drpValue = Number(defans["Drp/90"]);
                const topKybValue = Number(defans["TopKyb/90"]);
                return drpValue !== 0 && !isNaN(drpValue) && drpValue !== null &&
                       topKybValue !== 0 && !isNaN(topKybValue) && topKybValue !== null;
              })
              .map(defans => {
                return {
                  x: defans["TopKyb/90"],
                  y: defans["Drp/90"],
                  bnzrsz_def: defans.bnzrsz_def,
                  oyuncuIsim: defans.oyuncu_isim,
                  oyuncu_id: defans.oyuncu_id,
                  type: 'defans'
                } as PointData;
              }),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 206, 86, 1)',
          },
        ],
      };
    }

    // "Pas-Defanslar" grafiği için özel veri kolonu kullan
    if (title === "Pas-Defanslar") {
      return {
        datasets: [
          {
            label: 'Pas İstatistikleri',
            data: defansData
              .filter(defans => 
                defans["PsG/90"] !== 0 && 
                defans["PsG/90"] !== 0.0 && 
                defans["PsG/90"] !== 0.00 && 
                defans["Pas%"] !== 0 && 
                defans["Pas%"] !== 0.0 && 
                defans["Pas%"] !== 0.00
              )
              .map(defans => {
                return {
                  x: defans["Pas%"],
                  y: defans["PsG/90"],
                  bnzrsz_def: defans.bnzrsz_def,
                  oyuncuIsim: defans.oyuncu_isim,
                  oyuncu_id: defans.oyuncu_id,
                  type: 'defans'
                } as PointData;
              }),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
          },
        ],
      };
    }

    // "Topa Sahip Olma-Defanslar" grafiği için özel veri kolonu kullan
    if (title === "Topa Sahip Olma-Defanslar") {
      return {
        datasets: [
          {
            label: 'Top Kazanma/Kaybetme İstatistikleri',
            data: defansData
              .filter(defans => 
                defans["KazanTop/90"] !== 0 && 
                defans["KazanTop/90"] !== 0.0 && 
                defans["KazanTop/90"] !== 0.00 && 
                defans["TopKyb/90"] !== 0 && 
                defans["TopKyb/90"] !== 0.0 && 
                defans["TopKyb/90"] !== 0.00
              )
              .map(defans => {
                return {
                  x: defans["TopKyb/90"],
                  y: defans["KazanTop/90"],
                  bnzrsz_def: defans.bnzrsz_def,
                  oyuncuIsim: defans.oyuncu_isim,
                  oyuncu_id: defans.oyuncu_id,
                  type: 'defans'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      };
    }

    // "Hava Topu-Defanslar" grafiği için özel veri kolonu kullan
    if (title === "Hava Topu-Defanslar") {
      return {
        datasets: [
          {
            label: 'Hava Topu İstatistikleri',
            data: defansData
              .filter(defans => 
                defans["HtmG/90"] !== 0 && 
                defans["HtmG/90"] !== 0.0 && 
                defans["HtmG/90"] !== 0.00 && 
                defans["Hv%"] !== 0 && 
                defans["Hv%"] !== 0.0 && 
                defans["Hv%"] !== 0.00
              )
              .map(defans => {
                return {
                  x: defans["Hv%"],
                  y: defans["HtmG/90"],
                  bnzrsz_def: defans.bnzrsz_def,
                  oyuncuIsim: defans.oyuncu_isim,
                  oyuncu_id: defans.oyuncu_id,
                  type: 'defans'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
          },
        ],
      };
    }

    // "Savunma-Orta Sahalar" grafiği için özel veri kolonu kullan
    if (title === "Savunma-Orta Sahalar") {
      return {
        datasets: [
          {
            label: 'Orta Saha Savunma İstatistikleri',
            data: ortaSahaData
              .filter(ortaSaha => {
                const engValue = Number(ortaSaha["Eng/90"]);
                const uzkValue = Number(ortaSaha["Uzk/90"]);
                return engValue !== 0 && !isNaN(engValue) && engValue !== null &&
                       uzkValue !== 0 && !isNaN(uzkValue) && uzkValue !== null;
              })
              .map(ortaSaha => {
                return {
                  x: ortaSaha["Uzk/90"],
                  y: ortaSaha["Eng/90"],
                  bnzrsz_os: ortaSaha.bnzrsz_os,
                  oyuncuIsim: ortaSaha.oyuncu_isim,
                  oyuncu_id: ortaSaha.oyuncu_id,
                  type: 'ortasaha'
                } as PointData;
              }),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      };
    }

    // "Genel Fiziksel İstatistik-Orta Sahalar" grafiği için özel veri kolonu kullan
    if (title === "Genel Fiziksel İstatistik-Orta Sahalar") {
      return {
        datasets: [
          {
            label: 'Orta Saha Fiziksel İstatistikler',
            data: ortaSahaData
              .filter(ortaSaha => 
                ortaSaha["Mesf/90"] !== 0 && 
                ortaSaha["Mesf/90"] !== 0.0 && 
                ortaSaha["Mesf/90"] !== 0.00 && 
                ortaSaha["Sprint/90"] !== 0 && 
                ortaSaha["Sprint/90"] !== 0.0 && 
                ortaSaha["Sprint/90"] !== 0.00
              )
              .map(ortaSaha => {
                return {
                  x: ortaSaha["Sprint/90"],
                  y: ortaSaha["Mesf/90"],
                  bnzrsz_os: ortaSaha.bnzrsz_os,
                  oyuncuIsim: ortaSaha.oyuncu_isim,
                  oyuncu_id: ortaSaha.oyuncu_id,
                  type: 'ortasaha'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
          },
        ],
      };
    }
    
    // "Genel Fiziksel İstatistik-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Genel Fiziksel İstatistik-Forvetler") {
      return {
        datasets: [
          {
            label: 'Forvet Fiziksel İstatistikler',
            data: forvetData
              .filter(forvet => 
                forvet["Mesf/90"] !== 0 && 
                forvet["Mesf/90"] !== 0.0 && 
                forvet["Mesf/90"] !== 0.00 && 
                forvet["Sprint/90"] !== 0 && 
                forvet["Sprint/90"] !== 0.0 && 
                forvet["Sprint/90"] !== 0.00
              )
              .map(forvet => {
                return {
                  x: forvet["Sprint/90"],
                  y: forvet["Mesf/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      };
    }
    
    // "Asist-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Asist-Forvetler") {
      return {
        datasets: [
          {
            label: 'Forvet Asist İstatistikleri',
            data: forvetData
              .filter(forvet => {
                const spasiValue = Number(forvet["SPasi/90"]);
                const xaValue = Number(forvet["xA/90"]);
                return spasiValue !== 0 && !isNaN(spasiValue) && spasiValue !== null &&
                       xaValue !== 0 && !isNaN(xaValue) && xaValue !== null;
              })
              .map(forvet => {
                return {
                  x: forvet["xA/90"],
                  y: forvet["SPasi/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      };
    }
    
    // "Orta-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Orta-Forvetler") {
      return {
        datasets: [
          {
            label: 'Forvet Orta Açma İstatistikleri',
            data: forvetData
              .filter(forvet => 
                forvet["OrtGrsm/90"] !== 0 && 
                forvet["OrtGrsm/90"] !== 0.0 && 
                forvet["OrtGrsm/90"] !== 0.00 && 
                forvet["Ao-Io%"] !== 0 && 
                forvet["Ao-Io%"] !== 0.0 && 
                forvet["Ao-Io%"] !== 0.00
              )
              .map(forvet => {
                return {
                  x: forvet["Ao-Io%"],
                  y: forvet["OrtGrsm/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
          },
        ],
      };
    }
    
    // "Atılan Gol-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Atılan Gol-Forvetler") {
      return {
        datasets: [
          {
            label: 'Forvet Gol İstatistikleri',
            data: forvetData
              .filter(forvet => {
                const xgValue = Number(forvet["PH-xG/90"]);
                const xaValue = Number(forvet["xA/90"]);
                return xgValue !== 0 && !isNaN(xgValue) && xgValue !== null &&
                       xaValue !== 0 && !isNaN(xaValue) && xaValue !== null;
              })
              .map(forvet => {
                return {
                  x: forvet["xA/90"],
                  y: forvet["PH-xG/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
          },
        ],
      };
    }
    
    // "Golcülük-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Golcülük-Forvetler") {
      return {
        datasets: [
          {
            label: 'Forvet Golcülük İstatistikleri',
            data: forvetData
              .filter(forvet => {
                const golValue = Number(forvet["Gol/90"]);
                const xgValue = Number(forvet["PH-xG/90"]);
                return golValue !== 0 && !isNaN(golValue) && golValue !== null &&
                       xgValue !== 0 && !isNaN(xgValue) && xgValue !== null;
              })
              .map(forvet => {
                return {
                  x: forvet["PH-xG/90"],
                  y: forvet["Gol/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      };
    }
    
    // "Şut-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Şut-Forvetler") {
      return {
        datasets: [
          {
            label: 'Forvet Şut İstatistikleri',
            data: forvetData
              .filter(forvet => {
                const shdValue = Number(forvet["SHd/90"]);
                const xgSutValue = Number(forvet["xG/Sut"]);
                return shdValue !== 0 && !isNaN(shdValue) && shdValue !== null &&
                       xgSutValue !== 0 && !isNaN(xgSutValue) && xgSutValue !== null;
              })
              .map(forvet => {
                return {
                  x: forvet["xG/Sut"],
                  y: forvet["SHd/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      };
    }
    
    // "Hareketlilik-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Hareketlilik-Forvetler") {
      return {
        datasets: [
          {
            label: 'Hareketlilik İstatistikleri',
            data: forvetData
              .filter(forvet => {
                const drpValue = Number(forvet["Drp/90"]);
                const topKybValue = Number(forvet["TopKyb/90"]);
                return drpValue !== 0 && !isNaN(drpValue) && drpValue !== null &&
                       topKybValue !== 0 && !isNaN(topKybValue) && topKybValue !== null;
              })
              .map(forvet => {
                return {
                  x: forvet["TopKyb/90"],
                  y: forvet["Drp/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      };
    }
    
    // "Pas-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Pas-Forvetler") {
      return {
        datasets: [
          {
            label: 'Forvet Pas İstatistikleri',
            data: forvetData
              .filter(forvet => 
                forvet["PsG/90"] !== undefined && 
                forvet["PsG/90"] !== null && 
                forvet["Pas%"] !== undefined && 
                forvet["Pas%"] !== null
              )
              .map(forvet => {
                return {
                  x: forvet["Pas%"],
                  y: forvet["PsG/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
          },
        ],
      };
    }
    
    // "Hava Topu-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Hava Topu-Forvetler") {
      return {
        datasets: [
          {
            label: 'Forvet Hava Topu İstatistikleri',
            data: forvetData
              .filter(forvet => {
                const htmgValue = Number(forvet["HtmG/90"]);
                const hvValue = Number(forvet["Hv%"]);
                return htmgValue !== 0 && !isNaN(htmgValue) && htmgValue !== null &&
                       hvValue !== 0 && !isNaN(hvValue) && hvValue !== null;
              })
              .map(forvet => {
                return {
                  x: forvet["Hv%"],
                  y: forvet["HtmG/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 206, 86, 1)',
          },
        ],
      };
    }
    
    // "Genel Hücum Beklentisi-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Genel Hücum Beklentisi-Forvetler") {
      return {
        datasets: [
          {
            label: 'Forvet Hücum Beklentisi İstatistikleri',
            data: forvetData
              .filter(forvet => {
                const xgValue = Number(forvet["PH-xG/90"]);
                const xaValue = Number(forvet["xA/90"]);
                return xgValue !== 0 && !isNaN(xgValue) && xgValue !== null &&
                       xaValue !== 0 && !isNaN(xaValue) && xaValue !== null;
              })
              .map(forvet => {
                return {
                  x: forvet["xA/90"],
                  y: forvet["PH-xG/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 159, 64, 1)',
          },
        ],
      };
    }

    // "Asist-Orta Sahalar" grafiği için özel veri kolonu kullan
    if (title === "Asist-Orta Sahalar") {
      return {
        datasets: [
          {
            label: 'Orta Saha Asist İstatistikleri',
            data: ortaSahaData
              .filter(ortaSaha => 
                ortaSaha["SPasi/90"] !== 0 && 
                ortaSaha["SPasi/90"] !== 0.0 && 
                ortaSaha["SPasi/90"] !== 0.00 && 
                ortaSaha["xA/90"] !== 0 && 
                ortaSaha["xA/90"] !== 0.0 && 
                ortaSaha["xA/90"] !== 0.00
              )
              .map(ortaSaha => {
                return {
                  x: ortaSaha["xA/90"],
                  y: ortaSaha["SPasi/90"],
                  bnzrsz_os: ortaSaha.bnzrsz_os,
                  oyuncuIsim: ortaSaha.oyuncu_isim,
                  oyuncu_id: ortaSaha.oyuncu_id,
                  type: 'ortasaha'
                } as PointData;
              }),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      };
    }

    // "Orta-Orta Sahalar" grafiği için özel veri kolonu kullan
    if (title === "Orta-Orta Sahalar") {
      return {
        datasets: [
          {
            label: 'Orta Saha Orta Açma İstatistikleri',
            data: ortaSahaData
              .filter(ortaSaha => 
                ortaSaha["OrtGrsm/90"] !== 0 && 
                ortaSaha["OrtGrsm/90"] !== 0.0 && 
                ortaSaha["OrtGrsm/90"] !== 0.00 && 
                ortaSaha["Ao-Io%"] !== 0 && 
                ortaSaha["Ao-Io%"] !== 0.0 && 
                ortaSaha["Ao-Io%"] !== 0.00
              )
              .map(ortaSaha => {
                return {
                  x: ortaSaha["Ao-Io%"],
                  y: ortaSaha["OrtGrsm/90"],
                  bnzrsz_os: ortaSaha.bnzrsz_os,
                  oyuncuIsim: ortaSaha.oyuncu_isim,
                  oyuncu_id: ortaSaha.oyuncu_id,
                  type: 'ortasaha'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
          },
        ],
      };
    }

    // "Golcülük-Orta Sahalar" grafiği için özel veri kolonu kullan
    if (title === "Golcülük-Orta Sahalar") {
      return {
        datasets: [
          {
            label: 'Orta Saha Golcülük İstatistikleri',
            data: ortaSahaData
              .filter(ortaSaha => {
                const golValue = Number(ortaSaha["Gol/90"]);
                const xgValue = Number(ortaSaha["PH-xG/90"]);
                return golValue !== 0 && !isNaN(golValue) && golValue !== null &&
                       xgValue !== 0 && !isNaN(xgValue) && xgValue !== null;
              })
              .map(ortaSaha => {
                return {
                  x: ortaSaha["PH-xG/90"],
                  y: ortaSaha["Gol/90"],
                  bnzrsz_os: ortaSaha.bnzrsz_os,
                  oyuncuIsim: ortaSaha.oyuncu_isim,
                  oyuncu_id: ortaSaha.oyuncu_id,
                  type: 'ortasaha'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
          },
        ],
      };
    }

    // "Pas-Orta Sahalar" grafiği için özel veri kolonu kullan
    if (title === "Pas-Orta Sahalar") {
      return {
        datasets: [
          {
            label: 'Orta Saha Pas İstatistikleri',
            data: ortaSahaData
              .filter(ortaSaha => 
                ortaSaha["PsG/90"] !== undefined && 
                ortaSaha["PsG/90"] !== null && 
                ortaSaha["Pas%"] !== undefined && 
                ortaSaha["Pas%"] !== null
              )
              .map(ortaSaha => {
                return {
                  x: ortaSaha["Pas%"],
                  y: ortaSaha["PsG/90"],
                  bnzrsz_os: ortaSaha.bnzrsz_os,
                  oyuncuIsim: ortaSaha.oyuncu_isim,
                  oyuncu_id: ortaSaha.oyuncu_id,
                  type: 'ortasaha'
                } as PointData;
              }),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
          },
        ],
      };
    }

    // "Pas Şablonu-Orta Sahalar" grafiği için özel veri kolonu kullan
    if (title === "Pas Şablonu-Orta Sahalar") {
      return {
        datasets: [
          {
            label: 'Orta Saha Pas Şablonu İstatistikleri',
            data: ortaSahaData
              .filter(ortaSaha => 
                ortaSaha["DikKltPas/90"] !== undefined && 
                ortaSaha["DikKltPas/90"] !== null && 
                ortaSaha["Pas%"] !== undefined && 
                ortaSaha["Pas%"] !== null
              )
              .map(ortaSaha => {
                return {
                  x: ortaSaha["DikKltPas/90"],
                  y: ortaSaha["Pas%"],
                  bnzrsz_os: ortaSaha.bnzrsz_os,
                  oyuncuIsim: ortaSaha.oyuncu_isim,
                  oyuncu_id: ortaSaha.oyuncu_id,
                  type: 'ortasaha'
                } as PointData;
              }),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(255, 159, 64, 1)',
          },
        ],
      };
    }

    // "Topa Sahip Olma-Orta Sahalar" grafiği için özel veri kolonu kullan
    if (title === "Topa Sahip Olma-Orta Sahalar") {
      return {
        datasets: [
          {
            label: 'Orta Saha Top Kazanma/Kaybetme İstatistikleri',
            data: ortaSahaData
              .filter(ortaSaha => 
                ortaSaha["KazanTop/90"] !== undefined && 
                ortaSaha["KazanTop/90"] !== null && 
                ortaSaha["TopKyb/90"] !== undefined && 
                ortaSaha["TopKyb/90"] !== null
              )
              .map(ortaSaha => {
                return {
                  x: ortaSaha["TopKyb/90"],
                  y: ortaSaha["KazanTop/90"],
                  bnzrsz_os: ortaSaha.bnzrsz_os,
                  oyuncuIsim: ortaSaha.oyuncu_isim,
                  oyuncu_id: ortaSaha.oyuncu_id,
                  type: 'ortasaha'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      };
    }

    // "Hava Topu-Orta Sahalar" grafiği için özel veri kolonu kullan
    if (title === "Hava Topu-Orta Sahalar") {
      return {
        datasets: [
          {
            label: 'Orta Saha Hava Topu İstatistikleri',
            data: ortaSahaData
              .filter(ortaSaha => {
                const htmgValue = Number(ortaSaha["HtmG/90"]);
                const hvValue = Number(ortaSaha["Hv%"]);
                return htmgValue !== 0 && !isNaN(htmgValue) && htmgValue !== null &&
                       hvValue !== 0 && !isNaN(hvValue) && hvValue !== null;
              })
              .map(ortaSaha => {
                return {
                  x: ortaSaha["Hv%"],
                  y: ortaSaha["HtmG/90"],
                  bnzrsz_os: ortaSaha.bnzrsz_os,
                  oyuncuIsim: ortaSaha.oyuncu_isim,
                  oyuncu_id: ortaSaha.oyuncu_id,
                  type: 'ortasaha'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
          },
        ],
      };
    }

    // "Hareketlilik-Forvetler" grafiği için özel veri kolonu kullan
    if (title === "Hareketlilik-Forvetler") {
      return {
        datasets: [
          {
            label: 'Hareketlilik İstatistikleri',
            data: forvetData
              .filter(forvet => {
                const drpValue = Number(forvet["Drp/90"]);
                const topKybValue = Number(forvet["TopKyb/90"]);
                return drpValue !== 0 && !isNaN(drpValue) && drpValue !== null &&
                       topKybValue !== 0 && !isNaN(topKybValue) && topKybValue !== null;
              })
              .map(forvet => {
                return {
                  x: forvet["TopKyb/90"],
                  y: forvet["Drp/90"],
                  bnzrsz_fv: forvet.bnzrsz_fv,
                  oyuncuIsim: forvet.oyuncu_isim,
                  oyuncu_id: forvet.oyuncu_id,
                  type: 'forvet'
                } as PointData;
              }),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      };
    }

    return {
      datasets: [
        {
          label: 'Kaleci İstatistikleri',
          data: kaleciData.map(kaleci => {
            // Her bir kaleci için verileri düzgün şekilde tanımla
            return {
              x: kaleci[xKey as keyof KaleciData] as number,
              y: kaleci[yKey as keyof KaleciData] as number,
              bnzrsz_gk: kaleci.bnzrsz_gk,
              oyuncuIsim: kaleci.oyuncu_isim,
              oyuncu_id: kaleci.oyuncu_id,
              type: 'kaleci'
            } as PointData;
          }),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          pointRadius: isExpanded ? 6 : 4,
          pointHoverRadius: isExpanded ? 8 : 6,
          pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
        },
      ],
    };
  }, [kaleciData, defansData, ortaSahaData, isExpanded, title]);

  const chartOptions = useMemo(() => {
    // Her grafik için kullanılacak x ve y eksenlerini belirle
    let xLabel = 'Kurtarış Yüzdesi (%)';
    let yLabel = 'Maç Başına Kurtarış';
    let xMin = undefined;
    let xMax = undefined;
    let yMin = undefined;
    let yMax = undefined;
    
    // "Kalecilik-Kaleciler" grafiği için özel eksen sınırları
    if (title === "Kalecilik-Kaleciler") {
      xMin = 50;
      xMax = 100;
      yMin = 1.26;
      yMax = 5.23;
    }
    
    // "Detaylı Kalecilik İstatistikleri-Kaleciler" grafiği için özel veri kolonu etiketleri
    if (title === "Detaylı Kalecilik İstatistikleri-Kaleciler") {
      xLabel = 'Kurtarış Yüzdesi (%)';
      yLabel = 'Engellenen Gol Beklentisi';
      xMin = 50;
      xMax = 100;
      yMin = -10;
      yMax = 10;
    }
    
    // "Pas-Kaleciler" grafiği için özel veri kolonu etiketleri
    if (title === "Pas-Kaleciler") {
      xLabel = 'İsabetli Pas Yüzdesi (%)';
      yLabel = 'Maç Başına Pas Denemesi';
      xMin = 15;
      xMax = 100;
      yMin = 10;
      yMax = 40;
    }

    // "Savunma-Defanslar" grafiği için özel veri kolonu etiketleri
    if (title === "Savunma-Defanslar") {
      xLabel = 'Maç Başına Top Uzaklaştırma';
      yLabel = 'Maç Başına Şut Engelleme';
      xMin = 0.00;
      xMax = 5.73;
      yMin = 0.00;
      yMax = 1.88;
    }
    
    // "Genel Fiziksel İstatistik-Defanslar" grafiği için özel veri kolonu etiketleri
    if (title === "Genel Fiziksel İstatistik-Defanslar") {
      xLabel = 'Maç Başına Yüksek Hızlı Sprint';
      yLabel = 'Maç Başına Katettiği Mesafe';
      xMin = 0;
      xMax = 25;
      yMin = 9;
      yMax = 14;
    }

    // "Asist-Defanslar" grafiği için özel veri kolonu etiketleri
    if (title === "Asist-Defanslar") {
      xLabel = 'Beklenen Asist (xA) (90 Dakika Başına)';
      yLabel = 'Şut Pası (90 Dakika Başına)';
      xMin = 0.00;
      xMax = 0.36;
      yMin = 0.00;
      yMax = 2.79;
    }

    // "Orta-Defanslar" grafiği için özel veri kolonu etiketleri
    if (title === "Orta-Defanslar") {
      xLabel = 'İsabetli Orta (%)';
      yLabel = 'Orta Girişimleri (90 Dakika Başına)';
      xMin = 0;
      xMax = 100;
      yMin = 0;
      yMax = 8;
    }

    // "Hareketlilik-Defanslar" grafiği için özel veri kolonu etiketleri
    if (title === "Hareketlilik-Defanslar") {
      xLabel = 'Top Kaybı (90 Dakika Başına)';
      yLabel = 'Dripling (90 Dakika Başına)';
      xMin = 6;
      xMax = 14;
      yMin = 0.00;
      yMax = 1.60;
    }

    // "Pas-Defanslar" grafiği için özel veri kolonu etiketleri
    if (title === "Pas-Defanslar") {
      xLabel = 'İsabetli Pas Yüzdesi (%)';
      yLabel = 'Pas Girişimi (90 Dakika Başına)';
      xMin = 65;
      xMax = 95;
      yMin = 15;
      yMax = 90;
    }

    // "Topa Sahip Olma-Defanslar" grafiği için özel veri kolonu etiketleri
    if (title === "Topa Sahip Olma-Defanslar") {
      xLabel = 'Top Kaybı (90 Dakika Başına)';
      yLabel = 'Top Kazanma (90 Dakika Başına)';
      xMin = 5;
      xMax = 20;
      yMin = 5;
      yMax = 20;
    }

    // "Hava Topu-Defanslar" grafiği için özel veri kolonu etiketleri
    if (title === "Hava Topu-Defanslar") {
      xLabel = 'Hava Topu Kazanma Oranı (%)';
      yLabel = 'Hava Topu Mücadelesi (90 Dakika Başına)';
      xMin = 0;
      xMax = 100;
      yMin = 2;
      yMax = 12;
    }
    
    // "Savunma-Orta Sahalar" grafiği için özel veri kolonu etiketleri
    if (title === "Savunma-Orta Sahalar") {
      xLabel = 'Uzaklaştırma (90 Dakika Başına)';
      yLabel = 'Engelleme (90 Dakika Başına)';
      xMin = 0.00;
      xMax = 3.60;
      yMin = 0.00;
      yMax = 0.79;
    }

    // "Genel Fiziksel İstatistik-Orta Sahalar" grafiği için özel veri kolonu etiketleri
    if (title === "Genel Fiziksel İstatistik-Orta Sahalar") {
      xLabel = 'Sprint Sayısı (90 Dakika Başına)';
      yLabel = 'Koşu Mesafesi (90 Dakika Başına)';
      xMin = 0;
      xMax = 20;
      yMin = 9;
      yMax = 14;
    }
    
    // "Genel Fiziksel İstatistik-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Genel Fiziksel İstatistik-Forvetler") {
      xLabel = 'Sprint Sayısı (90 Dakika Başına)';
      yLabel = 'Koşu Mesafesi (90 Dakika Başına)';
      xMin = 0;
      xMax = 25;
      yMin = 9;
      yMax = 14;
    }
    
    // "Asist-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Asist-Forvetler") {
      xLabel = 'Beklenen Asist (xA) (90 Dakika Başına)';
      yLabel = 'Şut Pası (90 Dakika Başına)';
      xMin = 0.00;
      xMax = 0.71;
      yMin = 0.00;
      yMax = 4.33;
    }
    
    // "Orta-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Orta-Forvetler") {
      xLabel = 'İsabetli Orta (%)';
      yLabel = 'Orta Girişimleri (90 Dakika Başına)';
      xMin = 0;
      xMax = 50;
      yMin = 0;
      yMax = 15;
    }
    
    // "Atılan Gol-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Atılan Gol-Forvetler") {
      xLabel = 'Akan Oyunda Beklenen Asist (xA) (90 Dakika Başına)';
      yLabel = 'Penaltı Harici Gol Beklentisi (90 Dakika Başına)';
      xMin = 0.00;
      xMax = 0.71;
      yMin = 0.00;
      yMax = 1.01;
    }
    
    // "Golcülük-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Golcülük-Forvetler") {
      xLabel = 'Penaltı Hariç Gol Beklentisi (90 Dk Başına)';
      yLabel = 'Gol (90 Dakika Başına)';
      xMin = 0.00;
      xMax = 1.12;
      yMin = 0.00;
      yMax = 1.35;
    }
    
    // "Şut-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Şut-Forvetler") {
      xLabel = 'Şut Başına Beklenen Gol Değeri (xG/Şut)';
      yLabel = 'İsabetli Şut (90 Dakika Başına)';
      xMin = 0.00;
      xMax = 0.52;
      yMin = 0.00;
      yMax = 2.29;
    }
    
    // "Hareketlilik-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Hareketlilik-Forvetler") {
      xLabel = 'Top Kaybı (90 Dakika Başına)';
      yLabel = 'Dripling (90 Dakika Başına)';
      xMin = 0;
      xMax = 20;
      yMin = 0.00;
      yMax = 5.93;
    }
    
    // "Pas-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Pas-Forvetler") {
      xLabel = 'İsabetli Pas Yüzdesi (%)';
      yLabel = 'Pas Girişimi (90 Dakika Başına)';
      xMin = 70;
      xMax = 95;
      yMin = 10;
      yMax = 70;
    }
    
    // "Hava Topu-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Hava Topu-Forvetler") {
      xLabel = 'Hava Topu Kazanma Yüzdesi (%)';
      yLabel = 'Hava Topu Mücadelesi (90 Dakika Başına)';
      xMin = 0;
      xMax = 75;
      yMin = 0;
      yMax = 20;
    }
    
    // "Genel Hücum Beklentisi-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Genel Hücum Beklentisi-Forvetler") {
      xLabel = 'Akan Oyunda Beklenen Asist (xA) (90 Dakika Başına)';
      yLabel = 'Penaltı Harici Gol Beklentisi (90 Dakika Başına)';
      xMin = 0.00;
      xMax = 0.72;
      yMin = 0.00;
      yMax = 1.01;
    }

    // "Asist-Orta Sahalar" grafiği için özel veri kolonu etiketleri
    if (title === "Asist-Orta Sahalar") {
      xLabel = 'Beklenen Asist (xA) (90 Dakika Başına)';
      yLabel = 'Şut Pası (90 Dakika Başına)';
      xMin = 0.00;
      xMax = 0.60;
      yMin = 0.00;
      yMax = 3.98;
    }

    // "Orta-Orta Sahalar" grafiği için özel veri kolonu etiketleri
    if (title === "Orta-Orta Sahalar") {
      xLabel = 'İsabetli Orta (%)';
      yLabel = 'Orta Girişimleri (90 Dakika Başına)';
      xMin = 0;
      xMax = 60;
      yMin = 0;
      yMax = 10;
    }

    // "Golcülük-Orta Sahalar" grafiği için özel veri kolonu etiketleri
    if (title === "Golcülük-Orta Sahalar") {
      xLabel = 'Penaltı Harici Gol Beklentisi (90 Dakika Başına)';
      yLabel = 'Gol (90 Dakika Başına)';
      xMin = 0.00;
      xMax = 0.51;
      yMin = 0.00;
      yMax = 1.03;
    }

    // "Pas-Orta Sahalar" grafiği için özel veri kolonu etiketleri
    if (title === "Pas-Orta Sahalar") {
      xLabel = 'İsabetli Pas Yüzdesi (%)';
      yLabel = 'Pas Girişimi (90 Dakika Başına)';
      xMin = 70;
      xMax = 95;
      yMin = 20;
      yMax = 80;
    }

    // "Pas Şablonu-Orta Sahalar" grafiği için özel veri kolonu etiketleri
    if (title === "Pas Şablonu-Orta Sahalar") {
      xLabel = 'Dikine Kilit Paslar (90 Dakika Başına)';
      yLabel = 'İsabetli Pas Yüzdesi (%)';
      xMin = 0;
      xMax = 10;
      yMin = 70;
      yMax = 95;
    }

    // "Topa Sahip Olma-Orta Sahalar" grafiği için özel veri kolonu etiketleri
    if (title === "Topa Sahip Olma-Orta Sahalar") {
      xLabel = 'Top Kaybı (90 Dakika Başına)';
      yLabel = 'Top Kazanma (90 Dakika Başına)';
      xMin = 0;
      xMax = 20;
      yMin = 2;
      yMax = 12;
    }

    // "Hava Topu-Orta Sahalar" grafiği için özel veri kolonu etiketleri
    if (title === "Hava Topu-Orta Sahalar") {
      xLabel = 'Hava Topu Kazanma Oranı (%)';
      yLabel = 'Hava Topu Mücadelesi (90 Dakika Başına)';
      xMin = 0;
      xMax = 100;
      yMin = 0;
      yMax = 12;
    }

    // "Hareketlilik-Forvetler" grafiği için özel veri kolonu etiketleri
    if (title === "Hareketlilik-Forvetler") {
      xLabel = 'Top Kaybı (90 Dakika Başına)';
      yLabel = 'Dripling (90 Dakika Başına)';
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: isExpanded,
            text: xLabel,
            font: {
              size: 12
            }
          },
          min: xMin,
          max: xMax,
          ticks: {
            display: isExpanded,
            font: {
              size: 10
            }
          }
        },
        y: {
          title: {
            display: isExpanded,
            text: yLabel,
            font: {
              size: 12
            }
          },
          min: yMin,
          max: yMax,
          ticks: {
            display: isExpanded,
            font: {
              size: 10
            }
          }
        }
      },
      plugins: {
        tooltip: {
          titleAlign: 'center' as const,
          bodyAlign: 'center' as const,
          titleMarginBottom: 0,
          padding: 6,
          callbacks: {
            title: function(tooltipItems: any[]) {
              return tooltipItems[0].raw.oyuncuIsim;
            },
            label: function(context: any) {
              const xLabel = context.chart.scales.x.options.title.text;
              const yLabel = context.chart.scales.y.options.title.text;
              
              return [
                `${xLabel}: ${context.parsed.x.toFixed(1)}`,
                `${yLabel}: ${context.parsed.y.toFixed(2)}`
              ];
            }
          }
        },
        legend: {
          display: false
        }
      },
      onClick: () => {
        toggleExpand();
      }
    };
  }, [isExpanded, title, toggleExpand]);

  return (
    <div className={`bg-white border rounded-lg shadow-sm transition-all duration-300 overflow-hidden ${
      isExpanded ? 'col-span-3 md:col-span-3 lg:col-span-9 row-span-1' : 'col-span-1'
    }`}>
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium truncate">{title}</h3>
        <button 
          onClick={toggleExpand}
          className="p-1 hover:bg-gray-100 rounded text-xs"
        >
          {isExpanded ? 'Küçült' : 'Büyüt'}
        </button>
      </div>
      
      <div className="p-2">
        {isExpanded ? (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 p-2">
              {title === "Kalecilik-Kaleciler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Kalecilik Analizi</h4>
                  <p className="text-xs mb-2">Kalecilerin kurtarış oranları ve maç başına kurtarış sayıları.</p>
                  <p className="text-xs">Yüksek kurtarış yüzdesi ve yüksek kurtarış sayısı ideal kaleci profilini gösterir.</p>
                </>
              )}
              
              {title === "Detaylı Kalecilik İstatistikleri-Kaleciler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Detaylı Kalecilik Analizi</h4>
                  <p className="text-xs mb-2">Kalecilerin kurtarış yüzdeleri ve engelledikleri gol beklentisi (xG).</p>
                  <p className="text-xs">Engellenen xG değeri yüksek olan kaleciler, zorluk seviyesi yüksek kurtarışlar yaparlar.</p>
                </>
              )}
              
              {title === "Pas-Kaleciler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Kaleci Pas Analizi</h4>
                  <p className="text-xs mb-2">Kalecilerin pas isabeti ve maç başına pas denemeleri.</p>
                  <p className="text-xs">Modern oyunda kalecilerin pas kabiliyeti giderek önem kazanmaktadır.</p>
                </>
              )}

              {title === "Savunma-Defanslar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Defans Oyuncuları Savunma Analizi</h4>
                  <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına engelleme ve uzaklaştırma sayıları.</p>
                  <p className="text-xs">Çeşitli savunma özelliklerinin karşılaştırması defans oyuncularının profilini gösterir.</p>
                </>
              )}

              {title === "Genel Fiziksel İstatistik-Defanslar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Defans Oyuncuları Fiziksel Analizi</h4>
                  <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına koşu mesafesi ve sprint sayıları.</p>
                  <p className="text-xs">Yüksek mesafe ve yüksek sprint sayısı, fiziksel kapasitesi yüksek defans oyuncularını gösterir.</p>
                </>
              )}

              {title === "Asist-Defanslar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Defans Oyuncuları Hücum Katkısı</h4>
                  <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına şut pası ve beklenen asist değerleri.</p>
                  <p className="text-xs">Yüksek xA ve şut pası değerleri, hücuma katkısı yüksek defans oyuncularını gösterir.</p>
                </>
              )}

              {title === "Orta-Defanslar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Defans Orta Girişimleri Analizi</h4>
                  <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına orta girişimleri ve alan içi/dışı oranları.</p>
                  <p className="text-xs">Yüksek orta sayısı ve alan içi oranı, etkili orta açan defans oyuncularını gösterir.</p>
                </>
              )}

              {title === "Hareketlilik-Defanslar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Defans Oyuncuları Hareketlilik Analizi</h4>
                  <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına dripling ve top kaybı sayıları.</p>
                  <p className="text-xs">Yüksek dripling ve düşük top kaybı, top kontrolü iyi olan defans oyuncularını gösterir.</p>
                </>
              )}

              {title === "Pas-Defanslar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Defans Oyuncuları Pas Analizi</h4>
                  <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına pas girişimi ve isabet yüzdeleri.</p>
                  <p className="text-xs">Yüksek pas sayısı ve isabet oranı, oyun kurucu özellikleri olan defans oyuncularını gösterir.</p>
                </>
              )}

              {title === "Topa Sahip Olma-Defanslar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Defans Oyuncuları Top Analizi</h4>
                  <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına top kazanma ve top kaybı değerleri.</p>
                  <p className="text-xs">Yüksek top kazanma ve düşük top kaybı oranları, topa sahip olmada başarılı defans oyuncularını gösterir.</p>
                </>
              )}

              {title === "Hava Topu-Defanslar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Defans Oyuncuları Hava Topu Analizi</h4>
                  <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına hava topu kazanma ve hava topu kaybı değerleri.</p>
                  <p className="text-xs">Yüksek hava topu kazanma ve düşük hava topu kaybı oranları, hava topu kontrolü iyi olan defans oyuncularını gösterir.</p>
                </>
              )}

              {title === "Savunma-Orta Sahalar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Orta Saha Oyuncuları Savunma Analizi</h4>
                  <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına engelleme ve uzaklaştırma sayıları.</p>
                  <p className="text-xs">Yüksek engelleme ve uzaklaştırma değerleri, savunma katkısı güçlü orta saha oyuncularını gösterir.</p>
                </>
              )}

              {title === "Genel Fiziksel İstatistik-Orta Sahalar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Orta Saha Fiziksel İstatistikler</h4>
                  <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına koşu mesafesi ve sprint sayıları.</p>
                  <p className="text-xs">Yüksek mesafe ve yüksek sprint sayısı, fiziksel kapasitesi yüksek orta saha oyuncularını gösterir.</p>
                </>
              )}

              {title === "Asist-Orta Sahalar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Orta Saha Asist Analizi</h4>
                  <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına şut pası ve beklenen asist değerleri.</p>
                  <p className="text-xs">Yüksek xA ve şut pası değerleri, hücuma katkısı yüksek orta saha oyuncularını gösterir.</p>
                </>
              )}

              {title === "Orta-Orta Sahalar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Orta Saha Orta Açma Analizi</h4>
                  <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına orta girişimleri ve alan içi/dışı oranları.</p>
                  <p className="text-xs">Yüksek orta sayısı ve alan içi oranı, etkili orta açan orta saha oyuncularını gösterir.</p>
                </>
              )}

              {title === "Golcülük-Orta Sahalar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Orta Saha Golcülük Analizi</h4>
                  <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına attıkları goller ve beklenen gol değerlerinin üzerine çıkma durumları.</p>
                  <p className="text-xs">Yüksek gol sayısı ve pozitif bir PH-xG değeri, klinik bitiricilik gösteren orta saha oyuncularını işaret eder.</p>
                </>
              )}

              {title === "Pas-Orta Sahalar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Orta Saha Pas Analizi</h4>
                  <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına pas girişimi ve isabet yüzdeleri.</p>
                  <p className="text-xs">Yüksek pas sayısı ve isabet oranı, oyun kurucu özellikleri olan orta saha oyuncularını gösterir.</p>
                </>
              )}

              {title === "Pas Şablonu-Orta Sahalar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Orta Saha Pas Şablonu Analizi</h4>
                  <p className="text-xs mb-2">Orta saha oyuncularının pas isabet oranları ve dikey/kaliteli pas sayıları.</p>
                  <p className="text-xs">Yüksek dikey pas sayısı ve yüksek isabet oranı, ileriye dönük yaratıcı orta saha oyuncularını gösterir.</p>
                </>
              )}

              {title === "Topa Sahip Olma-Orta Sahalar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Orta Saha Top Kazanma/Kaybetme Analizi</h4>
                  <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına top kazanma ve top kaybı değerleri.</p>
                  <p className="text-xs">Yüksek top kazanma ve düşük top kaybı oranları, topa sahip olmada başarılı orta saha oyuncularını gösterir.</p>
                </>
              )}

              {title === "Hava Topu-Orta Sahalar" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Orta Saha Hava Topu Analizi</h4>
                  <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına hava topu mücadele sayıları ve kazanma oranları.</p>
                  <p className="text-xs">Yüksek hava topu mücadele sayısı ve yüksek kazanma oranı, havadan gelen toplarda etkili orta saha oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Genel Fiziksel İstatistik-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Fiziksel İstatistik Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının 90 dakika başına koştuğu mesafe ve sprint sayıları.</p>
                  <p className="text-xs">Yüksek mesafe ve yüksek sprint sayısı, fiziksel kapasitesi yüksek forvet oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Asist-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Asist Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının 90 dakika başına şut pası sayıları ve beklenen asist değerleri.</p>
                  <p className="text-xs">Yüksek şut pası sayısı ve yüksek xA değeri, asist potansiyeli yüksek forvet oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Orta-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Orta Açma Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının 90 dakika başına orta girişimleri ve alan içi/dışı oranları.</p>
                  <p className="text-xs">Yüksek orta sayısı ve yüksek alan içi oranı, nitelikli ortalar yapan forvet oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Hareketlilik-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Hareketlilik Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının 90 dakika başına dripling ve top kaybı sayıları.</p>
                  <p className="text-xs">Yüksek dripling sayısı ve düşük top kaybı, teknik kapasitesi yüksek ve top kontrolü iyi forvet oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Pas-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Pas Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının 90 dakika başına pas girişimleri ve isabet oranları.</p>
                  <p className="text-xs">Yüksek pas girişimi ve yüksek isabet oranı, oyun kurucu özellikleri olan forvet oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Hava Topu-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Hava Topu Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının 90 dakika başına hava topu mücadeleleri ve kazanma oranları.</p>
                  <p className="text-xs">Yüksek hava topu mücadelesi ve yüksek kazanma oranı, hava toplarında etkili forvet oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Atılan Gol-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Golcülük Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının beklenen gol değerinin üzerine çıkma ve beklenen asist değerleri.</p>
                  <p className="text-xs">Yüksek PH-xG/90 değeri, beklenen gol değerinin üzerinde performans gösteren forvet oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Golcülük-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Gol/xG İlişki Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının 90 dakika başına attıkları gol sayısı ve beklenen gol değerinin üzerine çıkma oranları.</p>
                  <p className="text-xs">Yüksek gol sayısı ve pozitif PH-xG/90, golcülük yeteneği ve bitiricilik özelliği yüksek forvet oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Şut-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Şut Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının 90 dakika başına hedefe giden şut sayısı ve şut başına düşen beklenen gol değeri.</p>
                  <p className="text-xs">Yüksek şut kalitesi (xG/Şut) ve yüksek hedefe şut sayısı, etkili şut seçimleri yapan ve çok pozisyona giren forvet oyuncularını gösterir.</p>
                </>
              )}
              
              {title === "Genel Hücum Beklentisi-Forvetler" && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Forvet Genel Hücum Beklentisi Analizi</h4>
                  <p className="text-xs mb-2">Forvet oyuncularının beklenen gol değerine göre performansı ve beklenen asist değerleri.</p>
                  <p className="text-xs">Yüksek PH-xG/90 ve yüksek xA/90 değerleri, hem gol atma hem de asist yapma potansiyeli yüksek forvet oyuncularını gösterir.</p>
                </>
              )}
            </div>
            
            <div className="md:w-3/4 relative">
              <div className="w-full relative transition-all duration-300 h-[400px]">
                {title === "Kalecilik-Kaleciler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kurtarış Sayısı Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şutların Azını Kurtarıyor</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kurtarış Sayısı Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Şutların Çoğunu Kurtarıyor</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kurtarış Sayısı Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Şutların Azını Kurtarıyor</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kurtarış Sayısı Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şutların Çoğunu Kurtarıyor</div>
                    </div>
                  </>
                )}

                {title === "Detaylı Kalecilik İstatistikleri-Kaleciler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Durdurma Kalitesi Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şutların Azını Kurtarıyor</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Şut Durdurma Kalitesi Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Şutların Çoğunu Kurtarıyor</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Şut Durdurma Kalitesi İyi Değil</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Şutların Azını Kurtarıyor</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Durdurma Kalitesi İyi Değil</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şutların Çoğunu Kurtarıyor</div>
                    </div>
                  </>
                )}

                {title === "Pas-Kaleciler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Pas Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetsiz Paslaşma</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Pas Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>İsabetli Paslaşma</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Paslı Oynayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>İsabetsiz Paslaşma</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Paslı Oynayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetli Paslaşma</div>
                    </div>
                  </>
                )}

                {title === "Savunma-Defanslar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Engelleme Sayısı Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Topu Uzaklaştırma Sayısı Az</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Şut Engelleme Sayısı Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Topu Uzaklaştırma Sayısı Çok</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Şut Engelleme Sayısı Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Topu Uzaklaştırma Sayısı Az</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Engelleme Sayısı Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Topu Uzaklaştırma Sayısı Çok</div>
                    </div>
                  </>
                )}

                {title === "Genel Fiziksel İstatistik-Defanslar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Düşük Sayıda Başarılı Sprint</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Sayıda Başarılı Sprint</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Düşük Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Düşük Sayıda Başarılı Sprint</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Düşük Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Sayıda Başarılı Sprint</div>
                    </div>
                  </>
                )}

                {title === "Asist-Defanslar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yaratıcılık Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yaratıcılık Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Yaratıcılık Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yaratıcılık Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                  </>
                )}
                
                {title === "Orta-Defanslar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Ortalar İsabetsiz</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Ortalar İsabetli</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Ortalar İsabetsiz</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Ortalar İsabetli</div>
                    </div>
                  </>
                )}
                
                {title === "Hareketlilik-Defanslar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Dripling Denemesi Bol</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Dripling Denemesi Bol</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Dripling Denemesi Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Dripling Denemesi Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                    </div>
                  </>
                )}
                
                {title === "Pas-Defanslar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Pas Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetsiz Paslaşma</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Pas Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>İsabetli Paslaşma</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Paslı Oynayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>İsabetsiz Paslaşma</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Paslı Oynayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetli Paslaşma</div>
                    </div>
                  </>
                )}
                
                {title === "Topa Sahip Olma-Defanslar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Sık Sık Top Kazanan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Sık Sık Top Kazanan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Pek Sık Top Kazanamayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Pek Sık Top Kazanamayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                    </div>
                  </>
                )}
                
                {title === "Hava Topu-Defanslar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşu Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşunda Etkisiz</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kafa Vuruşu Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kafa Vuruşunda Etkili</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kafa Vuruşu Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kafa Vuruşunda Etkisiz</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşu Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşunda Etkili</div>
                    </div>
                  </>
                )}
                
                {title === "Savunma-Orta Sahalar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Engelleme Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Uzaklaştırma Düşük</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Engelleme Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Uzaklaştırma Yüksek</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Engelleme Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Uzaklaştırma Düşük</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Engelleme Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Uzaklaştırma Yüksek</div>
                    </div>
                  </>
                )}

                {title === "Genel Fiziksel İstatistik-Orta Sahalar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Düşük Sayıda Başarılı Sprint</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Sayıda Başarılı Sprint</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Düşük Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Düşük Sayıda Başarılı Sprint</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Düşük Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Sayıda Başarılı Sprint</div>
                    </div>
                  </>
                )}

                {title === "Asist-Orta Sahalar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yaratıcılık Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yaratıcılık Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Yaratıcılık Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yaratıcılık Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                  </>
                )}

                {title === "Orta-Orta Sahalar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Ortalar İsabetsiz</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Ortalar İsabetli</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Ortalar İsabetsiz</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Ortalar İsabetli</div>
                    </div>
                  </>
                )}

                {title === "Golcülük-Orta Sahalar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Gol Atan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Gol Atan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Gol Atan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Gol Atan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                    </div>
                  </>
                )}

                {title === "Pas-Orta Sahalar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Pas Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetsiz Paslaşma</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Pas Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>İsabetli Paslaşma</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Paslı Oynayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>İsabetsiz Paslaşma</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Paslı Oynayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetli Paslaşma</div>
                    </div>
                  </>
                )}

                {title === "Pas Şablonu-Orta Sahalar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetli Paslaşma</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Düşük Sayıda Dikine Başarılı Pas</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>İsabetli Paslaşma</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Sayıda Dikine Başarılı Pas</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>İsabetsiz Paslaşma</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Düşük Sayıda Dikine Başarılı Pas</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetsiz Paslaşma</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Sayıda Dikine Başarılı Pas</div>
                    </div>
                  </>
                )}

                {title === "Topa Sahip Olma-Orta Sahalar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Sık Sık Top Kazanan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Sık Sık Top Kazanan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Pek Sık Top Kazanamayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Pek Sık Top Kazanamayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                    </div>
                  </>
                )}

                {title === "Hava Topu-Orta Sahalar" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşu Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşunda Etkisiz</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kafa Vuruşu Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kafa Vuruşunda Etkili</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kafa Vuruşu Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kafa Vuruşunda Etkisiz</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşu Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşunda Etkili</div>
                    </div>
                  </>
                )}
                
                {title === "Genel Fiziksel İstatistik-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Düşük Sayıda Başarılı Sprint</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Sayıda Başarılı Sprint</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Düşük Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Düşük Sayıda Başarılı Sprint</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Düşük Koşu Mesafesi</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Sayıda Başarılı Sprint</div>
                    </div>
                  </>
                )}
                
                {title === "Asist-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yaratıcılık Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yaratıcılık Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Yaratıcılık Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yaratıcılık Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                  </>
                )}
                
                {title === "Orta-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Ortalar İsabetsiz</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Ortalar İsabetli</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Ortalar İsabetsiz</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Orta Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Ortalar İsabetli</div>
                    </div>
                  </>
                )}
                
                {title === "Atılan Gol-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                  </>
                )}
                
                {title === "Golcülük-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Gol Atan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Gol Atan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Gol Atan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Gol Atan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                    </div>
                  </>
                )}
                
                {title === "Şut-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Aktif</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Kalitesi Düşük</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Aktif</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Şut Kalitesi Yüksek</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Pasif</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Şut Kalitesi Düşük</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Pasif</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Kalitesi Yüksek</div>
                    </div>
                  </>
                )}
                
                {title === "Genel Hücum Beklentisi-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Düşük Kalite</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Akan Oyunda Gol Şansı Yaratmada Yüksek Kalite</div>
                    </div>
                  </>
                )}
                
                {title === "Hareketlilik-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Dripling Denemesi Bol</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Dripling Denemesi Bol</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Dripling Denemesi Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Dripling Denemesi Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                    </div>
                  </>
                )}
                
                {title === "Pas-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Pas Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetsiz Paslaşma</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Pas Yapan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>İsabetli Paslaşma</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Paslı Oynayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>İsabetsiz Paslaşma</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Paslı Oynayan</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetli Paslaşma</div>
                    </div>
                  </>
                )}
                
                {title === "Hava Topu-Forvetler" && (
                  <>
                    {/* Sol üst köşe - Turuncu */}
                    <div className="absolute ml-12 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşu Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşunda Etkisiz</div>
                    </div>
                    
                    {/* Sağ üst köşe - Yeşil */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kafa Vuruşu Çok</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kafa Vuruşunda Etkili</div>
                    </div>
                    
                    {/* Sol alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kafa Vuruşu Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kafa Vuruşunda Etkisiz</div>
                    </div>
                    
                    {/* Sağ alt köşe - Turuncu */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşu Az</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kafa Vuruşunda Etkili</div>
                    </div>
                  </>
                )}
                
                <Scatter 
                  ref={chartRef}
                  data={chartData} 
                  options={chartOptions}
                  plugins={[referenceLinePlugin, customImagePlugin]}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[120px]">
            <Scatter 
              ref={chartRef}
              data={chartData} 
              options={chartOptions}
              plugins={[referenceLinePlugin, customImagePlugin]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function OyuncuPage() {
  const [kaleciData, setKaleciData] = useState<KaleciData[]>([]);
  const [defansData, setDefansData] = useState<DefansData[]>([]);
  const [ortaSahaData, setOrtaSahaData] = useState<OrtaSahaData[]>([]);
  const [forvetData, setForvetData] = useState<ForvetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<number | null>(null);

  useEffect(() => {
    // Veritabanından verileri çek
    const fetchData = async () => {
      try {
        // Kaleci grafik verilerini çek
        const kaleciResponse = await fetch('/api/kaleciler-grafik');
        if (!kaleciResponse.ok) {
          throw new Error('Veri çekme hatası: Kaleciler');
        }
        const kaleciResult = await kaleciResponse.json();
        
        // Defans grafik verilerini çek
        const defansResponse = await fetch('/api/defanslar-grafik');
        if (!defansResponse.ok) {
          throw new Error('Veri çekme hatası: Defanslar');
        }
        const defansResult = await defansResponse.json();
        
        // Orta saha grafik verilerini çek
        const ortaSahaResponse = await fetch('/api/ortasahalar-grafik');
        if (!ortaSahaResponse.ok) {
          throw new Error('Veri çekme hatası: Orta Sahalar');
        }
        const ortaSahaResult = await ortaSahaResponse.json();
        
        // Forvet grafik verilerini çek
        const forvetResponse = await fetch('/api/forvetler-grafik');
        if (!forvetResponse.ok) {
          throw new Error('Veri çekme hatası: Forvetler');
        }
        const forvetResult = await forvetResponse.json();
        
        setKaleciData(kaleciResult.data);
        setDefansData(defansResult.data);
        setOrtaSahaData(ortaSahaResult.data);
        setForvetData(forvetResult.data);
      } catch (err: any) {
        setError(err.message);
        console.error('Veri çekme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Grafikler için başlıklar
  const chartTitles = [
    "Kalecilik-Kaleciler",
    "Detaylı Kalecilik İstatistikleri-Kaleciler",
    "Pas-Kaleciler",
    "Savunma-Defanslar",
    "Genel Fiziksel İstatistik-Defanslar",
    "Asist-Defanslar",
    "Orta-Defanslar",
    "Hareketlilik-Defanslar",
    "Pas-Defanslar",
    "Topa Sahip Olma-Defanslar",
    "Hava Topu-Defanslar",
    "Savunma-Orta Sahalar",
    "Genel Fiziksel İstatistik-Orta Sahalar",
    "Asist-Orta Sahalar",
    "Orta-Orta Sahalar",
    "Golcülük-Orta Sahalar",
    "Pas-Orta Sahalar",
    "Pas Şablonu-Orta Sahalar",
    "Topa Sahip Olma-Orta Sahalar",
    "Hava Topu-Orta Sahalar",
    "Genel Fiziksel İstatistik-Forvetler",
    "Asist-Forvetler",
    "Orta-Forvetler",
    "Hareketlilik-Forvetler",
    "Pas-Forvetler",
    "Hava Topu-Forvetler", // Yeni eklenen grafik
    "Atılan Gol-Forvetler",
    "Golcülük-Forvetler",
    "Şut-Forvetler",
    "Genel Hücum Beklentisi-Forvetler"
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Veri Merkezi - Oyuncu</h1>
      
      {/* Secondary Navbar */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <Link href="/veri-merkezi/takim" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Takım
          </Link>
          <Link href="/veri-merkezi/oyuncu" className="py-2 px-4 text-gray-900 border-b-2 border-blue-500 font-medium">
            Oyuncu
          </Link>
        </nav>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Oyuncu Verileri</h2>
        
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Oyuncu ara..."
              className="w-full py-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Hata: {error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-2 transition-all duration-300">
            {chartTitles.map((title, index) => (
              <ChartContainer
                key={index}
                title={title}
                index={index}
                kaleciData={kaleciData}
                defansData={defansData}
                ortaSahaData={ortaSahaData}
                forvetData={forvetData}
                expandedChart={expandedChart}
                setExpandedChart={setExpandedChart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 