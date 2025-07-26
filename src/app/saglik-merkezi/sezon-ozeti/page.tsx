'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SezonOzeti {
  bu_sezonki_sakatliklari: number;
  bu_sezon_forma_giymedigi_sure: string;
  oynamadigi_mac_yuzde: number;
  oyuncu_id: number;
  oyuncu_isim: string;
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
        <span>📊</span>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  );
};

export default function SezonOzetiPage() {
  const [sezonOzeti, setSezonOzeti] = useState<SezonOzeti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  useEffect(() => {
    const fetchSezonOzeti = async () => {
      try {
        const response = await fetch('/api/sezon-ozeti');
        if (!response.ok) {
          throw new Error('Veri alınamadı');
        }
        const data = await response.json();
        setSezonOzeti(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSezonOzeti();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage === 0) return 'text-emerald-600 bg-emerald-100';
    if (percentage <= 5) return 'text-green-600 bg-green-100';
    if (percentage <= 10) return 'text-yellow-600 bg-yellow-100';
    if (percentage <= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getBadgeColor = (count: number) => {
    if (count === 0) return 'bg-emerald-100 text-emerald-800';
    if (count <= 1) return 'bg-green-100 text-green-800';
    if (count <= 2) return 'bg-yellow-100 text-yellow-800';
    if (count <= 3) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Calculate stats
  const totalPlayers = sezonOzeti.length;
  const playersWithInjuries = sezonOzeti.filter(p => p.bu_sezonki_sakatliklari > 0).length;
  const playersWithoutInjuries = sezonOzeti.filter(p => p.bu_sezonki_sakatliklari === 0).length;
  const totalInjuries = sezonOzeti.reduce((sum, p) => sum + p.bu_sezonki_sakatliklari, 0);
  const averageInjuryRate = totalPlayers > 0 ? (totalInjuries / totalPlayers).toFixed(1) : '0';

  // Most injured players
  const mostInjuredPlayers = sezonOzeti
    .filter(p => p.bu_sezonki_sakatliklari > 0)
    .sort((a, b) => b.bu_sezonki_sakatliklari - a.bu_sezonki_sakatliklari)
    .slice(0, 5);

  // Players by availability percentage
  const highAvailabilityPlayers = sezonOzeti.filter(p => p.oynamadigi_mac_yuzde <= 5).length;
  const mediumAvailabilityPlayers = sezonOzeti.filter(p => p.oynamadigi_mac_yuzde > 5 && p.oynamadigi_mac_yuzde <= 15).length;
  const lowAvailabilityPlayers = sezonOzeti.filter(p => p.oynamadigi_mac_yuzde > 15).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
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
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Sezon Özeti
              </h1>
              <p className="text-gray-600 mt-1">Bu sezonun kapsamlı sağlık durumu analizi</p>
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
                className="flex-1 py-3 px-6 text-center font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                📋 Sakatlık Geçmişi
              </Link>
              <Link 
                href="/saglik-merkezi/sezon-ozeti" 
                className="flex-1 py-3 px-6 text-center font-medium text-white bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                📊 Sezon Özeti
              </Link>
            </nav>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Toplam Oyuncu</p>
                <p className="text-3xl font-bold text-blue-600">{loading ? '...' : totalPlayers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl">
                <span className="text-2xl">🤕</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Sakatlık Yaşayan</p>
                <p className="text-3xl font-bold text-red-600">{loading ? '...' : playersWithInjuries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-xl">
                <span className="text-2xl">💚</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Sağlıklı Oyuncu</p>
                <p className="text-3xl font-bold text-emerald-600">{loading ? '...' : playersWithoutInjuries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Ortalama Sakatlık</p>
                <p className="text-3xl font-bold text-orange-600">{loading ? '...' : averageInjuryRate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-xl">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-600">Yüksek Erişilebilirlik</h3>
                <p className="text-sm text-gray-600">≤ %5 maç kaçırma</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{loading ? '...' : highAvailabilityPlayers}</div>
            <p className="text-sm text-gray-500 mt-1">oyuncu</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yellow-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded-xl">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-600">Orta Erişilebilirlik</h3>
                <p className="text-sm text-gray-600">%5-15 maç kaçırma</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{loading ? '...' : mediumAvailabilityPlayers}</div>
            <p className="text-sm text-gray-500 mt-1">oyuncu</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl">
                <span className="text-xl">🚨</span>
              </div>
              <div>
                                 <h3 className="text-lg font-bold text-red-600">Düşük Erişilebilirlik</h3>
                 <p className="text-sm text-gray-600">&gt; %15 maç kaçırma</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-red-600">{loading ? '...' : lowAvailabilityPlayers}</div>
            <p className="text-sm text-gray-500 mt-1">oyuncu</p>
          </div>
        </div>

        {/* Most Injured Players */}
        {mostInjuredPlayers.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-6 text-red-600 flex items-center space-x-2">
                <span>🏆</span>
                <span>En Çok Sakatlık Yaşayan Oyuncular</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {mostInjuredPlayers.map((player, index) => (
                  <div key={player.oyuncu_id} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100 hover:shadow-md transition-all duration-300 group hover:scale-105">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center">
                        <img
                          src={`/images/${player.oyuncu_id}.png`}
                          alt={player.oyuncu_isim}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-white font-bold text-sm">${player.oyuncu_isim.charAt(0)}</span>`;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors duration-300">
                          {player.oyuncu_isim}
                        </h3>
                        <div className="text-xs text-gray-500 mt-1">Oyuncu</div>
                      </div>
                      <div className="space-y-2 w-full">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(player.bu_sezonki_sakatliklari)}`}>
                          {player.bu_sezonki_sakatliklari} sakatlık
                        </div>
                        <div className="text-xs text-gray-600">
                          {player.bu_sezon_forma_giymedigi_sure}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Data Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white p-6">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <span>📊</span>
              <span>Detaylı Sezon Özeti</span>
            </h2>
            <p className="text-blue-100 mt-1">Tüm oyuncuların sezon boyunca sağlık durumu</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    👤 Oyuncu
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    🤕 Bu Sezonki Sakatlıkları
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    ⏱️ Forma Giyemediği Süre
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    📊 Oynayamadığı Maç %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-2 text-gray-500">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span>Sezon özeti yükleniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-red-500">
                      ⚠️ Hata: {error}
                    </td>
                  </tr>
                ) : sezonOzeti.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <div className="text-xl font-bold text-gray-600 mb-2">Veri Yok</div>
                      <div className="text-gray-500">Henüz sezon özeti verisi bulunmuyor.</div>
                    </td>
                  </tr>
                ) : (
                  sezonOzeti.map((oyuncu, index) => (
                    <tr 
                      key={`${oyuncu.oyuncu_id}-${index}`} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 transition-all duration-300 group"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center justify-center">
                            <img
                              src={`/images/${oyuncu.oyuncu_id}.png`}
                              alt={oyuncu.oyuncu_isim}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-white font-bold text-sm">${oyuncu.oyuncu_isim.charAt(0)}</span>`;
                                }
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{oyuncu.oyuncu_isim}</div>
                            <div className="text-xs text-gray-500">Oyuncu</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(oyuncu.bu_sezonki_sakatliklari)}`}>
                          {oyuncu.bu_sezonki_sakatliklari}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="text-sm text-gray-900 font-medium">
                          {oyuncu.bu_sezon_forma_giymedigi_sure}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getPercentageColor(oyuncu.oynamadigi_mac_yuzde)}`}>
                          %{oyuncu.oynamadigi_mac_yuzde}
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
                <span>📊 Toplam oyuncu: {loading ? '...' : sezonOzeti.length}</span>
              </div>
              <button 
                onClick={() => showNotification('Sezon özeti başarıyla yenilendi!', 'success')}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300 hover:scale-105"
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