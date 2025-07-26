"use client";

import { useState, useEffect } from 'react';

interface FiksturItem {
  ev_mi_deplasman_mi: string;
  organizasyon: string;
  rakip: string;
  saat: string;
  skor: string;
  tarih: string;
}

interface PuanTablosuItem {
  atilan_gol: number;
  beraberlik: number;
  gol_averaji: number;
  kaybedilen_mac: number;
  kazanilan_mac: number;
  oynanan_mac: number;
  puan: number;
  takim_adi: string;
  takim_id: number;
  yenilen_gol: number;
}

export default function FikturPuanTablosuPage() {
  const [fiksturData, setFiksturData] = useState<FiksturItem[]>([]);
  const [puanTablosuData, setPuanTablosuData] = useState<PuanTablosuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fikstür verilerini çek
        const fiksturResponse = await fetch('/api/fikstur');
        const fiksturResult = await fiksturResponse.json();
        
        // Puan tablosu verilerini çek
        const puanResponse = await fetch('/api/puan-tablosu');
        const puanResult = await puanResponse.json();
        
        if (fiksturResult.success) {
          setFiksturData(fiksturResult.data);
        }
        
        if (puanResult.success) {
          setPuanTablosuData(puanResult.data);
        }
        
        if (!fiksturResult.success || !puanResult.success) {
          setError('Veriler çekilirken hata oluştu');
        }
        
      } catch (err) {
        setError('Bağlantı hatası oluştu');
        console.error('Veri çekme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Veriler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Hata: {error}
        </div>
      </div>
    );
  }

        return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="h-full flex gap-6">
        {/* Fikstür Tablosu */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Fikstür
            </h2>
          </div>
          <div className="overflow-auto" style={{ height: 'calc(100% - 64px)' }}>
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Saat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Rakip
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Ev/Dep
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Skor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Organizasyon
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fiksturData.map((item, index) => {
                  // Saati saat:dakika formatına çevir
                  const formatTime = (timeString: string) => {
                    if (!timeString) return '';
                    return timeString.substring(0, 5); // HH:MM:SS -> HH:MM
                  };

                  // Skor analizi ve görselleştirme
                  const getSkorStyle = (skor: string) => {
                    if (!skor || skor === '-') {
                      return { style: '', icon: '', text: skor || '-' };
                    }

                    const skorParts = skor.split('-');
                    if (skorParts.length !== 2) {
                      return { style: '', icon: '', text: skor };
                    }

                    const bizimGol = parseInt(skorParts[0].trim());
                    const rakipGol = parseInt(skorParts[1].trim());

                    if (bizimGol > rakipGol) {
                      // Galibiyet - Yeşil
                      return { 
                        style: 'bg-emerald-100 text-emerald-800 border border-emerald-200', 
                        icon: '●', 
                        text: skor 
                      };
                    } else if (bizimGol === rakipGol) {
                      // Beraberlik - Sarı
                      return { 
                        style: 'bg-amber-100 text-amber-800 border border-amber-200', 
                        icon: '●', 
                        text: skor 
                      };
                    } else {
                      // Mağlubiyet - Kırmızı
                      return { 
                        style: 'bg-red-100 text-red-800 border border-red-200', 
                        icon: '●', 
                        text: skor 
                      };
                    }
                  };

                  // Organizasyon türüne göre satır renklendirmesi
                  const getRowStyle = (organizasyon: string, index: number) => {
                    if (organizasyon === 'Hazırlık') {
                      return 'bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-400';
                    } else if (organizasyon === 'Bursa Süper Amatör Grup B') {
                      // Bursa Süper Amatör Grup B maçları için zebra pattern
                      const bursaMatches = fiksturData.filter(match => match.organizasyon === 'Bursa Süper Amatör Grup B');
                                             const bursaIndex = bursaMatches.findIndex(match => match === item);
                       return bursaIndex % 2 === 0 
                         ? 'bg-gray-500 text-white hover:bg-gray-600' 
                         : 'bg-gray-200 text-gray-900 hover:bg-gray-300';
                    }
                    return 'hover:bg-blue-50';
                  };

                  // Rakip takım logosu için mapping
                  const getRakipLogo = (rakipAdi: string) => {
                    const logoMapping: { [key: string]: string } = {
                      'Göçmen SK': '70081151.png',
                      'Bursa Zaferspor': '70055736.png',
                      'Elmasbahçelerspor': '70098997.png',
                      'İnegöl Anadolu FK': '2000066740.png',
                      'İnegöl Osmaniye FSK': '70135986.png',
                      'Emek Spor': '70101850.png',
                      'Akhisar D.S.': '70135984.png',
                      'Hürriyetspor': '70108472h.png',
                      'Alanyurt Gençlikspor': '2000066716.png',
                      'İnegöl Kurtuluşspor': '70081157.png',
                      'Demirtaşspor': '70081150.png'
                    };

                    return logoMapping[rakipAdi] || null;
                  };

                  const skorInfo = getSkorStyle(item.skor);
                  const rowStyle = getRowStyle(item.organizasyon, index);
                  const rakipLogo = getRakipLogo(item.rakip);

                  return (
                    <tr key={index} className={`transition-colors duration-150 ${rowStyle}`}>
                      <td className={`px-4 py-3 text-sm font-medium ${
                        rowStyle.includes('bg-gray-500') ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.tarih}
                      </td>
                      <td className={`px-4 py-3 text-sm ${
                        rowStyle.includes('bg-gray-500') ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {formatTime(item.saat)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {rakipLogo ? (
                            <img 
                              src={`/images/${rakipLogo}`}
                              alt={item.rakip}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            // Logosu olmayan takımlar için gri placeholder
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span className={`text-sm font-medium ${
                            rowStyle.includes('bg-gray-500') ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.rakip}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          item.ev_mi_deplasman_mi === 'Ev' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.ev_mi_deplasman_mi}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {skorInfo.style ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className={`text-sm ${skorInfo.style.includes('emerald') ? 'text-emerald-600' : skorInfo.style.includes('amber') ? 'text-amber-600' : 'text-red-600'}`}>
                              {skorInfo.icon}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${skorInfo.style}`}>
                              {skorInfo.text}
                            </span>
                          </div>
                        ) : (
                          <span className={`text-sm ${
                            rowStyle.includes('bg-gray-500') ? 'text-gray-400' : 'text-gray-400'
                          }`}>{skorInfo.text}</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-sm ${
                        rowStyle.includes('bg-gray-500') ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {item.organizasyon}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Puan Tablosu */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 00-2-2m0 0V9a2 2 0 012-2h2a2 2 0 00-2-2" />
              </svg>
              Puan Tablosu
            </h2>
          </div>
          <div className="overflow-auto" style={{ height: 'calc(100% - 64px)' }}>
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Takım
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    O
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    G
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    B
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    M
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    AG
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    YG
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    A
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    P
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {puanTablosuData.map((item, index) => {
                  // Sıra rengini belirle
                  let siraStyle = '';
                  if (index === 0) {
                    siraStyle = 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'; // Şampiyon
                  } else if (index <= 2) {
                    siraStyle = 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'; // Avrupa kupaları
                  } else if (index >= puanTablosuData.length - 3) {
                    siraStyle = 'bg-gradient-to-r from-red-400 to-red-500 text-white'; // Küme düşme
                  }

                  return (
                    <tr key={index} className="hover:bg-emerald-50 transition-colors duration-150">
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          siraStyle || 'bg-gray-100 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                                             <td className="px-4 py-3">
                         <div className="flex items-center gap-3">
                           <img 
                             src={`/images/${item.takim_id}.png`}
                             alt={item.takim_adi}
                             className="w-8 h-8 rounded-full object-cover"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               const currentSrc = target.src;
                               
                               // İlk denemede başarısız olursa, farklı varyasyonları dene
                               if (currentSrc.includes(`${item.takim_id}.png`)) {
                                 // Özel ID mapping'leri
                                 if (item.takim_id === 2000066712) {
                                   target.src = `/images/2000066716.png`;
                                   return;
                                 }
                                 // 'h' harfi ekli versiyonu dene (Hürriyetspor vb. için)
                                 target.src = `/images/${item.takim_id}h.png`;
                                 return;
                               } else if (currentSrc.includes(`${item.takim_id}h.png`)) {
                                 // Takım adına göre manuel mapping dene
                                 if (item.takim_adi.toLowerCase().includes('alanyurt')) {
                                   target.src = `/images/70101850.png`; // Alanyurt Gençlikspor için varsayılan
                                   return;
                                 }
                               }
                               
                               // Hiçbiri bulunamazsa varsayılan avatar göster
                               target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23e5e7eb'/%3E%3Ctext x='16' y='20' text-anchor='middle' font-family='Arial' font-size='12' fill='%23374151'%3E${item.takim_adi.charAt(0)}%3C/text%3E%3C/svg%3E`;
                             }}
                           />
                           <span className="text-sm text-gray-900 font-semibold">
                             {item.takim_adi}
                           </span>
                         </div>
                       </td>
                      <td className="px-2 py-3 text-center text-sm text-gray-700">
                        {item.oynanan_mac}
                      </td>
                      <td className="px-2 py-3 text-center text-sm text-emerald-600 font-medium">
                        {item.kazanilan_mac}
                      </td>
                      <td className="px-2 py-3 text-center text-sm text-amber-600 font-medium">
                        {item.beraberlik}
                      </td>
                      <td className="px-2 py-3 text-center text-sm text-red-600 font-medium">
                        {item.kaybedilen_mac}
                      </td>
                      <td className="px-2 py-3 text-center text-sm text-gray-700">
                        {item.atilan_gol}
                      </td>
                      <td className="px-2 py-3 text-center text-sm text-gray-700">
                        {item.yenilen_gol}
                      </td>
                      <td className="px-2 py-3 text-center text-sm font-medium">
                        <span className={item.gol_averaji > 0 ? 'text-emerald-600' : item.gol_averaji < 0 ? 'text-red-600' : 'text-gray-600'}>
                          {item.gol_averaji > 0 ? `+${item.gol_averaji}` : item.gol_averaji}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-sm font-bold px-2 py-1 rounded-lg">
                          {item.puan}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {fiksturData.length === 0 && puanTablosuData.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-lg px-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">Henüz veri bulunmamaktadır</p>
          </div>
        </div>
      )}
    </div>
  );
} 