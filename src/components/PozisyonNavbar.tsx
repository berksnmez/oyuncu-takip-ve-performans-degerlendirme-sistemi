"use client";

import Link from 'next/link';

interface PozisyonNavbarProps {
  seciliPozisyon: string;
}

const PozisyonNavbar: React.FC<PozisyonNavbarProps> = ({ seciliPozisyon }) => {
  // Tüm pozisyonlar ve rotaları
  const pozisyonlar = [
    { 
      isim: "Kaleci", 
      rota: "/oyuncu-arama/kaleci",
      icon: "🥅"
    },
    { 
      isim: "Stoper", 
      rota: "/oyuncu-arama/stoper",
      icon: "🧱"
    },
    { 
      isim: "Bek", 
      rota: "/oyuncu-arama/bek",
      icon: "🌀"
    },
    { 
      isim: "DOS", 
      rota: "/oyuncu-arama/dos",
      icon: "🛡️"
    },
    { 
      isim: "Orta Saha", 
      rota: "/oyuncu-arama/orta-saha",
      icon: "⚽"
    },
    { 
      isim: "Ofansif Orta Saha", 
      rota: "/oyuncu-arama/oos",
      icon: "🧠"
    },
    { 
      isim: "Kanat", 
      rota: "/oyuncu-arama/kanat",
      icon: "🚀"
    },
    { 
      isim: "Açık Kanat", 
      rota: "/oyuncu-arama/acik-kanat",
      icon: "⚡"
    },
    { 
      isim: "Santrafor", 
      rota: "/oyuncu-arama/santrafor",
      icon: "🎯"
    }
  ];
  
  return (
    <div className="relative mb-8">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl blur-sm"></div>
      
      {/* Main container */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-emerald-500/10 border border-white/20 overflow-hidden">
        {/* Header gradient */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
        
        {/* Navigation content */}
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Oyuncu Pozisyonu
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {pozisyonlar.map((pozisyon) => {
              const isActive = seciliPozisyon === pozisyon.isim;
              
              return (
                <Link
                  key={pozisyon.isim}
                  href={pozisyon.rota}
                  className={`
                    group relative flex items-center space-x-2 px-5 py-3 rounded-xl
                    font-medium text-sm transition-all duration-300 ease-out
                    hover:scale-105 hover:shadow-lg
                    ${isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 transform scale-105' 
                      : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-emerald-100 hover:to-teal-100 hover:text-slate-800 hover:shadow-md'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                  )}
                  
                  {/* Position icon */}
                  <span className="text-base">
                    {pozisyon.icon}
                  </span>
                  
                  {/* Position name */}
                  <span className={`
                    whitespace-nowrap transition-all duration-300
                    ${isActive ? 'text-white font-semibold' : 'font-medium'}
                  `}>
                    {pozisyon.isim}
                  </span>
                  
                  {/* Hover effect overlay */}
                  <div className={`
                    absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                    ${!isActive ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10' : ''}
                  `}></div>
                </Link>
              );
            })}
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default PozisyonNavbar; 