"use client";

import { useState } from 'react';
import { useTakipListesi } from '@/contexts/TakipListesiContext';

// This component is only for debugging and development
// It should be removed or disabled in production
export default function DebugResetButton() {
  const { resetTakipListesi } = useTakipListesi();
  const [resetDone, setResetDone] = useState(false);
  
  const handleReset = () => {
    if (window.confirm('Bu işlem takip listenizi tamamen silecek. Devam etmek istiyor musunuz?')) {
      resetTakipListesi();
      setResetDone(true);
      
      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleReset}
        disabled={resetDone}
        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-xs hover:bg-gray-300 transition-colors"
      >
        {resetDone ? 'Liste sıfırlandı...' : 'Debug: Takip Listesini Sıfırla'}
      </button>
    </div>
  );
} 