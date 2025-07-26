"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      href: "/oyuncu-arama",
      label: "Oyuncu Arama",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      href: "/takip-listesi",
      label: "Takip Listesi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      href: "/kadro",
      label: "Kadro",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      href: "/veri-merkezi/takim",
      label: "Veri Merkezi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      href: "/mali-durum/genel",
      label: "Mali Durum",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      href: "/saglik-merkezi/mevcut-sakatliklar",
      label: "Sağlık Merkezi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v4m-2-2h4" />
        </svg>
      )
    },
    {
      href: "/fiktur-puan-tablosu",
      label: "Fikstür/Puan Tablosu",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      href: "/teknik-ekip",
      label: "Teknik Ekip",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      href: "/en-iyiler",
      label: "En İyiler",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Modern Mobile Toggle Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90 hover:shadow-xl transition-all duration-300 hover:scale-105"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <div className="relative w-6 h-6">
          <span className={`absolute block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'top-3 rotate-45' : 'top-1'}`}></span>
          <span className={`absolute block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'top-3'}`}></span>
          <span className={`absolute block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'}`}></span>
        </div>
      </button>
      
      {/* Modern Sidebar Navigation */}
      <nav className={`
        fixed top-0 left-0 z-40 h-full w-72
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        backdrop-blur-xl border-r border-slate-700/50
        transform transition-all duration-500 ease-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl shadow-black/20
      `}>
        {/* Header Section */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <Link href="/" className="group flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                Futbol Performans
              </h1>
              <p className="text-xs text-slate-400">Yönetim Sistemi</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = item.href === "/veri-merkezi/takim" 
                ? pathname.startsWith('/veri-merkezi')
                : item.href === "/mali-durum/genel"
                ? pathname.startsWith('/mali-durum')
                : item.href === "/saglik-merkezi/mevcut-sakatliklar"
                ? pathname.startsWith('/saglik-merkezi')
                : pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-300 ease-out
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 transition-all duration-300
                    ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}
                  `}>
                    {item.icon}
                  </div>
                  
                  {/* Label */}
                  <span className={`
                    font-medium transition-all duration-300
                    ${isActive ? 'text-white' : 'group-hover:text-white'}
                  `}>
                    {item.label}
                  </span>
                  
                  {/* Hover arrow */}
                  <svg className={`
                    w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 
                    transform translate-x-2 group-hover:translate-x-0
                    transition-all duration-300
                    ${isActive ? 'text-white' : 'text-slate-400'}
                  `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Footer Section */}
        <div className="p-6 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-800 rounded-lg p-3">
                <Image
                  src="/images/70108472B.png"
                  alt="Logo"
                  width={120}
                  height={60}
                  className="object-contain filter brightness-110"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              © 2024 Futbol Performans
            </p>
          </div>
        </div>
      </nav>
      
      {/* Modern Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
} 