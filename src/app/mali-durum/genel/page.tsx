'use client';

import React from 'react';
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

export default function GenelPage() {
  // Veri hesaplamaları
  const gelirData = [9.00, 2.77, 1.41, 3.07, 1.33, 11.72, 0.525, 0.880, 0.787, 0.935];
  const giderData = [0.043, 2.04, 2.01, 2.17, 3.83, 2.03, 2.40, 2.35, 3.79, 4.57];
  const netData = gelirData.map((gelir, index) => gelir - giderData[index]);
  
  // Toplamlar
  const toplamGelir = gelirData.reduce((sum, val) => sum + val, 0);
  const toplamGider = giderData.reduce((sum, val) => sum + val, 0);
  const genelDurum = toplamGelir - toplamGider;
  
  // Bu ay verileri (son ay - Nisan)
  const buAyGelir = gelirData[gelirData.length - 1];
  const buAyGider = giderData[giderData.length - 1];
  const buAyNet = buAyGelir - buAyGider;

  // Genel Durum Chart
  const genelDurumChartData = {
    labels: ['Tem 2023', 'Ağu 2023', 'Eyl 2023', 'Eki 2023', 'Kas 2023', 'Ara 2023', 'Oca 2024', 'Şub 2024', 'Mar 2024', 'Nis 2024'],
    datasets: [
      {
        label: 'Genel Durum',
        data: netData.map((val, index) => netData.slice(0, index + 1).reduce((sum, curr) => sum + curr, 0)),
        fill: true,
        backgroundColor: 'rgba(236, 72, 153, 0.6)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  // Bu Ayki Net Chart
  const netChartData = {
    labels: ['Tem 2023', 'Ağu 2023', 'Eyl 2023', 'Eki 2023', 'Kas 2023', 'Ara 2023', 'Oca 2024', 'Şub 2024', 'Mar 2024', 'Nis 2024'],
    datasets: [
      {
        label: 'Net Durum',
        data: netData,
        fill: true,
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  // Bu Ayki Gelir Chart
  const gelirChartData = {
    labels: ['Tem 2023', 'Ağu 2023', 'Eyl 2023', 'Eki 2023', 'Kas 2023', 'Ara 2023', 'Oca 2024', 'Şub 2024', 'Mar 2024', 'Nis 2024'],
    datasets: [
      {
        label: 'Gelir',
        data: gelirData,
        fill: true,
        backgroundColor: 'rgba(156, 163, 175, 0.6)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  // Bu Ayki Gider Chart
  const giderChartData = {
    labels: ['Tem 2023', 'Ağu 2023', 'Eyl 2023', 'Eki 2023', 'Kas 2023', 'Ara 2023', 'Oca 2024', 'Şub 2024', 'Mar 2024', 'Nis 2024'],
    datasets: [
      {
        label: 'Gider',
        data: giderData,
        fill: true,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
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
        min: -5,
        max: 18,
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

  const smallChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        min: 0,
        max: 12,
        stepSize: 2,
      },
    },
  };

  const giderChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        min: 0,
        max: 5,
        stepSize: 1,
      },
    },
  };

  // Gelir özet verileri
  const gelirOzet = [
    { madde: 'Gişe Hasılatları', tutar: '€233' },
    { madde: 'Sezonluk Biletler', tutar: '€208' },
    { madde: 'TV Geliri', tutar: '€0' },
    { madde: 'Ticaret', tutar: '€0' },
    { madde: 'Satılan Oyuncular', tutar: '€0' },
    { madde: 'Para Ödülü', tutar: '€0' },
    { madde: 'Yatırımlar', tutar: '€0' },
    { madde: 'Faiz', tutar: '€31' },
    { madde: 'Sponsorluk', tutar: '€0' },
    { madde: 'Maç Günü Geliri', tutar: '€124' },
    { madde: 'Bağışlar', tutar: '€0' },
    { madde: 'Yaratılan Kaynak', tutar: '€0' },
    { madde: 'Diğer', tutar: '€0' },
    { madde: 'Loca ve Ağırlama Geliri', tutar: '€3' },
    { madde: 'Kira Geliri', tutar: '€0' },
  ];

  // Gider özet verileri
  const giderOzet = [
    { madde: 'Futbol Dışı Giderler', tutar: '€814' },
    { madde: 'Vergi', tutar: '€42' },
    { madde: 'Saha Bakımı', tutar: '€685' },
    { madde: 'Maç Günü Giderleri', tutar: '€2' },
    { madde: 'Altyapı', tutar: '€294' },
    { madde: 'Seyahat Masrafları', tutar: '€0' },
    { madde: 'Gözlemcilik Maliyetleri', tutar: '€0' },
    { madde: 'Sadakat Primleri', tutar: '€0' },
    { madde: 'Transfer Harcamaları', tutar: '€0' },
    { madde: 'Diğer', tutar: '€387' },
    { madde: 'Kira Ücretleri', tutar: '€0' },
    { madde: 'Lig Cezaları', tutar: '€0' },
    { madde: 'Borç Geri Ödemeleri ve Faiz', tutar: '€0' },
    { madde: 'Sigorta', tutar: '€0' },
    { madde: 'Direktör Maaşları', tutar: '€0' },
    { madde: 'Temettüler', tutar: '€0' },
    { madde: 'Primler', tutar: '€0' },
    { madde: 'Temsilci ve Aracı Temsilci Ücretleri', tutar: '€0' },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mali Durum - Genel</h1>
      
      {/* Secondary Navbar */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <Link href="/mali-durum/genel" className="py-2 px-4 text-gray-900 bg-gray-100 rounded-t-lg font-semibold">
            Genel
          </Link>
          <Link href="/mali-durum/gelir" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Gelir
          </Link>
          <Link href="/mali-durum/gider" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Gider
          </Link>
        </nav>
      </div>
      
      <div className="space-y-6">
        {/* Genel Durum */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">!</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">GENEL DURUM</h2>
              <div className="text-2xl font-bold">€{(genelDurum * 1000).toLocaleString()}</div>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Line data={genelDurumChartData} options={chartOptions} />
          </div>
        </div>

        {/* Bu Ayki Gelir / Gider */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">%</span>
            </div>
                         <div>
               <h2 className="text-lg font-semibold">BU AYKI GELİR / (GİDER)</h2>
               <div className="text-2xl font-bold">€(-1,627)</div>
               <div className="text-sm text-gray-500">
                 <span className="mr-4">BU SEZON: € 5,562</span>
                 <span>GEÇEN SEZON: €0</span>
               </div>
             </div>
          </div>
          <div style={{ height: '200px' }}>
            <Line data={netChartData} options={chartOptions} />
          </div>
        </div>

        {/* Alt Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bu Ayki Gelir */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">↑</span>
              </div>
                             <div>
                 <h3 className="text-lg font-semibold">BU AYKI GELİR</h3>
                 <div className="text-xl font-bold">€599</div>
               </div>
            </div>
            <div style={{ height: '150px' }}>
              <Line data={gelirChartData} options={smallChartOptions} />
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">ÖZET</h4>
              <div className="space-y-1 text-sm">
                {gelirOzet.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.madde}</span>
                    <span>{item.tutar}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bu Ayki Gider */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">↓</span>
              </div>
                             <div>
                 <h3 className="text-lg font-semibold">BU AYKI GİDER</h3>
                 <div className="text-xl font-bold">€2,226</div>
               </div>
            </div>
                         <div style={{ height: '150px' }}>
               <Line data={giderChartData} options={giderChartOptions} />
             </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">ÖZET</h4>
              <div className="space-y-1 text-sm">
                {giderOzet.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.madde}</span>
                    <span>{item.tutar}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 