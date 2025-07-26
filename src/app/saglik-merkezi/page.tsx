import React from 'react';
import Link from 'next/link';

export default function SaglikMerkeziPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sağlık Merkezi</h1>
      
      {/* Secondary Navbar */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <Link href="/saglik-merkezi/mevcut-sakatliklar" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Mevcut Sakatlıklar
          </Link>
          <Link href="/saglik-merkezi/sakatlik-gecmisi" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Sakatlık Geçmişi
          </Link>
          <Link href="/saglik-merkezi/sezon-ozeti" className="py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg">
            Sezon Özeti
          </Link>
        </nav>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-lg mb-4">
          Bu sayfada takımın sağlık durumu ile ilgili veriler ve analizler bulunmaktadır.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Mevcut Sakatlıklar</h2>
            <p>Şu anda sakatlığı bulunan oyuncular ve durumları</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Sakatlık Geçmişi</h2>
            <p>Takımın geçmiş sakatlık kayıtları ve analizleri</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Sezon Özeti</h2>
            <p>Bu sezonun sağlık durumu özeti ve istatistikleri</p>
          </div>
        </div>
      </div>
    </div>
  );
} 