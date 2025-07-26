-- bitirme_proje veritabanında ofansifortasaha_istatistik tablosunu oluştur
CREATE TABLE IF NOT EXISTS `ofansifortasaha_istatistik` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `oyuncu_id` INT NOT NULL,
  `pas_isabeti` DECIMAL(5,2) COMMENT 'Yüzde olarak',
  `uzun_pas` INT DEFAULT 0,
  `kisa_pas` INT DEFAULT 0,
  `asist` INT DEFAULT 0,
  `gol` INT DEFAULT 0,
  `maç_sayisi` INT DEFAULT 0,
  `takım_adi` VARCHAR(100),
  `oyuncu_adi` VARCHAR(100),
  `top_kaybi` INT DEFAULT 0,
  `şut` INT DEFAULT 0,
  `isabetli_şut` INT DEFAULT 0,
  `şut_isabeti` DECIMAL(5,2) COMMENT 'Yüzde olarak',
  `başarılı_dripling` INT DEFAULT 0,
  `kilit_pas` INT DEFAULT 0,
  `yaratılan_şans` INT DEFAULT 0,
  `ikili_mücadele_kazanma` DECIMAL(5,2) COMMENT 'Yüzde olarak',
  `başarılı_orta` INT DEFAULT 0,
  `ortasaha_baskısı` DECIMAL(5,2) COMMENT 'Yüzde olarak',
  `sarı_kart` INT DEFAULT 0,
  `kırmızı_kart` INT DEFAULT 0,
  `penaltı_golü` INT DEFAULT 0,
  `serbest_vuruş_golü` INT DEFAULT 0,
  `oluşturulma_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `güncelleme_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (oyuncu_id) REFERENCES oyuncu(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek ofansif orta saha istatistik verileri
INSERT INTO `ofansifortasaha_istatistik` 
(`oyuncu_id`, `oyuncu_adi`, `takım_adi`, `pas_isabeti`, `uzun_pas`, `kisa_pas`, `asist`, `gol`, `maç_sayisi`, `top_kaybi`, 
`şut`, `isabetli_şut`, `şut_isabeti`, `başarılı_dripling`, `kilit_pas`, `yaratılan_şans`, `ikili_mücadele_kazanma`, 
`başarılı_orta`, `ortasaha_baskısı`, `sarı_kart`, `kırmızı_kart`, `penaltı_golü`, `serbest_vuruş_golü`) 
VALUES
(13, 'Kevin De Bruyne', 'Manchester City', 87.5, 120, 1500, 28, 15, 45, 40, 85, 40, 47.1, 50, 95, 105, 62.3, 45, 78.4, 6, 0, 3, 2),
(14, 'Bruno Fernandes', 'Manchester United', 82.3, 140, 1650, 25, 20, 48, 55, 110, 48, 43.6, 35, 90, 100, 58.7, 55, 72.1, 8, 1, 7, 3),
(15, 'Martin Ødegaard', 'Arsenal', 88.7, 110, 1750, 22, 12, 42, 38, 70, 30, 42.9, 45, 88, 90, 64.5, 40, 80.2, 5, 0, 2, 1),
(16, 'Phil Foden', 'Manchester City', 90.1, 80, 1600, 18, 18, 46, 42, 95, 50, 52.6, 60, 75, 85, 60.1, 30, 75.8, 3, 0, 1, 0),
(17, 'Bernardo Silva', 'Manchester City', 93.2, 95, 1900, 15, 10, 47, 25, 65, 28, 43.1, 55, 70, 80, 67.8, 25, 82.5, 4, 0, 0, 1); 