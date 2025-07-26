import React from 'react';
import Link from 'next/link';

export default function MaliDurumPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mali Durum</h1>
      
      {/* Secondary Navbar */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <Link href="/mali-durum/genel" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Genel
          </Link>
          <Link href="/mali-durum/gelir" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Gelir
          </Link>
          <Link href="/mali-durum/gider" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Gider
          </Link>
        </nav>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-lg mb-4">
          Bu sayfada takımın mali durumu ile ilgili veriler ve analizler bulunmaktadır.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Gelir Yönetimi</h2>
            <p>Takımın gelir kaynakları ve mali gelir analizleri</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Gider Takibi</h2>
            <p>Takımın giderleri ve mali gider analizleri</p>
          </div>
        </div>
      </div>
    </div>
  );
} 