'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  Chart as ChartJS, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend,
  RadialLinearScale,
  RadarController,
  TooltipItem
} from 'chart.js';
import { Scatter, Radar } from 'react-chartjs-2';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  RadarController
);

// Tooltip davranışını ayarla
ChartJS.defaults.set('plugins.tooltip', {
  enabled: true,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  titleColor: 'white',
  bodyColor: 'white',
  displayColors: false
});

// Performans veri tipi
type PerformanceData = {
  takim_id: number;
  takim_adi: string;
  blabla_tkm: number;
  golMb_gnlprf: number;
  pnltszxg_gnlprf: number;
  ynlgolMb_gnlprf: number;
  klsndexgMb_gnlprf: number;
  sutMb_gnlprf: number;
  isbtlsutyzd_gnlprf: number;
  isbtlpasyzd_gnlprf: number;
  topmdhlkznmyzd_gnlprf: number;
};

// Takım veri tipi
type TeamData = {
  takim_id: number;
  takim_adi: string;
  blabla_tkm: number; // Changed from string to number as it's stored as INTEGER
  hvatpMb_HT: number;
  hvatpkznyzd_HT: number;
  pnltszxgMb_ag: number;
  klsndexgMb_ag: number;
  sutenglMb_svn: number;
  uzklstrmaMb_svn: number;
  klsndSutMb_svnetk: number;
  rkpGlCvrYzd_svnetk: number;
  ynlGolMb_klclk: number;
  klsndeSutMb_klclk: number;
  topMdhDnmMb_topmdh: number;
  topMdhKznYzd_topmdh: number;
  svnYprkRkpPas_prs: number;
  ortSvnHtYksMb_prs: number;
  rkpDrnTopAsstMb_SvnDTvrm: number;
  DrnTopRkpOrtMb_SvnDTvrm: number;
  xaDrnTopMb_hcmDTvrm: number;
  yplnOrtDtMb_hcmDTvrm: number;
  sutMb_hcmetkn: number;
  goleDnsYzd_hcmetkn: number;
  golMb_glclk: number;
  pnltszXgMb_glclk: number;
  isbtlSutMb_sut: number;
  sutBasınaXg_sut: number;
  golDt_DtGol: number;
  ynlGolDt_DtGol: number;
  pasDnmMb_pas: number;
  isbtlPasYzd_pas: number;
  rkpIsbtlPasSys_PasDnmk: number;
  isbtlPas_PasDnmk: number;
  rkpUcnBlgPasMb_UcBlgDmns: number;
  UcnBlgPasMb_UcBlgDmns: number;
  calimMb_hrktllk: number;
  topKybiMb_hrktllk: number;
  topKznMb_TopShp: number;
  topKybiMb_TopShp: number;
  ortDnmMb_ort: number;
  isbtlOrtYzd_ort: number;
  // Savunma (Takım) için yeni alanlar
  ynlGolMb_svntkm: number;
  klsndeXgMb_svntkm: number;
  golYmdMcSys_svntkm: number;
  topMdhKznYzd_svntkm: number;
  svnYprknRkpPas_svntkm: number;
  topKzn_svntkm: number;
  rkpUcnBlgPas_svntkm: number;
  yplnFaulMb_svntkm: number;
  // Pas için yeni alanlar
  golMb_hcmtkm: number;
  pnltszXgMb_hcmtkm: number;
  sutMb_hcmtkm: number;
  isbtlSutYzd_hcmtkm: number;
  calimMb_hcmtkm: number;
  isbtlOrt_hcmtkm: number;
  isbtlPasYzd_hcmtkm: number;
  kznlFaulMb_hcmtkm: number;
};

// Görseli önceden yükle
const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

// Grafik bileşeni - her grafik için ayrı
function ChartContainer({ 
  title, 
  index, 
  teamData, 
  teamLogo, 
  teamLogo70081151,
  teamLogo70055736,
  teamLogo70098997,
  teamLogo2000066740,
  teamLogo70135986,
  teamLogo70101850,
  teamLogo70135984,
  teamLogo2000066712,
  teamLogo70081157,
  teamLogo70081150,
  expandedChart, 
  setExpandedChart 
}: { 
  title: string; 
  index: number; 
  teamData: TeamData[]; 
  teamLogo: HTMLImageElement | null;
  teamLogo70081151: HTMLImageElement | null;
  teamLogo70055736: HTMLImageElement | null;
  teamLogo70098997: HTMLImageElement | null;
  teamLogo2000066740: HTMLImageElement | null;
  teamLogo70135986: HTMLImageElement | null;
  teamLogo70101850: HTMLImageElement | null;
  teamLogo70135984: HTMLImageElement | null;
  teamLogo2000066712: HTMLImageElement | null;
  teamLogo70081157: HTMLImageElement | null;
  teamLogo70081150: HTMLImageElement | null;
  expandedChart: number | null;
  setExpandedChart: (index: number | null) => void;
}) {
  const chartRef = useRef<any>(null);
  const isExpanded = expandedChart === index;

  // Team logo plugin'i - yüklenmiş görseli kullan
  const teamLogoPlugin = useMemo(() => {
    return {
      id: `teamLogo-${index}`,
      afterDatasetsDraw(chart: any) {
        if (!teamLogo && !teamLogo70081151 && !teamLogo70055736 && !teamLogo70098997 && !teamLogo2000066740 && !teamLogo70135986 && !teamLogo70101850 && !teamLogo70135984 && !teamLogo2000066712 && !teamLogo70081157 && !teamLogo70081150) return; // Logo yüklenmediyse işlem yapma
        
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset: any, i: number) => {
          const meta = chart.getDatasetMeta(i);
          
          if (!meta.hidden) {
            meta.data.forEach((element: any, dataIndex: number) => {
              const data = dataset.data[dataIndex];
              
              // takim_id 70108472 olan nokta için özel logo göster
              if (data.teamId === 70108472 && teamLogo) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 70081151 olan nokta için özel logo göster
              if (data.teamId === 70081151 && teamLogo70081151) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo70081151, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 70055736 olan nokta için özel logo göster
              if (data.teamId === 70055736 && teamLogo70055736) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo70055736, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 70098997 olan nokta için özel logo göster
              if (data.teamId === 70098997 && teamLogo70098997) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo70098997, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 2000066740 olan nokta için özel logo göster
              if (data.teamId === 2000066740 && teamLogo2000066740) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo2000066740, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 70135986 olan nokta için özel logo göster
              if (data.teamId === 70135986 && teamLogo70135986) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo70135986, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 70101850 olan nokta için özel logo göster
              if (data.teamId === 70101850 && teamLogo70101850) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo70101850, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 70135984 olan nokta için özel logo göster
              if (data.teamId === 70135984 && teamLogo70135984) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo70135984, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 2000066712 olan nokta için özel logo göster (2000066716.png görseli ile)
              if (data.teamId === 2000066712 && teamLogo2000066712) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo2000066712, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 70081157 olan nokta için özel logo göster
              if (data.teamId === 70081157 && teamLogo70081157) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo70081157, x - width/2, y - height/2, width, height);
              }
              
              // takim_id 70081150 olan nokta için özel logo göster
              if (data.teamId === 70081150 && teamLogo70081150) {
                // Nokta konumunu al
                const x = element.x;
                const y = element.y;

                // Logoyu çiz (merkezi nokta konumunda olsun)
                const width = 25; // Logo genişliği
                const height = 18; // Logo yüksekliği
                ctx.drawImage(teamLogo70081150, x - width/2, y - height/2, width, height);
              }
            });
          }
        });
      }
    };
  }, [teamLogo, teamLogo70081151, teamLogo70055736, teamLogo70098997, teamLogo2000066740, teamLogo70135986, teamLogo70101850, teamLogo70135984, teamLogo2000066712, teamLogo70081157, teamLogo70081150, index]);

  // Hava Topu grafiği için referans çizgileri plugin'i
  const referenceLinePlugin = useMemo(() => {
    return {
      id: `referenceLines-${index}`,
      afterDatasetsDraw(chart: any) {
        // Sadece Hava Topu, Atılan Gol, Savunma, Savunma Etkinliği, Kalecilik, Topa Müdahale, Pres Şiddeti, Savunmadaki Duran Top Verimliliği, Hücumdaki Duran Top Verimliliği, Hücum Etkinliği, Golcülük, Şut, Duran Toplardan Goller, Pas, Pas Dinamikleri, 3. Bölge Dominasyonu, Hareketlilik, Topa Sahip Olma, Orta grafiği için çalış
        if ((title !== "Hava Topu" && index !== 0) && 
            (title !== "Atılan Gol" && index !== 2) && 
            (title !== "Savunma" && index !== 3) &&
            (title !== "Savunma Etkinliği" && index !== 4) &&
            (title !== "Kalecilik" && index !== 5) &&
            (title !== "Topa Müdahale" && index !== 6) &&
            (title !== "Pres Şiddeti" && index !== 7) &&
            (title !== "Savunmadaki Duran Top Verimliliği" && index !== 8) &&
            (title !== "Hücumdaki Duran Top Verimliliği" && index !== 10) &&
            (title !== "Hücum Etkinliği" && index !== 11) &&
            (title !== "Golcülük" && index !== 12) &&
            (title !== "Şut" && index !== 13) &&
            (title !== "Duran Toplardan Goller" && index !== 14) && 
            (title !== "Pas" && index !== 15) &&
            (title !== "Pas Dinamikleri" && index !== 17) &&
            (title !== "3. Bölge Dominasyonu" && index !== 18) &&
            (title !== "Hareketlilik" && index !== 19) &&
            (title !== "Topa Sahip Olma" && index !== 20) &&
            (title !== "Orta" && index !== 21)) return;

        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x || !scales.y) return; // Grafik alanı henüz hazır değilse çık
        
        const { top, bottom, left, right } = chartArea;
        
        if (title === "Hava Topu" || index === 0) {
          // Yatay çizgi (y=59) için
          const yPos = scales.y.getPixelForValue(59);
          
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
            ctx.fillText('59', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=49) için
          const xPos = scales.x.getPixelForValue(49);
          
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
            ctx.fillText('49', xPos, top - 5);
          }
        }
        
        if (title === "Atılan Gol" || index === 2) {
          // Yatay çizgi (y=1.10) için
          const yPos = scales.y.getPixelForValue(1.10);
          
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
            ctx.fillText('1.10', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=1.37) için
          const xPos = scales.x.getPixelForValue(1.37);
          
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
            ctx.fillText('1.37', xPos, top - 5);
          }
        }
        
        if (title === "Savunma" || index === 3) {
          // Yatay çizgi (y=3) için
          const yPos = scales.y.getPixelForValue(3);
          
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
            ctx.fillText('3', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=21) için
          const xPos = scales.x.getPixelForValue(21);
          
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
            ctx.fillText('21', xPos, top - 5);
          }
        }
        
        if (title === "Savunma Etkinliği" || index === 4) {
          // Yatay çizgi (y=10.50) için
          const yPos = scales.y.getPixelForValue(10.50);
          
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
            ctx.fillText('10.50', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=13.90) için
          const xPos = scales.x.getPixelForValue(13.90);
          
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
            ctx.fillText('13.90', xPos, top - 5);
          }
        }
        
        if (title === "Kalecilik" || index === 5) {
          // Yatay çizgi (y=1.50) için
          const yPos = scales.y.getPixelForValue(1.50);
          
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
            ctx.fillText('1.50', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=10.60) için
          const xPos = scales.x.getPixelForValue(10.60);
          
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
            ctx.fillText('10.60', xPos, top - 5);
          }
        }
        
        if (title === "Topa Müdahale" || index === 6) {
          // Yatay çizgi (y=17.90) için
          const yPos = scales.y.getPixelForValue(17.90);
          
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
            ctx.fillText('17.90', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=77.50) için
          const xPos = scales.x.getPixelForValue(77.50);
          
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
            ctx.fillText('77.50', xPos, top - 5);
          }
        }
        
        if (title === "Pres Şiddeti" || index === 7) {
          // Yatay çizgi (y=4.70) için
          const yPos = scales.y.getPixelForValue(4.70);
          
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
            ctx.fillText('4.70', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=35.85) için
          const xPos = scales.x.getPixelForValue(35.85);
          
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
            ctx.fillText('35.85', xPos, top - 5);
          }
        }
        
        if (title === "Savunmadaki Duran Top Verimliliği" || index === 8) {
          // Yatay çizgi (y=0.12) için
          const yPos = scales.y.getPixelForValue(0.12);
          
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
            ctx.fillText('0.12', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=7.85) için
          const xPos = scales.x.getPixelForValue(7.85);
          
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
            ctx.fillText('7.85', xPos, top - 5);
          }
        }
        
        if (title === "Hücumdaki Duran Top Verimliliği" || index === 10) {
          // Yatay çizgi (y=0.12) için
          const yPos = scales.y.getPixelForValue(0.12);
          
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
            ctx.fillText('0.12', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=7.85) için
          const xPos = scales.x.getPixelForValue(7.85);
          
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
            ctx.fillText('7.85', xPos, top - 5);
          }
        }
        
        if (title === "Hücum Etkinliği" || index === 11) {
          // Yatay çizgi (y=10.30) için
          const yPos = scales.y.getPixelForValue(10.30);
          
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
            ctx.fillText('10.30', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=14) için
          const xPos = scales.x.getPixelForValue(14);
          
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
            ctx.fillText('14', xPos, top - 5);
          }
        }
        
        if (title === "Golcülük" || index === 12) {
          // Yatay çizgi (y=1.43) için
          const yPos = scales.y.getPixelForValue(1.43);
          
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
            ctx.fillText('1.43', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=1.07) için
          const xPos = scales.x.getPixelForValue(1.07);
          
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
            ctx.fillText('1.07', xPos, top - 5);
          }
        }
        
        if (title === "Şut" && index === 13) {
          // Yatay çizgi (y=4.15) için
          const yPos = scales.y.getPixelForValue(4.15);
          
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
            ctx.fillText('4.15', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=0.1350) için
          const xPos = scales.x.getPixelForValue(0.1350);
          
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
            ctx.fillText('0.1350', xPos, top - 5);
          }
        }
        
        if (title === "Duran Toplardan Goller" || index === 14) {
          // Yatay çizgi (y=5.50) için
          const yPos = scales.y.getPixelForValue(5.50);
          
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
            ctx.fillText('5.50', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=5.50) için
          const xPos = scales.x.getPixelForValue(5.50);
          
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
            ctx.fillText('5.50', xPos, top - 5);
          }

          ctx.restore();
        }
        
        if (title === "Pas" || index === 15) {
          // Yatay çizgi (y=440) için
          const yPos = scales.y.getPixelForValue(440);
          
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
            ctx.fillText('440', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=84) için
          const xPos = scales.x.getPixelForValue(84);
          
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
            ctx.fillText('84', xPos, top - 5);
          }

          ctx.restore();
        }
        
        if (title === "Pas Dinamikleri" || index === 17) {
          // Yatay çizgi (y=7600) için
          const yPos = scales.y.getPixelForValue(7600);
          
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
            ctx.fillText('7600', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=7600) için
          const xPos = scales.x.getPixelForValue(7600);
          
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
            ctx.fillText('7600', xPos, top - 5);
          }

          ctx.restore();
        }
        
        if (title === "3. Bölge Dominasyonu" || index === 18) {
          // Yatay çizgi (y=52) için
          const yPos = scales.y.getPixelForValue(52);
          
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
            ctx.fillText('52', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=52) için
          const xPos = scales.x.getPixelForValue(52);
          
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
            ctx.fillText('52', xPos, top - 5);
          }

          ctx.restore();
        }
        
        if (title === "Hareketlilik" || index === 19) {
          // Yatay çizgi (y=7.35) için
          const yPos = scales.y.getPixelForValue(7.35);
          
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
            ctx.fillText('7.35', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=101) için
          const xPos = scales.x.getPixelForValue(101);
          
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
            ctx.fillText('101', xPos, top - 5);
          }

          ctx.restore();
        }
        
        if (title === "Topa Sahip Olma" || index === 20) {
          // Yatay çizgi (y=86) için
          const yPos = scales.y.getPixelForValue(86);
          
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
            ctx.fillText('86', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=101) için
          const xPos = scales.x.getPixelForValue(101);
          
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
            ctx.fillText('101', xPos, top - 5);
          }

          ctx.restore();
        }
        
        if (title === "Orta" || index === 21) {
          // Yatay çizgi (y=26) için
          const yPos = scales.y.getPixelForValue(26);
          
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
            ctx.fillText('26', right + 5, yPos + 4);
          }
          
          // Dikey çizgi (x=15.50) için
          const xPos = scales.x.getPixelForValue(15.50);
          
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
            ctx.fillText('15.50', xPos, top - 5);
          }

          ctx.restore();
        }
        
        ctx.restore();
      }
    };
  }, [title, index, isExpanded]);

  // Grafik verilerini hazırla
  const chartData = useMemo(() => {
    // Her grafik için kullanılacak x ve y eksenlerini belirle
    let xKey = 'hvatpkznyzd_HT';
    let yKey = 'hvatpMb_HT';
    let xLabel = 'hvatpkznyzd_HT';
    let yLabel = 'hvatpMb_HT';

    // "Goller ve Asistler" grafiği için özel veri kolonu kullan
    if (title === "Atılan Gol" || index === 2) {
      xKey = 'klsndexgMb_ag';
      yKey = 'pnltszxgMb_ag';
      xLabel = 'Kalesinde Maç Başına Gol Beklentisi';
      yLabel = '90 Dakika Başına Penaltı Harici Gol Beklentisi';
    }
    
    // "Savunma" grafiği için özel veri kolonu kullan
    if (title === "Savunma" || index === 3) {
      xKey = 'uzklstrmaMb_svn';
      yKey = 'sutenglMb_svn';
      xLabel = 'Maç Başına Yapılan Uzaklaştırma';
      yLabel = 'Maç Başına Engelleme';
    }
    
    // "Savunma Etkinliği" grafiği için özel veri kolonu kullan
    if (title === "Savunma Etkinliği" || index === 4) {
      xKey = 'rkpGlCvrYzd_svnetk';
      yKey = 'klsndSutMb_svnetk';
      xLabel = 'Rakibin Gole Çevirme Oranı (%)';
      yLabel = 'Maç Başına Kalesine Çekilen Şutlar';
    }
    
    // "Kalecilik" grafiği için özel veri kolonu kullan
    if (title === "Kalecilik" || index === 5) {
      xKey = 'klsndeSutMb_klclk';
      yKey = 'ynlGolMb_klclk';
      xLabel = 'klsndeSutMb_klclk';
      yLabel = 'ynlGolMb_klclk';
    }
    
    // "Topa Müdahale" grafiği için özel veri kolonu kullan
    if (title === "Topa Müdahale" || index === 6) {
      xKey = 'topMdhKznYzd_topmdh';
      yKey = 'topMdhDnmMb_topmdh';
      xLabel = 'Topa Müdahale Kazanma Oranı (%)';
      yLabel = 'Maç Başına Topa Müdahale Denemesi';
    }
    
    // "Pres Şiddeti" grafiği için özel veri kolonu kullan
    if (title === "Pres Şiddeti" || index === 7) {
      xKey = 'ortSvnHtYksMb_prs';
      yKey = 'svnYprkRkpPas_prs';
      xLabel = 'Maç Başına Savunma Hattı Yüksekliği (Yarda)';
      yLabel = 'Savunma Yapıyorken Rakibin Yaptığı Paslaşma';
    }
    
    // "Savunmadaki Duran Top Verimliliği" grafiği için özel veri kolonu kullan
    if (title === "Savunmadaki Duran Top Verimliliği" || index === 8) {
      xKey = 'DrnTopRkpOrtMb_SvnDTvrm';
      yKey = 'rkpDrnTopAsstMb_SvnDTvrm';
      xLabel = 'Maç Başına Duran Toplardan Rakibin Yaptığı Ortalar';
      yLabel = 'Rakibin Duran Toplarda Maç Başına Yaptığı Asist Sayısı';
    }
    
    // "Hücumdaki Duran Top Verimliliği" grafiği için özel veri kolonu kullan
    if (title === "Hücumdaki Duran Top Verimliliği" || index === 10) {
      xKey = 'yplnOrtDtMb_hcmDTvrm';
      yKey = 'xaDrnTopMb_hcmDTvrm';
      xLabel = 'Maç Başına Duran Toplardan Yapılan Ortalar';
      yLabel = 'Maç Başına Duran Toplardan Asist Beklentisi';
    }
    
    // "Hücum Etkinliği" grafiği için özel veri kolonu kullan
    if (title === "Hücum Etkinliği" || index === 11) {
      xKey = 'goleDnsYzd_hcmetkn';
      yKey = 'sutMb_hcmetkn';
      xLabel = 'Gole Dönüşme Oranı (%)';
      yLabel = 'Maç Başına Şut';
    }
    
    // "Golcülük" grafiği için özel veri kolonu kullan
    if (title === "Golcülük" || index === 12) {
      xKey = 'pnltszXgMb_glclk';
      yKey = 'golMb_glclk';
      xLabel = '90 Dakika Başına Penaltı Harici Gol Beklentisi';
      yLabel = 'Maç Başına Gol Sayısı';
    }
    
    // "Şut" grafiği için özel veri kolonu kullan
    if (title === "Şut" || index === 13) {
      xKey = 'sutBasınaXg_sut';
      yKey = 'isbtlSutMb_sut';
      xLabel = 'Şut Başına Gol Beklentisi';
      yLabel = 'Maç Başına İsabetli Şut';
    }
    
    // "Duran Toplardan Goller" grafiği için özel veri kolonu kullan
    if (title === "Duran Toplardan Goller" || index === 14) {
      xKey = 'ynlGolDt_DtGol';
      yKey = 'golDt_DtGol';
      xLabel = 'Duran Toptan Yenilen Gol';
      yLabel = 'Duran Toptan Atılan Gol';
    }
    
    // "Hücum (Takım)" grafiği için özel veri kolonu kullan
    if (title === "Hücum (Takım)" || index === 16) {
      xKey = 'isbtlPasYzd_pas';
      yKey = 'pasDnmMb_pas';
      xLabel = 'isbtlPasYzd_pas';
      yLabel = 'pasDnmMb_pas';
    }
    
    // "Pas" grafiği için özel veri kolonu kullan
    if (title === "Pas" || index === 15) {
      xKey = 'isbtlPasYzd_pas';
      yKey = 'pasDnmMb_pas';
      xLabel = 'İsabetli Pas Oranı (%)';
      yLabel = 'Maç Başına Pas Denemesi';
    }
    
    // "Pas Dinamikleri" grafiği için özel veri kolonu kullan
    if (title === "Pas Dinamikleri" || index === 17) {
      xKey = 'isbtlPas_PasDnmk';
      yKey = 'rkpIsbtlPasSys_PasDnmk';
      xLabel = 'İsabetli Pas';
      yLabel = 'Rakibin İsabetli Pas Sayısı';
    }
    
    // "3. Bölge Dominasyonu" grafiği için özel veri kolonu kullan
    if (title === "3. Bölge Dominasyonu" || index === 18) {
      xKey = 'UcnBlgPasMb_UcBlgDmns';
      yKey = 'rkpUcnBlgPasMb_UcBlgDmns';
      xLabel = 'Maç Başına 3. Bölgedeki Paslaşmalar';
      yLabel = 'Maç Başına Rakibin 3. Bölgede Yaptığı Pas';
    }
    
    // "Hareketlilik" grafiği için özel veri kolonu kullan
    if (title === "Hareketlilik" || index === 19) {
      xKey = 'topKybiMb_hrktllk';
      yKey = 'calimMb_hrktllk';
      xLabel = 'Maç Başına Yapılan Top Kaybı';
      yLabel = 'Maç Başına Çalım';
    }
    
    // "Topa Sahip Olma" grafiği için özel veri kolonu kullan
    if (title === "Topa Sahip Olma" || index === 20) {
      xKey = 'topKybiMb_TopShp';
      yKey = 'topKznMb_TopShp';
      xLabel = 'Maç Başına Yapılan Top Kaybı';
      yLabel = 'Maç Başına Top Kazanma';
    }
    
    // "Orta" grafiği için özel veri kolonu kullan
    if (title === "Orta" || index === 21) {
      xKey = 'isbtlOrtYzd_ort';
      yKey = 'ortDnmMb_ort';
      xLabel = 'İsabetli Orta (%)';
      yLabel = 'Maç Başına Yapılan Orta Denemesi';
    }

    return {
      datasets: [
        {
          label: 'Takım İstatistikleri',
          data: teamData.map(team => {
            // Her bir takım için verileri düzgün şekilde tanımla
            const teamName = team.takim_adi || team.blabla_tkm || `Takım ID: ${team.takim_id}`; 
            return {
              x: team[xKey as keyof TeamData] as number,
              y: team[yKey as keyof TeamData] as number,
              teamId: team.takim_id,
              // String olarak takım adını ayarla
              takimAdi: teamName
            };
          }),
          // Özel logo gösterilecek takımlar için nokta görünürlüğünü ayarla
          pointStyle: teamData.map(team => (
            team.takim_id === 70108472 || 
            team.takim_id === 70081151 || 
            team.takim_id === 70055736 || 
            team.takim_id === 70098997 || 
            team.takim_id === 2000066740 || 
            team.takim_id === 70135986 ||
            team.takim_id === 70101850 ||
            team.takim_id === 70135984 ||
            team.takim_id === 2000066712 ||
            team.takim_id === 70081157 ||
            team.takim_id === 70081150
            ? false : 'circle')),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          pointRadius: isExpanded ? 6 : 4,
          pointHoverRadius: isExpanded ? 8 : 6,
          pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
        },
      ],
    };
  }, [teamData, isExpanded, title, index]);

  const chartOptions = useMemo(() => {
    // Her grafik için kullanılacak x ve y eksenlerini belirle
    let xLabel = 'Kafa Topu Kazanma Oranı (%)';
    let yLabel = 'Maç Başına Yapılan Hava Topu Denemesi';
    let xMin = 40;
    let xMax = 65;
    let yMin = undefined;
    let yMax = undefined;

    // "Goller ve Asistler" grafiği için özel veri kolonu etiketleri
    if (title === "Atılan Gol" || index === 2) {
      xLabel = 'Kalesinde Maç Başına Gol Beklentisi';
      yLabel = '90 Dakika Başına Penaltı Harici Gol Beklentisi';
      xMin = 0.68;
      xMax = 2.20;
      yMin = 0.51;
      yMax = 1.80;
    }
    
    // "Savunma" grafiği için özel veri kolonu etiketleri
    if (title === "Savunma" || index === 3) {
      xLabel = 'Maç Başına Yapılan Uzaklaştırma';
      yLabel = 'Maç Başına Engelleme';
      xMin = 10;
      xMax = 30;
      yMin = 1.28;
    }
    
    // "Savunma Etkinliği" grafiği için özel veri kolonu etiketleri
    if (title === "Savunma Etkinliği" || index === 4) {
      xLabel = 'Rakibin Gole Çevirme Oranı (%)';
      yLabel = 'Maç Başına Kalesine Çekilen Şutlar';
      xMin = 10;
      xMax = 20;
    }
    
    // "Kalecilik" grafiği için özel veri kolonu etiketleri
    if (title === "Kalecilik" || index === 5) {
      xLabel = 'Maç Başına Kalesine Çekilen Şutlar';
      yLabel = 'Maç Başına Yenilen Gol';
      xMin = 6;
      xMax = 16;
      yMin = 0.70;
      yMax = 2.80;
    }
    
    // "Topa Müdahale" grafiği için özel veri kolonu etiketleri
    if (title === "Topa Müdahale" || index === 6) {
      xLabel = 'Topa Müdahale Kazanma Oranı (%)';
      yLabel = 'Maç Başına Topa Müdahale Denemesi';
      xMin = 70;
      xMax = 85;
      yMin = 14;
      yMax = 22;
    }
    
    // "Pres Şiddeti" grafiği için özel veri kolonu etiketleri
    if (title === "Pres Şiddeti" || index === 7) {
      xLabel = 'Maç Başına Savunma Hattı Yüksekliği (Yarda)';
      yLabel = 'Savunma Yapıyorken Rakibin Yaptığı Paslaşma';
      xMin = 32;
      xMax = 40;
      yMin = 4;
      yMax = 6;
    }
    
    // "Savunmadaki Duran Top Verimliliği" grafiği için özel veri kolonu etiketleri
    if (title === "Savunmadaki Duran Top Verimliliği" || index === 8) {
      xLabel = 'Maç Başına Duran Toplardan Rakibin Yaptığı Ortalar';
      yLabel = 'Rakibin Duran Toplarda Maç Başına Yaptığı Asist Sayısı';
      xMin = 4;
      xMax = 12;
      yMin = 0;
      yMax = 0.21;
    }
    
    // "Hücumdaki Duran Top Verimliliği" grafiği için özel veri kolonu etiketleri
    if (title === "Hücumdaki Duran Top Verimliliği" || index === 10) {
      xLabel = 'Maç Başına Duran Toplardan Yapılan Ortalar';
      yLabel = 'Maç Başına Duran Toplardan Asist Beklentisi';
      xMin = 4;
      xMax = 12;
      yMin = 0;
      yMax = 0.23;
    }
    
    // "Hücum Etkinliği" grafiği için özel veri kolonu etiketleri
    if (title === "Hücum Etkinliği" || index === 11) {
      xLabel = 'Gole Dönüşme Oranı (%)';
      yLabel = 'Maç Başına Şut';
      xMin = 8;
      xMax = 20;
      yMin = 6;
      yMax = 14;
    }
    
    // "Golcülük" grafiği için özel veri kolonu etiketleri
    if (title === "Golcülük" || index === 12) {
      xLabel = '90 Dakika Başına Penaltı Harici Gol Beklentisi';
      yLabel = 'Maç Başına Gol Sayısı';
      xMin = 0.51;
      xMax = 1.75;
      yMin = 0.59;
      yMax = 2.76;
    }
    
    // "Şut" grafiği için özel veri kolonu etiketleri
    if (title === "Şut" || index === 13) {
      xLabel = 'Şut Başına Gol Beklentisi';
      yLabel = 'Maç Başına İsabetli Şut';
      xMin = 0.10;
      xMax = 0.16;
      yMin = 2;
      yMax = 7;
    }
    
    // "Duran Toplardan Goller" grafiği için özel veri kolonu etiketleri
    if (title === "Duran Toplardan Goller" || index === 14) {
      xLabel = 'Duran Toptan Yenilen Gol';
      yLabel = 'Duran Toptan Atılan Gol';
      xMin = 0;
      xMax = 15;
      yMin = 0;
      yMax = 15;
    }
    
    // "Hücum (Takım)" grafiği için özel veri kolonu etiketleri
    if (title === "Hücum (Takım)" || index === 16) {
      xLabel = 'isbtlPasYzd_pas';
      yLabel = 'pasDnmMb_pas';
      xMin = 75;
      xMax = 90;
      yMin = 300;
      yMax = 600;
    }
    
    // "Pas" grafiği için özel veri kolonu etiketleri
    if (title === "Pas" || index === 15) {
      xLabel = 'İsabetli Pas Oranı (%)';
      yLabel = 'Maç Başına Pas Denemesi';
      xMin = 75;
      xMax = 90;
      yMin = 300;
      yMax = 600;
    }
    
    // "Pas Dinamikleri" grafiği için özel veri kolonu etiketleri
    if (title === "Pas Dinamikleri" || index === 17) {
      xLabel = 'İsabetli Pas';
      yLabel = 'Rakibin İsabetli Pas Sayısı';
      xMin = 4800;
      xMax = 10800;
      yMin = 6000;
      yMax = 9000;
    }
    
    // "3. Bölge Dominasyonu" grafiği için özel veri kolonu etiketleri
    if (title === "3. Bölge Dominasyonu" || index === 18) {
      xLabel = 'Maç Başına 3. Bölgedeki Paslaşmalar';
      yLabel = 'Maç Başına Rakibin 3. Bölgede Yaptığı Pas';
      xMin = 30;
      xMax = 80;
      yMin = 40;
      yMax = 80;
    }
    
    // "Hareketlilik" grafiği için özel veri kolonu etiketleri
    if (title === "Hareketlilik" || index === 19) {
      xLabel = 'Maç Başına Yapılan Top Kaybı';
      yLabel = 'Maç Başına Çalım';
      xMin = 90;
      xMax = 110;
      yMin = 5;
      yMax = 10;
    }
    
    // "Topa Sahip Olma" grafiği için özel veri kolonu etiketleri
    if (title === "Topa Sahip Olma" || index === 20) {
      xLabel = 'Maç Başına Yapılan Top Kaybı';
      yLabel = 'Maç Başına Top Kazanma';
      xMin = 90;
      xMax = 110;
      yMin = 75;
      yMax = 95;
    }
    
    // "Orta" grafiği için özel veri kolonu etiketleri
    if (title === "Orta" || index === 21) {
      xLabel = 'İsabetli Orta (%)';
      yLabel = 'Maç Başına Yapılan Orta Denemesi';
      xMin = 10;
      xMax = 25;
      yMin = 15;
      yMax = 40;
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
            // Sadece takım adını göster
            title: function(tooltipItems: any[]) {
              return tooltipItems[0].raw.takimAdi;
            },
            // Label'ı boş bırak - hiçbir şey gösterme
            label: function() {
              return []; // Boş bir array döndür
            }
          }
        },
        legend: {
          display: false  // Legend'ı gizle
        }
      }
    };
  }, [isExpanded, title, index]);

  // Grafiği büyüt/küçült
  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedChart(null);
    } else {
      setExpandedChart(index);
    }
  };

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
        {isExpanded && (title === "Hava Topu" || title === "Atılan Gol" || title === "Savunma" || title === "Savunma Etkinliği" || title === "Kalecilik" || title === "Topa Müdahale" || title === "Pres Şiddeti" || title === "Savunmadaki Duran Top Verimliliği" || title === "Hücumdaki Duran Top Verimliliği" || title === "Hücum Etkinliği" || title === "Golcülük" || title === "Şut" || title === "Duran Toplardan Goller" || title === "Pas" || title === "Pas Dinamikleri" || title === "3. Bölge Dominasyonu" || title === "Hareketlilik" || title === "Topa Sahip Olma" || title === "Orta") ? (
          <div className="flex">
            {/* Sol taraftaki metin konteynırı */}
            <div className="w-1/4 pr-4">
              <div className="bg-gray-50 p-3 rounded-lg h-full">
                {title === "Hava Topu" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Hava Topu Analizi</h4>
                    <p className="text-xs mb-2">Orta yapma istatistiklerimiz insanın ağzını açık bırakıyor.</p>
                    <p className="text-xs mb-2">Genel ortalamaya göre daha az orta yapıyoruz.</p>
                    <p className="text-xs">İsabetli orta yüzdemiz genel ortalamaya göre daha yüksek.</p>
                  </>
                )}
                                  {title === "Atılan Gol" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Atılan Gol Analizi</h4>
                    <p className="text-xs mb-2">Genel hücum istatistiklerimiz bir kez daha gözden geçirilmeyi hak ediyor.</p>
                    <p className="text-xs mb-2">Penaltı harici gol beklentimiz genel ortalamanın altında.</p>
                    <p className="text-xs">Rakibe verdiğimiz toplam önemli gol pozisyonu sayısı genel ortalamaya göre daha yüksek.</p>
                  </>
                )}
                {title === "Savunma" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Savunma Analizi</h4>
                    <p className="text-xs mb-2">Savunma istatistiklerimiz standartın çok hafif dışında.</p>
                    <p className="text-xs mb-2">Şut engelleme sayımız genel ortalamaya göre daha fazla.</p>
                    <p className="text-xs">Topu uzaklaştırma sayımız genel ortalamaya göre daha yüksek.</p>
                  </>
                )}
                {title === "Savunma Etkinliği" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Savunma Etkinliği Analizi</h4>
                    <p className="text-xs mb-2">Ortalamaya göre kalemizde daha fazla şut gördük.</p>
                    <p className="text-xs mb-2">Kalemize çekilen şut ortalamasına göre daha fazla gol yedik.</p>
                    <p className="text-xs"></p>
                  </>
                )}
                {title === "Kalecilik" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Kalecilik Analizi</h4>
                    <p className="text-xs mb-2">Genel ortalamaya göre maç başına daha fazla gol yedik.</p>
                    <p className="text-xs mb-2">Ortalamaya göre kalemizde daha fazla şut gördük.</p>
                    <p className="text-xs"></p>
                  </>
                )}
                {title === "Topa Müdahale" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Topa Müdahale Analizi</h4>
                    <p className="text-xs mb-2">Top kapma istatistiklerimiz incelemeye değer gibi duruyor.</p>
                    <p className="text-xs mb-2">Genel ortalamaya göre daha çok top kapıyoruz.</p>
                    <p className="text-xs">Yaptığımız müdahalelerde topu kapma yüzdemiz genel ortalamaya göre daha düşük.</p>
                  </>
                )}
                {title === "Pres Şiddeti" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Pres Şiddeti Analizi</h4>
                    <p className="text-xs mb-2">Defansif hamle yapmadan rakibin pas yapmasına yüksek sayıda izin verdik.</p>
                    <p className="text-xs mb-2">Savunma hattımızı genele göre daha önde kuruyoruz.</p>
                    <p className="text-xs"></p>
                  </>
                )}
                {title === "Savunmadaki Duran Top Verimliliği" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Savunmadaki Duran Top Verimliliği Analizi</h4>
                    <p className="text-xs mb-2">İsabetli duran top istatistiğimiz ilgi çekici.</p>
                    <p className="text-xs mb-2">Duran toplardan rakiplerimizin elde ettiği xA oranı ortalamanın altında.</p>
                    <p className="text-xs">Duran toplarda rakiplerimizin yaptığı isabetli ortalama sayısı ortalamanın üstünde.</p>
                  </>
                )}
                {title === "Hücumdaki Duran Top Verimliliği" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Hücumdaki Duran Top Verimliliği Analizi</h4>
                    <p className="text-xs mb-2">Duran topları isabetli kullanma konusundaki istatistiğimizi daha iyi incelemek gerekiyor.</p>
                    <p className="text-xs mb-2">Duran toplardan elde ettiğimiz xA oranı ortalamanın üstünde.</p>
                    <p className="text-xs">Duran toplarda yaptığımız isabetli orta sayısı ortalamanın altında.</p>
                  </>
                )}
                {title === "Hücum Etkinliği" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Hücum Etkinliği Analizi</h4>
                    <p className="text-xs mb-2">Ofansif verimlilik istatistiklerimiz idare eder seviyede.</p>
                    <p className="text-xs mb-2">Ortalamaya göre daha az şut çektik.</p>
                    <p className="text-xs">Birçok takıma göre son vuruşlarda daha kötüyüz.</p>
                  </>
                )}
                {title === "Golcülük" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Golcülük Analizi</h4>
                    <p className="text-xs mb-2">Gol bulma istatistiklerimizin çok hafif bir ilgi çekiciliği var.</p>
                    <p className="text-xs mb-2">Genel ortalamaya göre daha az gol atıyoruz.</p>
                    <p className="text-xs">Penaltı harici gol beklentimiz genel ortalamanın altında.</p>
                  </>
                )}
                {title === "Şut" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Şut Analizi</h4>
                    <p className="text-xs mb-2">Şut istatistiklerimiz ilgi çekici olabilir.</p>
                    <p className="text-xs mb-2">Maç başına isabetli şutta ortalamanın altındayız.</p>
                    <p className="text-xs">Gol pozisyonlarımızın ortalama tehlike oranı çoğu takımdan daha iyi.</p>
                  </>
                )}
                {title === "Duran Toplardan Goller" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Duran Toplardan Goller Analizi</h4>
                    <p className="text-xs mb-2">Duran toplardan bulduğumuz gol istatistiğimiz ilgi çekici.</p>
                    <p className="text-xs mb-2">Duran toplardan bulduğumuz gol sayısı genel ortalamaya göre daha düşük.</p>
                    <p className="text-xs">Duran toplardan yediğimiz gol sayısı genel ortalamaya göre daha yüksek.</p>
                  </>
                )}
                {title === "Pas" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Pas Analizi</h4>
                    <p className="text-xs mb-2">Pas istatistiklerimiz göz alıcı.</p>
                    <p className="text-xs mb-2">Genel ortalamaya göre daha az pas yapıyoruz.</p>
                    <p className="text-xs">İsabetli pas yüzdemiz genel ortalamaya göre daha kötü.</p>
                  </>
                )}
                {title === "Pas Dinamikleri" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">Pas Dinamikleri Analizi</h4>
                    <p className="text-xs mb-2">Pas dinamikleri konusunda göz atmaya değer bir istatistiğimiz var.</p>
                    <p className="text-xs mb-2">Bize karşı oynadıklarında genel ortalamaya göre takımlar daha fazla isabetli pas yapıyorlar.</p>
                    <p className="text-xs">Genel ortalamaya göre daha az pas yapıyoruz.</p>
                  </>
                )}
                {title === "3. Bölge Dominasyonu" && (
                  <>
                    <h4 className="font-semibold text-sm mb-2">3. Bölge Dominasyonu Analizi</h4>
                    <p className="text-xs mb-2">Üçüncü bölgedeki dominasyon istatistiğimiz göz atmaya değer nitelikte.</p>
                    <p className="text-xs mb-2">Rakip takımlar ortalamaya göre üçüncü bölgemizde daha az pas yaptı.</p>
                    <p className="text-xs">Ortalamaya göre maç başına daha fazla üçüncü bölgede pas yaptık.</p>
                  </>
                )}
                                  {title === "Hareketlilik" && (
                    <>
                      <h4 className="font-semibold text-sm mb-2">Hareketlilik Analizi</h4>
                      <p className="text-xs mb-2">Hücum organizasyonu istatistiklerimiz ortalamadan oldukça farklı bir seviyede.</p>
                      <p className="text-xs mb-2">Genel ortalamaya göre daha az top sürme yapıyoruz.</p>
                      <p className="text-xs">Genel ortalamaya göre daha az top kaybı yapıyoruz.</p>
                    </>
                  )}
                  {title === "Topa Sahip Olma" && (
                    <>
                      <h4 className="font-semibold text-sm mb-2">Topa Sahip Olma Analizi</h4>
                      <p className="text-xs mb-2">Topa sahip olma istatistiklerimiz son derece büyüleyici.</p>
                      <p className="text-xs mb-2">Topu geri kazanma sayımız genel ortalamaya göre daha düşük.</p>
                      <p className="text-xs">Genel ortalamaya göre daha az top kaybı yapıyoruz.</p>
                    </>
                  )}
                  {title === "Orta" && (
                    <>
                      <h4 className="font-semibold text-sm mb-2">Orta Analizi</h4>
                      <p className="text-xs mb-2">Orta yapma istatistiklerimiz insanın ağzını açık bırakıyor.</p>
                      <p className="text-xs mb-2">Genel ortalamaya göre daha az orta yapıyoruz.</p>
                      <p className="text-xs">İsabetli orta yüzdemiz genel ortalamaya göre daha yüksek.</p>
                    </>
                  )}
              </div>
            </div>
            
            {/* Sağ taraftaki grafik konteynırı */}
            <div className="w-3/4 relative">
              <div className="w-full relative transition-all duration-300 h-[400px]">
                {title === "Hava Topu" && (
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
                
                {title === "Atılan Gol" && (
                  <>
                    {/* Sol üst köşe - Yeşil */}
                    <div className="absolute ml-13 mt-3 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Savunmada Güçlü</div>
                    </div>
                    
                    {/* Sağ üst köşe - Sarı */}
                    <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 215, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 215, 0, 1)' }}>Savunmada Kötü</div>
                    </div>
                    
                    {/* Sol alt köşe - Sarı */}
                    <div className="absolute bottom-0 ml-13 mb-12 text-left z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 215, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 215, 0, 1)' }}>Savunmada Güçlü</div>
                    </div>
                    
                    {/* Sağ alt köşe - Kırmızı */}
                    <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Penlatı Harici Gol Beklentisi Düşük</div>
                      <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Savunmada Kötü</div>
                    </div>
                  </>
                                  )}
                  
                  {title === "Savunma" && (
                    <>
                      {/* Sol üst köşe - Turuncu */}
                      <div className="absolute ml-13 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Engelleme Sayısı Çok</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Topu Uzaklaştırma Sayısı Az</div>
                      </div>
                      
                      {/* Sağ üst köşe - Yeşil */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Şut Engelleme Sayısı Çok</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Topu Uzaklaştırma Sayısı Çok</div>
                      </div>
                      
                      {/* Sol alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 ml-13 mb-12 text-left z-10">
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
                  {title === "Savunma Etkinliği" && (
                    <>
                      {/* Sol üst köşe - Turuncu */}
                      <div className="absolute ml-12 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Savunmada Aktif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Duvar Gibi Savunma</div>
                      </div>
                      
                      {/* Sağ üst köşe - Kırmızı */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Savunmada Aktif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Etkisiz Savunma</div>
                      </div>
                      
                      {/* Sol alt köşe - Yeşil */}
                      <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Savunmada Silik</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Duvar Gibi Savunma</div>
                      </div>
                      
                      {/* Sağ alt köşe - Turuncu */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Savunmada Silik</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Etkisiz Savunma</div>
                      </div>
                    </>
                  )}
                  {title === "Kalecilik" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-13 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Etkisiz Savunma</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Savunmada Silik</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Etkisiz Savunma</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Savunmada Aktif</div>
                      </div>
                      
                      {/* Sol alt köşe - Yeşil */}
                      <div className="absolute bottom-0 ml-13 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Duvar Gibi Savunma</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Savunmada Silik</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Duvar Gibi Savunma</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Savunmada Aktif</div>
                      </div>
                    </>
                  )}
                  {title === "Topa Müdahale" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-13 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Topa Müdahale Sayısı Çok</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Topa Müdahalede Kötü</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Topa Müdahale Sayısı Çok</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Topa Müdahalede İyi</div>
                      </div>
                      
                      {/* Sol alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 ml-13 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Topa Müdahale Sayısı Az</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Topa Müdahalede Kötü</div>
                      </div>
                      
                      {/* Sağ alt köşe - Turuncu */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Topa Müdahale Sayısı Az</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Topa Müdahalede İyi</div>
                      </div>
                    </>
                  )}
                  {title === "Pres Şiddeti" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-13 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Def hamle yapana kadar rakibe yüksek sayıda pas imkanı</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Savunma Hattı Geride</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Def hamle yapana kadar rakibe yüksek sayıda pas imkanı</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Savunma Hattı Önde</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-13 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Def hamle yapana kadar rakibe düşük sayıda pas imkanı</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Savunma Hattı Geride</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Def hamle yapana kadar rakibe düşük sayıda pas imkanı</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Savunma Hattı Önde</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Savunmadaki Duran Top Verimliliği" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-14 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Maç Başına Rakibin xA Oranı Yüksek</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Maç Başına Rakibe Az Sayıda Orta Yaptırıldı</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Maç Başına Rakibin xA Oranı Yüksek</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Maç Başına Rakibe Çok Sayıda Orta Yaptırıldı</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-14 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Maç Başına Rakibin xA Oranı Düşük</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Maç Başına Rakibe Az Sayıda Orta Yaptırıldı</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Maç Başına Rakibin xA Oranı Düşük</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Maç Başına Rakibe Çok Sayıda Orta Yaptırıldı</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Hücumdaki Duran Top Verimliliği" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-14 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Maç Başına Yüksek xA</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Maç Başına Az Sayıda Orta Yapıldı</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Maç Başına Yüksek xA</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Maç Başına Çok Sayıda Orta Yapıldı</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-14 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Maç Başına Düşük xA</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Maç Başına Az Sayıda Orta Yapıldı</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Maç Başına Düşük xA</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Maç Başına Çok Sayıda Orta Yapıldı</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Hücum Etkinliği" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-14 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Aktif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kötü Bitiricilik</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Aktif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Bitiricilik</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-14 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Pasif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kötü Bitiricilik</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Pasif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Bitiricilik</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Golcülük" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-14 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Gol Atan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Gol Atan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-14 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Gol Atan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Penaltı Harici Gol Beklentisi Düşük</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Gol Atan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Penaltı Harici Gol Beklentisi Yüksek</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Şut" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-14 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Aktif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Kalitesi Düşük</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Aktif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Şut Kalitesi Yüksek</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-14 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Pasif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Şut Kalitesi Düşük</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Kaleye Şut Çekmede Oldukça Pasif</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Kalitesi Yüksek</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Duran Toplardan Goller" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-14 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Duran Toplardan Yüksek Sayıda Gol Atıldı</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Duran Toplardan Az Sayıda Gol Yendi</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Duran Toplardan Yüksek Sayıda Gol Atıldı</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Duran Toplardan Yüksek Sayıda Gol Yendi</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-14 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Duran Toplardan Az Sayıda Gol Atıldı</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Duran Toplardan Az Sayıda Gol Yendi</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Duran Toplardan Az Sayıda Gol Atıldı</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Duran Toplardan Yüksek Sayıda Gol Yendi</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Pas" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-14 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Pas Yapan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetsiz Paslaşma</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Pas Yapan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>İsabetli Paslaşma</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-14 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Paslı Oynayan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>İsabetsiz Paslaşma</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Paslı Oynayan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetli Paslaşma</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Pas Dinamikleri" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-16 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Rakibin Pas İsabeti Yüksek</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>İsabetli Pas Sayısı Düşük</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-5 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Rakibin Pas İsabeti Yüksek</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Pas İsabeti Yüksek</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-16 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Rakibin Pas İsabeti Düşük</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>İsabetli Pas Sayısı Düşük</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-5 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Rakibin Pas İsabeti Düşük</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Pas İsabeti Yüksek</div>
                      </div>
                    </>
                  )}
                  
                  {title === "3. Bölge Dominasyonu" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-13 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Üçüncü Bölgede Rakibin Pas Sayısı Yüksek</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Üçüncü Bölgede Pas Sayısı Düşük</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Üçüncü Bölgede Rakibin Pas Sayısı Yüksek</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Üçüncü Bölgede Pas Sayısı Yüksek</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-13 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Üçüncü Bölgede Rakibin Pas Sayısı Düşük</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Üçüncü Bölgede Pas Sayısı Düşük</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Üçüncü Bölgede Rakibin Pas Sayısı Düşük</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Üçüncü Bölgede Pas Sayısı Yüksek</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Hareketlilik" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-14 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Dripling Denemesi Bol</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Dripling Denemesi Bol</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-14 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Dripling Denemesi Az</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Dripling Denemesi Az</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Topa Sahip Olma" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-13 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Sık Sık Top Kazanan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Sık Sık Top Kazanan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-13 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Pek Sık Top Kazanamayan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Fazla Top Kaybı Yapmayan</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Pek Sık Top Kazanamayan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Fazla Top Kaybı Yapan</div>
                      </div>
                    </>
                  )}
                  
                  {title === "Orta" && (
                    <>
                      {/* Sol üst köşe - Yeşil */}
                      <div className="absolute ml-13 mt-3 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Bol Orta Yapan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Ortalar İsabetsiz</div>
                      </div>
                      
                      {/* Sağ üst köşe - Turuncu */}
                      <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Bol Orta Yapan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Ortalar İsabetli</div>
                      </div>
                      
                      {/* Sol alt köşe - Turuncu */}
                      <div className="absolute bottom-0 ml-13 mb-12 text-left z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Orta Yapan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Ortalar İsabetsiz</div>
                      </div>
                      
                      {/* Sağ alt köşe - Kırmızı */}
                      <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Orta Yapan</div>
                        <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Ortalar İsabetli</div>
                      </div>
                    </>
                  )}
                  
                  <Scatter 
                    ref={chartRef}
                    data={chartData} 
                    options={chartOptions}
                    plugins={[teamLogoPlugin, referenceLinePlugin]}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={`w-full relative transition-all duration-300 ${
              isExpanded ? 'h-[400px]' : 'h-[120px]'
                                    }`}>
            
            {/* Include all other conditionals for different chart types */}
            
            <Scatter 
              ref={chartRef}
              data={chartData} 
              options={chartOptions}
              plugins={[teamLogoPlugin, referenceLinePlugin]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Radar (Poligon) Grafik Bileşeni - Genel Performans için özel
function RadarChartContainer({ 
  title, 
  index, 
  performanceData, 
  expandedChart, 
  setExpandedChart 
}: { 
  title: string; 
  index: number; 
  performanceData: PerformanceData[]; 
  expandedChart: number | null;
  setExpandedChart: (index: number | null) => void;
}) {
  const chartRef = useRef<any>(null);
  const isExpanded = expandedChart === index;

  // Metrik etiketleri ve normalizasyon parametreleri
  const metrics = [
    { name: 'Gol Ortalaması', key: 'golMb_gnlprf', min: 0, max: 3 },
    { name: 'Penaltısız Gol', key: 'pnltszxg_gnlprf', min: 0, max: 2.5 },
    { name: 'Yenilen Gol', key: 'ynlgolMb_gnlprf', min: 0, max: 3 },
    { name: 'Kalesinde Tehlike', key: 'klsndexgMb_gnlprf', min: 0, max: 5 },
    { name: 'Şut Ortalaması', key: 'sutMb_gnlprf', min: 0, max: 15 },
    { name: 'İsabetli Şut %', key: 'isbtlsutyzd_gnlprf', min: 0, max: 100 },
    { name: 'İsabetli Pas %', key: 'isbtlpasyzd_gnlprf', min: 0, max: 100 },
    { name: 'Top Kazanma %', key: 'topmdhlkznmyzd_gnlprf', min: 0, max: 100 }
  ];

  // Grafik verilerini hazırla - Radar grafiği için
  const chartData = useMemo(() => {
    // Eğer veri yoksa boş veri döndür
    if (!performanceData || performanceData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Metrik etiketleri
    const labels = metrics.map(m => m.name);

    // Her bir takım için veri seti oluştur
    const datasets = performanceData.map(team => {
      const teamName = team.takim_adi || `Takım ${team.blabla_tkm}`;
      
      // Sabit renkler kullan, rastgele olmayan (Savunma Takım chartındaki renkleri taklit et)
      const color = team.takim_id === 70108472 
        ? { r: 255, g: 99, b: 71 }  // Coral for team 70108472
        : { r: 65, g: 105, b: 225 }; // Royal Blue for team 1111111111
      
      // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
      const normalizedData = metrics.map(metric => {
        const value = team[metric.key as keyof PerformanceData] as number || 0;
        
        // İsabetli Şut %, İsabetli Pas % ve Top Kazanma % zaten yüzde olarak geliyor
        if (metric.key === 'isbtlsutyzd_gnlprf' || metric.key === 'isbtlpasyzd_gnlprf' || metric.key === 'topmdhlkznmyzd_gnlprf') {
          return value;
        }
        
        // Diğer değerleri normalizasyon parametrelerine göre ölçekle
        return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
      });
      
      return {
        label: teamName,
        data: normalizedData,
        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`,
        borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
        borderWidth: 1,
        pointBackgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
      };
    });

    return {
      labels,
      datasets
    };
  }, [performanceData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: isExpanded,
          backdropColor: 'rgba(255, 255, 255, 0.75)',
          stepSize: 20
        },
        pointLabels: {
          font: {
            size: isExpanded ? 12 : 8
          }
        }
      }
    },
    plugins: {
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
            const metric = metrics[dataIndex];
            const value = context.raw;
            
            // İlgili takımı bul
            const teamLabel = context.dataset.label;
            const team = performanceData.find(t => 
              t.takim_adi === teamLabel || 
              `Takım ${t.blabla_tkm}` === teamLabel
            );
            
            if (team) {
              const originalValue = team[metric.key as keyof PerformanceData];
              
              // İsabetli Şut %, İsabetli Pas % ve Top Kazanma % için
              if (metric.key === 'isbtlsutyzd_gnlprf' || metric.key === 'isbtlpasyzd_gnlprf' || metric.key === 'topmdhlkznmyzd_gnlprf') {
                return `${metric.name}: %${Number(originalValue).toFixed(1)}`;
              }
              
              // Diğer metrikler için
              return `${metric.name}: ${Number(originalValue).toFixed(2)}`;
            }
            
            return `${metric.name}: ${value.toFixed(1)}`;
          }
        }
      },
      legend: {
        display: isExpanded,
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    },
    hover: {
      mode: 'nearest' as const,
      intersect: true
    },
    interaction: {
      mode: 'point' as const,
      intersect: true
    }
  }), [isExpanded, performanceData]);

  // Grafiği büyüt/küçült
  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedChart(null);
    } else {
      setExpandedChart(index);
    }
  };

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
          <div className="flex">
            {/* Sol taraftaki metin konteynırı */}
            <div className="w-1/4 pr-4">
              <div className="bg-gray-50 p-3 rounded-lg h-full">
                <h4 className="font-semibold text-sm mb-2">Genel Performans Analizi</h4>
                <p className="text-xs mb-2">Maalesef istatistiksel olarak vasatın altında bir performans gösteriyoruz.</p>
                <p className="text-xs mb-2">Hürriyetspor:</p>
                <p className="text-xs mb-2">İsabetli şut oranı ortalamaya yakın.</p>
                <p className="text-xs">90 dakika başına çektiği şut sayısı ortalamanın altında.</p>
              </div>
            </div>
            
            {/* Sağ taraftaki grafik konteynırı */}
            <div className="w-3/4 relative">
              <div className="w-full relative transition-all duration-300 h-[400px]">
                <Radar 
                  ref={chartRef}
                  data={chartData} 
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full relative transition-all duration-300 h-[120px]">
            <Radar 
              ref={chartRef}
              data={chartData} 
              options={chartOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

  // Savunma (Takım) için özel Radar (Poligon) Grafik Bileşeni
function SavunmaTakimRadarChartContainer({ 
  title, 
  index, 
  teamData, 
  expandedChart, 
  setExpandedChart 
}: { 
  title: string; 
  index: number; 
  teamData: TeamData[]; 
  expandedChart: number | null;
  setExpandedChart: (index: number | null) => void;
}) {
  const chartRef = useRef<any>(null);
  const isExpanded = expandedChart === index;

  // Sadece belirli takım ID'leri için filtreleme yap (70108472 ve 1111111111)
  const filteredTeamData = useMemo(() => {
    return teamData.filter(team => 
      team.takim_id === 70108472 || team.takim_id === 1111111111
    );
  }, [teamData]);

  // Metrik etiketleri ve normalizasyon parametreleri
  const metrics = [
    { name: 'Yenilen Gol', key: 'ynlGolMb_svntkm', min: 0, max: 3 },
    { name: 'Kalesinde Tehlike', key: 'klsndeXgMb_svntkm', min: 1.2, max: 2.2 },
    { name: 'Gol Yemeden Maç', key: 'golYmdMcSys_svntkm', min: 0, max: 3 },
    { name: 'Top Kazanma %', key: 'topMdhKznYzd_svntkm', min: 0, max: 100 },
    { name: 'Savunma Rakip Pas', key: 'svnYprknRkpPas_svntkm', min: 0, max: 15 },
    { name: 'Top Kazanma', key: 'topKzn_svntkm', min: 1400, max: 1650 },
    { name: 'Rakip Uç Pas', key: 'rkpUcnBlgPas_svntkm', min: 0, max: 100 },
    { name: 'Yapılan Faul', key: 'yplnFaulMb_svntkm', min: 10, max: 26 }
  ];

  // Grafik verilerini hazırla - Radar grafiği için
  const chartData = useMemo(() => {
    // Eğer veri yoksa boş veri döndür
    if (!filteredTeamData || filteredTeamData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Metrik etiketleri
    const labels = metrics.map(m => m.name);

    // Her bir takım için veri seti oluştur
    const datasets = filteredTeamData.map(team => {
      const teamName = team.takim_adi || `Takım ID: ${team.takim_id}`;
      
      // Sabit renkler kullan, rastgele olmayan (Savunma Takım chartındaki renkleri taklit et)
      const color = team.takim_id === 70108472 
        ? { r: 255, g: 99, b: 71 }  // Coral for team 70108472
        : { r: 65, g: 105, b: 225 }; // Royal Blue for team 1111111111
      
      // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
      const normalizedData = metrics.map(metric => {
        const value = team[metric.key as keyof TeamData] as number || 0;
        
        // Top Kazanma % zaten yüzde olarak geliyor
        if (metric.key === 'topMdhKznYzd_svntkm') {
          return value;
        }
        
        // Yapılan Faul metriğini ters çevir (düşük değerler daha iyi)
        if (metric.key === 'yplnFaulMb_svntkm') {
          return Math.min(100, Math.max(0, 100 - (value - metric.min) / (metric.max - metric.min) * 100));
        }
        
        // Rakip Uç Pas metriğini ters çevir (düşük değerler daha iyi)
        if (metric.key === 'rkpUcnBlgPas_svntkm') {
          return Math.min(100, Math.max(0, 100 - (value - metric.min) / (metric.max - metric.min) * 100));
        }
        
        // Kalesinde Tehlike metriğini ters çevir (düşük değerler daha iyi)
        if (metric.key === 'klsndeXgMb_svntkm') {
          return Math.min(100, Math.max(0, 100 - (value - metric.min) / (metric.max - metric.min) * 100));
        }
        
        // Yenilen Gol metriğini ters çevir (düşük değerler daha iyi)
        if (metric.key === 'ynlGolMb_svntkm') {
          return Math.min(100, Math.max(0, 100 - (value - metric.min) / (metric.max - metric.min) * 100));
        }
        
        // Diğer değerleri normalizasyon parametrelerine göre ölçekle
        return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
      });
      
      return {
        label: teamName,
        data: normalizedData,
        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`,
        borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
        borderWidth: 1,
        pointBackgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
      };
    });

    return {
      labels,
      datasets
    };
  }, [filteredTeamData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: isExpanded,
          backdropColor: 'rgba(255, 255, 255, 0.75)',
          stepSize: 20
        },
        pointLabels: {
          font: {
            size: isExpanded ? 12 : 8
          }
        }
      }
    },
    plugins: {
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
            const metric = metrics[dataIndex];
            const value = context.raw;
            
            // İlgili takımı bul
            const teamLabel = context.dataset.label;
            const team = filteredTeamData.find(t => 
              t.takim_adi === teamLabel || 
              `Takım ID: ${t.takim_id}` === teamLabel
            );
            
            if (team) {
              const originalValue = team[metric.key as keyof TeamData];
              
              // Top Kazanma % için
              if (metric.key === 'topMdhKznYzd_svntkm') {
                return `${metric.name}: %${Number(originalValue).toFixed(1)}`;
              }
              
              // Diğer metrikler için
              return `${metric.name}: ${Number(originalValue).toFixed(2)}`;
            }
            
            return `${metric.name}: ${value.toFixed(1)}`;
          }
        }
      },
      legend: {
        display: isExpanded,
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    },
    hover: {
      mode: 'nearest' as const,
      intersect: true
    },
    interaction: {
      mode: 'point' as const,
      intersect: true
    }
  }), [isExpanded, filteredTeamData]);

  // Grafiği büyüt/küçült
  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedChart(null);
    } else {
      setExpandedChart(index);
    }
  };

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
          <div className="flex">
            {/* Sol taraftaki metin konteynırı */}
            <div className="w-1/4 pr-4">
              <div className="bg-gray-50 p-3 rounded-lg h-full">
                <h4 className="font-semibold text-sm mb-2">Savunma (Takım) Analizi</h4>
                <p className="text-xs mb-2">Savunma istatistiklerinde vasatın altında bir performans sergiliyoruz.</p>
                <p className="text-xs mb-2">Hürriyetspor:</p>
                <p className="text-xs mb-2">Ortalamaya göre daha yüksek sayıda kalesini gole kapadı.</p>
                <p className="text-xs">90 dakika başına yaptığı faul sayısı ortalamanın üstünde.</p>
              </div>
            </div>
            
            {/* Sağ taraftaki grafik konteynırı */}
            <div className="w-3/4 relative">
              <div className="w-full relative transition-all duration-300 h-[400px]">
                <Radar 
                  ref={chartRef}
                  data={chartData} 
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full relative transition-all duration-300 h-[120px]">
            <Radar 
              ref={chartRef}
              data={chartData} 
              options={chartOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Radar (Poligon) Grafik Bileşeni - Pas için özel
function FaulRadarChartContainer({ 
  title, 
  index, 
  teamData, 
  expandedChart, 
  setExpandedChart 
}: { 
  title: string; 
  index: number; 
  teamData: TeamData[]; 
  expandedChart: number | null;
  setExpandedChart: (index: number | null) => void;
}) {
  const chartRef = useRef<any>(null);
  const isExpanded = expandedChart === index;

  // Metrik etiketleri ve normalizasyon parametreleri
  const metrics = [
    { name: 'Gol Ortalaması', key: 'golMb_hcmtkm', min: 0, max: 3 },
    { name: 'Penaltısız Gol', key: 'pnltszXgMb_hcmtkm', min: 0, max: 2.5 },
    { name: 'Şut Ortalaması', key: 'sutMb_hcmtkm', min: 0, max: 15 },
    { name: 'İsabetli Şut %', key: 'isbtlSutYzd_hcmtkm', min: 0, max: 100 },
    { name: 'Çalım Ortalaması', key: 'calimMb_hcmtkm', min: 0, max: 10 },
    { name: 'İsabetli Orta', key: 'isbtlOrt_hcmtkm', min: 0, max: 5 },
    { name: 'İsabetli Pas %', key: 'isbtlPasYzd_hcmtkm', min: 0, max: 100 },
    { name: 'Kazanılan Faul', key: 'kznlFaulMb_hcmtkm', min: 0, max: 5 }
  ];

  // Grafik verilerini hazırla - Radar grafiği için
  const chartData = useMemo(() => {
    // Filtreleme: Sadece 70108472 ve 1111111111 ID'li takımları al
    const filteredData = teamData.filter(team => 
      team.takim_id === 70108472 || team.takim_id === 1111111111
    );
    
    // Eğer veri yoksa boş veri döndür
    if (!filteredData || filteredData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Metrik etiketleri
    const labels = metrics.map(m => m.name);

    // Her bir takım için veri seti oluştur
    const datasets = filteredData.map(team => {
      const teamName = team.takim_adi || `Takım ${team.blabla_tkm}`;
      
      // Sabit renkler kullan, rastgele olmayan (Savunma Takım chartındaki renkleri taklit et)
      const color = team.takim_id === 70108472 
        ? { r: 255, g: 99, b: 71 }  // Coral for team 70108472
        : { r: 65, g: 105, b: 225 }; // Royal Blue for team 1111111111
      
      // Değerleri normalizasyon parametrelerine göre 0-100 arasına ölçekle
      const normalizedData = metrics.map(metric => {
        const value = team[metric.key as keyof TeamData] as number || 0;
        
        // İsabetli Şut % ve İsabetli Pas % zaten yüzde olarak geliyor
        if (metric.key === 'isbtlSutYzd_hcmtkm' || metric.key === 'isbtlPasYzd_hcmtkm') {
          return value;
        }
        
        // Diğer değerleri normalizasyon parametrelerine göre ölçekle
        return Math.min(100, Math.max(0, (value - metric.min) / (metric.max - metric.min) * 100));
      });
      
      return {
        label: teamName,
        data: normalizedData,
        backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`,
        borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
        borderWidth: 1,
        pointBackgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
      };
    });

    return {
      labels,
      datasets
    };
  }, [teamData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          display: isExpanded,
          backdropColor: 'rgba(255, 255, 255, 0.75)',
          stepSize: 20
        },
        pointLabels: {
          font: {
            size: isExpanded ? 12 : 8
          }
        }
      }
    },
    plugins: {
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
            const metric = metrics[dataIndex];
            const value = context.raw;
            
            // İlgili takımı bul
            const teamLabel = context.dataset.label;
            const team = teamData.find(t => 
              t.takim_adi === teamLabel || 
              `Takım ${t.blabla_tkm}` === teamLabel
            );
            
            if (team) {
              const originalValue = team[metric.key as keyof TeamData];
              
              // İsabetli Şut % ve İsabetli Pas % için
              if (metric.key === 'isbtlSutYzd_hcmtkm' || metric.key === 'isbtlPasYzd_hcmtkm') {
                return `${metric.name}: %${Number(originalValue).toFixed(1)}`;
              }
              
              // Diğer metrikler için
              return `${metric.name}: ${Number(originalValue).toFixed(2)}`;
            }
            
            return `${metric.name}: ${value.toFixed(1)}`;
          }
        }
      },
      legend: {
        display: isExpanded,
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    },
    hover: {
      mode: 'nearest' as const,
      intersect: true
    },
    interaction: {
      mode: 'point' as const,
      intersect: true
    }
  }), [isExpanded, teamData]);

  // Grafiği büyüt/küçült
  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedChart(null);
    } else {
      setExpandedChart(index);
    }
  };

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
          <div className="flex">
            {/* Sol taraftaki metin konteynırı */}
            <div className="w-1/4 pr-4">
              <div className="bg-gray-50 p-3 rounded-lg h-full">
                <h4 className="font-semibold text-sm mb-2">Hücum (Takım) Analizi</h4>
                <p className="text-xs mb-2">Maalesef hücum istatistiklerinde vasatın oldukça altında bir performans sergiliyoruz.</p>
                <p className="text-xs mb-2">Hürriyetspor:</p>
                <p className="text-xs mb-2">Yaptığı isabetli orta oranı ortalamanın çok üstünde.</p>
                <p className="text-xs">90 dakika başına yaptığı çalım denemesi ortalamanın altında.</p>
              </div>
            </div>
            
            {/* Sağ taraftaki grafik konteynırı */}
            <div className="w-3/4 relative">
              <div className="w-full relative transition-all duration-300 h-[400px]">
                <Radar
                  ref={chartRef}
                  data={chartData}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full relative transition-all duration-300 h-[120px]">
            <Radar
              ref={chartRef}
              data={chartData}
              options={chartOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TakimPage() {
  const [teamData, setTeamData] = useState<TeamData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [teamLogo, setTeamLogo] = useState<HTMLImageElement | null>(null);
  const [teamLogo70081151, setTeamLogo70081151] = useState<HTMLImageElement | null>(null);
  const [teamLogo70055736, setTeamLogo70055736] = useState<HTMLImageElement | null>(null);
  const [teamLogo70098997, setTeamLogo70098997] = useState<HTMLImageElement | null>(null);
  const [teamLogo2000066740, setTeamLogo2000066740] = useState<HTMLImageElement | null>(null);
  const [teamLogo70135986, setTeamLogo70135986] = useState<HTMLImageElement | null>(null);
  const [teamLogo70101850, setTeamLogo70101850] = useState<HTMLImageElement | null>(null);
  const [teamLogo70135984, setTeamLogo70135984] = useState<HTMLImageElement | null>(null);
  const [teamLogo2000066712, setTeamLogo2000066712] = useState<HTMLImageElement | null>(null);
  const [teamLogo70081157, setTeamLogo70081157] = useState<HTMLImageElement | null>(null);
  const [teamLogo70081150, setTeamLogo70081150] = useState<HTMLImageElement | null>(null);
  const [expandedChart, setExpandedChart] = useState<number | null>(null);

  // Takım logosunu önceden yükle
  useEffect(() => {
    const loadTeamLogo = async () => {
      try {
        const logo = await preloadImage('/images/70108472h.png');
        setTeamLogo(logo);
        
        // Yeni takım logosu için
        const logoForTeam70081151 = await preloadImage('/images/70081151.png');
        setTeamLogo70081151(logoForTeam70081151);
        
        // 70055736 takım logosu için
        const logoForTeam70055736 = await preloadImage('/images/70055736.png');
        setTeamLogo70055736(logoForTeam70055736);
        
        // 70098997 takım logosu için
        const logoForTeam70098997 = await preloadImage('/images/70098997.png');
        setTeamLogo70098997(logoForTeam70098997);
        
        // 2000066740 takım logosu için
        const logoForTeam2000066740 = await preloadImage('/images/2000066740.png');
        setTeamLogo2000066740(logoForTeam2000066740);
        
        // 70135986 takım logosu için
        const logoForTeam70135986 = await preloadImage('/images/70135986.png');
        setTeamLogo70135986(logoForTeam70135986);
        
        // 70101850 takım logosu için
        const logoForTeam70101850 = await preloadImage('/images/70101850.png');
        setTeamLogo70101850(logoForTeam70101850);
        
        // 70135984 takım logosu için
        const logoForTeam70135984 = await preloadImage('/images/70135984.png');
        setTeamLogo70135984(logoForTeam70135984);
        
        // 2000066712 takım logosu için (2000066716.png resmini kullanıyor)
        const logoForTeam2000066712 = await preloadImage('/images/2000066716.png');
        setTeamLogo2000066712(logoForTeam2000066712);
        
        // 70081157 takım logosu için
        const logoForTeam70081157 = await preloadImage('/images/70081157.png');
        setTeamLogo70081157(logoForTeam70081157);
        
        // 70081150 takım logosu için
        const logoForTeam70081150 = await preloadImage('/images/70081150.png');
        setTeamLogo70081150(logoForTeam70081150);
      } catch (err) {
        console.error('Logo yüklenemedi:', err);
      }
    };

    loadTeamLogo();
  }, []);

  useEffect(() => {
    // Veritabanından takım verilerini çek
    const fetchData = async () => {
      try {
        // Temel takım verilerini çek
        const teamResponse = await fetch('/api/takim-istatistik');
        if (!teamResponse.ok) {
          throw new Error('Veri çekme hatası');
        }
        const teamData = await teamResponse.json();
        setTeamData(teamData);

        // Performans verilerini çek
        const performanceResponse = await fetch('/api/takim-performans');
        if (!performanceResponse.ok) {
          throw new Error('Performans veri çekme hatası');
        }
        const performanceData = await performanceResponse.json();
        setPerformanceData(performanceData);
      } catch (err: any) {
        setError(err.message);
        console.error('Veri çekme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 22 grafiğin başlıklarını oluştur
  const chartTitles = [
    "Hava Topu",
    "Genel Performans",
    "Atılan Gol",
    "Savunma",
    "Savunma Etkinliği",
    "Kalecilik",
    "Topa Müdahale",
    "Pres Şiddeti",
    "Savunmadaki Duran Top Verimliliği",
    "Savunma (Takım)",
    "Hücumdaki Duran Top Verimliliği",
    "Hücum Etkinliği",
    "Golcülük",
    "Şut",
    "Duran Toplardan Goller",
    "Pas",
    "Hücum (Takım)",
    "Pas Dinamikleri",
    "3. Bölge Dominasyonu",
    "Hareketlilik",
    "Topa Sahip Olma",
    "Orta"
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Veri Merkezi - Takım</h1>
      
      {/* Secondary Navbar */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <Link href="/veri-merkezi/takim" className="py-2 px-4 text-gray-900 border-b-2 border-blue-500 font-medium">
            Takım
          </Link>
          <Link href="/veri-merkezi/oyuncu" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Oyuncu
          </Link>
        </nav>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-2xl font-semibold mb-4">Takım Verileri</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Hata: {error}</div>
          </div>
        ) : teamData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Veri bulunamadı</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-2 transition-all duration-300">
            {/* 22 Grafik göster */}
            {chartTitles.map((title, index) => {
              // Genel Performans için özel Radar grafiği kullan (index 1)
              if (index === 1) {
                return (
                  <RadarChartContainer
                    key={index}
                    title={title}
                    index={index}
                    performanceData={performanceData}
                    expandedChart={expandedChart}
                    setExpandedChart={setExpandedChart}
                  />
                );
              }
              
              // Savunma (Takım) için özel Radar grafiği kullan (index 9)
              if (index === 9) {
                return (
                  <SavunmaTakimRadarChartContainer
                    key={index}
                    title={title}
                    index={index}
                    teamData={teamData}
                    expandedChart={expandedChart}
                    setExpandedChart={setExpandedChart}
                  />
                );
              }
              
              // Pas için özel Radar grafiği kullan (index 16)
              if (index === 16) {
                return (
                  <FaulRadarChartContainer
                    key={index}
                    title={title}
                    index={index}
                    teamData={teamData}
                    expandedChart={expandedChart}
                    setExpandedChart={setExpandedChart}
                  />
                );
              }
              
              // Diğer grafikler için normal Scatter grafiği kullan
              return (
                <ChartContainer
                  key={index}
                  title={title}
                  index={index}
                  teamData={teamData}
                  teamLogo={teamLogo}
                  teamLogo70081151={teamLogo70081151}
                  teamLogo70055736={teamLogo70055736}
                  teamLogo70098997={teamLogo70098997}
                  teamLogo2000066740={teamLogo2000066740}
                  teamLogo70135986={teamLogo70135986}
                  teamLogo70101850={teamLogo70101850}
                  teamLogo70135984={teamLogo70135984}
                  teamLogo2000066712={teamLogo2000066712}
                  teamLogo70081157={teamLogo70081157}
                  teamLogo70081150={teamLogo70081150}
                  expandedChart={expandedChart}
                  setExpandedChart={setExpandedChart}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 