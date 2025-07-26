"use client";

import { useState, useEffect } from "react";

// Teknik ekip üyesi tipi tanımı
interface TeknikEkipUyesi {
  gorev: string;
  isim: string;
  sozlesme_tur: string;
  sozlesme_bitis_trh: string;
  antrenorluk_derece: string;
}

export default function TeknikEkipPage() {
  const [teknikEkipVerileri, setTeknikEkipVerileri] = useState<TeknikEkipUyesi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [siralamaSutunu, setSiralamaSutunu] = useState<string>('isim');
  const [siralamaYonu, setSiralamaYonu] = useState<'asc' | 'desc'>('asc');
  const [aramaTerimi, setAramaTerimi] = useState('');

  // Sayfa yüklendiğinde teknik ekip verilerini getir
  useEffect(() => {
    const teknikEkipVerileriniGetir = async () => {
      try {
        setYukleniyor(true);
        const response = await fetch('/api/teknik-ekip');
        const result = await response.json();
        
        if (result.success) {
          setTeknikEkipVerileri(result.data);
        } else {
          setHata(result.message || 'Teknik ekip verileri alınırken bir hata oluştu');
        }
      } catch (error) {
        console.error('Teknik ekip verileri getirilirken hata:', error);
        setHata('Teknik ekip verileri getirilirken bir hata oluştu');
      } finally {
        setYukleniyor(false);
      }
    };

    teknikEkipVerileriniGetir();
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
  const filtrelenmisVeriler = teknikEkipVerileri
    .filter(uye => 
      uye.isim.toLowerCase().includes(aramaTerimi.toLowerCase()) ||
      uye.gorev.toLowerCase().includes(aramaTerimi.toLowerCase()) ||
      uye.sozlesme_tur.toLowerCase().includes(aramaTerimi.toLowerCase()) ||
      uye.antrenorluk_derece.toLowerCase().includes(aramaTerimi.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[siralamaSutunu as keyof TeknikEkipUyesi];
      const bValue = b[siralamaSutunu as keyof TeknikEkipUyesi];
      
      // String değerleri karşılaştır
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (siralamaYonu === 'asc') {
        return aStr.localeCompare(bStr, 'tr');
      } else {
        return bStr.localeCompare(aStr, 'tr');
      }
    });

  // Sütun başlığı komponenti
  const SutunBasligi = ({ sutun, baslik }: { sutun: string, baslik: string }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => sirala(sutun)}
    >
      <div className="flex items-center gap-1">
        {baslik}
        {siralamaSutunu === sutun && (
          <span className="text-blue-600 text-sm">
            {siralamaYonu === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  // Görev rengini belirleyen fonksiyon
  const getGorevRengi = (gorev: string) => {
    const gorevRenkleri: { [key: string]: string } = {
      'Teknik Direktör': 'bg-red-100 text-red-800',
      'Antrenör': 'bg-blue-100 text-blue-800',
      'Kondisyoner': 'bg-yellow-100 text-yellow-800',
      'Masaj': 'bg-pink-100 text-pink-800',
      'Doktor': 'bg-indigo-100 text-indigo-800',
      'Malzemeci': 'bg-gray-100 text-gray-800',
    };
    
    return gorevRenkleri[gorev] || 'bg-gray-100 text-gray-800';
  };

  // Sözleşme türü rengini belirleyen fonksiyon
  const getSozlesmeTuruRengi = (tur: string) => {
    const turRenkleri: { [key: string]: string } = {
      'Süresiz': 'bg-green-100 text-green-800',
      'Süreli': 'bg-orange-100 text-orange-800',
      'Sezonluk': 'bg-blue-100 text-blue-800',
      'Proje Bazlı': 'bg-purple-100 text-purple-800',
    };
    
    return turRenkleri[tur] || 'bg-gray-100 text-gray-800';
  };

  if (yukleniyor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hata) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Hata</div>
          <p className="text-gray-600">{hata}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Teknik Ekip
        </h1>
        <p className="text-gray-600">
          Teknik ekip üyelerinin görevleri, sözleşme bilgileri ve antrenörlük derecelerine göz atabilirsiniz.
        </p>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-2xl font-bold">{teknikEkipVerileri.length}</div>
          <div className="text-blue-100">Toplam Ekip Üyesi</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-2xl font-bold">
            {teknikEkipVerileri.filter(uye => {
              if (!uye.antrenorluk_derece || uye.antrenorluk_derece === '') return false;
              const lisansPattern = /^(Ulusal .+ Lisansı|Uluslararası .+ Lisansı|Uluslararası .+ Lisans)$/i;
              return lisansPattern.test(uye.antrenorluk_derece);
            }).length}
          </div>
          <div className="text-green-100">Lisanslı Antrenör</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-2xl font-bold">
            {teknikEkipVerileri.filter(uye => uye.sozlesme_bitis_trh === '-' || uye.sozlesme_bitis_trh === '' || !uye.sozlesme_bitis_trh).length}
          </div>
          <div className="text-purple-100">Süresiz Sözleşme</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="text-2xl font-bold">
            {teknikEkipVerileri.filter(uye => uye.sozlesme_bitis_trh && uye.sozlesme_bitis_trh !== '-' && uye.sozlesme_bitis_trh !== '').length}
          </div>
          <div className="text-orange-100">Süreli Sözleşme</div>
        </div>
      </div>

      {/* Arama çubuğu */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="İsim, görev, sözleşme türü veya antrenörlük derecesi ara..."
            className="w-full px-4 py-3 pl-12 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            value={aramaTerimi}
            onChange={(e) => setAramaTerimi(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SutunBasligi sutun="gorev" baslik="Görev" />
                <SutunBasligi sutun="isim" baslik="İsim" />
                <SutunBasligi sutun="sozlesme_tur" baslik="Sözleşme Türü" />
                <SutunBasligi sutun="sozlesme_bitis_trh" baslik="Sözleşme Bitiş Tarihi" />
                <SutunBasligi sutun="antrenorluk_derece" baslik="Antrenörlük Lisans Derecesi" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtrelenmisVeriler.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      {aramaTerimi ? 'Arama kriterlerine uygun teknik ekip üyesi bulunamadı' : 'Henüz teknik ekip üyesi bulunmuyor'}
                    </div>
                  </td>
                </tr>
              ) : (
                filtrelenmisVeriler.map((uye, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getGorevRengi(uye.gorev)}`}>
                        {uye.gorev}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {uye.isim.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{uye.isim}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSozlesmeTuruRengi(uye.sozlesme_tur)}`}>
                        {uye.sozlesme_tur}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {uye.sozlesme_bitis_trh || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {uye.antrenorluk_derece || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfa altı bilgi */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        Toplam {filtrelenmisVeriler.length} teknik ekip üyesi gösteriliyor
      </div>
    </div>
  );
} 