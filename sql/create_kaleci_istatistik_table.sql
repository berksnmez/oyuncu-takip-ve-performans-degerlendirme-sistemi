-- bitirme_proje veritabanında kaleci_istatistik tablosunu oluştur
CREATE TABLE IF NOT EXISTS `kaleci_istatistik` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `oyuncu_id` INT NOT NULL,
  `kaleci_ad` VARCHAR(50) NOT NULL,
  `kaleci_soyad` VARCHAR(50) NOT NULL,
  `takim` VARCHAR(100),
  `sezon` VARCHAR(10) NOT NULL,
  `mac_sayisi` INT DEFAULT 0,
  `gol_yememe` INT DEFAULT 0,
  `kurtaris` INT DEFAULT 0,
  `basarili_kurtaris_yuzdesi` DECIMAL(5, 2) DEFAULT 0.00,
  `gol_yenilen` INT DEFAULT 0,
  `mac_basi_gol_yenilen` DECIMAL(4, 2) DEFAULT 0.00,
  `penalti_kurtaris` INT DEFAULT 0,
  `penalti_gol_yenilen` INT DEFAULT 0,
  `uzun_paslar` INT DEFAULT 0,
  `basarili_uzun_paslar` INT DEFAULT 0,
  `pas_basari_yuzdesi` DECIMAL(5, 2) DEFAULT 0.00,
  `cizgi_disinda_mudahale` INT DEFAULT 0,
  `hava_topu_hakimiyeti` INT DEFAULT 0,
  `oluşturulma_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `güncelleme_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`oyuncu_id`) REFERENCES `oyuncu` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek kaleci istatistik verileri ekle
INSERT INTO `kaleci_istatistik` 
(`oyuncu_id`, `kaleci_ad`, `kaleci_soyad`, `takim`, `sezon`, `mac_sayisi`, `gol_yememe`, `kurtaris`, 
`basarili_kurtaris_yuzdesi`, `gol_yenilen`, `mac_basi_gol_yenilen`, `penalti_kurtaris`, 
`penalti_gol_yenilen`, `uzun_paslar`, `basarili_uzun_paslar`, `pas_basari_yuzdesi`, 
`cizgi_disinda_mudahale`, `hava_topu_hakimiyeti`) 
VALUES
(1, 'Thibaut', 'Courtois', 'Real Madrid', '2023/24', 8, 4, 28, 87.50, 4, 0.50, 1, 2, 72, 54, 75.00, 8, 12),
(2, 'Gianluigi', 'Donnarumma', 'PSG', '2023/24', 35, 15, 98, 79.03, 26, 0.74, 3, 5, 103, 72, 69.90, 12, 20),
(1, 'Thibaut', 'Courtois', 'Real Madrid', '2022/23', 36, 12, 108, 78.26, 30, 0.83, 2, 6, 124, 93, 75.00, 15, 34),
(2, 'Gianluigi', 'Donnarumma', 'PSG', '2022/23', 38, 14, 112, 76.71, 34, 0.89, 3, 7, 136, 98, 72.06, 18, 42); 