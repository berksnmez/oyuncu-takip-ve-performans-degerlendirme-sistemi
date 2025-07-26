'use client';

import React, { useRef, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DefansData {
  'Drp/90': number;
  'TopKyb/90': number;
  bnzrsz_def: number;
  oyuncu_id: number;
  oyuncu_isim: string;
  [key: string]: any;
}

interface DefansHareketlilikChartProps {
  defansData: DefansData[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  currentPlayerId?: number;
}

export default function DefansHareketlilikChart({ 
  defansData, 
  isExpanded = false, 
  onToggleExpand,
  currentPlayerId 
}: DefansHareketlilikChartProps) {
  const chartRef = useRef<any>(null);

  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const referenceLinePlugin = useMemo(() => {
    return {
      id: 'referenceLines-hareketlilik-defanslar',
      afterDatasetsDraw(chart: any) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x || !scales.y) return;
        
        const { top, bottom, left, right } = chartArea;
        const yPos = scales.y.getPixelForValue(0.3);
        const xPos = scales.x.getPixelForValue(9.5);
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(left, yPos);
        ctx.lineTo(right, yPos);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 99, 132, 0.8)';
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        
        if (isExpanded) {
          ctx.fillStyle = 'rgba(255, 99, 132, 1)';
          ctx.font = '12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('0.3', right + 5, yPos + 4);
        }
        
        ctx.beginPath();
        ctx.moveTo(xPos, top);
        ctx.lineTo(xPos, bottom);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
        ctx.stroke();
        
        if (isExpanded) {
          ctx.fillStyle = 'rgba(54, 162, 235, 1)';
          ctx.textAlign = 'center';
          ctx.fillText('9.5', xPos, top - 5);
        }
        
        ctx.restore();
      }
    };
  }, [isExpanded]);

  const chartData = useMemo(() => {
    const points = defansData
      .filter(defans => {
        const drpValue = safeNumber(defans["Drp/90"]);
        const topKybValue = safeNumber(defans["TopKyb/90"]);
        return drpValue !== 0 && !isNaN(drpValue) && drpValue !== null &&
               topKybValue !== 0 && !isNaN(topKybValue) && topKybValue !== null;
      })
      .map(defans => ({
        x: safeNumber(defans["TopKyb/90"]),
        y: safeNumber(defans["Drp/90"]),
        bnzrsz_def: defans.bnzrsz_def,
        oyuncuIsim: defans.oyuncu_isim,
        oyuncu_id: defans.oyuncu_id,
        type: 'defans'
      }));

    const currentPlayerPoint = currentPlayerId ? points.find(p => p.oyuncu_id === currentPlayerId) : null;
    const otherPoints = currentPlayerId ? points.filter(p => p.oyuncu_id !== currentPlayerId) : points;

    return {
      datasets: [
        {
          label: 'Diğer Defans Oyuncuları',
          data: otherPoints,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointRadius: isExpanded ? 6 : 4,
          pointHoverRadius: isExpanded ? 8 : 6,
          pointHoverBackgroundColor: 'rgba(255, 206, 86, 1)',
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
            text: 'Top Kaybı (90 Dakika Başına)',
            font: { size: 12 }
          },
          min: 6,
          max: 14,
          ticks: { display: isExpanded, font: { size: 10 } }
        },
        y: {
          title: {
            display: isExpanded,
            text: 'Dripling (90 Dakika Başına)',
            font: { size: 12 }
          },
          min: 0.00,
          max: 1.60,
          ticks: { display: isExpanded, font: { size: 10 } }
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
                `Top Kaybı: ${context.parsed.x.toFixed(2)}`,
                `Dripling: ${context.parsed.y.toFixed(2)}`
              ];
            }
          }
        },
        legend: { display: isExpanded, position: 'top' as const },
        title: {
          display: true,
          text: 'Hareketlilik-Defanslar',
          font: { size: isExpanded ? 16 : 12, weight: 'bold' as const }
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
        <h3 className="text-sm font-medium truncate">Hareketlilik-Defanslar</h3>
        {onToggleExpand && (
          <button onClick={onToggleExpand} className="p-1 hover:bg-gray-100 rounded text-xs">
            {isExpanded ? 'Küçült' : 'Büyüt'}
          </button>
        )}
      </div>
      
      <div className="p-2">
        {isExpanded ? (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 p-2">
              <h4 className="font-semibold text-sm mb-2">Defans Oyuncuları Hareketlilik Analizi</h4>
              <p className="text-xs mb-2">Defans oyuncularının 90 dakika başına dripling ve top kaybı sayıları.</p>
              <p className="text-xs">Yüksek dripling ve düşük top kaybı, top kontrolü iyi olan defans oyuncularını gösterir.</p>
            </div>
            
            <div className="md:w-3/4 relative">
              <div className="h-[500px] relative">
                <Scatter ref={chartRef} data={chartData} options={chartOptions} plugins={[referenceLinePlugin]} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[120px]">
            <Scatter ref={chartRef} data={chartData} options={chartOptions} plugins={[referenceLinePlugin]} />
          </div>
        )}
      </div>
    </div>
  );
} 