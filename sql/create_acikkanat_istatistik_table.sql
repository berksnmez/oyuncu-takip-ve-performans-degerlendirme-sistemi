-- bitirme_proje veritabanında acikkanat_istatistik tablosunu oluştur
CREATE TABLE IF NOT EXISTS `acikkanat_istatistik` (
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
  `başarılı_çalım` INT DEFAULT 0,
  `başarılı_orta` INT DEFAULT 0,
  `orta_sayısı` INT DEFAULT 0,
  `orta_isabeti` DECIMAL(5,2) COMMENT 'Yüzde olarak',
  `yaratılan_şans` INT DEFAULT 0,
  `sprint_sayısı` INT DEFAULT 0,
  `maksimum_hız` DECIMAL(5,2) COMMENT 'km/saat cinsinden',
  `hücum_aksiyonu` INT DEFAULT 0,
  `ceza_sahası_girişi` INT DEFAULT 0,
  `alan_kazanma` DECIMAL(7,2) COMMENT 'Metre cinsinden',
  `sarı_kart` INT DEFAULT 0,
  `kırmızı_kart` INT DEFAULT 0,
  `penaltı_golü` INT DEFAULT 0,
  `oluşturulma_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `güncelleme_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (oyuncu_id) REFERENCES oyuncu(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek açık kanat oyuncusu istatistik verileri
INSERT INTO `acikkanat_istatistik` 
(`oyuncu_id`, `oyuncu_adi`, `takım_adi`, `pas_isabeti`, `uzun_pas`, `kisa_pas`, `asist`, `gol`, `maç_sayisi`, 
`top_kaybi`, `şut`, `isabetli_şut`, `şut_isabeti`, `başarılı_dripling`, `başarılı_çalım`, `başarılı_orta`, 
`orta_sayısı`, `orta_isabeti`, `yaratılan_şans`, `sprint_sayısı`, `maksimum_hız`, `hücum_aksiyonu`, `ceza_sahası_girişi`, 
`alan_kazanma`, `sarı_kart`, `kırmızı_kart`, `penaltı_golü`) 
VALUES
(23, 'Kylian Mbappé', 'Real Madrid', 81.5, 85, 1100, 16, 32, 42, 68, 145, 78, 53.8, 115, 155, 40, 85, 47.1, 75, 250, 36.2, 180, 95, 1850.5, 4, 0, 7),
(24, 'Jadon Sancho', 'Borussia Dortmund', 84.2, 75, 1250, 18, 15, 38, 60, 95, 45, 47.4, 105, 140, 55, 110, 50.0, 65, 215, 33.8, 160, 80, 1650.2, 3, 0, 3),
(25, 'Rodrygo', 'Real Madrid', 82.8, 80, 1150, 14, 18, 40, 58, 105, 52, 49.5, 95, 120, 45, 95, 47.4, 60, 220, 35.1, 155, 85, 1680.7, 2, 0, 2),
(26, 'Serge Gnabry', 'Bayern Munich', 79.6, 70, 1050, 12, 20, 36, 62, 110, 55, 50.0, 85, 110, 40, 90, 44.4, 55, 210, 34.5, 145, 75, 1580.8, 5, 1, 4),
(27, 'Luis Díaz', 'Liverpool', 80.3, 65, 1080, 15, 16, 39, 65, 100, 48, 48.0, 100, 130, 50, 105, 47.6, 58, 225, 35.0, 150, 82, 1620.5, 3, 0, 1); 