'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GiderItem {
  madde: string;
  bu_ay: number;
  gecen_ay: number;
  bu_sezon: number;
}

interface ProcessedGiderItem {
  id: string;
  madde: string;
  buAy: string;
  gecenAy: string;
  buSezon: string;
  color: string;
  hasChildren: boolean;
  children?: ProcessedGiderItem[];
}

export default function GiderPage() {
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  const [giderData, setGiderData] = useState<GiderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Veri çekme fonksiyonu
  useEffect(() => {
    const fetchGiderData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/gider-tablosu');
        const result = await response.json();
        
        if (result.success) {
          setGiderData(result.data);
        } else {
          setError('Veriler yüklenirken hata oluştu');
        }
      } catch (err) {
        setError('Bağlantı hatası oluştu');
        console.error('Gider verileri çekilirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGiderData();
  }, []);

  // Para formatlama fonksiyonu
  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  // Toplam hesaplama fonksiyonları
  const getTotalBuAy = () => giderData.reduce((sum, item) => sum + item.bu_ay, 0);
  const getTotalGecenAy = () => giderData.reduce((sum, item) => sum + item.gecen_ay, 0);
  const getTotalBuSezon = () => giderData.reduce((sum, item) => sum + item.bu_sezon, 0);

  // Veriyi hiyerarşik yapıya çevirme fonksiyonu
  const processGiderData = (): ProcessedGiderItem[] => {
    const colors = [
      '#f59e0b', '#10b981', '#f97316', '#06b6d4', '#8b5cf6', '#ec4899', 
      '#14b8a6', '#84cc16', '#6366f1', '#ef4444', '#a855f7', '#22c55e'
    ];

    // Vergi ile ilgili maddeler
    const vergiMaddeleri = ['KDV', 'İşveren Sigortası', 'Diğer'];
    const vergiChildren: ProcessedGiderItem[] = [];
    const processedItems: ProcessedGiderItem[] = [];
    
    let colorIndex = 0;
    let vergiTotalBuAy = 0;
    let vergiTotalGecenAy = 0;
    let vergiTotalBuSezon = 0;

    giderData.forEach((item) => {
      // "Diğer" maddesini özel olarak kontrol et - Bu Ay verisi 387 olan vergi kategorisine dahil edilmesin
      if (vergiMaddeleri.includes(item.madde) && !(item.madde === 'Diğer' && item.bu_ay === 387)) {
        // Vergi alt kategorisi
        vergiChildren.push({
          id: `${item.madde.toLowerCase().replace(/\s+/g, '-')}-vergi`,
          madde: item.madde,
          buAy: formatCurrency(item.bu_ay),
          gecenAy: formatCurrency(item.gecen_ay),
          buSezon: formatCurrency(item.bu_sezon),
          color: '#10b981',
          hasChildren: false,
        });
        vergiTotalBuAy += item.bu_ay;
        vergiTotalGecenAy += item.gecen_ay;
        vergiTotalBuSezon += item.bu_sezon;
      } else if (item.madde !== 'Vergi') {
        // Diğer kategoriler (Vergi kategorisi dışındaki tüm maddeler dahil 387 tutarlı "Diğer")
        processedItems.push({
          id: `${item.madde.toLowerCase().replace(/\s+/g, '-')}-${item.bu_ay}`,
          madde: item.madde,
          buAy: formatCurrency(item.bu_ay),
          gecenAy: formatCurrency(item.gecen_ay),
          buSezon: formatCurrency(item.bu_sezon),
          color: colors[colorIndex % colors.length],
          hasChildren: false,
        });
        colorIndex++;
      }
    });

    // Vergi ana kategorisini ekle
    if (vergiChildren.length > 0) {
      processedItems.unshift({
        id: 'vergi',
        madde: 'Vergi',
        buAy: formatCurrency(vergiTotalBuAy),
        gecenAy: formatCurrency(vergiTotalGecenAy),
        buSezon: formatCurrency(vergiTotalBuSezon),
        color: '#10b981',
        hasChildren: true,
        children: vergiChildren,
      });
    }

    return processedItems;
  };

  // Chart data - Stacked area chart
  const chartData = {
    labels: ['Tem 2023', 'Ağu 2023', 'Eyl 2023', 'Eki 2023', 'Kas 2023', 'Ara 2023', 'Oca 2024', 'Şub 2024', 'Mar 2024', 'Nis 2024'],
    datasets: [
      {
        label: 'Toplam Gider',
        data: [0.043, 2.04, 2.01, 2.17, 3.83, 2.03, 2.40, 2.35, 3.79, 4.57],
        fill: true,
        backgroundColor: 'rgba(96, 165, 250, 0.8)',
        borderColor: 'rgba(96, 165, 250, 1)',
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        stacked: true,
      },
      y: {
        display: true,
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return '€' + value + 'B';
          },
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        stacked: true,
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
      },
    },
  };

  // İşlenmiş gider verisini al
  const processedGiderData = processGiderData();

  // Loading ve error kontrolü
  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mali Durum - Gider</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Veriler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mali Durum - Gider</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Hata: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mali Durum - Gider</h1>
      
      {/* Secondary Navbar */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <Link href="/mali-durum/genel" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Genel
          </Link>
          <Link href="/mali-durum/gelir" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Gelir
          </Link>
          <Link href="/mali-durum/gider" className="py-2 px-4 text-gray-900 bg-gray-100 rounded-t-lg font-semibold">
            Gider
          </Link>
        </nav>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Toplam Gider Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <h2 className="text-lg text-gray-600">Toplam Gider</h2>
          </div>
        </div>

        {/* Üst Metrikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">BU AY</div>
            <div className="text-xl font-bold">{formatCurrency(getTotalBuAy())}</div>
            <div className="text-sm text-gray-400">{formatCurrency(getTotalBuAy())}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">GEÇEN AY</div>
            <div className="text-xl font-bold">{formatCurrency(getTotalGecenAy())}</div>
            <div className="text-sm text-gray-400">{formatCurrency(getTotalGecenAy())}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">BU SEZON</div>
            <div className="text-xl font-bold">{formatCurrency(getTotalBuSezon())}</div>
            <div className="text-sm text-gray-400">{formatCurrency(getTotalBuSezon())}</div>
          </div>
        </div>

        {/* Grafik */}
        <div className="mb-8">
          <div style={{ height: '300px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Gider Kategorileri Tablosu */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase">MADDE</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 uppercase">BU AY ▼</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 uppercase">GEÇEN AY</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 uppercase">BU SEZON</th>
                </tr>
              </thead>
              <tbody>
                {processedGiderData.map((kategori) => (
                  <React.Fragment key={kategori.id}>
                    <tr className="border-b border-gray-100 hover:bg-gray-100">
                      <td className="py-3 px-4 flex items-center">
                        {kategori.hasChildren && (
                          <button
                            onClick={() => toggleExpanded(kategori.id)}
                            className="mr-2 text-gray-400 hover:text-gray-600"
                          >
                            {expandedItems[kategori.id] ? '▼' : '▶'}
                          </button>
                        )}
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: kategori.color }}></div>
                        <span className="text-sm">{kategori.madde}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm">{kategori.buAy}</td>
                      <td className="py-3 px-4 text-right text-sm">{kategori.gecenAy}</td>
                      <td className="py-3 px-4 text-right text-sm">{kategori.buSezon}</td>
                    </tr>
                    
                    {kategori.hasChildren && expandedItems[kategori.id] && kategori.children?.map((child, childIndex) => (
                      <tr key={`${kategori.id}-${childIndex}`} className="border-b border-gray-100 hover:bg-gray-100 bg-gray-25">
                        <td className="py-3 px-4 flex items-center pl-12">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: child.color }}></div>
                          <span className="text-sm text-gray-600">{child.madde}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">{child.buAy}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">{child.gecenAy}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">{child.buSezon}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 