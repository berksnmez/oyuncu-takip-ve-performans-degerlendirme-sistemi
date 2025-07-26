"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PozisyonNavbar from "@/components/PozisyonNavbar";

// Oyuncu tipi tanımı
interface Oyuncu {
  id: number;
  [key: string]: any; // Diğer tüm sütunları kabul etmek için
}

// Pozisyon tipleri moved to PozisyonNavbar component

export default function OyuncuArama() {
  const router = useRouter();
  const [aramaTermi, setAramaTermi] = useState("");
  const [oyuncular, setOyuncular] = useState<Oyuncu[]>([]);
  const [filtrelenmisOyuncular, setFiltrelenmisOyuncular] = useState<Oyuncu[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [sutunlar, setSutunlar] = useState<string[]>([]);
  const [seciliPozisyon, setSeciliPozisyon] = useState("Kaleci");
  
  // Sayfa ilk yüklendiğinde Kaleci sayfasına yönlendir
  useEffect(() => {
    router.push('/oyuncu-arama/kaleci');
  }, []);

  // Sayfa yüklendiğinde oyuncuları getir
  useEffect(() => {
    const oyunculariGetir = async () => {
      try {
        setYukleniyor(true);
        const response = await fetch('/api/oyuncular');
        const result = await response.json();
        
        if (result.success) {
          setOyuncular(result.data);
          setFiltrelenmisOyuncular(result.data);
          
          // Veritabanı sütunlarını tespit et (ilk oyuncunun anahtarlarından)
          if (result.data.length > 0) {
            setSutunlar(Object.keys(result.data[0]));
          }
        } else {
          setHata(result.message || 'Veriler alınırken bir hata oluştu');
        }
      } catch (error) {
        console.error('Oyuncular getirilirken hata:', error);
        setHata('Oyuncular getirilirken bir hata oluştu');
      } finally {
        setYukleniyor(false);
      }
    };

    oyunculariGetir();
  }, []);

  // Arama fonksiyonu
  const aramaYap = () => {
    if (!aramaTermi.trim()) {
      // Eğer arama terimi yoksa sadece seçili pozisyona göre filtrele
      setFiltrelenmisOyuncular(
        oyuncular.filter(oyuncu => 
          oyuncu.pozisyon && oyuncu.pozisyon.toLowerCase() === seciliPozisyon.toLowerCase()
        )
      );
      return;
    }

    let sonuclar = [...oyuncular];

    // Eğer arama terimi varsa filtreleme yap
    if (aramaTermi.trim()) {
      const arananTerim = aramaTermi.toLowerCase();
      sonuclar = sonuclar.filter(oyuncu => {
        // Tüm alanlarda arama yap
        return Object.values(oyuncu).some(deger => 
          String(deger).toLowerCase().includes(arananTerim)
        );
      });
    }

    // Pozisyona göre filtreleme yap
    sonuclar = sonuclar.filter(oyuncu => 
      oyuncu.pozisyon && oyuncu.pozisyon.toLowerCase() === seciliPozisyon.toLowerCase()
    );

    setFiltrelenmisOyuncular(sonuclar);
  };

  // Pozisyona göre filtreleme
  const pozisyonaGoreFiltrele = (pozisyon: string) => {
    setSeciliPozisyon(pozisyon);
    
    // Özel sayfaları olan pozisyonlar için yönlendirme
    if (pozisyon === "Kaleci") {
      router.push('/oyuncu-arama/kaleci');
      return;
    }
    else if (pozisyon === "Stoper") {
      router.push('/oyuncu-arama/stoper');
      return;
    }
    else if (pozisyon === "Bek") {
      router.push('/oyuncu-arama/bek');
      return;
    }
    else if (pozisyon === "DOS") {
      router.push('/oyuncu-arama/dos');
      return;
    }
    else if (pozisyon === "Orta Saha") {
      router.push('/oyuncu-arama/orta-saha');
      return;
    }
    else if (pozisyon === "Ofansif Orta Saha") {
      router.push('/oyuncu-arama/oos');
      return;
    }
    else if (pozisyon === "Kanat") {
      router.push('/oyuncu-arama/kanat');
      return;
    }
    else if (pozisyon === "Açık Kanat") {
      router.push('/oyuncu-arama/acik-kanat');
      return;
    }
    else if (pozisyon === "Santrafor") {
      router.push('/oyuncu-arama/santrafor');
      return;
    }
    
    // Tümü seçeneği kaldırıldı
    
    // Seçilen pozisyona göre filtrele
    let sonuclar = oyuncular.filter(oyuncu => 
      oyuncu.pozisyon && oyuncu.pozisyon.toLowerCase() === pozisyon.toLowerCase()
    );
    
    // Eğer arama terimi de varsa, onunla da filtrele
    if (aramaTermi.trim()) {
      const arananTerim = aramaTermi.toLowerCase();
      sonuclar = sonuclar.filter(oyuncu => {
        return Object.values(oyuncu).some(deger => 
          String(deger).toLowerCase().includes(arananTerim)
        );
      });
    }
    
    setFiltrelenmisOyuncular(sonuclar);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Oyuncu Arama</h1>
      
      {/* Pozisyon Navbar */}
      <PozisyonNavbar seciliPozisyon={seciliPozisyon} />
      
      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Oyuncu adı, takım veya özellik ara..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={aramaTermi}
            onChange={(e) => {
              setAramaTermi(e.target.value);
              if (e.target.value === '') {
                // Arama terimi boşaldığında, sadece pozisyon filtresine göre güncelle
                pozisyonaGoreFiltrele(seciliPozisyon);
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && aramaYap()}
          />
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            onClick={aramaYap}
          >
            Ara
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {yukleniyor ? (
          <p className="text-center text-gray-500">Oyuncular yükleniyor...</p>
        ) : hata ? (
          <div className="text-center text-red-500">
            <p>{hata}</p>
            <p className="mt-2 text-sm">Veritabanında 'oyuncu' tablosu oluşturulduğundan emin olun.</p>
          </div>
        ) : filtrelenmisOyuncular.length === 0 ? (
          <p className="text-center text-gray-500">
            {aramaTermi ? 
              'Arama kriterlerine uygun oyuncu bulunamadı.' : 
              'Veritabanında kayıtlı oyuncu bulunamadı.'
            }
          </p>
        ) : (
          <div>
            <p className="mb-4 text-gray-500">
              Toplam {filtrelenmisOyuncular.length} oyuncu bulundu
              {` (${seciliPozisyon} pozisyonu)`}
              {aramaTermi ? ` "${aramaTermi}" araması için` : ''}
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {sutunlar.map((sutun) => (
                      <th key={sutun} className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {sutun}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtrelenmisOyuncular.map((oyuncu) => (
                    <tr key={oyuncu.id} className="hover:bg-gray-50">
                      {sutunlar.map((sutun) => (
                        <td key={`${oyuncu.id}-${sutun}`} className="p-3 text-sm">
                          {oyuncu[sutun]?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 