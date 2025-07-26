"use client";

import { useState, useRef, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  position: string;
  x: number;
  y: number;
}

interface PositionZone {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface BestPlayer {
  oyuncu_isim: string;
  takim_adi: string;
  genel_sira: number;
  performans_skoru: number;
}

interface BestPlayerTable {
  takim_adi: string;
  oyuncu_mevkii: string;
  oyuncu_isim: string;
  oyuncu_yas: number;
  oyuncu_sure: number;
  genel_sira: number;
}

interface BestStoperTable {
  takim_adi: string;
  oyuncu_mevkii: string;
  oyuncu_yan_mevkii: string;
  oyuncu_isim: string;
  oyuncu_yas: number;
  oyuncu_sure: number;
  genel_sira: number;
}

interface TopScorer {
  takim_adi: string;
  oyuncu_mevkii: string;
  oyuncu_yan_mevkii: string | null;
  oyuncu_isim: string;
  oyuncu_yas: number;
  oyuncu_sure: number;
  gol: number;
  oyuncu_id: number;
}

interface TopAssist {
  takim_adi: string;
  oyuncu_mevkii: string;
  oyuncu_yan_mevkii: string | null;
  oyuncu_isim: string;
  oyuncu_yas: number;
  oyuncu_sure: number;
  asist: number;
  oyuncu_id: number;
}

interface TopMotm {
  takim_adi: string;
  oyuncu_mevkii: string;
  oyuncu_yan_mevkii: string | null;
  oyuncu_isim: string;
  oyuncu_yas: number;
  oyuncu_sure: number;
  macin_adami: number;
  oyuncu_id: number;
}

export default function EnIyilerPage() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [bestGoalkeeper, setBestGoalkeeper] = useState<BestPlayer | null>(null);
  const [bestStopers, setBestStopers] = useState<BestPlayer[]>([]);
  const [bestDefensiveMidfielders, setBestDefensiveMidfielders] = useState<BestPlayer[]>([]);
  const [bestMidfielders, setBestMidfielders] = useState<BestPlayer[]>([]);
  const [bestOffensiveMidfielders, setBestOffensiveMidfielders] = useState<BestPlayer[]>([]);
  const [bestStrikers, setBestStrikers] = useState<BestPlayer[]>([]);
  const [bestLeftBacks, setBestLeftBacks] = useState<BestPlayer[]>([]);
  const [bestRightBacks, setBestRightBacks] = useState<BestPlayer[]>([]);
  const [bestLeftWingers, setBestLeftWingers] = useState<BestPlayer[]>([]);
  const [bestRightWingers, setBestRightWingers] = useState<BestPlayer[]>([]);
  const [bestLeftWideWingers, setBestLeftWideWingers] = useState<BestPlayer[]>([]);
  const [bestRightWideWingers, setBestRightWideWingers] = useState<BestPlayer[]>([]);
  const [sortingCriteria, setSortingCriteria] = useState<string>('genel_sira');
  
  // Her tablo için ayrı sıralama kriterleri
  const [kalecilerSortCriteria, setKalecilerSortCriteria] = useState<string>('genel_sira');
  const [stoperlerSortCriteria, setStoperlerSortCriteria] = useState<string>('genel_sira');
  const [solBeklerSortCriteria, setSolBeklerSortCriteria] = useState<string>('genel_sira');
  const [sagBeklerSortCriteria, setSagBeklerSortCriteria] = useState<string>('genel_sira');
  const [dosSortCriteria, setDosSortCriteria] = useState<string>('genel_sira');
  const [solKanatlarSortCriteria, setSolKanatlarSortCriteria] = useState<string>('genel_sira');
  const [sagKanatlarSortCriteria, setSagKanatlarSortCriteria] = useState<string>('genel_sira');
  const [ortasahaSortCriteria, setOrtasahaSortCriteria] = useState<string>('genel_sira');
  const [oosSortCriteria, setOosSortCriteria] = useState<string>('genel_sira');
  const [solAcikKanatSortCriteria, setSolAcikKanatSortCriteria] = useState<string>('genel_sira');
  const [sagAcikKanatSortCriteria, setSagAcikKanatSortCriteria] = useState<string>('genel_sira');
  const [santraforSortCriteria, setSantraforSortCriteria] = useState<string>('genel_sira');

  // Her tablo için minimum süre filtreleri
  const [kalecilerMinSure, setKalecilerMinSure] = useState<number>(0);
  const [stoperlerMinSure, setStoperlerMinSure] = useState<number>(0);
  const [solBeklerMinSure, setSolBeklerMinSure] = useState<number>(0);
  const [sagBeklerMinSure, setSagBeklerMinSure] = useState<number>(0);
  const [dosMinSure, setDosMinSure] = useState<number>(0);
  const [solKanatlarMinSure, setSolKanatlarMinSure] = useState<number>(0);
  const [sagKanatlarMinSure, setSagKanatlarMinSure] = useState<number>(0);
  const [ortasahaMinSure, setOrtasahaMinSure] = useState<number>(0);
  const [oosMinSure, setOosMinSure] = useState<number>(0);
  const [solAcikKanatMinSure, setSolAcikKanatMinSure] = useState<number>(0);
  const [sagAcikKanatMinSure, setSagAcikKanatMinSure] = useState<number>(0);
  const [santraforMinSure, setSantraforMinSure] = useState<number>(0);
  
  const [bestGoalkeepersTable, setBestGoalkeepersTable] = useState<BestPlayerTable[]>([]);
  const [bestStopersTable, setBestStopersTable] = useState<BestStoperTable[]>([]);
  const [bestSolBekTable, setBestSolBekTable] = useState<BestStoperTable[]>([]);
  const [bestSagBekTable, setBestSagBekTable] = useState<BestStoperTable[]>([]);
  const [bestDosTable, setBestDosTable] = useState<BestStoperTable[]>([]);
  const [bestSolKanatTable, setBestSolKanatTable] = useState<BestStoperTable[]>([]);
  const [bestSagKanatTable, setBestSagKanatTable] = useState<BestStoperTable[]>([]);
  const [bestOrtasahaTable, setBestOrtasahaTable] = useState<BestStoperTable[]>([]);
  const [bestOosTable, setBestOosTable] = useState<BestStoperTable[]>([]);
  const [bestSolAcikKanatTable, setBestSolAcikKanatTable] = useState<BestStoperTable[]>([]);
  const [bestSagAcikKanatTable, setBestSagAcikKanatTable] = useState<BestStoperTable[]>([]);
  const [bestSantraforTable, setBestSantraforTable] = useState<BestStoperTable[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [topAssists, setTopAssists] = useState<TopAssist[]>([]);
  const [topMotm, setTopMotm] = useState<TopMotm[]>([]);
  const [players, setPlayers] = useState<Player[]>([
    // Başlangıç dizilimi (4-4-2)
    { id: '1', name: 'Kaleci', position: 'Kaleci', x: 50, y: 90 },
    { id: '2', name: 'Sağ Bek', position: 'Sağ Bek', x: 80, y: 75 },
    { id: '3', name: 'Stoper 1', position: 'Stoper', x: 35, y: 75 },
    { id: '4', name: 'Stoper 2', position: 'Stoper', x: 65, y: 75 },
    { id: '5', name: 'Sol Bek', position: 'Sol Bek', x: 20, y: 75 },
    { id: '6', name: 'Sağ Orta Saha', position: 'Orta Saha', x: 75, y: 50 },
    { id: '7', name: 'Def. Orta Saha 1', position: 'Defansif Orta Saha', x: 40, y: 50 },
    { id: '8', name: 'Def. Orta Saha 2', position: 'Defansif Orta Saha', x: 60, y: 50 },
    { id: '9', name: 'Sol Orta Saha', position: 'Orta Saha', x: 25, y: 50 },
    { id: '10', name: 'Santrafor 1', position: 'Santrafor', x: 40, y: 25 },
    { id: '11', name: 'Santrafor 2', position: 'Santrafor', x: 60, y: 25 },
  ]);

  // En iyi oyuncu verilerini çek
  useEffect(() => {
    const fetchBestPlayers = async () => {
      try {
        // En iyi kaleci
        const kalecyResponse = await fetch(`/api/en-iyi-kaleci?sortBy=${kalecilerSortCriteria}&minSure=${kalecilerMinSure}`);
        const kalecyResult = await kalecyResponse.json();
        
        if (kalecyResult.success && kalecyResult.data) {
          // İlk kaleci drag&drop için
          setBestGoalkeeper(kalecyResult.data[0]);
          // Tablo için tüm kaleciler
          setBestGoalkeepersTable(kalecyResult.data);
        }

        // En iyi stoperler
        const stoperResponse = await fetch(`/api/en-iyi-stoper?sortBy=${stoperlerSortCriteria}&minSure=${stoperlerMinSure}`);
        const stoperResult = await stoperResponse.json();
        
        if (stoperResult.success && stoperResult.data) {
          setBestStopers(stoperResult.data);
          // Tablo için stoper verilerini de kaydet
          setBestStopersTable(stoperResult.data);
        }

        // En iyi defansif orta saha oyuncuları
        const dosResponse = await fetch(`/api/en-iyi-dos?sortBy=${dosSortCriteria}&minSure=${dosMinSure}`);
        const dosResult = await dosResponse.json();
        
        if (dosResult.success && dosResult.data) {
          setBestDefensiveMidfielders(dosResult.data);
          // Tablo için DOS verilerini de kaydet
          setBestDosTable(dosResult.data);
        }

        // En iyi orta saha oyuncuları
        const ortasahaResponse = await fetch(`/api/en-iyi-ortasaha?sortBy=${ortasahaSortCriteria}&minSure=${ortasahaMinSure}`);
        const ortasahaResult = await ortasahaResponse.json();
        
        if (ortasahaResult.success && ortasahaResult.data) {
          setBestMidfielders(ortasahaResult.data);
          // Tablo için orta saha verilerini de kaydet
          setBestOrtasahaTable(ortasahaResult.data);
        }

        // En iyi ofansif orta saha oyuncuları
        const oosResponse = await fetch(`/api/en-iyi-oos?sortBy=${oosSortCriteria}&minSure=${oosMinSure}`);
        const oosResult = await oosResponse.json();
        
        if (oosResult.success && oosResult.data) {
          setBestOffensiveMidfielders(oosResult.data);
          // Tablo için ofansif orta saha verilerini de kaydet
          setBestOosTable(oosResult.data);
        }

        // En iyi santrafor oyuncuları
        const santraforResponse = await fetch(`/api/en-iyi-santrafor?sortBy=${santraforSortCriteria}&minSure=${santraforMinSure}`);
        const santraforResult = await santraforResponse.json();
        
        if (santraforResult.success && santraforResult.data) {
          setBestStrikers(santraforResult.data);
          // Tablo için santrafor verilerini de kaydet
          setBestSantraforTable(santraforResult.data);
        }

        // En iyi sol bek oyuncuları
        const solBekResponse = await fetch(`/api/en-iyi-solbek?sortBy=${solBeklerSortCriteria}&minSure=${solBeklerMinSure}`);
        const solBekResult = await solBekResponse.json();
        
        if (solBekResult.success && solBekResult.data) {
          setBestLeftBacks(solBekResult.data);
          // Tablo için sol bek verilerini de kaydet
          setBestSolBekTable(solBekResult.data);
        }

        // En iyi sağ bek oyuncuları
        const sagBekResponse = await fetch(`/api/en-iyi-sagbek?sortBy=${sagBeklerSortCriteria}&minSure=${sagBeklerMinSure}`);
        const sagBekResult = await sagBekResponse.json();
        
        if (sagBekResult.success && sagBekResult.data) {
          setBestRightBacks(sagBekResult.data);
          // Tablo için sağ bek verilerini de kaydet
          setBestSagBekTable(sagBekResult.data);
        }

        // En iyi sol kanat oyuncuları
        const solKanatResponse = await fetch(`/api/en-iyi-solkanat?sortBy=${solKanatlarSortCriteria}&minSure=${solKanatlarMinSure}`);
        const solKanatResult = await solKanatResponse.json();
        
        if (solKanatResult.success && solKanatResult.data) {
          setBestLeftWingers(solKanatResult.data);
          // Tablo için sol kanat verilerini de kaydet
          setBestSolKanatTable(solKanatResult.data);
        }

        // En iyi sağ kanat oyuncuları
        const sagKanatResponse = await fetch(`/api/en-iyi-sagkanat?sortBy=${sagKanatlarSortCriteria}&minSure=${sagKanatlarMinSure}`);
        const sagKanatResult = await sagKanatResponse.json();
        
        if (sagKanatResult.success && sagKanatResult.data) {
          setBestRightWingers(sagKanatResult.data);
          // Tablo için sağ kanat verilerini de kaydet
          setBestSagKanatTable(sagKanatResult.data);
        }

        // En iyi sol açık kanat oyuncuları
        const solAcikKanatResponse = await fetch(`/api/en-iyi-solacikkanat?sortBy=${solAcikKanatSortCriteria}&minSure=${solAcikKanatMinSure}`);
        const solAcikKanatResult = await solAcikKanatResponse.json();
        
        if (solAcikKanatResult.success && solAcikKanatResult.data) {
          setBestLeftWideWingers(solAcikKanatResult.data);
          // Tablo için sol açık kanat verilerini de kaydet
          setBestSolAcikKanatTable(solAcikKanatResult.data);
        }

        // En iyi sağ açık kanat oyuncuları
        const sagAcikKanatResponse = await fetch(`/api/en-iyi-sagacikkanat?sortBy=${sagAcikKanatSortCriteria}&minSure=${sagAcikKanatMinSure}`);
        const sagAcikKanatResult = await sagAcikKanatResponse.json();
        
        if (sagAcikKanatResult.success && sagAcikKanatResult.data) {
          setBestRightWideWingers(sagAcikKanatResult.data);
          // Tablo için sağ açık kanat verilerini de kaydet
          setBestSagAcikKanatTable(sagAcikKanatResult.data);
        }

        // Gol krallığı verilerini çek
        const golKralligiResponse = await fetch('/api/gol-kralligi');
        const golKralligiResult = await golKralligiResponse.json();
        
        if (golKralligiResult.success && golKralligiResult.data) {
          setTopScorers(golKralligiResult.data);
        }

        // Asist krallığı verilerini çek
        const asistKralligiResponse = await fetch('/api/asist-kralligi');
        const asistKralligiResult = await asistKralligiResponse.json();
        
        if (asistKralligiResult.success && asistKralligiResult.data) {
          setTopAssists(asistKralligiResult.data);
        }

        // Maçın adamı verilerini çek
        const macinAdamiResponse = await fetch('/api/macin-adami');
        const macinAdamiResult = await macinAdamiResponse.json();
        
        if (macinAdamiResult.success && macinAdamiResult.data) {
          setTopMotm(macinAdamiResult.data);
        }

        // Oyuncu listesini güncelle
        setPlayers(prev => {
          let stoperIndex = 0;
          let dosIndex = 0;
          let ortasahaIndex = 0;
          let oosIndex = 0;
          let santraforIndex = 0;
          let solBekIndex = 0;
          let sagBekIndex = 0;
          let solKanatIndex = 0;
          let sagKanatIndex = 0;
          let solAcikKanatIndex = 0;
          let sagAcikKanatIndex = 0;
          
          return prev.map(player => {
            if (player.position === 'Kaleci' && kalecyResult.success && kalecyResult.data) {
              return { ...player, name: kalecyResult.data.oyuncu_isim };
            }
            if (player.position === 'Stoper' && stoperResult.success && stoperResult.data && stoperResult.data.length > 0) {
              const stoperData = stoperResult.data[stoperIndex % stoperResult.data.length];
              stoperIndex++;
              return { ...player, name: stoperData.oyuncu_isim };
            }
            if (player.position === 'Defansif Orta Saha' && dosResult.success && dosResult.data && dosResult.data.length > 0) {
              const dosData = dosResult.data[dosIndex % dosResult.data.length];
              dosIndex++;
              return { ...player, name: dosData.oyuncu_isim };
            }
            if (player.position === 'Orta Saha' && ortasahaResult.success && ortasahaResult.data && ortasahaResult.data.length > 0) {
              const ortasahaData = ortasahaResult.data[ortasahaIndex % ortasahaResult.data.length];
              ortasahaIndex++;
              return { ...player, name: ortasahaData.oyuncu_isim };
            }
            if (player.position === 'Ofansif Orta Saha' && oosResult.success && oosResult.data && oosResult.data.length > 0) {
              const oosData = oosResult.data[oosIndex % oosResult.data.length];
              oosIndex++;
              return { ...player, name: oosData.oyuncu_isim };
            }
            if (player.position === 'Santrafor' && santraforResult.success && santraforResult.data && santraforResult.data.length > 0) {
              const santraforData = santraforResult.data[santraforIndex % santraforResult.data.length];
              santraforIndex++;
              return { ...player, name: santraforData.oyuncu_isim };
            }
            if (player.position === 'Sol Bek' && solBekResult.success && solBekResult.data && solBekResult.data.length > 0) {
              const solBekData = solBekResult.data[solBekIndex % solBekResult.data.length];
              solBekIndex++;
              return { ...player, name: solBekData.oyuncu_isim };
            }
            if (player.position === 'Sağ Bek' && sagBekResult.success && sagBekResult.data && sagBekResult.data.length > 0) {
              const sagBekData = sagBekResult.data[sagBekIndex % sagBekResult.data.length];
              sagBekIndex++;
              return { ...player, name: sagBekData.oyuncu_isim };
            }
            if (player.position === 'Sol Kanat' && solKanatResult.success && solKanatResult.data && solKanatResult.data.length > 0) {
              const solKanatData = solKanatResult.data[solKanatIndex % solKanatResult.data.length];
              solKanatIndex++;
              return { ...player, name: solKanatData.oyuncu_isim };
            }
            if (player.position === 'Sağ Kanat' && sagKanatResult.success && sagKanatResult.data && sagKanatResult.data.length > 0) {
              const sagKanatData = sagKanatResult.data[sagKanatIndex % sagKanatResult.data.length];
              sagKanatIndex++;
              return { ...player, name: sagKanatData.oyuncu_isim };
            }
            if (player.position === 'Sol Açık Kanat' && solAcikKanatResult.success && solAcikKanatResult.data && solAcikKanatResult.data.length > 0) {
              const solAcikKanatData = solAcikKanatResult.data[solAcikKanatIndex % solAcikKanatResult.data.length];
              solAcikKanatIndex++;
              return { ...player, name: solAcikKanatData.oyuncu_isim };
            }
            if (player.position === 'Sağ Açık Kanat' && sagAcikKanatResult.success && sagAcikKanatResult.data && sagAcikKanatResult.data.length > 0) {
              const sagAcikKanatData = sagAcikKanatResult.data[sagAcikKanatIndex % sagAcikKanatResult.data.length];
              sagAcikKanatIndex++;
              return { ...player, name: sagAcikKanatData.oyuncu_isim };
            }
            return player;
          });
        });
        
      } catch (error) {
        console.error('En iyi oyuncu verileri çekilirken hata:', error);
      }
    };

    fetchBestPlayers();
  }, [sortingCriteria, kalecilerSortCriteria, stoperlerSortCriteria, solBeklerSortCriteria, sagBeklerSortCriteria, dosSortCriteria, solKanatlarSortCriteria, sagKanatlarSortCriteria, ortasahaSortCriteria, oosSortCriteria, solAcikKanatSortCriteria, sagAcikKanatSortCriteria, santraforSortCriteria, kalecilerMinSure, stoperlerMinSure, solBeklerMinSure, sagBeklerMinSure, dosMinSure, solKanatlarMinSure, sagKanatlarMinSure, ortasahaMinSure, oosMinSure, solAcikKanatMinSure, sagAcikKanatMinSure, santraforMinSure]);

  // Mevki bölgeleri
  const positionZones: PositionZone[] = [
    { name: 'Kaleci', x: 40, y: 85, width: 20, height: 10, color: 'bg-yellow-200' },
    { name: 'Stoper', x: 25, y: 70, width: 50, height: 15, color: 'bg-red-200' },
    { name: 'Sağ Bek', x: 70, y: 65, width: 20, height: 20, color: 'bg-blue-200' },
    { name: 'Sol Bek', x: 10, y: 65, width: 20, height: 20, color: 'bg-blue-200' },
    { name: 'Defansif Orta Saha', x: 20, y: 40, width: 60, height: 20, color: 'bg-green-200' },
    { name: 'Orta Saha', x: 15, y: 35, width: 70, height: 20, color: 'bg-purple-200' },
    { name: 'Sağ Kanat', x: 80, y: 30, width: 15, height: 25, color: 'bg-orange-200' },
    { name: 'Sol Kanat', x: 5, y: 30, width: 15, height: 25, color: 'bg-orange-200' },
    { name: 'Ofansif Orta Saha', x: 25, y: 20, width: 50, height: 20, color: 'bg-pink-200' },
    { name: 'Sağ Açık Kanat', x: 80, y: 15, width: 15, height: 20, color: 'bg-indigo-200' },
    { name: 'Sol Açık Kanat', x: 5, y: 15, width: 15, height: 20, color: 'bg-indigo-200' },
    { name: 'Santrafor', x: 30, y: 5, width: 40, height: 20, color: 'bg-cyan-200' },
  ];

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPlayer || !fieldRef.current) return;

    const rect = fieldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Hangi mevki bölgesine düştüğünü kontrol et
    let newPosition = draggedPlayer.position;
    for (const zone of positionZones) {
      if (x >= zone.x && x <= zone.x + zone.width && 
          y >= zone.y && y <= zone.y + zone.height) {
        newPosition = zone.name;
        break;
      }
    }

    setPlayers(prev => prev.map(player => 
      player.id === draggedPlayer.id 
        ? { ...player, x, y, position: newPosition }
        : player
    ));
    setDraggedPlayer(null);
  };

  const getPositionColor = (position: string) => {
    const colorMap: { [key: string]: string } = {
      'Kaleci': 'bg-yellow-500',
      'Stoper': 'bg-red-500',
      'Sağ Bek': 'bg-blue-500',
      'Sol Bek': 'bg-blue-500',
      'Defansif Orta Saha': 'bg-green-500',
      'Orta Saha': 'bg-purple-500',
      'Sağ Kanat': 'bg-orange-500',
      'Sol Kanat': 'bg-orange-500',
      'Ofansif Orta Saha': 'bg-pink-500',
      'Sağ Açık Kanat': 'bg-indigo-500',
      'Sol Açık Kanat': 'bg-indigo-500',
      'Santrafor': 'bg-cyan-500',
    };
    return colorMap[position] || 'bg-gray-500';
  };

  // Mevki sıralaması
  const positionOrder = [
    'Kaleci', 'Sol Bek', 'Stoper', 'Sağ Bek', 'Defansif Orta Saha', 
    'Sol Kanat', 'Orta Saha', 'Sağ Kanat', 'Sol Açık Kanat', 
    'Ofansif Orta Saha', 'Sağ Açık Kanat', 'Santrafor'
  ];

  // Oyuncuları mevki sırasına göre grupla ve sırala
  const sortedPlayers = positionOrder.reduce((acc: Player[], position) => {
    const playersInPosition = players.filter(player => player.position === position);
    return [...acc, ...playersInPosition];
  }, []);

  // Mevki rehberi için benzersiz mevkiler
  const uniquePositions = [
    { name: 'Kaleci', color: 'bg-yellow-200' },
    { name: 'Bek', color: 'bg-blue-200' },
    { name: 'Stoper', color: 'bg-red-200' },
    { name: 'Defansif Orta Saha', color: 'bg-green-200' },
    { name: 'Orta Saha', color: 'bg-purple-200' },
    { name: 'Kanat', color: 'bg-orange-200' },
    { name: 'Ofansif Orta Saha', color: 'bg-pink-200' },
    { name: 'Açık Kanat', color: 'bg-indigo-200' },
    { name: 'Santrafor', color: 'bg-cyan-200' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 lg:mb-8 gap-4 lg:gap-0 pt-6">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">En İyiler - Taktik Şablonu</h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <label htmlFor="sorting-criteria" className="text-sm font-medium text-gray-700">
            Sıralama Kriteri:
          </label>
          <select
            id="sorting-criteria"
            value={sortingCriteria}
            onChange={(e) => {
              const newCriteria = e.target.value;
              setSortingCriteria(newCriteria);
              // Tüm tabloları aynı kritere göre sırala
              setKalecilerSortCriteria(newCriteria === 'surdurabilirlik_sira' ? 'sürdürülebilirlik_sira' : newCriteria);
              setStoperlerSortCriteria(newCriteria);
              setSolBeklerSortCriteria(newCriteria);
              setSagBeklerSortCriteria(newCriteria);
              setDosSortCriteria(newCriteria);
              setSolKanatlarSortCriteria(newCriteria);
              setSagKanatlarSortCriteria(newCriteria);
              setOrtasahaSortCriteria(newCriteria);
              setOosSortCriteria(newCriteria);
              setSolAcikKanatSortCriteria(newCriteria);
              setSagAcikKanatSortCriteria(newCriteria);
              setSantraforSortCriteria(newCriteria);
            }}
            className="px-3 lg:px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="genel_sira">Genel Sıra</option>
            <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
            <option value="performans_skor_sirasi">Performans Skor Sırası</option>
            <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
          </select>
        </div>
      </div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Taktik Dizilimi</h2>
            <p className="text-gray-600 mb-4">
              Oyuncuları istediğiniz mevkiye sürükleyin. Oyuncu hangi bölgeye bırakılırsa o mevkiyi alır.
            </p>
          </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sol Taraf - Mevki Rehberi */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <h3 className="text-lg font-semibold mb-4">Mevki Rehberi</h3>
            <div className="space-y-2">
              {uniquePositions.map((position, index) => (
                <div key={index} className={`p-3 rounded ${position.color} border`}>
                  <span className="font-medium">{position.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Orta - Futbol Sahası */}
          <div className="flex-1 min-w-0">
            <div 
              ref={fieldRef}
              className="relative w-full h-[600px] lg:h-[700px] xl:h-[800px] bg-green-400 border-4 border-white rounded-lg overflow-hidden"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px),
                  linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Saha çizgileri */}
              <div className="absolute inset-0">
                {/* Orta saha çizgisi */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-0.5"></div>
                {/* Orta daire */}
                <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                {/* Orta nokta */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Üst kale alanı */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-20 border-2 border-white border-t-0"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white border-t-0"></div>
                
                {/* Alt kale alanı */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-20 border-2 border-white border-b-0"></div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white border-b-0"></div>
              </div>

              {/* Mevki bölgeleri (görünmez, sadece drop zone) */}
              {positionZones.map((zone, index) => (
                <div
                  key={index}
                  className={`absolute opacity-20 ${zone.color} border border-gray-400`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                  title={zone.name}
                >
                  <span className="text-xs font-bold text-gray-700 absolute top-1 left-1">
                    {zone.name}
                  </span>
                </div>
              ))}

              {/* Oyuncular */}
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`absolute w-8 h-8 ${getPositionColor(player.position)} rounded-full border-2 border-white cursor-move flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform`}
                  style={{
                    left: `${player.x}%`,
                    top: `${player.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, player)}
                  title={`${player.name} - ${player.position}`}
                >
                  {player.id}
                </div>
              ))}
            </div>
          </div>

          {/* Sağ Taraf - Oyuncu Listesi */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <h3 className="text-lg font-semibold mb-4">Oyuncu Listesi</h3>
            <div className="space-y-3">
              {sortedPlayers.map((player, index) => {
                // Stoper oyuncuları için farklı oyuncuları göster
                const getStoperData = () => {
                  if (player.position === 'Stoper' && bestStopers.length > 0) {
                    // Stoper listesindeki kaçıncı stoper olduğunu bul
                    const stoperCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Stoper').length;
                    return bestStopers[stoperCount % bestStopers.length];
                  }
                  return null;
                };

                // Defansif orta saha oyuncuları için farklı oyuncuları göster
                const getDosData = () => {
                  if (player.position === 'Defansif Orta Saha' && bestDefensiveMidfielders.length > 0) {
                    // DOS listesindeki kaçıncı oyuncu olduğunu bul
                    const dosCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Defansif Orta Saha').length;
                    return bestDefensiveMidfielders[dosCount % bestDefensiveMidfielders.length];
                  }
                  return null;
                };

                // Orta saha oyuncuları için farklı oyuncuları göster
                const getOrtasahaData = () => {
                  if (player.position === 'Orta Saha' && bestMidfielders.length > 0) {
                    // Orta saha listesindeki kaçıncı oyuncu olduğunu bul
                    const ortasahaCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Orta Saha').length;
                    return bestMidfielders[ortasahaCount % bestMidfielders.length];
                  }
                  return null;
                };

                // Ofansif orta saha oyuncuları için farklı oyuncuları göster
                const getOosData = () => {
                  if (player.position === 'Ofansif Orta Saha' && bestOffensiveMidfielders.length > 0) {
                    // OOS listesindeki kaçıncı oyuncu olduğunu bul
                    const oosCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Ofansif Orta Saha').length;
                    return bestOffensiveMidfielders[oosCount % bestOffensiveMidfielders.length];
                  }
                  return null;
                };

                // Santrafor oyuncuları için farklı oyuncuları göster
                const getSantraforData = () => {
                  if (player.position === 'Santrafor' && bestStrikers.length > 0) {
                    // Santrafor listesindeki kaçıncı oyuncu olduğunu bul
                    const santraforCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Santrafor').length;
                    return bestStrikers[santraforCount % bestStrikers.length];
                  }
                  return null;
                };

                // Sol bek oyuncuları için farklı oyuncuları göster
                const getSolBekData = () => {
                  if (player.position === 'Sol Bek' && bestLeftBacks.length > 0) {
                    const solBekCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Sol Bek').length;
                    return bestLeftBacks[solBekCount % bestLeftBacks.length];
                  }
                  return null;
                };

                // Sağ bek oyuncuları için farklı oyuncuları göster
                const getSagBekData = () => {
                  if (player.position === 'Sağ Bek' && bestRightBacks.length > 0) {
                    const sagBekCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Sağ Bek').length;
                    return bestRightBacks[sagBekCount % bestRightBacks.length];
                  }
                  return null;
                };

                // Sol kanat oyuncuları için farklı oyuncuları göster
                const getSolKanatData = () => {
                  if (player.position === 'Sol Kanat' && bestLeftWingers.length > 0) {
                    const solKanatCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Sol Kanat').length;
                    return bestLeftWingers[solKanatCount % bestLeftWingers.length];
                  }
                  return null;
                };

                // Sağ kanat oyuncuları için farklı oyuncuları göster
                const getSagKanatData = () => {
                  if (player.position === 'Sağ Kanat' && bestRightWingers.length > 0) {
                    const sagKanatCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Sağ Kanat').length;
                    return bestRightWingers[sagKanatCount % bestRightWingers.length];
                  }
                  return null;
                };

                // Sol açık kanat oyuncuları için farklı oyuncuları göster  
                const getSolAcikKanatData = () => {
                  if (player.position === 'Sol Açık Kanat' && bestLeftWideWingers.length > 0) {
                    const solAcikKanatCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Sol Açık Kanat').length;
                    return bestLeftWideWingers[solAcikKanatCount % bestLeftWideWingers.length];
                  }
                  return null;
                };

                // Sağ açık kanat oyuncuları için farklı oyuncuları göster  
                const getSagAcikKanatData = () => {
                  if (player.position === 'Sağ Açık Kanat' && bestRightWideWingers.length > 0) {
                    const sagAcikKanatCount = sortedPlayers.slice(0, index).filter(p => p.position === 'Sağ Açık Kanat').length;
                    return bestRightWideWingers[sagAcikKanatCount % bestRightWideWingers.length];
                  }
                  return null;
                };

                const stoperData = getStoperData();
                const dosData = getDosData();
                const ortasahaData = getOrtasahaData();
                const oosData = getOosData();
                const santraforData = getSantraforData();
                const solBekData = getSolBekData();
                const sagBekData = getSagBekData();
                const solKanatData = getSolKanatData();
                const sagKanatData = getSagKanatData();
                const solAcikKanatData = getSolAcikKanatData();
                const sagAcikKanatData = getSagAcikKanatData();

                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg border-2 ${getPositionColor(player.position)} bg-opacity-20`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 ${getPositionColor(player.position)} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {player.id}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">
                          {player.position === 'Kaleci' && bestGoalkeeper 
                            ? bestGoalkeeper.oyuncu_isim 
                            : player.position === 'Stoper' && stoperData
                            ? stoperData.oyuncu_isim
                            : player.position === 'Defansif Orta Saha' && dosData
                            ? dosData.oyuncu_isim
                            : player.position === 'Orta Saha' && ortasahaData
                            ? ortasahaData.oyuncu_isim
                            : player.position === 'Ofansif Orta Saha' && oosData
                            ? oosData.oyuncu_isim
                            : player.position === 'Santrafor' && santraforData
                            ? santraforData.oyuncu_isim
                            : player.position === 'Sol Bek' && solBekData
                            ? solBekData.oyuncu_isim
                            : player.position === 'Sağ Bek' && sagBekData
                            ? sagBekData.oyuncu_isim
                            : player.position === 'Sol Kanat' && solKanatData
                            ? solKanatData.oyuncu_isim
                            : player.position === 'Sağ Kanat' && sagKanatData
                            ? sagKanatData.oyuncu_isim
                            : player.position === 'Sol Açık Kanat' && solAcikKanatData
                            ? solAcikKanatData.oyuncu_isim
                            : player.position === 'Sağ Açık Kanat' && sagAcikKanatData
                            ? sagAcikKanatData.oyuncu_isim
                            : player.name}
                        </p>
                        {player.position === 'Kaleci' && bestGoalkeeper && (
                          <p className="text-xs text-gray-500 font-medium">
                            {bestGoalkeeper.takim_adi}
                          </p>
                        )}
                        {player.position === 'Stoper' && stoperData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {stoperData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Defansif Orta Saha' && dosData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {dosData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Orta Saha' && ortasahaData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {ortasahaData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Ofansif Orta Saha' && oosData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {oosData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Santrafor' && santraforData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {santraforData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Sol Bek' && solBekData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {solBekData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Sağ Bek' && sagBekData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {sagBekData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Sol Kanat' && solKanatData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {solKanatData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Sağ Kanat' && sagKanatData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {sagKanatData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Sol Açık Kanat' && solAcikKanatData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {solAcikKanatData.takim_adi}
                          </p>
                        )}
                        {player.position === 'Sağ Açık Kanat' && sagAcikKanatData && (
                          <p className="text-xs text-gray-500 font-medium">
                            {sagAcikKanatData.takim_adi}
                          </p>
                        )}
                        <p className="text-xs text-gray-600">{player.position}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

        {/* En İyi Oyuncular Tabloları */}
        <div className="mt-8 lg:mt-12">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 lg:mb-8 text-center">En İyi Oyuncular</h2>
        
        {/* İlk Sıra - En İyi Kaleciler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 mb-6 lg:mb-8">
          {/* En İyi Kaleciler Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">En İyi Kaleciler</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={kalecilerMinSure || ''}
                  onChange={(e) => setKalecilerMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={kalecilerSortCriteria}
                  onChange={(e) => setKalecilerSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="sürdürülebilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[22%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[28%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[12%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestGoalkeepersTable.map((goalkeeper, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={goalkeeper.takim_adi}>
                        {goalkeeper.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {goalkeeper.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={goalkeeper.oyuncu_isim}>
                        {goalkeeper.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{goalkeeper.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{goalkeeper.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* En İyi Stoperler Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">En İyi Stoperler</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={stoperlerMinSure || ''}
                  onChange={(e) => setStoperlerMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={stoperlerSortCriteria}
                  onChange={(e) => setStoperlerSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestStopersTable.map((stoper, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={stoper.takim_adi}>
                        {stoper.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {stoper.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {stoper.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={stoper.oyuncu_isim}>
                        {stoper.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{stoper.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{stoper.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* En İyi Sol Bekler Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">En İyi Sol Bekler</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={solBeklerMinSure || ''}
                  onChange={(e) => setSolBeklerMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={solBeklerSortCriteria}
                  onChange={(e) => setSolBeklerSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestSolBekTable.map((solBek, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={solBek.takim_adi}>
                        {solBek.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {solBek.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {solBek.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={solBek.oyuncu_isim}>
                        {solBek.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{solBek.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{solBek.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* İkinci Sıra - En İyi Sağ Bekler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 mb-6 lg:mb-8">
          {/* En İyi Sağ Bekler Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">En İyi Sağ Bekler</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={sagBeklerMinSure || ''}
                  onChange={(e) => setSagBeklerMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={sagBeklerSortCriteria}
                  onChange={(e) => setSagBeklerSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestSagBekTable.map((sagBek, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={sagBek.takim_adi}>
                        {sagBek.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {sagBek.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {sagBek.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={sagBek.oyuncu_isim}>
                        {sagBek.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{sagBek.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{sagBek.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* En İyi Defansif Orta Sahalar Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">En İyi Defansif Orta Sahalar</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={dosMinSure || ''}
                  onChange={(e) => setDosMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={dosSortCriteria}
                  onChange={(e) => setDosSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestDosTable.map((dos, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={dos.takim_adi}>
                        {dos.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {dos.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {dos.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={dos.oyuncu_isim}>
                        {dos.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{dos.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{dos.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* En İyi Sol Kanatlar Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">En İyi Sol Kanatlar</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={solKanatlarMinSure || ''}
                  onChange={(e) => setSolKanatlarMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={solKanatlarSortCriteria}
                  onChange={(e) => setSolKanatlarSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestSolKanatTable.map((solKanat, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={solKanat.takim_adi}>
                        {solKanat.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {solKanat.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {solKanat.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={solKanat.oyuncu_isim}>
                        {solKanat.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{solKanat.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{solKanat.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Üçüncü Sıra - En İyi Sağ Kanatlar, Orta Sahalar, Ofansif Orta Sahalar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 mb-6 lg:mb-8">
          {/* En İyi Sağ Kanatlar Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">En İyi Sağ Kanatlar</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={sagKanatlarMinSure || ''}
                  onChange={(e) => setSagKanatlarMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={sagKanatlarSortCriteria}
                  onChange={(e) => setSagKanatlarSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestSagKanatTable.map((sagKanat, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={sagKanat.takim_adi}>
                        {sagKanat.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {sagKanat.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {sagKanat.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={sagKanat.oyuncu_isim}>
                        {sagKanat.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{sagKanat.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{sagKanat.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* En İyi Orta Sahalar Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">En İyi Orta Sahalar</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={ortasahaMinSure || ''}
                  onChange={(e) => setOrtasahaMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={ortasahaSortCriteria}
                  onChange={(e) => setOrtasahaSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestOrtasahaTable.map((ortasaha, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={ortasaha.takim_adi}>
                        {ortasaha.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {ortasaha.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {ortasaha.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={ortasaha.oyuncu_isim}>
                        {ortasaha.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{ortasaha.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{ortasaha.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* En İyi Ofansif Orta Sahalar Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">En İyi Ofansif Orta Sahalar</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={oosMinSure || ''}
                  onChange={(e) => setOosMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={oosSortCriteria}
                  onChange={(e) => setOosSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestOosTable.map((oos, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={oos.takim_adi}>
                        {oos.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                          {oos.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {oos.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={oos.oyuncu_isim}>
                        {oos.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{oos.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{oos.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dördüncü Sıra - En İyi Sol Açık Kanatlar, Sağ Açık Kanatlar, Santraforlar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 mb-6 lg:mb-8">
          {/* En İyi Sol Açık Kanatlar Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">En İyi Sol Açıklar</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={solAcikKanatMinSure || ''}
                  onChange={(e) => setSolAcikKanatMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={solAcikKanatSortCriteria}
                  onChange={(e) => setSolAcikKanatSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestSolAcikKanatTable.map((solAcikKanat, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={solAcikKanat.takim_adi}>
                        {solAcikKanat.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {solAcikKanat.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {solAcikKanat.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={solAcikKanat.oyuncu_isim}>
                        {solAcikKanat.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{solAcikKanat.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{solAcikKanat.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* En İyi Sağ Açık Kanatlar Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">En İyi Sağ Açıklar</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={sagAcikKanatMinSure || ''}
                  onChange={(e) => setSagAcikKanatMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={sagAcikKanatSortCriteria}
                  onChange={(e) => setSagAcikKanatSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
              </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestSagAcikKanatTable.map((sagAcikKanat, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={sagAcikKanat.takim_adi}>
                        {sagAcikKanat.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                          {sagAcikKanat.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {sagAcikKanat.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={sagAcikKanat.oyuncu_isim}>
                        {sagAcikKanat.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{sagAcikKanat.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{sagAcikKanat.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* En İyi Santraforlar Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">En İyi Santraforlar</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min. Süre"
                  value={santraforMinSure || ''}
                  onChange={(e) => setSantraforMinSure(Number(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 w-24"
                />
                <select
                  value={santraforSortCriteria}
                  onChange={(e) => setSantraforSortCriteria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="genel_sira">Genel Sıra</option>
                  <option value="kalite_sira_katsayi">Kalite Sıra Katsayı</option>
                  <option value="performans_skor_sirasi">Performans Skor Sırası</option>
                  <option value="surdurabilirlik_sira">Sürdürülebilirlik Sıra</option>
                </select>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[25%]">Oyuncu</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Sıra</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {bestSantraforTable.map((santrafor, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={santrafor.takim_adi}>
                        {santrafor.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {santrafor.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {santrafor.oyuncu_yan_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={santrafor.oyuncu_isim}>
                        {santrafor.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{santrafor.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{santrafor.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Beşinci Sıra - En İyi Genel Kategoriler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 mb-6 lg:mb-8">
          {/* Gol Krallığı Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4 text-center">Gol Krallığı</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[22%]">Oyuncu</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Gol</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {topScorers.length > 0 ? (
                  topScorers.map((scorer, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={scorer.takim_adi}>
                        {scorer.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {scorer.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {scorer.oyuncu_yan_mevkii || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={scorer.oyuncu_isim}>
                        {scorer.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{scorer.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{scorer.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold">
                          {scorer.gol}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-colors duration-200">
                    <td colSpan={7} className="px-3 py-4 text-center text-gray-500 italic">
                      Veriler yükleniyor...
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>

          {/* Asist Krallığı Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 text-center">Asist Krallığı</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[22%]">Oyuncu</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Asist</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {topAssists.length > 0 ? (
                  topAssists.map((assist, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={assist.takim_adi}>
                        {assist.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {assist.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {assist.oyuncu_yan_mevkii || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={assist.oyuncu_isim}>
                        {assist.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{assist.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{assist.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold">
                          {assist.asist}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors duration-200">
                    <td colSpan={7} className="px-3 py-4 text-center text-gray-500 italic">
                      Veriler yükleniyor...
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>

          {/* En Çok Maçın Adamı Tablosu */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 lg:p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 text-center">En Çok Maçın Adamı</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-xs lg:text-sm table-fixed">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[18%]">Takım</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Pos</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yan</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 w-[22%]">Oyuncu</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">Yaş</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[10%]">Süre</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 w-[8%]">MoM</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {topMotm.length > 0 ? (
                  topMotm.map((motm, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors duration-200">
                      <td className="px-3 py-3 text-gray-800 truncate font-medium" title={motm.takim_adi}>
                        {motm.takim_adi}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {motm.oyuncu_mevkii}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {motm.oyuncu_yan_mevkii || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 truncate" title={motm.oyuncu_isim}>
                        {motm.oyuncu_isim}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{motm.oyuncu_yas}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{motm.oyuncu_sure}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold">
                          {motm.macin_adami}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors duration-200">
                    <td colSpan={7} className="px-3 py-4 text-center text-gray-500 italic">
                      Veriler yükleniyor...
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
} 