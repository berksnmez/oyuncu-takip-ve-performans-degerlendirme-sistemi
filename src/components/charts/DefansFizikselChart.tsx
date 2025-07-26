'use client';

import React, { useRef, useMemo } from 'react';
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

// Defans veri tipi
interface DefansData {
  'Ao-Io%': number;
  bnzrsz_def: number;
  'Drp/90': number;
  'HtmG/90': number;
  'Hv%': number;
  'KazanTop/90': number;
  'OrtGrsm/90': number;
  oyuncu_id: number;
  oyuncu_isim: string;
  'Pas%': number;
  'PsG/90': number;
  'SPasi/90': number;
  'Sprint/90': number;
  takim_adi: string;
  takim_id: number;
  'TopKyb/90': number;
  'Uzk/90': number;
  'Eng/90': number;
  'Mesf/90': number;
}

interface PointData {
  x: number;
  y: number;
  oyuncuIsim: string;
  oyuncu_id: number;
  type: string;
  bnzrsz_def: number;
}

interface DefansFizikselChartProps {
  defansData: DefansData[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  currentPlayerId?: number;
}

export default function DefansFizikselChart({ 
  defansData, 
  isExpanded = false, 
  onToggleExpand,
  currentPlayerId 
}: DefansFizikselChartProps) {
  const chartRef = useRef<any>(null);

  // Güvenli number dönüşümü fonksiyonu
  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Referans çizgileri plugin'i
  const referenceLinePlugin = useMemo(() => {
    return {
      id: 'referenceLines-fiziksel-defanslar',
      afterDatasetsDraw(chart: any) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x || !scales.y) return;
        
        const { top, bottom, left, right } = chartArea;
        
        // Yatay çizgi için (ortalama değer)
        const yPos = scales.y.getPixelForValue(11.0);
        
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
        const xPos = scales.x.getPixelForValue(7.70);
        
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
        
        ctx.restore();
      }
    };
  }, [isExpanded]);

  // Grafik verilerini hazırla
  const chartData = useMemo(() => {
    const points: PointData[] = defansData.map(defans => ({
      x: safeNumber(defans["Sprint/90"]),
      y: safeNumber(defans["Mesf/90"]),
      bnzrsz_def: defans.bnzrsz_def,
      oyuncuIsim: defans.oyuncu_isim,
      oyuncu_id: defans.oyuncu_id,
      type: 'defans'
    }));

    // Mevcut oyuncuyu vurgula
    const currentPlayerPoint = currentPlayerId ? points.find(p => p.oyuncu_id === currentPlayerId) : null;
    const otherPoints = currentPlayerId ? points.filter(p => p.oyuncu_id !== currentPlayerId) : points;

    return {
      datasets: [
        {
          label: 'Diğer Defans Oyuncuları',
          data: otherPoints,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          pointRadius: isExpanded ? 6 : 4,
          pointHoverRadius: isExpanded ? 8 : 6,
          pointHoverBackgroundColor: 'rgba(255, 159, 64, 1)',
        },
        ...(currentPlayerPoint ? [{
          label: currentPlayerPoint.oyuncuIsim,
          data: [currentPlayerPoint],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          pointRadius: isExpanded ? 10 : 8,
          pointHoverRadius: isExpanded ? 12 : 10,
        }] : [])
      ]
    };
  }, [defansData, isExpanded, currentPlayerId]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: isExpanded,
            text: 'Maç Başına Yüksek Hızlı Sprint',
            font: {
              size: 12
            }
          },
          min: 0,
          max: 25,
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
            text: 'Maç Başına Katettiği Mesafe',
            font: {
              size: 12
            }
          },
          min: 9,
          max: 14,
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
              return [
                `Sprint: ${context.parsed.x.toFixed(2)}`,
                `Mesafe: ${context.parsed.y.toFixed(2)}`
              ];
            }
          }
        },
        legend: {
          display: isExpanded,
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Genel Fiziksel İstatistik-Defanslar',
          font: {
            size: isExpanded ? 16 : 12,
            weight: 'bold' as const
          }
        }
      },
      onClick: onToggleExpand
    };
  }, [isExpanded, onToggleExpand]);

  return (
    <div className={`bg-white border rounded-lg shadow-sm transition-all duration-300 overflow-hidden ${
      isExpanded ? 'fixed inset-4 z-50' : ''
    }`}>
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium truncate">Genel Fiziksel İstatistik-Defanslar</h3>
        {onToggleExpand && (
          <button 
            onClick={onToggleExpand}
            className="p-1 hover:bg-gray-100 rounded text-xs"
          >
            {isExpanded ? 'Küçült' : 'Büyüt'}
          </button>
        )}
      </div>
      
      <div className="p-2">
        {isExpanded ? (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 p-2">
              <h4 className="font-semibold text-sm mb-2">Defans Oyuncuları Fiziksel Analizi</h4>
              <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına koşu mesafesi ve sprint sayıları.</p>
              <p className="text-xs">Yüksek mesafe ve yüksek sprint sayısı, fiziksel kapasitesi yüksek defans oyuncularını gösterir.</p>
            </div>
            
            <div className="md:w-3/4 relative">
              <div className="h-[500px] relative">
                {/* Sabit bölge yazıları */}
                <>
                  {/* Sol üst köşe - Turuncu */}
                  <div className="absolute ml-12 mt-3 text-left z-10">
                    <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Koşu Mesafesi</div>
                    <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Düşük Sprint</div>
                  </div>
                  
                  {/* Sağ üst köşe - Yeşil */}
                  <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                    <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Koşu Mesafesi</div>
                    <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Yüksek Sprint</div>
                  </div>
                  
                  {/* Sol alt köşe - Kırmızı */}
                  <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                    <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Düşük Koşu Mesafesi</div>
                    <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Düşük Sprint</div>
                  </div>
                  
                  {/* Sağ alt köşe - Turuncu */}
                  <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                    <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Düşük Koşu Mesafesi</div>
                    <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Yüksek Sprint</div>
                  </div>
                </>
                
                <Scatter 
                  ref={chartRef}
                  data={chartData} 
                  options={chartOptions}
                  plugins={[referenceLinePlugin]}
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
              plugins={[referenceLinePlugin]}
            />
          </div>
        )}
      </div>
    </div>
  );
} 