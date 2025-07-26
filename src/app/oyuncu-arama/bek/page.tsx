"use client";

import { useState, useEffect, useCallback } from "react";
import PozisyonNavbar from "@/components/PozisyonNavbar";
import { useTakipListesi } from "@/contexts/TakipListesiContext";
import { useRouter } from "next/navigation";
import React from "react";

// Bek istatistik tipi
interface BekIstatistik {
  id: number;
  blabla_bek: string;
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
  topmdhMB: { short: "T.Müd/M", full: "Topa Müdahale/Maç" },
  bsrltopmdh_yzd: { short: "Baş.T.M %", full: "Başarılı Topa Müdahale Yüzdesi" },
  sutengllmeMB: { short: "Ş.Eng/M", full: "Şut Engelleme/Maç" },
  topksmeMB: { short: "T.Kes/M", full: "Top Kesme/Maç" },
  bsrlpressMB: { short: "Baş.P/M", full: "Başarılı Press/Maç" },
  astbklntMB: { short: "Ast.B/M", full: "Asist Beklentisi/Maç" },
  yrtglfrstMB: { short: "G.Fır/M", full: "Yaratılan Gol Fırsatı/Maç" },
  isbtlortMB: { short: "İs.O/M", full: "İsabetli Orta/Maç" },
  anhtrpasMB: { short: "Anh.P/M", full: "Anahtar Pas/Maç" },
  kosumsfMB: { short: "Koş.M/M", full: "Koşu Mesafesi/Maç" },
  isbtlpasMB: { short: "İs.P/M", full: "İsabetli Pas/Maç" },
  yrtclkEtknlk: { short: "Yrt.Etk", full: "Yaratıcılık Etkinliği" },
  bsrltopmdhMB: { short: "Baş.T/M", full: "Başarılı Topa Müdahale/Maç" },
  bsrltopmdhMB_katsayi: { short: "B.T.K", full: "Başarılı Topa Müdahale/Maç Katsayı" },
  sutengllmeMB_katsayi: { short: "Ş.E.K", full: "Şut Engelleme/Maç Katsayı" },
  topksmeMB_katsayi: { short: "T.K.K", full: "Top Kesme/Maç Katsayı" },
  bsrlpressMB_katsayi: { short: "B.P.K", full: "Başarılı Press/Maç Katsayı" },
  astbklntMB_katsayi: { short: "A.B.K", full: "Asist Beklentisi/Maç Katsayı" },
  yrtglfrstMB_katsayi: { short: "G.F.K", full: "Yaratılan Gol Fırsatı/Maç Katsayı" },
  isbtlortMB_katsayi: { short: "İ.O.K", full: "İsabetli Orta/Maç Katsayı" },
  anhtrpasMB_katsayi: { short: "A.P.K", full: "Anahtar Pas/Maç Katsayı" },
  kosumsfMB_katsayi: { short: "K.M.K", full: "Koşu Mesafesi/Maç Katsayı" },
  yrtclkEtknlk_katsayi: { short: "Y.E.K", full: "Yaratıcılık Etkinliği Katsayı" },
  performans_skoru: { short: "Perf.S", full: "Performans Skoru" },
  kalite_sira_katsayi: { short: "Kal.S", full: "Kalite Sıra" },
  performans_skor_sirasi: { short: "P.Skor", full: "Performans Skor Sırası" },
  surdurabilirlik_sira: { short: "Sürd.", full: "Sürdürülebilirlik Sıra" },
  genel_sira: { short: "Genel", full: "Genel Sıra" }
};

export default function BekSayfasi() {
  const router = useRouter();
  const [bekIstatistikleri, setBekIstatistikleri] = useState<BekIstatistik[]>([]);
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

  // Sayfa yüklendiğinde bek istatistiklerini getir
  useEffect(() => {
    const bekIstatistikleriniGetir = async () => {
      try {
        setYukleniyor(true);
        const response = await fetch('/api/bek-istatistik');
        const result = await response.json();
        
        if (result.success) {
          const processedData = result.data.map((bek: BekIstatistik) => {
            if (!bek.blabla_bek) {
              return { ...bek, blabla_bek: String(bek.id) };
            }
            return bek;
          });
          
          setBekIstatistikleri(processedData);
          
          if (processedData.length > 0) {
            const tumSutunlar = Object.keys(processedData[0]);
            const filtrelenmisStunlar = tumSutunlar.filter(
              sutun => sutun !== 'takim_id' && sutun !== 'oyuncu_id' && sutun !== 'id' && sutun !== 'blabla_bek' && (!sutun.endsWith('katsayi') || sutun === 'kalite_sira_katsayi')
            );
            setSutunlar(filtrelenmisStunlar);
          }
        } else {
          setHata(result.message || 'Veriler alınırken bir hata oluştu');
        }
      } catch (error) {
        console.error('Bek istatistikleri getirilirken hata:', error);
        setHata('Bek istatistikleri getirilirken bir hata oluştu');
      } finally {
        setYukleniyor(false);
      }
    };

    bekIstatistikleriniGetir();
  }, []);
  
  // Takip durumunu güncelle
  useEffect(() => {
    if (bekIstatistikleri.length > 0) {
      const updatedTakipDurumu: {[key: string]: boolean} = {};
      
      bekIstatistikleri.forEach((bek: BekIstatistik) => {
        if (bek.blabla_bek) {
          const blablaBekKey = String(bek.blabla_bek).trim();
          updatedTakipDurumu[blablaBekKey] = isInTakipListesi(blablaBekKey, 'bek');
        }
      });
      
      setTakipDurumu(updatedTakipDurumu);
    }
  }, [bekIstatistikleri, isInTakipListesi, takipListesi]);

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
    const newWidth = Math.max(50, startWidth + diff); // Minimum genişlik 50px
    
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
      // Same column clicked, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column clicked, set to ascending
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  // Sort data based on current sort settings
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return bekIstatistikleri;

    return [...bekIstatistikleri].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
      
      // Convert to string for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      // Try to parse as numbers for numeric sorting
      const aNum = parseFloat(aStr);
      const bNum = parseFloat(bStr);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        // Numeric comparison
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      } else {
        // String comparison
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [bekIstatistikleri, sortColumn, sortDirection]);

  // Takip listesi işlemleri
  const handleTakipListesiToggle = (bek: BekIstatistik) => {
    setAnimatingId(bek.id);
    
    // Use blabla_bek field for bek tracking
    if (!bek.blabla_bek) {
      setNotification({
        message: 'Bu bek için blabla_bek alanı bulunamadı!',
        type: 'error'
      });
      return;
    }
    
    // Standardize blabla_bek value
    const blablaBek = String(bek.blabla_bek).trim();
    
    // Get current state from our local tracking
    const isCurrentlyInList = takipDurumu[blablaBek] || false;
    console.log(`Toggle için bek ${bek.id} (${blablaBek}) mevcut durumu: ${isCurrentlyInList}`);
    
    if (isCurrentlyInList) {
      // Remove from context using blabla_bek
      removeFromTakipListesi(blablaBek, 'bek');
      
      // Update local tracking state immediately
      setTakipDurumu(prev => ({
        ...prev,
        [blablaBek]: false
      }));
      
      setNotification({
        message: 'Bek takip listenizden çıkarıldı.',
        type: 'success'
      });
    } else {
      // Clone the object to ensure we're working with a clean instance
      const cleanBek = { ...bek, blabla_bek: blablaBek };
      
      // Add to context and track result
      const result = addToTakipListesi(cleanBek, 'bek');
      
      if (result.isDuplicate) {
        setNotification({
          message: 'Bu bek zaten takip listenizde bulunuyor!',
          type: 'warning'
        });
        
        // Make sure our tracking state matches reality
        setTakipDurumu(prev => ({
          ...prev,
          [blablaBek]: true
        }));
      } else if (result.success) {
        // Update local tracking state immediately
        setTakipDurumu(prev => ({
          ...prev,
          [blablaBek]: true
        }));
        
        setNotification({
          message: 'Bek takip listenize eklendi.',
          type: 'success'
        });
      } else {
        setNotification({
          message: 'Eklenirken bir hata oluştu.',
          type: 'error'
        });
      }
    }
    
    // Force update to make sure UI reflects the change
    forceUpdate();
    
    // Animation duration
    setTimeout(() => {
      setAnimatingId(null);
    }, 500);
  };

  // Go to Takip Listesi page
  const goToTakipListesi = () => {
    router.push('/takip-listesi/bek');
  };
  
  console.log("Takip durumu:", takipDurumu); // Debug log
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Pozisyon Navbar */}
      <PozisyonNavbar seciliPozisyon="Bek" />
      
      {/* Modern header with gradient */}
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-slate-800 font-bold text-2xl sm:text-3xl">🌀 Bek İstatistikleri</h1>
            <p className="text-slate-600 mt-1">Detaylı performans analizi ve karşılaştırma</p>
          </div>
        </div>
      
      {/* Notification */}
      {notification && (
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
            notification.type === 'success' 
              ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/50' :
            notification.type === 'warning' 
              ? 'bg-amber-50/80 text-amber-800 border-amber-200/50' :
              'bg-red-50/80 text-red-800 border-red-200/50'
        }`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{notification.message}</p>
            {notification.type === 'success' && notification.message.includes('eklendi') && (
              <button 
                onClick={goToTakipListesi}
                    className="mt-2 inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                    Takip Listesine Git →
              </button>
            )}
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {yukleniyor && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-4 text-slate-600 font-medium">Veriler yükleniyor...</p>
            <p className="text-sm text-slate-500">Bek istatistikleri getiriliyor</p>
          </div>
        )}

        {/* Error state */}
        {hata && !yukleniyor && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">{hata}</p>
            <p className="text-sm text-slate-500">Veritabanında 'bek_istatistik' tablosu oluşturulduğundan emin olun</p>
        </div>
      )}
      
        {/* Empty state */}
        {!yukleniyor && !hata && sortedData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Henüz bek verisi bulunmuyor</p>
            <p className="text-sm text-slate-500">Veritabanına bek istatistikleri eklendiğinde burada görünecek</p>
          </div>
        )}

        {/* Data table */}
        {!yukleniyor && !hata && sortedData.length > 0 && (
          <div>
            {/* Modern Stats Summary */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <p className="text-slate-700 font-medium">
                  <span className="text-2xl font-bold text-emerald-600">{sortedData.length}</span> bek bulundu
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
                      {sortedData.map((bek, rowIndex) => {
                      const blablaBekKey = bek.blabla_bek ? String(bek.blabla_bek).trim() : "";
                      const isInList = blablaBekKey ? takipDurumu[blablaBekKey] || false : false;
                      
                      return (
                        <tr key={bek.id} className={`hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-200 ${
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
                                key={`${bek.id}-${sutun}`} 
                                className="px-1 py-1.5 text-xs text-slate-700 font-medium"
                                style={{ width: `${currentWidth}px`, minWidth: '50px' }}
                              >
                                <div className="truncate" title={bek[sutun]?.toString() || '-'}>
                                  {formatValue(bek[sutun], sutun)}
                                </div>
                          </td>
                            );
                          })}
                          <td className="px-2 py-2 text-right">
                          <button
                            onClick={() => handleTakipListesiToggle(bek)}
                              className={`inline-flex items-center justify-center w-9 h-7 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                              animatingId === bek.id ? 'scale-110' : ''
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
  );
} 