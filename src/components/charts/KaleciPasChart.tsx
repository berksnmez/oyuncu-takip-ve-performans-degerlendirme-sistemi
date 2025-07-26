'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface KaleciData {
  bnzrsz_gk: number;
  oyuncu_isim: string;
  oyuncu_id?: number;
  kurtarisMb: number;
  kurtarisYzd: number;
  englxG: number;
  pasdnmeMb: number;
  pasYzd: number;
}

interface PointData {
  x: number;
  y: number;
  oyuncuIsim: string;
  oyuncu_id?: number;
  type: string;
}

interface KaleciPasChartProps {
  kaleciData: KaleciData[];
  highlightedPlayerId?: number;
  title?: string;
  showExpandButton?: boolean;
}

export default function KaleciPasChart({ 
  kaleciData, 
  highlightedPlayerId,
  title = "Pas-Kaleciler",
  showExpandButton = true
}: KaleciPasChartProps) {
  const chartRef = useRef<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Referans çizgileri plugin'i
  const referenceLinePlugin = useMemo(() => {
    return {
      id: 'referenceLines-pas',
      afterDatasetsDraw(chart: any) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x || !scales.y) return;
        
        const { top, bottom, left, right } = chartArea;
        
        // Yatay çizgi (ortalama değer)
        const yPos = scales.y.getPixelForValue(24);
        
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
          ctx.fillText('24', right + 5, yPos + 4);
        }
        
        // Dikey çizgi (ortalama değer)
        const xPos = scales.x.getPixelForValue(59);
        
        ctx.beginPath();
        ctx.moveTo(xPos, top);
        ctx.lineTo(xPos, bottom);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(54, 162, 235, 0.8)';
        ctx.stroke();
        
        if (isExpanded) {
          ctx.fillStyle = 'rgba(54, 162, 235, 1)';
          ctx.textAlign = 'center';
          ctx.fillText('59', xPos, top - 5);
        }
        
        ctx.restore();
      }
    };
  }, [isExpanded]);

  const chartData = useMemo(() => {
    const points: PointData[] = kaleciData.map(kaleci => ({
      x: kaleci.pasYzd,
      y: kaleci.pasdnmeMb,
      oyuncuIsim: kaleci.oyuncu_isim,
      oyuncu_id: kaleci.oyuncu_id,
      type: 'kaleci'
    }));

    if (highlightedPlayerId) {
      // Vurgulanan oyuncuyu ayır
      const highlightedPoint = points.find(p => p.oyuncu_id === highlightedPlayerId);
      const otherPoints = points.filter(p => p.oyuncu_id !== highlightedPlayerId);

      return {
        datasets: [
          {
            label: 'Diğer Kaleciler',
            data: otherPoints,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            pointRadius: isExpanded ? 6 : 4,
            pointHoverRadius: isExpanded ? 8 : 6,
            pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
          },
          ...(highlightedPoint ? [{
            label: highlightedPoint.oyuncuIsim,
            data: [highlightedPoint],
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: 'rgba(255, 99, 132, 1)',
            pointRadius: isExpanded ? 10 : 8,
            pointHoverRadius: isExpanded ? 12 : 10,
          }] : [])
        ]
      };
    }

    return {
      datasets: [
        {
          label: 'Kaleci İstatistikleri',
          data: points,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          pointRadius: isExpanded ? 6 : 4,
          pointHoverRadius: isExpanded ? 8 : 6,
          pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
        },
      ],
    };
  }, [kaleciData, highlightedPlayerId, isExpanded]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = context.raw;
            return `${point.oyuncuIsim}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'İsabetli Pas Yüzdesi (%)'
        },
        min: 15,
        max: 100
      },
      y: {
        title: {
          display: true,
          text: 'Maç Başına Pas Denemesi'
        },
        min: 10,
        max: 40
      }
    }
  }), [title]);

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md transition-all duration-300 ${
      isExpanded ? 'fixed inset-4 z-50 overflow-auto' : ''
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {showExpandButton && (
          <button
            onClick={toggleExpand}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isExpanded ? 'Kapat' : 'Büyüt'}
          </button>
        )}
      </div>
      <div className={isExpanded ? 'h-96' : 'h-64'}>
        <Scatter 
          ref={chartRef} 
          data={chartData} 
          options={chartOptions}
          plugins={[referenceLinePlugin]}
        />
      </div>
    </div>
  );
} 