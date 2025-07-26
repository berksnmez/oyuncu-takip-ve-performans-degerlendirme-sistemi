"use client";

import { useState } from 'react';

export default function TestDbPage() {
  const [result, setResult] = useState<{success?: boolean; message?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Veritabanı Bağlantı Testi</h1>
      
      <button 
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
      >
        {loading ? 'Test ediliyor...' : 'Bağlantıyı Test Et'}
      </button>

      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-medium">{result.success ? 'Başarılı!' : 'Hata!'}</p>
          <p>{result.message}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p className="mb-2">Bağlantı Ayarları:</p>
        <ul className="list-disc list-inside">
          <li>Host: localhost</li>
          <li>Kullanıcı: root</li>
          <li>Şifre: [boş]</li>
          <li>Veritabanı: bitirme_proje</li>
        </ul>
      </div>
    </div>
  );
} 