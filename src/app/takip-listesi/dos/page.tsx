"use client";

import { useState, useEffect, useCallback } from "react";
import { useTakipListesi } from "@/contexts/TakipListesiContext";
import Link from "next/link";
import React from 'react';

// Modern Takip Listesi Navbar Bileşeni
const TakipListesiNavbar = ({ seciliPozisyon }: { seciliPozisyon: string }) => {
  const pozisyonlar = [
    { isim: "Kaleci", rota: "/takip-listesi/kaleci" },
    { isim: "Stoper", rota: "/takip-listesi/stoper" },
    { isim: "Bek", rota: "/takip-listesi/bek" },
    { isim: "DOS", rota: "/takip-listesi/dos" },
    { isim: "Orta Saha", rota: "/takip-listesi/orta-saha" },
    { isim: "Ofansif Orta Saha", rota: "/takip-listesi/ofansif-orta-saha" },
    { isim: "Kanat", rota: "/takip-listesi/kanat" },
    { isim: "Açık Kanat", rota: "/takip-listesi/acik-kanat" },
    { isim: "Santrafor", rota: "/takip-listesi/santrafor" }
  ];
  
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-8 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-100/80 to-slate-200/80 px-4 py-3 border-b border-slate-200/50">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center">
          <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Takip Listesi Pozisyonları
        </h3>
      </div>
      <div className="p-2">
        <div className="flex flex-wrap gap-2">
          {pozisyonlar.map((pozisyon) => (
            <Link
              key={pozisyon.isim}
              href={pozisyon.rota}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                seciliPozisyon === pozisyon.isim 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:shadow-md'
              }`}
            >
              {pozisyon.isim}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

interface DOSItem {
  id: number;
  blabla_dos: string;
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
  topkpm_yzd: { short: "T.Kap %", full: "Top Kapma Yüzdesi" },
  anhtmudMB: { short: "Anh.M/M", full: "Anahtar Müdahale/Maç" },
  kznTopMB: { short: "Kaz.T/M", full: "Kazanılan Top/Maç" },
  kosumsfMB: { short: "Koş.M/M", full: "Koşu Mesafesi/Maç" },
  topksmeMB: { short: "T.Kes/M", full: "Top Kesme/Maç" },
  sutengllmeMB: { short: "Ş.Eng/M", full: "Şut Engelleme/Maç" },
  bsrlpressMB: { short: "B.Prs/M", full: "Başarılı Press/Maç" },
  isbtlpas_yzd: { short: "İ.Pas %", full: "İsabetli Pas Yüzdesi" },
  bsrltopmdhMB: { short: "B.T.M/M", full: "Başarılı Topa Müdahale/Maç" },
  bsrltopmdhMB_katsayi: { short: "B.T.K", full: "Başarılı Topa Müdahale/Maç Katsayı" },
  anhtmudMB_katsayi: { short: "Anh.K", full: "Anahtar Müdahale/Maç Katsayı" },
  kznTopMB_katsayi: { short: "Kaz.K", full: "Kazanılan Top/Maç Katsayı" },
  kosumsfMB_katsayi: { short: "Koş.K", full: "Koşu Mesafesi/Maç Katsayı" },
  topksmeMB_katsayi: { short: "T.K.K", full: "Top Kesme/Maç Katsayı" },
  sutengllmeMB_katsayi: { short: "Ş.E.K", full: "Şut Engelleme/Maç Katsayı" },
  bsrlpressMB_katsayi: { short: "B.P.K", full: "Başarılı Press/Maç Katsayı" },
  isbtlpas_yzd_katsayi: { short: "İ.P.K", full: "İsabetli Pas Yüzdesi Katsayı" },
  performans_skoru: { short: "Perf.S", full: "Performans Skoru" },
  kalite_sira_katsayi: { short: "Kal.S", full: "Kalite Sıra" },
  performans_skor_sirasi: { short: "P.Skor", full: "Performans Skor Sırası" },
  surdurabilirlik_sira: { short: "Sürd.", full: "Sürdürülebilirlik Sıra" },
  genel_sira: { short: "Genel", full: "Genel Sıra" }
};

export default function TakipListesiDOS() {
  const { getItemsByCategory, removeFromTakipListesi, takipListesi } = useTakipListesi();
  const [doslar, setDoslar] = useState<DOSItem[]>([]);
  const [sutunlar, setSutunlar] = useState<string[]>([]);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  
  // Sütun genişlikleri için state
  const [columnWidths, setColumnWidths] = useState<{[key: string]: number}>({});
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Load data from context and update when takipListesi changes occur
  useEffect(() => {
    const items = getItemsByCategory('dos');
    console.log("Loaded doslar:", items);
    
    // Filter and cast items to ensure they all have the blabla_dos field
    const validItems = items
      .filter(item => item.blabla_dos !== undefined)
      .map(item => ({ ...item, blabla_dos: String(item.blabla_dos) })) as DOSItem[];
      
    setDoslar(validItems);
    
    if (validItems.length > 0) {
      // DEBUG: Tüm available field'ları göster
      const allColumns = Object.keys(validItems[0]);
      console.log("All available columns:", allColumns);
      
      // Filter out unwanted columns like oyuncu-arama page - IMPORTANT: Include kalite_sira_katsayi
      const filteredColumns = allColumns.filter(
        sutun => sutun !== 'takim_id' && sutun !== 'oyuncu_id' && sutun !== 'id' && sutun !== 'blabla_dos' && (!sutun.endsWith('katsayi') || sutun === 'kalite_sira_katsayi')
      );
      console.log("Filtered columns:", filteredColumns);
      setSutunlar(filteredColumns);
    }
  }, [getItemsByCategory, takipListesi]);

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
    if (!sortColumn) return doslar;

    return [...doslar].sort((a, b) => {
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
      
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [doslar, sortColumn, sortDirection]);

  // Takip listesinden çıkarma işlemi
  const handleRemoveFromTakipListesi = (dos: DOSItem) => {
    if (!dos.blabla_dos) {
      setNotification({
        message: 'Bu DOS için blabla_dos alanı bulunamadı!',
        type: 'error'
      });
      return;
    }

    setAnimatingId(dos.id);
    
    const blablaDosKey = String(dos.blabla_dos).trim();
    removeFromTakipListesi(blablaDosKey, 'dos');
    
    setNotification({
      message: `${dos.oyuncu_isim} takip listesinden çıkarıldı.`,
      type: 'warning'
    });

    setTimeout(() => {
      setAnimatingId(null);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modern Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Takip Listem
              </h1>
              <p className="text-slate-600 text-lg mt-1">Favori oyuncularınızın takip merkezi</p>
            </div>
          </div>
      
          {/* Takip Listesi Navbar */}
          <TakipListesiNavbar seciliPozisyon="DOS" />
      
          {/* Stats Header */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚔️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Takip Edilen DOS'lar</h2>
                <p className="text-slate-600">Favori defansif orta saha oyuncularınızın performans takibi</p>
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
            </div>
          </div>
        )}
      
        {/* Modern Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {sortedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">Henüz takip edilen DOS bulunmuyor</p>
              <p className="text-sm text-slate-500 mt-1">Oyuncu arama sayfasından DOS ekleyerek başlayın</p>
              <Link
                href="/oyuncu-arama/dos"
                className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                DOS Ara →
              </Link>
            </div>
          ) : (
            <div className="p-6">
              {/* Modern Stats Summary */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <p className="text-slate-700 font-medium">
                    <span className="text-2xl font-bold text-emerald-600">{sortedData.length}</span> DOS takip ediliyor
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {sortedData.length >= 2 && (
                    <Link 
                      href="/takip-listesi/dos/karsilastir" 
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
                    >
                      <svg 
                        className="w-4 h-4 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                        />
                      </svg>
                      DOS Karşılaştır
                    </Link>
                  )}
                  <div className="hidden sm:flex items-center space-x-2">
                    <span className="text-xs text-slate-500">Favori oyuncularınız</span>
                  </div>
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
                      {sortedData.map((dos, rowIndex) => {
                        const blablaDosKey = dos.blabla_dos ? String(dos.blabla_dos).trim() : "";
                        
                        return (
                          <tr key={dos.id} className={`hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-200 ${
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
                                    return num.toString();
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
                                  key={`${dos.id}-${sutun}`} 
                                  className="px-1 py-1.5 text-xs text-slate-700 font-medium"
                                  style={{ width: `${currentWidth}px`, minWidth: '50px' }}
                                >
                                  <div className="truncate" title={dos[sutun]?.toString() || '-'}>
                                    {formatValue(dos[sutun], sutun)}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-2 py-2 text-right">
                              <button
                                onClick={() => handleRemoveFromTakipListesi(dos)}
                                className={`inline-flex items-center justify-center w-9 h-7 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                                  animatingId === dos.id ? 'scale-110' : ''
                                } bg-gradient-to-r from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300`}
                                title="Takip listesinden çıkar"
                              >
                                <svg 
                                  className="w-3 h-3 fill-red-600" 
                                  viewBox="0 0 24 24" 
                                >
                                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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