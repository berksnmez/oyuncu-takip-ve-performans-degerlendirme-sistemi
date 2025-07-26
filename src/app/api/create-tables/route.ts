import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Tabloları oluştur
    const results: Record<string, string | null> = {
      oyuncu: null,
      stoper_istatistik: null,
      bek_istatistik: null
    };
    
    // 1. Oyuncu tablosunu oluştur
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`oyuncu\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`ad\` VARCHAR(50) NOT NULL,
          \`soyad\` VARCHAR(50) NOT NULL,
          \`yas\` INT,
          \`takim\` VARCHAR(100),
          \`pozisyon\` VARCHAR(50),
          \`forma_no\` INT,
          \`boy\` INT COMMENT 'Santimetre cinsinden',
          \`kilo\` INT COMMENT 'Kilogram cinsinden',
          \`uyruk\` VARCHAR(50),
          \`değer\` DECIMAL(10, 2) COMMENT 'Milyon Euro cinsinden',
          \`gol\` INT DEFAULT 0,
          \`asist\` INT DEFAULT 0,
          \`maç_sayisi\` INT DEFAULT 0,
          \`sarı_kart\` INT DEFAULT 0,
          \`kırmızı_kart\` INT DEFAULT 0,
          \`oluşturulma_tarihi\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`güncelleme_tarihi\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      // Örnek veriler
      const oyuncuCount = await query('SELECT COUNT(*) as count FROM oyuncu');
      if ((oyuncuCount as any[])[0].count === 0) {
        await query(`
          INSERT INTO \`oyuncu\` 
          (\`ad\`, \`soyad\`, \`yas\`, \`takim\`, \`pozisyon\`, \`forma_no\`, \`boy\`, \`kilo\`, \`uyruk\`, \`değer\`, \`gol\`, \`asist\`, \`maç_sayisi\`, \`sarı_kart\`, \`kırmızı_kart\`) 
          VALUES
          ('Virgil', 'van Dijk', 33, 'Liverpool', 'Stoper', 4, 193, 92, 'Hollanda', 40.00, 25, 10, 420, 45, 3),
          ('Ronald', 'Araujo', 25, 'Barcelona', 'Stoper', 4, 188, 85, 'Uruguay', 70.00, 10, 3, 180, 25, 3),
          ('Trent', 'Alexander-Arnold', 25, 'Liverpool', 'Bek', 66, 175, 69, 'İngiltere', 80.00, 18, 65, 280, 20, 0),
          ('Achraf', 'Hakimi', 25, 'PSG', 'Bek', 2, 181, 73, 'Fas', 65.00, 25, 40, 300, 30, 1);
        `);
      }
      results.oyuncu = "Oluşturuldu";
    } catch (err: any) {
      results.oyuncu = `Hata: ${err.message}`;
    }
    
    // 2. Stoper istatistik tablosunu oluştur
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`stoper_istatistik\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`oyuncu_id\` INT NOT NULL,
          \`stoper_ad\` VARCHAR(50) NOT NULL,
          \`stoper_soyad\` VARCHAR(50) NOT NULL,
          \`takim\` VARCHAR(100),
          \`sezon\` VARCHAR(10) NOT NULL,
          \`mac_sayisi\` INT DEFAULT 0,
          \`temiz_mac\` INT DEFAULT 0,
          \`ikili_mucadele\` INT DEFAULT 0,
          \`kazanilan_ikili_mucadele\` INT DEFAULT 0,
          \`ikili_mucadele_yuzdesi\` DECIMAL(5, 2) DEFAULT 0.00,
          \`hava_topu_mucadelesi\` INT DEFAULT 0,
          \`kazanilan_hava_topu\` INT DEFAULT 0,
          \`hava_topu_yuzdesi\` DECIMAL(5, 2) DEFAULT 0.00,
          \`mudahale\` INT DEFAULT 0,
          \`top_kapma\` INT DEFAULT 0,
          \`blok\` INT DEFAULT 0,
          \`uzaklastirma\` INT DEFAULT 0,
          \`hatali_pas\` INT DEFAULT 0,
          \`pas_kesme\` INT DEFAULT 0,
          \`basarili_pas\` INT DEFAULT 0,
          \`pas_basari_yuzdesi\` DECIMAL(5, 2) DEFAULT 0.00,
          \`faul\` INT DEFAULT 0,
          \`sari_kart\` INT DEFAULT 0,
          \`kirmizi_kart\` INT DEFAULT 0,
          \`gol\` INT DEFAULT 0,
          \`asist\` INT DEFAULT 0,
          \`oluşturulma_tarihi\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`güncelleme_tarihi\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      // Örnek veriler
      const stoperCount = await query('SELECT COUNT(*) as count FROM stoper_istatistik');
      if ((stoperCount as any[])[0].count === 0) {
        await query(`
          INSERT INTO \`stoper_istatistik\` 
          (\`oyuncu_id\`, \`stoper_ad\`, \`stoper_soyad\`, \`takim\`, \`sezon\`, \`mac_sayisi\`, \`temiz_mac\`, 
          \`ikili_mucadele\`, \`kazanilan_ikili_mucadele\`, \`ikili_mucadele_yuzdesi\`, 
          \`hava_topu_mucadelesi\`, \`kazanilan_hava_topu\`, \`hava_topu_yuzdesi\`, 
          \`mudahale\`, \`top_kapma\`, \`blok\`, \`uzaklastirma\`, \`hatali_pas\`, \`pas_kesme\`,
          \`basarili_pas\`, \`pas_basari_yuzdesi\`, \`faul\`, \`sari_kart\`, \`kirmizi_kart\`, \`gol\`, \`asist\`) 
          VALUES
          (1, 'Virgil', 'van Dijk', 'Liverpool', '2023/24', 28, 12, 128, 98, 76.56, 112, 93, 83.04, 45, 62, 28, 104, 12, 38, 1850, 92.50, 18, 3, 0, 3, 1),
          (2, 'Ronald', 'Araujo', 'Barcelona', '2023/24', 22, 8, 110, 82, 74.55, 92, 74, 80.43, 38, 54, 22, 88, 15, 32, 1420, 89.31, 22, 5, 1, 2, 0),
          (1, 'Virgil', 'van Dijk', 'Liverpool', '2022/23', 34, 16, 156, 122, 78.21, 135, 110, 81.48, 52, 70, 32, 128, 14, 45, 2150, 93.02, 20, 4, 0, 5, 2),
          (2, 'Ronald', 'Araujo', 'Barcelona', '2022/23', 30, 11, 142, 105, 73.94, 118, 92, 77.97, 45, 65, 28, 115, 18, 38, 1820, 88.78, 25, 8, 1, 3, 1);
        `);
      }
      results.stoper_istatistik = "Oluşturuldu";
    } catch (err: any) {
      results.stoper_istatistik = `Hata: ${err.message}`;
    }
    
    // 3. Bek istatistik tablosunu oluştur
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`bek_istatistik\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`oyuncu_id\` INT NOT NULL,
          \`bek_ad\` VARCHAR(50) NOT NULL,
          \`bek_soyad\` VARCHAR(50) NOT NULL,
          \`takim\` VARCHAR(100),
          \`sezon\` VARCHAR(10) NOT NULL,
          \`mac_sayisi\` INT DEFAULT 0,
          \`temiz_mac\` INT DEFAULT 0,
          \`asist\` INT DEFAULT 0,
          \`gol\` INT DEFAULT 0,
          \`yaratilan_sans\` INT DEFAULT 0,
          \`orta\` INT DEFAULT 0,
          \`basarili_orta\` INT DEFAULT 0,
          \`orta_isabet_yuzdesi\` DECIMAL(5, 2) DEFAULT 0.00,
          \`ikili_mucadele\` INT DEFAULT 0,
          \`kazanilan_ikili_mucadele\` INT DEFAULT 0,
          \`ikili_mucadele_yuzdesi\` DECIMAL(5, 2) DEFAULT 0.00,
          \`mudahale\` INT DEFAULT 0,
          \`top_kapma\` INT DEFAULT 0,
          \`blok\` INT DEFAULT 0,
          \`uzaklastirma\` INT DEFAULT 0,
          \`pas\` INT DEFAULT 0,
          \`basarili_pas\` INT DEFAULT 0,
          \`pas_basari_yuzdesi\` DECIMAL(5, 2) DEFAULT 0.00,
          \`ileri_pas\` INT DEFAULT 0,
          \`basarili_ileri_pas\` INT DEFAULT 0,
          \`ileri_pas_yuzdesi\` DECIMAL(5, 2) DEFAULT 0.00,
          \`top_kaybi\` INT DEFAULT 0,
          \`faul\` INT DEFAULT 0,
          \`sari_kart\` INT DEFAULT 0,
          \`kirmizi_kart\` INT DEFAULT 0,
          \`oluşturulma_tarihi\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`güncelleme_tarihi\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      // Örnek veriler
      const bekCount = await query('SELECT COUNT(*) as count FROM bek_istatistik');
      if ((bekCount as any[])[0].count === 0) {
        await query(`
          INSERT INTO \`bek_istatistik\` 
          (\`oyuncu_id\`, \`bek_ad\`, \`bek_soyad\`, \`takim\`, \`sezon\`, \`mac_sayisi\`, \`temiz_mac\`, 
          \`asist\`, \`gol\`, \`yaratilan_sans\`, \`orta\`, \`basarili_orta\`, \`orta_isabet_yuzdesi\`, 
          \`ikili_mucadele\`, \`kazanilan_ikili_mucadele\`, \`ikili_mucadele_yuzdesi\`, 
          \`mudahale\`, \`top_kapma\`, \`blok\`, \`uzaklastirma\`, \`pas\`, \`basarili_pas\`, 
          \`pas_basari_yuzdesi\`, \`ileri_pas\`, \`basarili_ileri_pas\`, \`ileri_pas_yuzdesi\`, 
          \`top_kaybi\`, \`faul\`, \`sari_kart\`, \`kirmizi_kart\`) 
          VALUES
          (3, 'Trent', 'Alexander-Arnold', 'Liverpool', '2023/24', 32, 10, 12, 3, 65, 185, 52, 28.11, 124, 78, 62.90, 42, 58, 14, 68, 2340, 1980, 84.62, 520, 390, 75.00, 42, 24, 4, 0),
          (4, 'Achraf', 'Hakimi', 'PSG', '2023/24', 28, 8, 9, 4, 42, 154, 48, 31.17, 112, 74, 66.07, 39, 52, 13, 59, 1856, 1540, 82.97, 375, 268, 71.47, 38, 20, 6, 1),
          (3, 'Trent', 'Alexander-Arnold', 'Liverpool', '2022/23', 36, 12, 14, 2, 70, 204, 62, 30.39, 145, 88, 60.69, 46, 64, 18, 78, 2650, 2240, 84.53, 580, 428, 73.79, 48, 26, 6, 0),
          (4, 'Achraf', 'Hakimi', 'PSG', '2022/23', 32, 10, 10, 5, 48, 178, 57, 32.02, 128, 82, 64.06, 44, 59, 16, 68, 2120, 1734, 81.79, 430, 312, 72.56, 45, 24, 7, 0);
        `);
      }
      results.bek_istatistik = "Oluşturuldu";
    } catch (err: any) {
      results.bek_istatistik = `Hata: ${err.message}`;
    }
    
    return NextResponse.json({
      success: true,
      message: "Tablolar oluşturuldu",
      results
    });
  } catch (error: any) {
    console.error('Tablolar oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Tablolar oluşturulurken hata oluştu: ' + error.message,
        error: {
          message: error.message,
          code: error.code,
          errno: error.errno
        }
      },
      { status: 500 }
    );
  }
} 