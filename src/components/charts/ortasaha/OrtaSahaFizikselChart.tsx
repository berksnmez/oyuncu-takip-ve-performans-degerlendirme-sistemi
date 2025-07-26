'use client';

import React, { useRef, useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { OrtaSahaData, PointData } from './OrtaSahaSavunmaChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface OrtaSahaFizikselChartProps {
  ortaSahaData: OrtaSahaData[];
  currentPlayerId: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const OrtaSahaFizikselChart: React.FC<OrtaSahaFizikselChartProps> = ({
  ortaSahaData,
  currentPlayerId,
  isExpanded,
  onToggleExpand
}) => {
  const chartRef = useRef<any>(null);

  const referenceLinePlugin = useMemo(() => {
    return {
      id: 'referenceLines-fiziksel-ortasaha',
      afterDatasetsDraw(chart: any) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x || !scales.y) return;
        
        const { top, bottom, left, right } = chartArea;
        
        // Yatay çizgi için (ortalama değer)
        const yPos = scales.y.getPixelForValue(11.5);
        
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
        const xPos = scales.x.getPixelForValue(7);
        
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
        
        ctx.restore();
      }
    };
  }, [isExpanded]);

  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const chartData = useMemo(() => {
    const points: PointData[] = ortaSahaData
      .filter(ortaSaha => {
        const mesfValue = safeNumber(ortaSaha["Mesf/90"]);
        return mesfValue !== 0 && !isNaN(mesfValue) && mesfValue !== null;
      })
      .map(ortaSaha => ({
        x: safeNumber(ortaSaha["Sprint/90"]),
        y: safeNumber(ortaSaha["Mesf/90"]),
        bnzrsz_os: ortaSaha.bnzrsz_os,
        oyuncuIsim: ortaSaha.oyuncu_isim,
        oyuncu_id: ortaSaha.oyuncu_id,
        type: 'ortasaha'
      }));

    // Mevcut oyuncuyu vurgula
    const currentPlayerPoint = currentPlayerId ? points.find(p => p.oyuncu_id === currentPlayerId) : null;
    const otherPoints = currentPlayerId ? points.filter(p => p.oyuncu_id !== currentPlayerId) : points;

    return {
      datasets: [
        {
          label: 'Diğer Orta Saha Oyuncuları',
          data: otherPoints,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgba(53, 162, 235, 1)',
          pointRadius: isExpanded ? 6 : 4,
          pointHoverRadius: isExpanded ? 8 : 6,
          pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
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
  }, [ortaSahaData, isExpanded, currentPlayerId]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: isExpanded,
            text: 'Maç Başına Sprint Sayısı',
            font: {
              size: 12
            }
          },
          min: 0.00,
          max: 15.00,
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
            text: 'Maç Başına Koşu Mesafesi',
            font: {
              size: 12
            }
          },
          min: 6.00,
          max: 15.00,
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
          text: 'Genel Fiziksel İstatistik-Orta Sahalar',
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
        <h3 className="text-sm font-medium truncate">Genel Fiziksel İstatistik-Orta Sahalar</h3>
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
              <h4 className="font-semibold text-sm mb-2">Orta Saha Fiziksel İstatistikler</h4>
              <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına koşu mesafesi ve sprint sayıları.</p>
              <p className="text-xs">Yüksek mesafe ve yüksek sprint sayısı, fiziksel kapasitesi yüksek orta saha oyuncularını gösterir.</p>
            </div>
            
            <div className="md:w-3/4 relative">
              <div className="h-[500px] relative">
        {/* Corner Labels */}
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
};

export default OrtaSahaFizikselChart; 