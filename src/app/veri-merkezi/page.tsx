import React from 'react';
import Link from 'next/link';

export default function VeriMerkeziPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Veri Merkezi</h1>
      
      {/* Secondary Navbar */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <Link href="/veri-merkezi/takim" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Takım
          </Link>
          <Link href="/veri-merkezi/oyuncu" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Oyuncu
          </Link>
        </nav>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-lg mb-4">
          Bu sayfada futbol verileri ile ilgili istatistikler ve analizler bulunmaktadır.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Oyuncu İstatistikleri</h2>
            <p>Oyuncuların performans verileri ve istatistikleri</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Takım Analizleri</h2>
            <p>Takımların performans metrikleri ve karşılaştırmalı analizler</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Lig İstatistikleri</h2>
            <p>Liglere göre performans ve istatistik verileri</p>
          </div>
        </div>
      </div>
    </div>
  );
} 