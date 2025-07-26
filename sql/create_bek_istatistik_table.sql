-- bitirme_proje veritabanında bek_istatistik tablosunu oluştur
CREATE TABLE IF NOT EXISTS `bek_istatistik` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `oyuncu_id` INT NOT NULL,
  `bek_ad` VARCHAR(50) NOT NULL,
  `bek_soyad` VARCHAR(50) NOT NULL,
  `takim` VARCHAR(100),
  `sezon` VARCHAR(10) NOT NULL,
  `mac_sayisi` INT DEFAULT 0,
  `temiz_mac` INT DEFAULT 0,
  `asist` INT DEFAULT 0,
  `gol` INT DEFAULT 0,
  `yaratilan_sans` INT DEFAULT 0,
  `orta` INT DEFAULT 0,
  `basarili_orta` INT DEFAULT 0,
  `orta_isabet_yuzdesi` DECIMAL(5, 2) DEFAULT 0.00,
  `ikili_mucadele` INT DEFAULT 0,
  `kazanilan_ikili_mucadele` INT DEFAULT 0,
  `ikili_mucadele_yuzdesi` DECIMAL(5, 2) DEFAULT 0.00,
  `mudahale` INT DEFAULT 0,
  `top_kapma` INT DEFAULT 0,
  `blok` INT DEFAULT 0,
  `uzaklastirma` INT DEFAULT 0,
  `pas` INT DEFAULT 0,
  `basarili_pas` INT DEFAULT 0,
  `pas_basari_yuzdesi` DECIMAL(5, 2) DEFAULT 0.00,
  `ileri_pas` INT DEFAULT 0,
  `basarili_ileri_pas` INT DEFAULT 0,
  `ileri_pas_yuzdesi` DECIMAL(5, 2) DEFAULT 0.00,
  `top_kaybi` INT DEFAULT 0,
  `faul` INT DEFAULT 0,
  `sari_kart` INT DEFAULT 0,
  `kirmizi_kart` INT DEFAULT 0,
  `oluşturulma_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `güncelleme_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`oyuncu_id`) REFERENCES `oyuncu` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek bek istatistik verileri ekle
INSERT INTO `bek_istatistik` 
(`oyuncu_id`, `bek_ad`, `bek_soyad`, `takim`, `sezon`, `mac_sayisi`, `temiz_mac`, 
`asist`, `gol`, `yaratilan_sans`, `orta`, `basarili_orta`, `orta_isabet_yuzdesi`, 
`ikili_mucadele`, `kazanilan_ikili_mucadele`, `ikili_mucadele_yuzdesi`, 
`mudahale`, `top_kapma`, `blok`, `uzaklastirma`, `pas`, `basarili_pas`, 
`pas_basari_yuzdesi`, `ileri_pas`, `basarili_ileri_pas`, `ileri_pas_yuzdesi`, 
`top_kaybi`, `faul`, `sari_kart`, `kirmizi_kart`) 
VALUES
(5, 'Trent', 'Alexander-Arnold', 'Liverpool', '2023/24', 32, 10, 12, 3, 65, 185, 52, 28.11, 124, 78, 62.90, 42, 58, 14, 68, 2340, 1980, 84.62, 520, 390, 75.00, 42, 24, 4, 0),
(6, 'Achraf', 'Hakimi', 'PSG', '2023/24', 28, 8, 9, 4, 42, 154, 48, 31.17, 112, 74, 66.07, 39, 52, 13, 59, 1856, 1540, 82.97, 375, 268, 71.47, 38, 20, 6, 1),
(5, 'Trent', 'Alexander-Arnold', 'Liverpool', '2022/23', 36, 12, 14, 2, 70, 204, 62, 30.39, 145, 88, 60.69, 46, 64, 18, 78, 2650, 2240, 84.53, 580, 428, 73.79, 48, 26, 6, 0),
(6, 'Achraf', 'Hakimi', 'PSG', '2022/23', 32, 10, 10, 5, 48, 178, 57, 32.02, 128, 82, 64.06, 44, 59, 16, 68, 2120, 1734, 81.79, 430, 312, 72.56, 45, 24, 7, 0); 