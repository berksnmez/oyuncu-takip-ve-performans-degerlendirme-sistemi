"use client";

import { useState, useEffect, useCallback } from "react";
import PozisyonNavbar from "@/components/PozisyonNavbar";
import { useTakipListesi } from "@/contexts/TakipListesiContext";
import { useRouter } from "next/navigation";
import React from "react";

// Kaleci istatistik tipi
interface KaleciIstatistik {
  id: number;
  blabla: string;
  [key: string]: any;
}

// Sütun isimlerinin tam Türkçe karşılıkları
const SUTUN_ISIMLERI: { [key: string]: string } = {
  takim_adi: "Takım Adı",
  oyuncu_mevkii: "Oyuncu Mevkii",
  oyuncu_isim: "Oyuncu İsim",
  oyuncu_yas: "Oyuncu Yaş",
  oyuncu_sure: "Oyuncu Süre",
  englxgMB: "Engellenen xG/Maç",
  ynlgolMB: "Yenilen Gol/Maç",
  bklnKrtrs_yzd: "Beklenen Kurtarış Yüzdesi",
  kurtaris_yzd: "Kurtarış Yüzdesi",
  isbtPas_yzd: "İsabet Pas Yüzdesi",
  englxgMB_katsayi: "Engellenen xG/Maç Katsayı",
  ynlgolMB_katsayi: "Yenilen Gol/Maç Katsayı",
  bklnKrtrs_katsayi: "Beklenen Kurtarış Katsayı",
  kurtaris_katsayi: "Kurtarış Katsayı",
  isbtPas_katsayi: "İsabet Pas Katsayı",
  performans_skoru: "Performans Skoru",
  kalite_sira_katsayi: "Kalite Sıra",
  performans_skor_sirasi: "Performans Skor Sırası",
  sürdürülebilirlik_sira: "Sürdürülebilirlik Sıra",
  genel_sira: "Genel Sıra"
};

export default function KaleciSayfasi() {
  const router = useRouter();
  const [kaleciIstatistikleri, setKaleciIstatistikleri] = useState<KaleciIstatistik[]>([]);
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

  // Sayfa yüklendiğinde kaleci istatistiklerini getir
  useEffect(() => {
    const kaleciIstatistikleriniGetir = async () => {
      try {
        setYukleniyor(true);
        const response = await fetch('/api/kaleci-istatistik');
        const result = await response.json();
        
        if (result.success) {
          setKaleciIstatistikleri(result.data);
          
          if (result.data.length > 0) {
            const tumSutunlar = Object.keys(result.data[0]);
            const filtrelenmisStunlar = tumSutunlar.filter(
              sutun => sutun !== 'takim_id' && sutun !== 'oyuncu_id' && sutun !== 'id' && sutun !== 'blabla' && (!sutun.endsWith('katsayi') || sutun === 'kalite_sira_katsayi')
            );
            setSutunlar(filtrelenmisStunlar);
          }
        } else {
          setHata(result.message || 'Veriler alınırken bir hata oluştu');
        }
      } catch (error) {
        console.error('Kaleci istatistikleri getirilirken hata:', error);
        setHata('Kaleci istatistikleri getirilirken bir hata oluştu');
      } finally {
        setYukleniyor(false);
      }
    };

    kaleciIstatistikleriniGetir();
  }, []);
  
  // Takip durumunu güncelle
  useEffect(() => {
    if (kaleciIstatistikleri.length > 0) {
      const updatedTakipDurumu: {[key: string]: boolean} = {};
      
      kaleciIstatistikleri.forEach((kaleci: KaleciIstatistik) => {
        if (kaleci.blabla) {
          const blablaKey = String(kaleci.blabla).trim();
          updatedTakipDurumu[blablaKey] = isInTakipListesi(blablaKey, 'kaleci');
        }
      });
      
      setTakipDurumu(updatedTakipDurumu);
    }
  }, [kaleciIstatistikleri, isInTakipListesi, takipListesi]);

  // Notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
    if (!sortColumn) return kaleciIstatistikleri;

    return [...kaleciIstatistikleri].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      const aNum = parseFloat(aStr);
      const bNum = parseFloat(bStr);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      } else {
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [kaleciIstatistikleri, sortColumn, sortDirection]);

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
    if (columnName.includes('isim')) return 150;
    if (columnName.includes('takim')) return 120;
    if (columnName.includes('yas') || columnName.includes('sure')) return 80;
    if (columnName.includes('yzd') || columnName.includes('MB') || columnName.includes('skoru')) return 100;
    if (columnName.includes('sira') || columnName.includes('katsayi')) return 90;
    return 100;
  };

  // Takip listesi işlemleri
  const handleTakipListesiToggle = (kaleci: KaleciIstatistik) => {
    setAnimatingId(kaleci.id);
    
    if (!kaleci.blabla) {
      setNotification({
        message: 'Bu kaleci için blabla alanı bulunamadı!',
        type: 'error'
      });
      return;
    }
    
    const blablaKey = String(kaleci.blabla).trim();
    const isCurrentlyInList = takipDurumu[blablaKey] || false;
    
    if (isCurrentlyInList) {
      removeFromTakipListesi(blablaKey, 'kaleci');
      setTakipDurumu(prev => ({ ...prev, [blablaKey]: false }));
      setNotification({
        message: 'Kaleci takip listenizden çıkarıldı.',
        type: 'success'
      });
    } else {
      const cleanKaleci = { ...kaleci, blabla: blablaKey };
      const result = addToTakipListesi(cleanKaleci, 'kaleci');
      
      if (result.isDuplicate) {
        setNotification({
          message: 'Bu kaleci zaten takip listenizde bulunuyor!',
          type: 'warning'
        });
        setTakipDurumu(prev => ({ ...prev, [blablaKey]: true }));
      } else if (result.success) {
        setTakipDurumu(prev => ({ ...prev, [blablaKey]: true }));
        setNotification({
          message: 'Kaleci takip listenize eklendi.',
          type: 'success'
        });
      } else {
        setNotification({
          message: 'Eklenirken bir hata oluştu.',
          type: 'error'
        });
      }
    }
    
    forceUpdate();
    setTimeout(() => setAnimatingId(null), 500);
  };

  const goToTakipListesi = () => {
    router.push('/takip-listesi/kaleci');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modern Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Oyuncu Arama
              </h1>
              <p className="text-slate-600 text-lg mt-1">Profesyonel futbolcu analiz platformu</p>
            </div>
          </div>
      
      {/* Pozisyon Navbar */}
      <PozisyonNavbar seciliPozisyon="Kaleci" />
      
          {/* Stats Header */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🥅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Kaleci İstatistikleri</h2>
                <p className="text-slate-600">Detaylı performans analizi</p>
              </div>
            </div>

          </div>
        </div>

        {/* Modern Notification */}
      {notification && (
          <div className={`mb-6 relative overflow-hidden rounded-2xl backdrop-blur-xl border ${
            notification.type === 'success' ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/50' :
            notification.type === 'warning' ? 'bg-amber-50/80 text-amber-800 border-amber-200/50' :
            'bg-red-50/80 text-red-800 border-red-200/50'
          }`}>
            <div className={`absolute top-0 left-0 h-1 w-full ${
              notification.type === 'success' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
              notification.type === 'warning' ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
              'bg-gradient-to-r from-red-400 to-red-600'
            }`}></div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    notification.type === 'success' ? 'bg-emerald-100' :
                    notification.type === 'warning' ? 'bg-amber-100' :
                    'bg-red-100'
                  }`}>
                    {notification.type === 'success' ? (
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : notification.type === 'warning' ? (
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.82 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <p className="font-medium">{notification.message}</p>
                </div>
            {notification.type === 'success' && notification.message.includes('eklendi') && (
              <button 
                onClick={goToTakipListesi}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                    Takip Listesine Git →
              </button>
            )}
              </div>
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
              <p className="mt-6 text-slate-600 font-medium">Kaleci verileri yükleniyor...</p>
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
              <p className="mt-2 text-sm text-slate-500 text-center">Veritabanında 'kaleci_istatistik' tablosu oluşturulduğundan emin olun.</p>
          </div>
        ) : kaleciIstatistikleri.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">Henüz kaleci verisi bulunmuyor</p>
              <p className="text-sm text-slate-500">Veritabanına kaleci istatistikleri eklendiğinde burada görünecek</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Modern Stats Summary */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <p className="text-slate-700 font-medium">
                    <span className="text-2xl font-bold text-emerald-600">{sortedData.length}</span> kaleci bulundu
                  </p>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Canlı veriler</span>
                </div>
              </div>
              
              {/* Ultra Compact table container */}
              <div className="bg-gradient-to-br from-white/60 to-slate-50/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 overflow-hidden shadow-xl">
                <div className="w-full overflow-x-auto" style={{ userSelect: isResizing ? 'none' : 'auto' }}>
                  <table className="w-full table-auto">
                    <thead className="bg-gradient-to-r from-slate-100/80 to-slate-200/80 backdrop-blur-sm">
                      <tr className="border-b border-slate-300/50">
                        {sutunlar.map((sutun, index) => {
                          const currentWidth = columnWidths[sutun] || getDefaultColumnWidth(sutun);
                          
                          return (
                            <th 
                              key={sutun} 
                              className="px-2 py-2.5 text-left font-semibold text-slate-700 uppercase tracking-tight text-xs hover:bg-slate-200/50 transition-colors duration-200 relative"
                              style={{ width: `${currentWidth}px`, minWidth: '80px' }}
                            >
                              <div 
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => handleSort(sutun)}
                              >
                                <span className="truncate text-[10px] leading-tight" title={SUTUN_ISIMLERI[sutun] || sutun}>
                                  {SUTUN_ISIMLERI[sutun] || sutun}
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
                      {sortedData.map((kaleci, rowIndex) => {
                    const blablaKey = kaleci.blabla ? String(kaleci.blabla).trim() : "";
                    const isInList = blablaKey ? takipDurumu[blablaKey] || false : false;
                    
                    return (
                          <tr key={kaleci.id} className={`hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-200 ${
                            rowIndex % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/40'
                          }`}>
                            {sutunlar.map((sutun, index) => {
                              // Değeri formatla
                              const formatValue = (value: any, columnName: string) => {
                                if (value === null || value === undefined) return '-';
                                const str = value.toString();
                                
                                // Takım adları için özel durum - kesme
                                if (columnName.includes('takim')) {
                                  return str; // Takım adlarını tam göster
                                }
                                
                                // Yüzde içeren sütunlar için % işareti ekle
                                const sutunAdi = SUTUN_ISIMLERI[columnName] || columnName;
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
                                      // 4 haneli performans skorunu nokta ile ayır (örn: 1234 -> 1.234)
                                      return num.toLocaleString('tr-TR');
                                    }
                                    return str;
                                  }
                                  return str;
                                }
                                
                                // Dakika verisi için özel formatlama
                                if (columnName.includes('sure')) {
                                  if (!isNaN(parseFloat(str)) && isFinite(value)) {
                                    const num = parseInt(str);
                                    if (num >= 1000) {
                                      // 4 haneli dakika verisini nokta ile ayır (örn: 1234 -> 1.234)
                                      return num.toLocaleString('tr-TR');
                                    }
                                    return str;
                                  }
                                  return str;
                                }
                                
                                // Diğer sayısal değerler için kısaltma (dakika, performans skoru ve yüzde hariç)
                                if (!isNaN(parseFloat(str)) && isFinite(value)) {
                                  const num = parseFloat(str);
                                  if (num >= 1000) return (num/1000).toFixed(1) + 'k';
                                  if (num % 1 !== 0) return num.toFixed(2);
                                  return str;
                                }
                                
                                // Diğer uzun metinler için kısaltma
                                return str.length > 15 ? str.substring(0, 15) + '...' : str;
                              };
                              
                              const currentWidth = columnWidths[sutun] || getDefaultColumnWidth(sutun);
                              
                              return (
                                <td 
                                  key={`${kaleci.id}-${sutun}`} 
                                  className="px-2 py-2 text-sm text-slate-700 font-medium"
                                  style={{ width: `${currentWidth}px`, minWidth: '80px' }}
                                >
                                  <div className="truncate" title={kaleci[sutun]?.toString() || '-'}>
                                    {formatValue(kaleci[sutun], sutun)}
                                  </div>
                                </td>
                              );
                            })}
                                                        <td className="px-2 py-2 text-right">
                              <button
                                onClick={() => handleTakipListesiToggle(kaleci)}
                                className={`inline-flex items-center justify-center w-9 h-7 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                              animatingId === kaleci.id ? 'scale-110' : ''
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