'use client';

import { Scatter } from 'react-chartjs-2';
import { useRef } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

type ForvetData = {
  bnzrsz_fv: number;
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
  "SHd/90": number;
  "xG/Sut": number;
  "Drp/90": number;
};

type PointData = {
  x: number;
  y: number;
  oyuncuIsim: string;
  oyuncu_id?: number;
  type: string;
  [key: string]: any;
};

interface ForvetOrtaChartProps {
  forvetData: ForvetData[];
  currentPlayerId?: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function ForvetOrtaChart({ 
  forvetData, 
  currentPlayerId, 
  isExpanded, 
  onToggleExpand 
}: ForvetOrtaChartProps) {
  const chartRef = useRef<ChartJS<'scatter'>>(null);

  const chartData = {
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

  const customImagePlugin = {
    id: 'customImagePlugin',
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      
      chart.data.datasets.forEach((dataset: any) => {
        dataset.data.forEach((point: PointData, index: number) => {
          if (point.oyuncu_id === currentPlayerId) {
            const meta = chart.getDatasetMeta(0);
            const element = meta.data[index];
            
            if (element) {
              const { x, y } = element;
              
              ctx.save();
              ctx.strokeStyle = 'red';
              ctx.lineWidth = 3;
              ctx.setLineDash([5, 5]);
              ctx.beginPath();
              ctx.arc(x, y, isExpanded ? 12 : 8, 0, 2 * Math.PI);
              ctx.stroke();
              ctx.restore();
            }
          }
        });
      });
    }
  };

  const referenceLinePlugin = {
    id: 'referenceLinePlugin',
    afterDatasetsDraw(chart: any) {
      const { ctx, chartArea: { left, right, top, bottom }, scales } = chart;
      
      // Yatay çizgi için (ortalama değer)
      const yPos = scales.y.getPixelForValue(5.0);
      
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
      const xPos = scales.x.getPixelForValue(16);
      
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
      
      ctx.restore();
    }
  };

  const chartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: isExpanded,
          text: 'Atak/İnisiyatif %',
          font: {
            size: 12
          }
        },
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
          text: 'Orta Girişim/90',
          font: {
            size: 12
          }
        },
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
              `Atak/İnisiyatif: ${context.parsed.x.toFixed(2)}%`,
              `Orta Girişim: ${context.parsed.y.toFixed(2)}`
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
        text: 'Orta',
        font: {
          size: isExpanded ? 16 : 12,
          weight: 'bold' as const
        }
      }
    },
    onClick: onToggleExpand
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm transition-all duration-300 overflow-hidden ${
      isExpanded ? 'fixed inset-4 z-50' : ''
    }`}>
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium truncate">Orta</h3>
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
            <h4 className="font-semibold text-sm mb-2">Forvet Orta Analizi</h4>
            <p className="text-xs mb-2">Forvet oyuncularının orta girişim sayıları ve atak/inisiyatif yüzdeleri.</p>
            <p className="text-xs">Ofansif katkı ve orta kalitesinin karşılaştırması oyun tarzını gösterir.</p>
          </div>
          
          <div className="md:w-3/4 relative">
            <div className="h-[500px] relative">
              {/* Sabit bölge yazıları */}
              <>
                {/* Sol üst köşe - Turuncu */}
                <div className="absolute ml-12 mt-3 text-left z-10">
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Atak/İnisiyatif Yüksek</div>
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Orta Girişim Düşük</div>
                </div>
                
                {/* Sağ üst köşe - Yeşil */}
                <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                  <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Atak/İnisiyatif Yüksek</div>
                  <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Orta Girişim Yüksek</div>
                </div>
                
                {/* Sol alt köşe - Kırmızı */}
                <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Atak/İnisiyatif Düşük</div>
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Orta Girişim Düşük</div>
                </div>
                
                {/* Sağ alt köşe - Turuncu */}
                <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Atak/İnisiyatif Düşük</div>
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Orta Girişim Yüksek</div>
                </div>
              </>
              
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