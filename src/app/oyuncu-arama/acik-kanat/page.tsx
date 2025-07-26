"use client";

import { useState, useEffect, useCallback } from "react";
import PozisyonNavbar from "@/components/PozisyonNavbar";
import { useTakipListesi } from "@/contexts/TakipListesiContext";
import { useRouter } from "next/navigation";
import React from "react";

// Açık Kanat istatistik tipi
interface AcikKanatIstatistik {
  id: number;
  blabla_acknt: string;
  [key: string]: any;
}

// Sütun isimlerinin kısa ve tam karşılıkları
const SUTUN_ISIMLERI: { [key: string]: { short: string, full: string } } = {
  takim_adi: { short: "Takım", full: "Takım Adı" },
  oyuncu_mevkii: { short: "Mevkii", full: "Oyuncu Mevkii" },
  oyuncu_yan_mevkii: { short: "Yan Pos", full: "Oyuncu Yan Mevkii" },
  oyuncu_isim: { short: "İsim", full: "Oyuncu İsim" },
  oyuncu_yas: { short: "Yaş", full: "Oyuncu Yaş" },
  oyuncu_sure: { short: "Dk", full: "Oyuncu Süre" },
  astbklntMB: { short: "A.Bkl/M", full: "Asist Beklentisi/Maç" },
  bsrldrplMB: { short: "B.Drp/M", full: "Başarılı Dripling/Maç" },
  yrtglfrstMB: { short: "Y.G.F/M", full: "Yaratılan Gol Fırsatı/Maç" },
  sprintMB: { short: "Sprint/M", full: "Sprint/Maç" },
  isbtlpasMB: { short: "İ.Pas/M", full: "İsabetli Pas/Maç" },
  pnltszxgMB: { short: "P.xG/M", full: "Penaltısız xG/Maç" },
  isbtlsut_yzd: { short: "İ.Şut %", full: "İsabetli Şut Yüzdesi" },
  sutdgrlndrme_yzd: { short: "Ş.Değ %", full: "Şut Değerlendirme Yüzdesi" },
  golMB: { short: "Gol/M", full: "Gol/Maç" },
  golbkltnsMB: { short: "xG/M", full: "xG/Maç" },
  sutbsnagolbkltns: { short: "Ş/xG", full: "Şut/xG" },
  toplamsut: { short: "T.Şut", full: "Toplam Şut" },
  stdustuxg: { short: "St.Ü.xG", full: "Standart Üstü xG" },
  golculukEtknlk: { short: "G.Etk", full: "Golcülük Etkinliği" },
  yrtclkEtknlk: { short: "Y.Etk", full: "Yaratıcılık Etkinliği" },
  astbklntMB_katsayi: { short: "A.B.K", full: "Asist Beklentisi/Maç Katsayı" },
  bsrldrplMB_katsayi: { short: "B.D.K", full: "Başarılı Dripling/Maç Katsayı" },
  yrtglfrstMB_katsayi: { short: "Y.G.K", full: "Yaratılan Gol Fırsatı/Maç Katsayı" },
  sprintMB_katsayi: { short: "Spr.K", full: "Sprint/Maç Katsayı" },
  pnltszxgMB_katsayi: { short: "P.xG.K", full: "Penaltısız xG/Maç Katsayı" },
  isbtlsut_yzd_katsayi: { short: "İ.Ş.K", full: "İsabetli Şut Yüzdesi Katsayı" },
  sutdgrlndrme_yzd_katsayi: { short: "Ş.D.K", full: "Şut Değerlendirme Yüzdesi Katsayı" },
  golMB_katsayi: { short: "G.K", full: "Gol/Maç Katsayı" },
  stdustuxg_katsayi: { short: "St.Ü.K", full: "Standart Üstü xG Katsayı" },
  golculukEtknlk_katsayi: { short: "G.E.K", full: "Golcülük Etkinlik Katsayı" },
  yrtclkEtknlk_katsayi: { short: "Y.E.K", full: "Yaratıcılık Etkinlik Katsayı" },
  performans_skoru: { short: "Perf.S", full: "Performans Skoru" },
  kalite_sira_katsayi: { short: "Kal.S", full: "Kalite Sıra" },
  performans_skor_sirasi: { short: "P.Skor", full: "Performans Skor Sırası" },
  surdurabilirlik_sira: { short: "Sürd.", full: "Sürdürülebilirlik Sıra" },
  genel_sira: { short: "Genel", full: "Genel Sıra" }
};

export default function AcikKanatSayfasi() {
  const router = useRouter();
  const [acikKanatIstatistikleri, setAcikKanatIstatistikleri] = useState<AcikKanatIstatistik[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [sutunlar, setSutunlar] = useState<string[]>([]);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const { addToTakipListesi, isInTakipListesi, removeFromTakipListesi, takipListesi } = useTakipListesi();
  
  const [takipDurumu, setTakipDurumu] = useState<{[key: string]: boolean}>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [, setForceUpdate] = useState<{}>({});
  const forceUpdate = useCallback(() => setForceUpdate({}), []);

  // Sütun genişlikleri için state
  const [columnWidths, setColumnWidths] = useState<{[key: string]: number}>({});
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // Sayfa yüklendiğinde Açık Kanat istatistiklerini getir
  useEffect(() => {
    const acikKanatIstatistikleriniGetir = async () => {
      try {
        setYukleniyor(true);
        const response = await fetch('/api/acikkanat-istatistik');
        const result = await response.json();
        
        if (result.success) {
          const processedData = result.data.map((acik: AcikKanatIstatistik) => {
            if (!acik.blabla_acknt) {
              return { ...acik, blabla_acknt: String(acik.id) };
            }
            return acik;
          });
          
          setAcikKanatIstatistikleri(processedData);
          
          if (processedData.length > 0) {
            const tumSutunlar = Object.keys(processedData[0]);
            const filtrelenmisStunlar = tumSutunlar.filter(
              sutun => sutun !== 'takim_id' && sutun !== 'oyuncu_id' && sutun !== 'id' && sutun !== 'blabla_acknt' && (!sutun.endsWith('katsayi') || sutun === 'kalite_sira_katsayi')
            );
            setSutunlar(filtrelenmisStunlar);
          }
        } else {
          setHata(result.message || 'Veriler alınırken bir hata oluştu');
        }
      } catch (error) {
        console.error('Açık Kanat istatistikleri getirilirken hata:', error);
        setHata('Açık Kanat istatistikleri getirilirken bir hata oluştu');
      } finally {
        setYukleniyor(false);
      }
    };

    acikKanatIstatistikleriniGetir();
  }, []);
  
  // Takip durumunu güncelle
  useEffect(() => {
    if (acikKanatIstatistikleri.length > 0) {
      const updatedTakipDurumu: {[key: string]: boolean} = {};
      
      acikKanatIstatistikleri.forEach((acik: AcikKanatIstatistik) => {
        if (acik.blabla_acknt) {
          const blablaAckntKey = String(acik.blabla_acknt).trim();
          updatedTakipDurumu[blablaAckntKey] = isInTakipListesi(blablaAckntKey, 'acik-kanat');
        }
      });
      
      setTakipDurumu(updatedTakipDurumu);
    }
  }, [acikKanatIstatistikleri, isInTakipListesi, takipListesi]);

  // Notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Sütun genişlik ayarlama fonksiyonları
  const handleMouseDown = (e: React.MouseEvent, columnName: string) => {
    e.preventDefault();
    setIsResizing(columnName);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnName] || getDefaultColumnWidth(columnName));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const diff = e.clientX - startX;
    const newWidth = Math.max(80, startWidth + diff); // Minimum genişlik 80px
    
    setColumnWidths(prev => ({
      ...prev,
      [isResizing]: newWidth
    }));
  }, [isResizing, startX, startWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Varsayılan sütun genişliklerini hesapla
  const getDefaultColumnWidth = (columnName: string) => {
    if (columnName.includes('isim')) return 100;
    if (columnName.includes('takim')) return 80;
    if (columnName.includes('yas') || columnName.includes('sure')) return 50;
    if (columnName.includes('yzd') || columnName.includes('MB') || columnName.includes('skoru')) return 70;
    if (columnName.includes('sira') || columnName.includes('katsayi')) return 60;
    if (columnName.includes('mevkii')) return 60;
    return 70;
  };

  // Sorting function
  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return acikKanatIstatistikleri;

    return [...acikKanatIstatistikleri].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      
      // Try to parse as numbers for numeric sorting
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison for non-numeric values
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [acikKanatIstatistikleri, sortColumn, sortDirection]);

  const handleTakipListesiToggle = (acik: AcikKanatIstatistik) => {
    if (!acik.blabla_acknt) {
      console.error('blabla_acknt is missing for acik:', acik);
      setNotification({
        message: 'Bu oyuncu için gerekli bilgiler eksik',
        type: 'error'
      });
      return;
    }

    const blablaAckntKey = String(acik.blabla_acknt).trim();
    
    setAnimatingId(acik.id);

    setTimeout(() => {
      setAnimatingId(null);
      forceUpdate();
    }, 300);

    const isCurrentlyInList = isInTakipListesi(blablaAckntKey, 'acik-kanat');

    if (isCurrentlyInList) {
      removeFromTakipListesi(blablaAckntKey, 'acik-kanat');
      setTakipDurumu(prev => ({
        ...prev,
        [blablaAckntKey]: false
      }));
      setNotification({
        message: `${acik.oyuncu_isim || 'Oyuncu'} takip listesinden çıkarıldı`,
        type: 'warning'
      });
    } else {
      // Tüm açık kanat verilerini takip listesine ekle
      const oyuncuBilgisi = {
        ...acik, // Tüm açık kanat verilerini kopyala
        blabla_acknt: acik.blabla_acknt
      };

      console.log("Adding to takip listesi - Açık Kanat data:", oyuncuBilgisi);
      console.log("Açık Kanat object keys:", Object.keys(oyuncuBilgisi));
      addToTakipListesi(oyuncuBilgisi, 'acik-kanat');
      setTakipDurumu(prev => ({
        ...prev,
        [blablaAckntKey]: true
      }));
      setNotification({
        message: `${acik.oyuncu_isim || 'Oyuncu'} takip listesine eklendi`,
        type: 'success'
      });
    }
  };

  const goToTakipListesi = () => {
    router.push('/takip-listesi/acik-kanat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Pozisyon Navbar */}
        <PozisyonNavbar seciliPozisyon="Açık Kanat" />
        
        {/* Modern Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            ⚡ Açık Kanat İstatistikleri
          </h1>
          <p className="text-slate-600 text-lg">Hızın ve tekniğin buluştuğu yer - Modern istatistiklerle açık kanat performansı</p>
        </div>
        
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-500 transform ${
            notification.type === 'success' ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-300/30 text-emerald-700' :
            notification.type === 'warning' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-300/30 text-yellow-700' :
            'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-300/30 text-red-700'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-emerald-500' : 
                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {notification.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : notification.type === 'warning' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.82 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <p className="font-medium">{notification.message}</p>
              {notification.type === 'success' && notification.message.includes('eklendi') && (
                <button 
                  onClick={goToTakipListesi}
                  className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-lg"
                >
                  Takip Listesine Git →
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Modern Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {yukleniyor ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping"></div>
              </div>
              <p className="mt-6 text-slate-600 font-medium">Açık kanat verileri yükleniyor...</p>
              <p className="text-sm text-slate-500">Lütfen bekleyiniz</p>
            </div>
          ) : hata ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.82 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium text-center">{hata}</p>
              <p className="mt-2 text-sm text-slate-500 text-center">Veritabanında 'acikkanat_istatistik' tablosu oluşturulduğundan emin olun.</p>
            </div>
          ) : sortedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">Henüz açık kanat verisi bulunmuyor</p>
              <p className="text-sm text-slate-500">Veritabanına açık kanat istatistikleri eklendiğinde burada görünecek</p>
            </div>
          ) : (
            <div>
              {/* Modern Stats Summary */}
              <div className="mb-8 flex items-center justify-between p-6">
                <div className="flex items-center space-x-3">
                  <p className="text-slate-700 font-medium">
                    <span className="text-2xl font-bold text-emerald-600">{sortedData.length}</span> açık kanat bulundu
                  </p>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Canlı veriler</span>
                </div>
              </div>
              
              {/* Ultra Compact table container */}
              <div className="bg-gradient-to-br from-white/60 to-slate-50/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 overflow-hidden shadow-xl">
                <div className="w-full overflow-x-auto" style={{ userSelect: isResizing ? 'none' : 'auto' }}>
                  <table className="w-full table-fixed">
                    <thead className="bg-gradient-to-r from-slate-100/80 to-slate-200/80 backdrop-blur-sm">
                      <tr className="border-b border-slate-300/50">
                        {sutunlar.map((sutun, index) => {
                          const currentWidth = columnWidths[sutun] || getDefaultColumnWidth(sutun);
                          
                          return (
                            <th 
                              key={sutun} 
                              className="px-1 py-2 text-left font-semibold text-slate-700 uppercase tracking-tight text-xs hover:bg-slate-200/50 transition-colors duration-200 relative"
                              style={{ width: `${currentWidth}px`, minWidth: '50px' }}
                            >
                              <div 
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => handleSort(sutun)}
                              >
                                <span className="truncate text-[10px] leading-tight" title={SUTUN_ISIMLERI[sutun]?.full || sutun}>
                                  {SUTUN_ISIMLERI[sutun]?.short || sutun}
                                </span>
                                <div className="flex flex-col ml-1">
                                  <svg 
                                    className={`w-2 h-2 ${sortColumn === sutun && sortDirection === 'asc' ? 'text-emerald-600' : 'text-slate-400'}`}
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                  <svg 
                                    className={`w-2 h-2 ${sortColumn === sutun && sortDirection === 'desc' ? 'text-emerald-600' : 'text-slate-400'}`}
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                              
                              {/* Resize Handle */}
                              <div 
                                className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-emerald-400/30 transition-colors duration-200"
                                onMouseDown={(e) => handleMouseDown(e, sutun)}
                                title="Sütun genişliğini ayarla"
                              >
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-0.5 h-4 bg-slate-400/50 hover:bg-emerald-500 transition-colors duration-200"></div>
                                </div>
                              </div>
                            </th>
                          );
                        })}
                        <th className="px-2 py-2.5 text-right font-semibold text-slate-700 uppercase tracking-tight text-xs w-20 min-w-20">
                          İşlem
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {sortedData.map((acik, rowIndex) => {
                        const blablaAckntKey = acik.blabla_acknt ? String(acik.blabla_acknt).trim() : "";
                        const isInList = blablaAckntKey ? takipDurumu[blablaAckntKey] || false : false;
                        
                        return (
                          <tr key={acik.id} className={`hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-200 ${
                            rowIndex % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/40'
                          }`}>
                            {sutunlar.map((sutun, index) => {
                              // Değeri formatla
                              const formatValue = (value: any, columnName: string) => {
                                if (value === null || value === undefined) return '-';
                                const str = value.toString();
                                
                                // Takım adları için özel durum
                                if (columnName.includes('takim')) {
                                  return str;
                                }
                                
                                // Yüzde içeren sütunlar için % işareti ekle
                                const sutunAdi = SUTUN_ISIMLERI[columnName]?.full || columnName;
                                if (sutunAdi.toLowerCase().includes('yüzde')) {
                                  if (!isNaN(parseFloat(str)) && isFinite(value)) {
                                    const num = parseFloat(str);
                                    if (num % 1 !== 0) return num.toFixed(2) + '%';
                                    return str + '%';
                                  }
                                  return str + '%';
                                }
                                
                                // Performans Skor için özel formatlama
                                if (columnName === 'performans_skoru') {
                                  if (!isNaN(parseFloat(str)) && isFinite(value)) {
                                    const num = parseInt(str);
                                    if (num >= 1000) {
                                      return num.toLocaleString('tr-TR');
                                    }
                                    return str;
                                  }
                                  return str;
                                }
                                
                                // Genel sayısal formatlama - 4 haneli sayıları nokta ile ayır
                                if (!isNaN(parseFloat(str)) && isFinite(value)) {
                                  const num = parseFloat(str);
                                  if (Number.isInteger(num) && num >= 1000) {
                                    return num.toLocaleString('tr-TR');
                                  }
                                  return str;
                                }
                                
                                return str;
                              };
                              
                              const formattedValue = formatValue(acik[sutun], sutun);
                              
                              return (
                                <td 
                                  key={sutun} 
                                  className="px-1 py-1.5 text-xs text-slate-700 font-medium border-r border-slate-200/30"
                                  style={{ width: `${columnWidths[sutun] || getDefaultColumnWidth(sutun)}px` }}
                                >
                                  <div 
                                    className="truncate leading-tight" 
                                    title={`${SUTUN_ISIMLERI[sutun]?.full || sutun}: ${acik[sutun]}`}
                                  >
                                    {formattedValue}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-2 py-2 text-right w-20">
                              <button
                                onClick={() => handleTakipListesiToggle(acik)}
                                className={`inline-flex items-center justify-center w-9 h-7 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                                  animatingId === acik.id ? 'scale-110' : ''
                                } ${
                                  isInList
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300'
                                    : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 hover:from-emerald-200 hover:to-emerald-300'
                                }`}
                                title={isInList ? 'Takip listesinden çıkar' : 'Takip listesine ekle'}
                              >
                                <svg 
                                  className={`w-3 h-3 ${
                                    isInList ? 'fill-red-600' : 'fill-none stroke-emerald-600'
                                  }`} 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                >
                                  <path 
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 