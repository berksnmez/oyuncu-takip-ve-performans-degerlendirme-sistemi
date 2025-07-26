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

interface GelirItem {
  madde: string;
  bu_ay: number;
  gecen_ay: number;
  bu_sezon: number;
}

export default function GelirPage() {
  const [gelirData, setGelirData] = useState<GelirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Veri çekme fonksiyonu
  useEffect(() => {
    const fetchGelirData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/gelir-tablosu');
        const result = await response.json();
        
        if (result.success) {
          setGelirData(result.data);
        } else {
          setError('Veriler yüklenirken hata oluştu');
        }
      } catch (err) {
        setError('Bağlantı hatası oluştu');
        console.error('Gelir verileri çekilirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGelirData();
  }, []);

  // Para formatlama fonksiyonu
  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  // Toplam hesaplama fonksiyonları
  const getTotalBuAy = () => gelirData.reduce((sum, item) => sum + item.bu_ay, 0);
  const getTotalGecenAy = () => gelirData.reduce((sum, item) => sum + item.gecen_ay, 0);
  const getTotalBuSezon = () => gelirData.reduce((sum, item) => sum + item.bu_sezon, 0);
  // Chart data
  const chartData = {
    labels: ['Tem 2023', 'Ağu 2023', 'Eyl 2023', 'Eki 2023', 'Kas 2023', 'Ara 2023', 'Oca 2024', 'Şub 2024', 'Mar 2024', 'Nis 2024'],
    datasets: [
      {
        label: 'Gelir',
        data: [9.00, 2.77, 1.41, 3.07, 1.33, 11.72, 0.525, 0.880, 0.787, 0.935],
        fill: true,
        backgroundColor: 'rgba(96, 165, 250, 0.3)',
        borderColor: 'rgba(96, 165, 250, 1)',
        borderWidth: 2,
        tension: 0.1,
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
      },
      y: {
        display: true,
        min: 0,
        max: 12,
        ticks: {
          stepSize: 2,
          callback: function(value: any) {
            return '€' + value + 'B';
          },
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
      },
    },
  };

  // Loading ve error kontrolü
  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mali Durum - Gelir</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Veriler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mali Durum - Gelir</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Hata: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mali Durum - Gelir</h1>
      
      {/* Secondary Navbar */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <Link href="/mali-durum/genel" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Genel
          </Link>
          <Link href="/mali-durum/gelir" className="py-2 px-4 text-gray-900 bg-gray-100 rounded-t-lg font-semibold">
            Gelir
          </Link>
          <Link href="/mali-durum/gider" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Gider
          </Link>
        </nav>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Toplam Gelir Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <h2 className="text-lg text-gray-600">Toplam Gelir</h2>
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

        {/* Gelir Kategorileri Tablosu */}
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
                {gelirData.map((kategori, index) => {
                  // Renk paleti
                  const colors = [
                    '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#f97316', 
                    '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', 
                    '#14b8a6', '#f59e0b', '#84cc16', '#6366f1', '#06b6d4', '#9ca3af'
                  ];
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-100">
                      <td className="py-3 px-4 flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="text-sm">{kategori.madde}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm">{formatCurrency(kategori.bu_ay)}</td>
                      <td className="py-3 px-4 text-right text-sm">{formatCurrency(kategori.gecen_ay)}</td>
                      <td className="py-3 px-4 text-right text-sm">{formatCurrency(kategori.bu_sezon)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 