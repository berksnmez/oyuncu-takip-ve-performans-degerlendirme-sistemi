'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Insan vücudu silüeti component'i
const BodySilhouette = ({ injuredArea }: { injuredArea?: string }) => {
  const getInjuredAreaColor = (area: string) => {
    return injuredArea === area ? '#ef4444' : '#6b7280';
  };

  return (
    <div className="flex gap-2 justify-center">
      {/* Ön görünüm */}
      <svg width="40" height="80" viewBox="0 0 40 80" className="border border-gray-300 rounded">
        {/* Kafa */}
        <circle cx="20" cy="8" r="6" fill={getInjuredAreaColor('kafa')} />
        {/* Boyun */}
        <rect x="18" y="14" width="4" height="4" fill={getInjuredAreaColor('boyun')} />
        {/* Gövde */}
        <rect x="12" y="18" width="16" height="20" fill={getInjuredAreaColor('govde')} />
        {/* Köprücük kemiği */}
        <rect x="15" y="18" width="10" height="3" fill={getInjuredAreaColor('koprucuk')} />
        {/* Sol kol */}
        <rect x="6" y="20" width="6" height="15" fill={getInjuredAreaColor('sol-kol')} />
        {/* Sağ kol */}
        <rect x="28" y="20" width="6" height="15" fill={getInjuredAreaColor('sag-kol')} />
        {/* Sol bacak */}
        <rect x="14" y="38" width="5" height="25" fill={getInjuredAreaColor('sol-bacak')} />
        {/* Sağ bacak */}
        <rect x="21" y="38" width="5" height="25" fill={getInjuredAreaColor('sag-bacak')} />
        {/* Sol ayak */}
        <rect x="13" y="63" width="7" height="4" fill={getInjuredAreaColor('sol-ayak')} />
        {/* Sağ ayak */}
        <rect x="20" y="63" width="7" height="4" fill={getInjuredAreaColor('sag-ayak')} />
      </svg>
      
      {/* Arka görünüm */}
      <svg width="40" height="80" viewBox="0 0 40 80" className="border border-gray-300 rounded">
        {/* Kafa */}
        <circle cx="20" cy="8" r="6" fill={getInjuredAreaColor('kafa')} />
        {/* Boyun */}
        <rect x="18" y="14" width="4" height="4" fill={getInjuredAreaColor('boyun')} />
        {/* Sırt */}
        <rect x="12" y="18" width="16" height="20" fill={getInjuredAreaColor('sirt')} />
        {/* Sol kol arka */}
        <rect x="6" y="20" width="6" height="15" fill={getInjuredAreaColor('sol-kol')} />
        {/* Sağ kol arka */}
        <rect x="28" y="20" width="6" height="15" fill={getInjuredAreaColor('sag-kol')} />
        {/* Sol bacak arka */}
        <rect x="14" y="38" width="5" height="25" fill={getInjuredAreaColor('sol-bacak')} />
        {/* Sağ bacak arka */}
        <rect x="21" y="38" width="5" height="25" fill={getInjuredAreaColor('sag-bacak')} />
        {/* Sol ayak arka */}
        <rect x="13" y="63" width="7" height="4" fill={getInjuredAreaColor('sol-ayak')} />
        {/* Sağ ayak arka */}
        <rect x="20" y="63" width="7" height="4" fill={getInjuredAreaColor('sag-ayak')} />
      </svg>
    </div>
  );
};

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
        <span>🏥</span>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  );
};

export default function MevcutSakatliklarPage() {
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [sakatliklar, setSakatliklar] = useState([
    {
      tarih: '21/4/2024',
      isim: 'Ali Taban',
      sakatlik: 'Sırtta zorlanma',
      fizikselDurum: 'sirt',
      ayrintilar: 'Şu an sırtta zorlanma sakatlığıyla ilgili tedavi görüyor. Bu sakatlığı 21 Nisan 2024 günkü Hürriyetspor\'un Elmasbaşgelerspor\'a 1-2 yenildiği maçta geçirmişti. Yaklaşık 8 gün ve 3 hafta arasında sahalardan uzak kalması bekleniyor.',
      tedavi: 'Fizyoterapist',
      tahminiDonus: '8/5/2024'
    },
    {
      tarih: '10/3/2024',
      isim: 'Metin Altunbaş',
      sakatlik: 'Köprücük kemiğinde kırık',
      fizikselDurum: 'koprucuk',
      ayrintilar: 'Şu an köprücük kemiğinde kırık sakatlığının uzman tedavisi sonrası rehabilitasyon aşamasında. Bu sakatlığı 10 Mart 2024 günü Hürriyetspor\'un Akhisar D.S. a 1-2 yenildiği maçta geçirmişti. Yaklaşık 4 - 8 gün sahalardan uzak kalması bekleniyor.',
      tedavi: 'Uzman',
      tahminiDonus: '2/5/2024'
    }
  ]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
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
            <span className="text-3xl">🏥</span>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Mevcut Sakatlıklar
              </h1>
              <p className="text-gray-600 mt-1">Şu anda tedavi gören oyuncular</p>
            </div>
          </div>
        </div>

        {/* Modern Navigation */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2">
            <nav className="flex space-x-2">
              <Link 
                href="/saglik-merkezi/mevcut-sakatliklar" 
                className="flex-1 py-3 px-6 text-center font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
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
                className="flex-1 py-3 px-6 text-center font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                📊 Sezon Özeti
              </Link>
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl">
                <span className="text-2xl">🤕</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Toplam Sakatlık</p>
                <p className="text-3xl font-bold text-red-600">{sakatliklar.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl">
                <span className="text-2xl">⚕️</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Tedavi Gören</p>
                <p className="text-3xl font-bold text-orange-600">{sakatliklar.filter(s => s.tedavi).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-xl">
                <span className="text-2xl">🔄</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Dönüş Bekleyen</p>
                <p className="text-3xl font-bold text-emerald-600">{sakatliklar.filter(s => s.tahminiDonus).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Table Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <span>🏥</span>
              <span>Aktif Sakatlık Listesi</span>
            </h2>
            <p className="text-red-100 mt-1">Şu anda tedavi gören {sakatliklar.length} oyuncu</p>
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
                    🩹 Sakatlık Türü
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    🫀 Fiziksel Durum
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    📝 Detaylar
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    ⚕️ Tedavi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    🔄 Tahmini Dönüş
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sakatliklar.map((sakatlik, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-300 group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                        <span className="text-sm font-medium text-gray-900">{sakatlik.tarih}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {sakatlik.isim.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{sakatlik.isim}</div>
                          <div className="text-xs text-gray-500">Oyuncu</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                        {sakatlik.sakatlik}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center space-y-2">
                        <BodySilhouette injuredArea={sakatlik.fizikselDurum} />
                        <span className="text-xs text-gray-500 capitalize">{sakatlik.fizikselDurum}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-md">
                      <div className="text-xs leading-relaxed text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {sakatlik.ayrintilar}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                        {sakatlik.tedavi}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-emerald-600">{sakatlik.tahminiDonus}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sakatliklar.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-xl font-bold text-gray-600 mb-2">Mükemmel Durum!</div>
              <div className="text-gray-500">Şu anda mevcut sakatlık bulunmamaktadır.</div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>🔄 Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</span>
                <span>•</span>
                <span>📊 Toplam kayıt: {sakatliklar.length}</span>
              </div>
              <button 
                onClick={() => showNotification('Veriler başarıyla yenilendi!', 'success')}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all duration-300 hover:scale-105"
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