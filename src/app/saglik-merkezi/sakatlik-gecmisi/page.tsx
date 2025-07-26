'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SakatlikGecmisi {
  mac: string;
  oynamadigi_sure: string;
  oyuncu_id: number;
  oyuncu_isim: string;
  sakatlik_derece: string;
  sakatlik_detay: string;
  tarih: string;
  tedavi_doktor: string;
  yer: string;
}

// Modern notification component
const ModernNotification = ({ 
  message, 
  type = 'info', 
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error' | 'info'; 
  onClose: () => void 
}) => {
  const bgColor = type === 'success' ? 'bg-emerald-500' : 
                  type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 animate-in slide-in-from-right`}>
      <div className="flex items-center space-x-2">
        <span>📋</span>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  );
};

// Modern player card component
const PlayerCard = ({ name, days, injuryCount, playerId }: { 
  name: string; 
  days: number; 
  injuryCount: number; 
  playerId: number; 
}) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 group hover:scale-105">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
          {!imageError ? (
            <img
              src={`/images/${playerId}.png`}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-white font-bold text-sm">{name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors duration-300">
            {name}
          </h3>
          <div className="text-xs text-gray-500 mt-1">Oyuncu</div>
        </div>
        <div className="space-y-2 w-full">
          <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            {days} gün
          </div>
          <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
            {injuryCount} sakatlık
          </div>
        </div>
      </div>
    </div>
  );
};

// Line chart component for injury trends  
const LineChart = ({ data }: { data: Array<{ month: string; count: number }> }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartWidth = 900;
  const chartHeight = 350;
  const padding = 60;
  
  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (item.count / maxCount) * (chartHeight - 2 * padding);
    return { x, y, count: item.count, month: item.month };
  });
  
  // Create path string for the line
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
        <span>📈</span>
        <span>Son 12 Ayda Yaşanan Sakatlıklar</span>
      </h3>
      
      <div className="w-full overflow-x-auto">
        <div className="flex justify-center min-w-[900px]">
          <svg width={chartWidth} height={chartHeight} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-inner">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={padding + (i * (chartHeight - 2 * padding) / 4)}
              x2={chartWidth - padding}
              y2={padding + (i * (chartHeight - 2 * padding) / 4)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Vertical grid lines */}
          {data.map((_, index) => (
            <line
              key={`v-grid-${index}`}
              x1={padding + (index / (data.length - 1)) * (chartWidth - 2 * padding)}
              y1={padding}
              x2={padding + (index / (data.length - 1)) * (chartWidth - 2 * padding)}
              y2={chartHeight - padding}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Area under the line */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
          
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
            fill="url(#areaGradient)"
          />
          
                     {/* Main line */}
           <path
             d={pathData}
             fill="none"
             stroke="url(#lineGradient)"
             strokeWidth="4"
             strokeLinecap="round"
             strokeLinejoin="round"
           />
          
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#f97316' }} />
              <stop offset="100%" style={{ stopColor: '#ef4444' }} />
            </linearGradient>
          </defs>
          
                     {/* Data points */}
           {points.map((point, index) => (
             <g key={`point-${index}`}>
               <circle
                 cx={point.x}
                 cy={point.y}
                 r="8"
                 fill="white"
                 stroke="#ef4444"
                 strokeWidth="4"
                 className="hover:r-10 transition-all duration-300 cursor-pointer"
               />
               <circle
                 cx={point.x}
                 cy={point.y}
                 r="3"
                 fill="#ef4444"
               />
             </g>
           ))}
          
                     {/* Month labels */}
           {points.map((point, index) => (
             <text
               key={`month-${index}`}
               x={point.x}
               y={chartHeight - 15}
               textAnchor="middle"
               fill="#6b7280"
               fontSize="14"
               fontWeight="600"
             >
               {point.month}
             </text>
           ))}
           
           {/* Value labels */}
           {points.map((point, index) => (
             <text
               key={`value-${index}`}
               x={point.x}
               y={point.y - 15}
               textAnchor="middle"
               fill="#374151"
               fontSize="13"
               fontWeight="bold"
               className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             >
               {point.count}
             </text>
           ))}
           </svg>
         </div>
       </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          <span>Aylık Sakatlık Sayısı</span>
        </div>
      </div>
    </div>
  );
};

export default function SakatlikGecmisiPage() {
  const [injuryHistory, setInjuryHistory] = useState<SakatlikGecmisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  useEffect(() => {
    const fetchSakatlikGecmisi = async () => {
      try {
        const response = await fetch('/api/sakatlik-gecmisi');
        if (!response.ok) {
          throw new Error('Veri alınamadı');
        }
        const data = await response.json();
        setInjuryHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSakatlikGecmisi();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
  };

  // Utility function to parse dates in DD.MM.YYYY format (from tarih column)
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    
    // Tarih kolunundaki veriler "gün.ay.yıl" formatında geliyor
    const parts = dateStr.split('.');
    if (parts.length !== 3) return new Date();
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
  };

  // Calculate stats
  const totalInjuries = injuryHistory.length;
  const severeInjuries = injuryHistory.filter(injury => injury.sakatlik_derece === 'Ağır').length;
  const moderateInjuries = injuryHistory.filter(injury => injury.sakatlik_derece === 'Kısmi').length;
  const lightInjuries = injuryHistory.filter(injury => injury.sakatlik_derece === 'Az').length;

  // Calculate top missed players based on sakatlik_gecmisi table data
  const topMissedPlayers = React.useMemo(() => {
    const playerData: { [key: string]: { name: string; totalDays: number; injuryCount: number; playerId: number } } = {};
    const now = new Date();

    injuryHistory.forEach(injury => {
      // Tarih kontrolü - sadece son 12 ayın verilerini kullan
      const injuryDate = parseDate(injury.tarih); // tarih kolunu parse et (gün.ay.yıl formatı)
      const monthsDiff = (now.getFullYear() - injuryDate.getFullYear()) * 12 + (now.getMonth() - injuryDate.getMonth());
      
      // Son 12 ay içindeki sakatlıkları filtrele
      if (monthsDiff >= 0 && monthsDiff < 12) {
        const playerKey = injury.oyuncu_isim;
        
        if (!playerData[playerKey]) {
          playerData[playerKey] = {
            name: injury.oyuncu_isim,
            totalDays: 0,
            injuryCount: 0,
            playerId: injury.oyuncu_id
          };
        }

        // oynamadigi_sure kolonundan gün sayısını parse et - farklı formatları destekle
        let days = 0;
        const sureText = injury.oynamadigi_sure.toLowerCase();
        
        // "X gün" formatı
        const gunMatch = sureText.match(/(\d+)\s*g[üu]n/);
        if (gunMatch) {
          days = parseInt(gunMatch[1], 10);
        }
        // "X hafta" formatı
        else {
          const haftaMatch = sureText.match(/(\d+)\s*hafta/);
          if (haftaMatch) {
            days = parseInt(haftaMatch[1], 10) * 7; // hafta to gün
          }
          // "X ay" formatı  
          else {
            const ayMatch = sureText.match(/(\d+)\s*ay/);
            if (ayMatch) {
              days = parseInt(ayMatch[1], 10) * 30; // ay to gün (yaklaşık)
            }
            // Sadece rakam varsa gün olarak al
            else {
              const rakamMatch = sureText.match(/(\d+)/);
              if (rakamMatch) {
                days = parseInt(rakamMatch[1], 10);
              }
            }
          }
        }
        
        playerData[playerKey].totalDays += days;
        playerData[playerKey].injuryCount += 1;
      }
    });

    return Object.values(playerData)
      .filter(player => player.totalDays > 0) // Sadece sakatlık yaşayan oyuncuları al
      .sort((a, b) => b.totalDays - a.totalDays) // En fazla gün kaybedenden az olana
      .slice(0, 6); // İlk 6 oyuncu
  }, [injuryHistory]);

  // Calculate chart data for monthly injury trends based on tarih column
  const chartData = React.useMemo(() => {
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const now = new Date();
    const monthlyData: { month: string; count: number; sortOrder: number }[] = [];
    
    // Son 12 ayı sırayla oluştur (en eskiden en yeniye)
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyData.push({
        month: monthKey,
        count: 0,
        sortOrder: 11 - i
      });
    }
    
    // Sakatlık verilerini tarih kolununa göre aylara grupla
    injuryHistory.forEach(injury => {
      const injuryDate = parseDate(injury.tarih); // tarih kolunu kullan
      
      // Son 12 ay içinde mi kontrol et
      const monthsDiff = (now.getFullYear() - injuryDate.getFullYear()) * 12 + (now.getMonth() - injuryDate.getMonth());
      if (monthsDiff >= 0 && monthsDiff < 12) {
        const monthKey = monthNames[injuryDate.getMonth()];
        
        // İlgili ayı bul ve count'unu artır
        const monthData = monthlyData.find(m => m.month === monthKey);
        if (monthData) {
          monthData.count += 1;
        }
      }
    });
    
    // Sırayla döndür ve sortOrder'ı kaldır
    return monthlyData
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ month, count }) => ({ month, count }));
  }, [injuryHistory]);

  const getDegreeColor = (degree: string) => {
    switch (degree) {
      case 'Ağır': return 'bg-red-100 text-red-800';
      case 'Kısmi': return 'bg-orange-100 text-orange-800';
      case 'Az': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
      {/* Notification */}
      {notification && (
        <ModernNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
            <span className="text-3xl">📋</span>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Sakatlık Geçmişi
              </h1>
              <p className="text-gray-600 mt-1">Takımın geçmiş sakatlık kayıtları ve trendleri</p>
            </div>
          </div>
        </div>

        {/* Modern Navigation */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2">
            <nav className="flex space-x-2">
              <Link 
                href="/saglik-merkezi/mevcut-sakatliklar" 
                className="flex-1 py-3 px-6 text-center font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                🩹 Mevcut Sakatlıklar
              </Link>
              <Link 
                href="/saglik-merkezi/sakatlik-gecmisi" 
                className="flex-1 py-3 px-6 text-center font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                📋 Sakatlık Geçmişi
              </Link>
              <Link 
                href="/saglik-merkezi/sezon-ozeti" 
                className="flex-1 py-3 px-6 text-center font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                📊 Sezon Özeti
              </Link>
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Toplam Sakatlık</p>
                <p className="text-3xl font-bold text-orange-600">{loading ? '...' : totalInjuries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl">
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Ciddi Sakatlık</p>
                <p className="text-3xl font-bold text-red-600">{loading ? '...' : severeInjuries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-3 rounded-xl">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Orta Sakatlık</p>
                <p className="text-3xl font-bold text-orange-600">{loading ? '...' : moderateInjuries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-3 rounded-xl">
                <span className="text-2xl">💛</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Hafif Sakatlık</p>
                <p className="text-3xl font-bold text-yellow-600">{loading ? '...' : lightInjuries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex justify-center items-center h-48">
              <div className="text-gray-500 flex items-center space-x-2">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                <span>Trend verileri yükleniyor...</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex justify-center items-center h-48">
              <div className="text-red-500">⚠️ Hata: {error}</div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <LineChart data={chartData} />
          </div>
        )}

        {/* Top missed players */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-orange-600 flex items-center space-x-2">
              <span>🏆</span>
              <span>Son 12 Ayda En Fazla Oynayamayan Oyuncular</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {loading ? (
                <div className="col-span-full text-center text-gray-500 py-8">
                  <div className="animate-pulse flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span>Oyuncu verileri yükleniyor...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="col-span-full text-center text-red-500 py-8">⚠️ Hata: {error}</div>
              ) : (
                topMissedPlayers.map((player, index) => (
                  <PlayerCard
                    key={index}
                    name={player.name}
                    days={player.totalDays}
                    injuryCount={player.injuryCount}
                    playerId={player.playerId}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modern Table Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <span>📋</span>
              <span>Detaylı Sakatlık Geçmişi</span>
            </h2>
            <p className="text-orange-100 mt-1">Tüm sakatlık kayıtları ve detayları</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    📅 Tarih
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    👤 Oyuncu
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    ⚠️ Derece
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    🩹 Sakatlık Detayı
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    📍 Yer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    ⚽ Maç
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    ⚕️ Tedavi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    ⏱️ Süre
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-2 text-gray-500">
                        <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                        <span>Sakatlık geçmişi yükleniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-red-500">
                      ⚠️ Hata: {error}
                    </td>
                  </tr>
                ) : injuryHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <div className="text-xl font-bold text-gray-600 mb-2">Harika!</div>
                      <div className="text-gray-500">Henüz sakatlık geçmişi kaydı bulunmuyor.</div>
                    </td>
                  </tr>
                ) : (
                  injuryHistory.map((injury, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 group"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                          <span className="text-sm font-medium text-gray-900">{injury.tarih}</span>
                        </div>
                      </td>
                                             <td className="px-6 py-5 whitespace-nowrap">
                         <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                             <img
                               src={`/images/${injury.oyuncu_id}.png`}
                               alt={injury.oyuncu_isim}
                               className="w-full h-full object-cover"
                               onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = 'none';
                                 const parent = target.parentElement;
                                 if (parent) {
                                   parent.innerHTML = `<span class="text-white font-bold text-sm">${injury.oyuncu_isim.charAt(0)}</span>`;
                                 }
                               }}
                             />
                           </div>
                           <div>
                             <div className="text-sm font-bold text-gray-900">{injury.oyuncu_isim}</div>
                             <div className="text-xs text-gray-500">Oyuncu</div>
                           </div>
                         </div>
                       </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${getDegreeColor(injury.sakatlik_derece)}`}>
                          {injury.sakatlik_derece}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {injury.sakatlik_detay}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{injury.yer}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-900 max-w-xs">{injury.mac}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                          {injury.tedavi_doktor}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium text-red-600">{injury.oynamadigi_sure}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>🔄 Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</span>
                <span>•</span>
                <span>📊 Toplam kayıt: {loading ? '...' : injuryHistory.length}</span>
              </div>
              <button 
                onClick={() => showNotification('Sakatlık geçmişi başarıyla yenilendi!', 'success')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                🔄 Yenile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 