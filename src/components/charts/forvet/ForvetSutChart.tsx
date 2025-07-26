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

interface ForvetSutChartProps {
  forvetData: ForvetData[];
  currentPlayerId?: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function ForvetSutChart({ 
  forvetData, 
  currentPlayerId, 
  isExpanded, 
  onToggleExpand 
}: ForvetSutChartProps) {
  const chartRef = useRef<ChartJS<'scatter'>>(null);

  const chartData = {
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
      const yPos = scales.y.getPixelForValue(0.85);
      
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
      const xPos = scales.x.getPixelForValue(0.15);
      
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
      
      ctx.restore();
    }
  };

  const chartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0 && onToggleExpand) {
        onToggleExpand();
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: isExpanded,
          text: 'xG/Şut'
        },
        ticks: {
          display: isExpanded
        }
      },
      y: {
        title: {
          display: isExpanded,
          text: 'Şut Hedefe/90'
        },
        ticks: {
          display: isExpanded
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = context.raw as PointData;
            return [
              `Oyuncu: ${point.oyuncuIsim}`,
              `xG/Şut: ${point.x}`,
              `Şut Hedefe/90: ${point.y}`
            ];
          }
        }
      },
      legend: {
        display: isExpanded
      }
    }
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm transition-all duration-300 overflow-hidden ${
      isExpanded ? 'fixed inset-4 z-50' : ''
    }`}>
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium truncate">Şut</h3>
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
            <h4 className="font-semibold text-sm mb-2">Forvet Şut Analizi</h4>
            <p className="text-xs mb-2">Hedefe giden şut sayısı ve şut başına düşen beklenen gol değeri.</p>
            <p className="text-xs">Şut kalitesi ve şut sıklığının karşılaştırması.</p>
          </div>
          
          <div className="md:w-3/4 relative">
            <div className="h-[500px] relative">
              {/* Sabit bölge yazıları */}
              <>
                {/* Sol üst köşe - Turuncu */}
                <div className="absolute ml-12 mt-3 text-left z-10">
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Hedefe Yüksek</div>
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>xG/Şut Düşük</div>
                </div>
                
                {/* Sağ üst köşe - Yeşil */}
                <div className="absolute right-0 mr-3 mt-3 text-right z-10">
                  <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>Şut Hedefe Yüksek</div>
                  <div className="font-bold text-xs" style={{ color: 'rgba(0, 128, 0, 1)' }}>xG/Şut Yüksek</div>
                </div>
                
                {/* Sol alt köşe - Kırmızı */}
                <div className="absolute bottom-0 ml-12 mb-12 text-left z-10">
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>Şut Hedefe Düşük</div>
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 0, 0, 1)' }}>xG/Şut Düşük</div>
                </div>
                
                {/* Sağ alt köşe - Turuncu */}
                <div className="absolute bottom-0 right-0 mr-3 mb-12 text-right z-10">
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>Şut Hedefe Düşük</div>
                  <div className="font-bold text-xs" style={{ color: 'rgba(255, 140, 0, 1)' }}>xG/Şut Yüksek</div>
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