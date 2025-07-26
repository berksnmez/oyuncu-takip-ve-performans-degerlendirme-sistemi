"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// API'den gelecek veri tipleri
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

interface MevcutSakatlik {
  ayrinti: string;
  oyuncu_id: number;
  oyuncu_isim: string;
  sakatlik: string;
  tahmini_donus_tarihi: string;
  tarih: string;
  tedavi_yapan: string;
}

interface SezonOzeti {
  bu_sezonki_sakatliklari: number;
  bu_sezon_forma_giymedigi_sure: string;
  oynamadigi_mac_yuzde: number;
  oyuncu_id: number;
  oyuncu_isim: string;
}

interface GelirItem {
  madde: string;
  bu_ay: number;
  gecen_ay: number;
  bu_sezon: number;
}

interface GiderItem {
  madde: string;
  bu_ay: number;
  gecen_ay: number;
  bu_sezon: number;
}

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

export default function Home() {
  const [fiksturData, setFiksturData] = useState<FiksturItem[]>([]);
  const [puanTablosuData, setPuanTablosuData] = useState<PuanTablosuItem[]>([]);
  const [mevcutSakatliklar, setMevcutSakatliklar] = useState<MevcutSakatlik[]>([]);
  const [sezonOzeti, setSezonOzeti] = useState<SezonOzeti[]>([]);
  const [gelirData, setGelirData] = useState<GelirItem[]>([]);
  const [giderData, setGiderData] = useState<GiderItem[]>([]);
  const [kadroData, setKadroData] = useState<KadroOyuncusu[]>([]);
  const [loading, setLoading] = useState(true);

  // Gerçek API'den veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fikstür verilerini çek
        const fiksturResponse = await fetch('/api/fikstur');
        const fiksturResult = await fiksturResponse.json();
        
        // Puan tablosu verilerini çek
        const puanResponse = await fetch('/api/puan-tablosu');
        const puanResult = await puanResponse.json();
        
        // Mevcut sakatlıkları çek
        const sakatlikResponse = await fetch('/api/mevcut-sakatliklar');
        const sakatlikResult = await sakatlikResponse.json();
        
        // Sezon özeti verilerini çek
        const sezonResponse = await fetch('/api/sezon-ozeti');
        const sezonResult = await sezonResponse.json();
        
        // Gelir tablosu verilerini çek
        const gelirResponse = await fetch('/api/gelir-tablosu');
        const gelirResult = await gelirResponse.json();
        
        // Gider tablosu verilerini çek
        const giderResponse = await fetch('/api/gider-tablosu');
        const giderResult = await giderResponse.json();
        
        // Kadro verilerini çek
        const kadroResponse = await fetch('/api/kadro');
        const kadroResult = await kadroResponse.json();
        
        if (fiksturResult.success) {
          // Son 3 maçı al
          setFiksturData(fiksturResult.data.slice(-3));
        }
        
        if (puanResult.success) {
          // İlk 3 takımı al
          setPuanTablosuData(puanResult.data.slice(0, 3));
        }
        
        // Mevcut sakatlıkları set et
        if (Array.isArray(sakatlikResult)) {
          setMevcutSakatliklar(sakatlikResult.slice(0, 2)); // İlk 2 sakatlığı al
        }
        
        // Sezon özeti verilerini set et
        if (Array.isArray(sezonResult)) {
          setSezonOzeti(sezonResult);
        }
        
        // Gelir verilerini set et
        if (gelirResult.success && Array.isArray(gelirResult.data)) {
          setGelirData(gelirResult.data);
        }
        
        // Gider verilerini set et
        if (giderResult.success && Array.isArray(giderResult.data)) {
          setGiderData(giderResult.data);
        }
        
        // Kadro verilerini set et
        if (kadroResult.success && Array.isArray(kadroResult.data)) {
          setKadroData(kadroResult.data);
        }
        
      } catch (err) {
        console.error('Veri çekme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // En uzun süre oynayamayan oyuncuyu bul
  const enUzunSakatlikOyuncu = sezonOzeti.length > 0 
    ? sezonOzeti.reduce((prev, current) => 
        (prev.oynamadigi_mac_yuzde > current.oynamadigi_mac_yuzde) ? prev : current
      )
    : null;

  // Mali durum verilerini hesapla
  const maliDurumHesapla = () => {
    const gelirToplam = gelirData.reduce((sum, item) => sum + item.bu_ay, 0);
    const giderToplam = giderData.reduce((sum, item) => sum + item.bu_ay, 0);
    const netDurum = gelirToplam - giderToplam;
    
    // Önemli gelir kalemleri (0'dan büyük olanlar)
    const onemliGelirler = gelirData.filter(item => item.bu_ay > 0).slice(0, 4);
    
    // Önemli gider kalemleri (0'dan büyük olanlar) 
    const onemliGiderler = giderData.filter(item => item.bu_ay > 0).slice(0, 4);
    
    return {
      gelirToplam,
      giderToplam,
      netDurum,
      onemliGelirler,
      onemliGiderler
    };
  };
  
  const maliDurumBilgi = maliDurumHesapla();

  // Kadro liderlerini hesapla
  const kadroLiderleriHesapla = () => {
    if (kadroData.length === 0) {
      return {
        enCokGol: { isim: "-", deger: 0 },
        enCokAsist: { isim: "-", deger: 0 },
        enCokSure: { isim: "-", deger: 0 },
        enYuksekPerformans: { isim: "-", deger: 0 }
      };
    }

    // En çok gol atan (gol sayısına göre)
    const enCokGolAtan = kadroData.reduce((prev, current) => 
      (prev.gol > current.gol) ? prev : current
    );

    // En çok asist yapan (asist sayısına göre)
    const enCokAsistYapan = kadroData.reduce((prev, current) => 
      (prev.asist > current.asist) ? prev : current
    );

    // En çok süre alan (oyuncu_sure göre)
    const enCokSureAlan = kadroData.reduce((prev, current) => 
      (prev.oyuncu_sure > current.oyuncu_sure) ? prev : current
    );

    // En yüksek performans skoruna sahip (performans_skoru göre)
    const enYuksekPerformansli = kadroData
      .filter(oyuncu => oyuncu.performans_skoru && oyuncu.performans_skoru > 0)
      .reduce((prev, current) => 
        (prev.performans_skoru > current.performans_skoru) ? prev : current,
        { performans_skoru: 0, oyuncu_isim: "-" }
      );

    return {
      enCokGol: { isim: enCokGolAtan.oyuncu_isim, deger: enCokGolAtan.gol },
      enCokAsist: { isim: enCokAsistYapan.oyuncu_isim, deger: enCokAsistYapan.asist },
      enCokSure: { isim: enCokSureAlan.oyuncu_isim, deger: enCokSureAlan.oyuncu_sure },
      enYuksekPerformans: { 
        isim: enYuksekPerformansli.oyuncu_isim, 
        deger: enYuksekPerformansli.performans_skoru || 0 
      }
    };
  };

  const topOyuncular = kadroLiderleriHesapla();

  // Saat formatı düzenleme
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM:SS -> HH:MM
  };

  // Skor stilini belirle
  const getSkorStyle = (skor: string) => {
    if (!skor || skor === '-') {
      return { style: 'text-gray-400', text: skor || '-' };
    }

    const skorParts = skor.split('-');
    if (skorParts.length !== 2) {
      return { style: 'text-gray-600', text: skor };
    }

    const bizimGol = parseInt(skorParts[0].trim());
    const rakipGol = parseInt(skorParts[1].trim());

    if (bizimGol > rakipGol) {
      return { style: 'text-emerald-600 font-bold', text: skor };
    } else if (bizimGol === rakipGol) {
      return { style: 'text-amber-600 font-bold', text: skor };
    } else {
      return { style: 'text-red-600 font-bold', text: skor };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Futbol Performans</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Futbolcuların performanslarını araştırın, takip edin ve analiz edin.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link
              href="/oyuncu-arama"
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Oyuncu Arama
            </Link>
            <Link
              href="/takip-listesi"
              className="bg-blue-500 hover:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Takip Listesi
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Fikstür */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fikstür
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Fikstür yükleniyor...</p>
                </div>
              ) : fiksturData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Fikstür verisi bulunamadı</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {fiksturData.map((mac, index) => {
                      const skorInfo = getSkorStyle(mac.skor);
                      return (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{mac.rakip}</div>
                            <div className="text-sm text-gray-500">{mac.tarih} - {formatTime(mac.saat)}</div>
                          </div>
                          <div className="text-center">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              mac.ev_mi_deplasman_mi === 'Ev' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {mac.ev_mi_deplasman_mi}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${skorInfo.style}`}>{skorInfo.text}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Link href="/fiktur-puan-tablosu" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Tüm fikstürü görüntüle →
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Puan Tablosu */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 00-2-2m0 0V9a2 2 0 012-2h2a2 2 0 00-2-2" />
                </svg>
                Puan Tablosu
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Puan tablosu yükleniyor...</p>
                </div>
              ) : puanTablosuData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Puan tablosu verisi bulunamadı</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2">#</th>
                          <th className="text-left py-2">Takım</th>
                          <th className="text-center py-2">O</th>
                          <th className="text-center py-2">G</th>
                          <th className="text-center py-2">P</th>
                        </tr>
                      </thead>
                      <tbody>
                        {puanTablosuData.map((takim, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index === 0 ? 'bg-yellow-400 text-white' : 
                                index === 1 ? 'bg-emerald-400 text-white' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-2 font-medium">{takim.takim_adi}</td>
                            <td className="py-2 text-center">{takim.oynanan_mac}</td>
                            <td className="py-2 text-center">{takim.kazanilan_mac}</td>
                            <td className="py-2 text-center">
                              <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                {takim.puan}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Link href="/fiktur-puan-tablosu" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium mt-4 inline-block">
                    Tüm tabloyu görüntüle →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* İkinci Grid - Sağlık ve Mali Durum */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Sakatlık Kartı */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                SAKATLIK
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Sakatlık verileri yükleniyor...</p>
                </div>
              ) : (
                <>
                  {/* Mevcut Sakatlıklar */}
                  {mevcutSakatliklar.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {mevcutSakatliklar.map((sakatlik, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                              <span className="text-red-700 text-xl">👤</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-red-900">{sakatlik.oyuncu_isim}</h4>
                              <p className="text-sm text-red-700">{sakatlik.sakatlik}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-red-900">{sakatlik.tarih}</div>
                              <div className="text-xs text-red-600">{sakatlik.tedavi_yapan}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-center">
                      <p className="text-green-700">Şu anda mevcut sakatlık bulunmamaktadır</p>
                    </div>
                  )}
                  
                  {/* En Uzun Sakatlık */}
                  {enUzunSakatlikOyuncu && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">Bu Sezon En Uzun Süre Oynayamayan</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-orange-800">{enUzunSakatlikOyuncu.oyuncu_isim}</div>
                          <div className="text-sm text-orange-600">{enUzunSakatlikOyuncu.bu_sezon_forma_giymedigi_sure}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-orange-800">%{enUzunSakatlikOyuncu.oynamadigi_mac_yuzde}</div>
                          <div className="text-xs text-orange-600">kaçırılan maç</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <Link href="/saglik-merkezi/sakatlik-gecmisi" className="text-red-600 hover:text-red-800 text-sm font-medium mt-4 inline-block">
                Sakatlık geçmişini görüntüle →
              </Link>
            </div>
          </div>

          {/* Mali Durum */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                BU AYKI GELİR / (GİDER)
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Mali veriler yükleniyor...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {/* Gelir Kalemleri */}
                    {maliDurumBilgi.onemliGelirler.map((gelir, index) => (
                      <div key={`gelir-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{gelir.madde}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-green-600">
                            €{gelir.bu_ay.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Gider Kalemleri */}
                    {maliDurumBilgi.onemliGiderler.map((gider, index) => (
                      <div key={`gider-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{gider.madde}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-red-600">
                            -€{gider.bu_ay.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`border rounded-lg p-4 ${
                    maliDurumBilgi.netDurum >= 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className={`font-semibold ${
                        maliDurumBilgi.netDurum >= 0 ? 'text-green-900' : 'text-red-900'
                      }`}>
                        Bu Ayki Net Durum
                      </div>
                      <div className={`text-xl font-bold ${
                        maliDurumBilgi.netDurum >= 0 ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {maliDurumBilgi.netDurum >= 0 ? '+' : ''}€{maliDurumBilgi.netDurum.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <Link href="/mali-durum/genel" className="text-green-600 hover:text-green-800 text-sm font-medium mt-4 inline-block">
                Detaylı mali durumu görüntüle →
              </Link>
            </div>
          </div>
        </div>

        {/* Kadro İstatistikleri */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Kadro Liderleri
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Kadro verileri yükleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* En Çok Gol */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-yellow-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-yellow-700 text-xl">⚽</span>
                  </div>
                  <h4 className="font-semibold text-yellow-900 mb-1">En Çok Gol</h4>
                  <p className="text-sm text-yellow-700 mb-2">{topOyuncular.enCokGol.isim}</p>
                  <p className="text-2xl font-bold text-yellow-800">{topOyuncular.enCokGol.deger}</p>
                </div>

                {/* En Çok Asist */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-blue-700 text-xl">🎯</span>
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-1">En Çok Asist</h4>
                  <p className="text-sm text-blue-700 mb-2">{topOyuncular.enCokAsist.isim}</p>
                  <p className="text-2xl font-bold text-blue-800">{topOyuncular.enCokAsist.deger}</p>
                </div>

                {/* En Çok Süre */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-green-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-green-700 text-xl">⏱️</span>
                  </div>
                  <h4 className="font-semibold text-green-900 mb-1">En Çok Süre</h4>
                  <p className="text-sm text-green-700 mb-2">{topOyuncular.enCokSure.isim}</p>
                  <p className="text-2xl font-bold text-green-800">{topOyuncular.enCokSure.deger}'</p>
                </div>

                {/* En Yüksek Performans */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-purple-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-purple-700 text-xl">⭐</span>
                  </div>
                  <h4 className="font-semibold text-purple-900 mb-1">En Yüksek Performans</h4>
                  <p className="text-sm text-purple-700 mb-2">{topOyuncular.enYuksekPerformans.isim}</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {typeof topOyuncular.enYuksekPerformans.deger === 'number' && topOyuncular.enYuksekPerformans.deger > 0 
                      ? topOyuncular.enYuksekPerformans.deger.toFixed(2) 
                      : topOyuncular.enYuksekPerformans.deger
                    }
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Link href="/kadro" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                Tüm kadroyu görüntüle →
              </Link>
            </div>
          </div>
        </div>

        {/* Hızlı Erişim */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Oyuncu Arama</h2>
            <p className="mb-4">İsim, takım veya pozisyona göre futbolcuları arayın.</p>
            <Link href="/oyuncu-arama" className="text-blue-600 hover:text-blue-800 font-medium">
              Aramaya başla →
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Performans Analizi</h2>
            <p className="mb-4">Detaylı istatistikler ve performans grafikleri ile oyuncuları analiz edin.</p>
            <Link href="/kadro" className="text-blue-600 hover:text-blue-800 font-medium">
              Analize başla →
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Takip Listesi</h2>
            <p className="mb-4">Favori oyuncularınızı takip listesine ekleyerek performanslarını izleyin.</p>
            <Link href="/takip-listesi" className="text-blue-600 hover:text-blue-800 font-medium">
              Listeyi görüntüle →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
