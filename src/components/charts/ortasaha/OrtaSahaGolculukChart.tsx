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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export type OrtaSahaData = {
  bnzrsz_os: number;
  oyuncu_isim: string;
  oyuncu_id?: number;
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

export type PointData = {
  x: number;
  y: number;
  oyuncuIsim: string;
  oyuncu_id?: number;
  type: string;
  [key: string]: any;
};

interface OrtaSahaGolculukChartProps {
  ortaSahaData: OrtaSahaData[];
  currentPlayerId: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const OrtaSahaGolculukChart: React.FC<OrtaSahaGolculukChartProps> = ({
  ortaSahaData,
  currentPlayerId,
  isExpanded,
  onToggleExpand
}) => {
  const chartRef = useRef<any>(null);

  const referenceLinePlugin = useMemo(() => {
    return {
      id: 'referenceLines-golculuk-ortasaha',
      afterDatasetsDraw(chart: any) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x || !scales.y) return;
        
        const { top, bottom, left, right } = chartArea;
        
        // Yatay çizgi için (ortalama değer)
        const yPos = scales.y.getPixelForValue(0.08);
        
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
          ctx.fillText('0.08', right + 5, yPos + 4);
        }
        
        // Dikey çizgi için (ortalama değer)
        const xPos = scales.x.getPixelForValue(0.12);
        
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
        const golValue = safeNumber(ortaSaha["Gol/90"]);
        return !isNaN(golValue) && golValue !== null;
      })
      .map(ortaSaha => ({
        x: safeNumber(ortaSaha["PH-xG/90"]),
        y: safeNumber(ortaSaha["Gol/90"]),
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
            text: 'Maç Başına Penaltı Hariç Beklenen Gol',
            font: {
              size: 12
            }
          },
          min: 0.00,
          max: 0.50,
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
            text: 'Maç Başına Gol',
            font: {
              size: 12
            }
          },
          min: 0.00,
          max: 0.40,
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
                `PH-xG/90: ${context.parsed.x.toFixed(3)}`,
                `Gol/90: ${context.parsed.y.toFixed(3)}`
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
          text: 'Golcülük-Orta Sahalar',
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
        <h3 className="text-sm font-medium truncate">Golcülük-Orta Sahalar</h3>
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
              <h4 className="font-semibold text-sm mb-2">Orta Saha Golcülük Analizi</h4>
              <p className="text-xs mb-2">Orta saha oyuncularının 90 dakika başına gol ve beklenen gol değerleri.</p>
              <p className="text-xs">Yüksek gol ve xG değerleri, golcülük yetenekleri yüksek orta saha oyuncularını gösterir.</p>
            </div>
            
            <div className="md:w-3/4 relative">
              <div className="h-[500px] relative">
        {/* Corner Labels */}
        <>
          {/* Sol üst köşe - Turuncu */}
          <div className="absolute ml-12 mt-3 text-left z-10">
            <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Beklenenden Fazla Gol</div>
            <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Az Pozisyon Bulma</div>
          </div>
          
          {/* Sağ üst köşe - Yeşil */}
          <div className="absolute right-0 mr-3 mt-3 text-right z-10">
            <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Beklenenden Fazla Gol</div>
            <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Çok Pozisyon Bulma</div>
          </div>
          
          {/* Sol alt köşe - Kırmızı */}
          <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
            <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Beklenenden Az Gol</div>
            <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Az Pozisyon Bulma</div>
          </div>
          
          {/* Sağ alt köşe - Turuncu */}
          <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
            <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Beklenenden Az Gol</div>
            <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Çok Pozisyon Bulma</div>
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

export default OrtaSahaGolculukChart; 