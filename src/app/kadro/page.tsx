"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Kadro oyuncusu tipi tanımı
interface KadroOyuncusu {
  oyuncu_id: number;
  oyuncu_mevkii: string;
  oyuncu_yan_mevkii: string;
  oyuncu_isim: string;
  oyuncu_yas: number;
  oyuncu_sure: number;
  gol: number;
  asist: number;
  xG: number;
  macin_adami: number;
  isbtlPasYzd: number;
  topaMudhleMb: number;
  bsrliDriplingMb: number;
  isbtlSutYzd: number;
  golYnlmedenTmmMac: number;
  yenilen_goller: number;
  kurtarisYuzdesi: number;
  kurtarisBkltnsYzd: number;
  sari_kart: number;
  kirmizi_kart: number;
  performans_skoru: number;
  kalite_sira_katsayi: number;
  performans_skor_sirasi: number;
  surdurabilirlik_sira: number;
  genel_sira: number;
}

export default function KadroPage() {
  const [kadroVerileri, setKadroVerileri] = useState<KadroOyuncusu[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [siralamaSutunu, setSiralamaSutunu] = useState<string>('oyuncu_isim');
  const [siralamaYonu, setSiralamaYonu] = useState<'asc' | 'desc'>('asc');
  const [aramaTerimi, setAramaTerimi] = useState('');

  // Mevkii sıralaması için özel fonksiyon
  const getMevkiiSiralamaDegeri = (mevkii: string): number => {
    const mevkiiSiralamasi: { [key: string]: number } = {
      'K': 1,
      'D (Sğ)': 2,
      'D (M)': 3,
      'D (Sl)': 4,
      'DOS': 5,
      'OS (Sğ)': 6,
      'OOS (Sğ)': 7,
      'OOS (Sl)': 8,
      'ST (M)': 9
    };
    
    return mevkiiSiralamasi[mevkii] || 999; // Bilinmeyen mevkiiler en sona
  };

  // Sayfa yüklendiğinde kadro verilerini getir
  useEffect(() => {
    const kadroVerileriniGetir = async () => {
      try {
        setYukleniyor(true);
        const response = await fetch('/api/kadro');
        const result = await response.json();
        
        if (result.success) {
          setKadroVerileri(result.data);
        } else {
          setHata(result.message || 'Kadro verileri alınırken bir hata oluştu');
        }
      } catch (error) {
        console.error('Kadro verileri getirilirken hata:', error);
        setHata('Kadro verileri getirilirken bir hata oluştu');
      } finally {
        setYukleniyor(false);
      }
    };

    kadroVerileriniGetir();
  }, []);

  // Sıralama fonksiyonu
  const sirala = (sutun: string) => {
    if (siralamaSutunu === sutun) {
      setSiralamaYonu(siralamaYonu === 'asc' ? 'desc' : 'asc');
    } else {
      setSiralamaSutunu(sutun);
      setSiralamaYonu('asc');
    }
  };

  // Filtrelenmiş ve sıralanmış veriler
  const filtrelenmisVeriler = kadroVerileri
    .filter(oyuncu => 
      oyuncu.oyuncu_isim.toLowerCase().includes(aramaTerimi.toLowerCase()) ||
      oyuncu.oyuncu_mevkii.toLowerCase().includes(aramaTerimi.toLowerCase()) ||
      oyuncu.oyuncu_yan_mevkii.toLowerCase().includes(aramaTerimi.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[siralamaSutunu as keyof KadroOyuncusu];
      const bValue = b[siralamaSutunu as keyof KadroOyuncusu];
      
      // Mevkii kolonu için özel sıralama
      if (siralamaSutunu === 'oyuncu_mevkii') {
        const aMevkiiDegeri = getMevkiiSiralamaDegeri(String(aValue));
        const bMevkiiDegeri = getMevkiiSiralamaDegeri(String(bValue));
        
        return siralamaYonu === 'asc' ? 
          aMevkiiDegeri - bMevkiiDegeri : 
          bMevkiiDegeri - aMevkiiDegeri;
      }
      
      // Diğer kolonlar için normal sıralama
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return siralamaYonu === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (siralamaYonu === 'asc') {
          return aStr.localeCompare(bStr, 'tr');
        } else {
          return bStr.localeCompare(aStr, 'tr');
        }
      }
    });

  // Sütun başlığı komponenti
  const SutunBasligi = ({ sutun, baslik }: { sutun: string, baslik: string }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => sirala(sutun)}
    >
      <div className="flex items-center gap-1">
        {baslik}
        {siralamaSutunu === sutun && (
          <span className="text-blue-600">
            {siralamaYonu === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  // Oyuncu ismi render fonksiyonu
  const renderOyuncuIsmi = (oyuncu: KadroOyuncusu) => {
    if (oyuncu.oyuncu_mevkii === 'K') {
      return (
        <Link 
          href={`/kadro/kaleci/${oyuncu.oyuncu_id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
        >
          {oyuncu.oyuncu_isim}
        </Link>
      );
    }
    if (oyuncu.oyuncu_mevkii === 'D (Sl)' || oyuncu.oyuncu_mevkii === 'D (Sğ)') {
      return (
        <Link 
          href={`/kadro/bek/${oyuncu.oyuncu_id}`}
          className="text-slate-600 hover:text-slate-800 hover:underline font-medium transition-colors"
        >
          {oyuncu.oyuncu_isim}
        </Link>
      );
    }
    if (oyuncu.oyuncu_mevkii === 'D (M)') {
      return (
        <Link 
          href={`/kadro/stoper/${oyuncu.oyuncu_id}`}
          className="text-gray-700 hover:text-gray-900 hover:underline font-medium transition-colors"
        >
          {oyuncu.oyuncu_isim}
        </Link>
      );
    }
    if (oyuncu.oyuncu_mevkii === 'DOS') {
      return (
        <Link 
          href={`/kadro/dos/${oyuncu.oyuncu_id}`}
          className="text-amber-600 hover:text-amber-800 hover:underline font-medium transition-colors"
        >
          {oyuncu.oyuncu_isim}
        </Link>
      );
    }
    if (oyuncu.oyuncu_mevkii === 'ST (M)') {
      return (
        <Link 
          href={`/kadro/santrafor/${oyuncu.oyuncu_id}`}
          className="text-green-600 hover:text-green-800 hover:underline font-medium transition-colors"
        >
          {oyuncu.oyuncu_isim}
        </Link>
      );
    }
    if (oyuncu.oyuncu_mevkii === 'OOS (Sl)' || oyuncu.oyuncu_mevkii === 'OOS (Sğ)') {
      return (
        <Link 
          href={`/kadro/kanat/${oyuncu.oyuncu_id}`}
          className="text-purple-600 hover:text-purple-800 hover:underline font-medium transition-colors"
        >
          {oyuncu.oyuncu_isim}
        </Link>
      );
    }
    return <span className="font-medium">{oyuncu.oyuncu_isim}</span>;
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hürriyetspor Kadrosu</h1>
        <p className="text-gray-600">Takımımızın oyuncu kadrosu ve detaylı istatistikleri</p>
      </div>

      {/* Arama kutusu */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Oyuncu adı, mevkii veya yan mevkii ara..."
          className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={aramaTerimi}
          onChange={(e) => setAramaTerimi(e.target.value)}
        />
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {yukleniyor ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Kadro verileri yükleniyor...</p>
          </div>
        ) : hata ? (
          <div className="p-8 text-center text-red-500">
            <p>{hata}</p>
            <p className="mt-2 text-sm">Veritabanında 'kadro' tablosu oluşturulduğundan emin olun.</p>
          </div>
        ) : filtrelenmisVeriler.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>
              {aramaTerimi ? 
                'Arama kriterlerine uygun oyuncu bulunamadı.' : 
                'Kadro verisi bulunamadı.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SutunBasligi sutun="oyuncu_isim" baslik="Oyuncu Adı" />
                  <SutunBasligi sutun="oyuncu_mevkii" baslik="Mevkii" />
                  <SutunBasligi sutun="oyuncu_yan_mevkii" baslik="Yan Mevkii" />
                  <SutunBasligi sutun="oyuncu_yas" baslik="Yaş" />
                  <SutunBasligi sutun="oyuncu_sure" baslik="Süre" />
                  <SutunBasligi sutun="gol" baslik="Gol" />
                  <SutunBasligi sutun="asist" baslik="Asist" />
                  <SutunBasligi sutun="xG" baslik="xG" />
                  <SutunBasligi sutun="macin_adami" baslik="Maçın Adamı" />
                  <SutunBasligi sutun="isbtlPasYzd" baslik="İsabetli Pas %" />
                  <SutunBasligi sutun="topaMudhleMb" baslik="Topa Müdahale" />
                  <SutunBasligi sutun="bsrliDriplingMb" baslik="Başarılı Dripling" />
                  <SutunBasligi sutun="isbtlSutYzd" baslik="İsabetli Şut %" />
                  <SutunBasligi sutun="golYnlmedenTmmMac" baslik="Gol Yenmeden Oynanan Maç" />
                  <SutunBasligi sutun="yenilen_goller" baslik="Yenilen Goller" />
                  <SutunBasligi sutun="kurtarisYuzdesi" baslik="Kurtarış %" />
                  <SutunBasligi sutun="kurtarisBkltnsYzd" baslik="Kurtarış Beklentisi %" />
                  <SutunBasligi sutun="sari_kart" baslik="Sarı Kart" />
                  <SutunBasligi sutun="kirmizi_kart" baslik="Kırmızı Kart" />
                  <SutunBasligi sutun="performans_skoru" baslik="Performans Skoru" />
                  <SutunBasligi sutun="kalite_sira_katsayi" baslik="Kalite Sırası" />
                  <SutunBasligi sutun="performans_skor_sirasi" baslik="Performans Skor Sırası" />
                  <SutunBasligi sutun="surdurabilirlik_sira" baslik="Sürdürülebilirlik Sırası" />
                  <SutunBasligi sutun="genel_sira" baslik="Genel Sıra" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtrelenmisVeriler.map((oyuncu, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderOyuncuIsmi(oyuncu)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {oyuncu.oyuncu_mevkii}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {oyuncu.oyuncu_yan_mevkii}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {oyuncu.oyuncu_yas}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {oyuncu.oyuncu_sure}'
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {oyuncu.gol}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {oyuncu.asist}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof oyuncu.xG === 'number' ? oyuncu.xG.toFixed(2) : oyuncu.xG}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {oyuncu.macin_adami}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {oyuncu.isbtlPasYzd}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof oyuncu.topaMudhleMb === 'number' ? oyuncu.topaMudhleMb.toFixed(2) : oyuncu.topaMudhleMb}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof oyuncu.bsrliDriplingMb === 'number' ? oyuncu.bsrliDriplingMb.toFixed(2) : oyuncu.bsrliDriplingMb}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {oyuncu.isbtlSutYzd}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {oyuncu.golYnlmedenTmmMac}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {oyuncu.yenilen_goller}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {oyuncu.kurtarisYuzdesi}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {oyuncu.kurtarisBkltnsYzd}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {oyuncu.sari_kart}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {oyuncu.kirmizi_kart}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {typeof oyuncu.performans_skoru === 'number' ? oyuncu.performans_skoru.toFixed(2) : (oyuncu.performans_skoru || '-')}
                      </span>
                    </td>
                                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                         {oyuncu.kalite_sira_katsayi || '-'}
                       </span>
                      </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {typeof oyuncu.performans_skor_sirasi === 'number' ? oyuncu.performans_skor_sirasi : (oyuncu.performans_skor_sirasi || '-')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                        {typeof oyuncu.surdurabilirlik_sira === 'number' ? oyuncu.surdurabilirlik_sira : (oyuncu.surdurabilirlik_sira || '-')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 font-semibold">
                        {typeof oyuncu.genel_sira === 'number' ? oyuncu.genel_sira : (oyuncu.genel_sira || '-')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* İstatistik özeti */}
      {!yukleniyor && !hata && filtrelenmisVeriler.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kadro Özeti</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filtrelenmisVeriler.length}</div>
              <div className="text-sm text-gray-600">Toplam Oyuncu</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filtrelenmisVeriler.reduce((toplam, oyuncu) => toplam + oyuncu.gol, 0)}
              </div>
              <div className="text-sm text-gray-600">Toplam Gol</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filtrelenmisVeriler.reduce((toplam, oyuncu) => toplam + oyuncu.asist, 0)}
              </div>
              <div className="text-sm text-gray-600">Toplam Asist</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filtrelenmisVeriler.reduce((toplam, oyuncu) => toplam + oyuncu.sari_kart + oyuncu.kirmizi_kart, 0)}
              </div>
              <div className="text-sm text-gray-600">Toplam Kart</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 