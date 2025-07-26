"use client";

import Link from 'next/link';

interface TakipListesiNavbarProps {
  seciliPozisyon: string;
}

const TakipListesiNavbar: React.FC<TakipListesiNavbarProps> = ({ seciliPozisyon }) => {
  // Tüm pozisyonlar ve rotaları
  const pozisyonlar = [
    { 
      isim: "Kaleci", 
      rota: "/takip-listesi/kaleci",
      icon: "🥅"
    },
    { 
      isim: "Stoper", 
      rota: "/takip-listesi/stoper",
      icon: "🧱"
    },
    { 
      isim: "Bek", 
      rota: "/takip-listesi/bek",
      icon: "🌀"
    },
    { 
      isim: "DOS", 
      rota: "/takip-listesi/dos",
      icon: "🛡️"
    },
    { 
      isim: "Orta Saha", 
      rota: "/takip-listesi/orta-saha",
      icon: "⚽"
    },
    { 
      isim: "Ofansif Orta Saha", 
      rota: "/takip-listesi/oos",
      icon: "🧠"
    },
    { 
      isim: "Kanat", 
      rota: "/takip-listesi/kanat",
      icon: "🚀"
    },
    { 
      isim: "Açık Kanat", 
      rota: "/takip-listesi/acik-kanat",
      icon: "⚡"
    },
    { 
      isim: "Santrafor", 
      rota: "/takip-listesi/santrafor",
      icon: "🎯"
    }
  ];
  
  return (
    <div className="relative mb-8">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-2xl blur-sm"></div>
      
      {/* Main container */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-500/10 border border-white/20 overflow-hidden">
        {/* Header gradient */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
        
        {/* Navigation content */}
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Pozisyon Seçimi
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
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transform scale-105' 
                      : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-blue-100 hover:to-purple-100 hover:text-slate-800 hover:shadow-md'
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
                    ${!isActive ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : ''}
                  `}></div>
                </Link>
              );
            })}
          </div>
          
          {/* Bottom decoration */}
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                    i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-500' : 'bg-blue-400'
                  }`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakipListesiNavbar; 