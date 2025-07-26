-- bitirme_proje veritabanında ortasaha_istatistik tablosunu oluştur
CREATE TABLE IF NOT EXISTS `ortasaha_istatistik` (
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
  `başarılı_dripling` INT DEFAULT 0,
  `kilit_pas` INT DEFAULT 0,
  `ikili_mücadele_kazanma` DECIMAL(5,2) COMMENT 'Yüzde olarak',
  `başarılı_orta` INT DEFAULT 0,
  `koşu_mesafesi` DECIMAL(7,2) COMMENT 'Kilometre olarak',
  `sarı_kart` INT DEFAULT 0,
  `kırmızı_kart` INT DEFAULT 0,
  `penaltı_golü` INT DEFAULT 0,
  `oluşturulma_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `güncelleme_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (oyuncu_id) REFERENCES oyuncu(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek orta saha istatistik verileri
INSERT INTO `ortasaha_istatistik` 
(`oyuncu_id`, `oyuncu_adi`, `takım_adi`, `pas_isabeti`, `uzun_pas`, `kisa_pas`, `asist`, `gol`, `maç_sayisi`, `top_kaybi`, `başarılı_dripling`, `kilit_pas`, `ikili_mücadele_kazanma`, `başarılı_orta`, `koşu_mesafesi`, `sarı_kart`, `kırmızı_kart`, `penaltı_golü`) 
VALUES
(8, 'Rodri Hernandez', 'Manchester City', 94.3, 145, 2300, 15, 10, 45, 20, 30, 60, 78.5, 12, 12.5, 5, 0, 2),
(9, 'Kevin De Bruyne', 'Manchester City', 87.2, 180, 1850, 25, 12, 38, 35, 40, 85, 65.2, 35, 11.3, 3, 0, 3),
(10, 'Toni Kroos', 'Real Madrid', 92.8, 220, 2100, 12, 5, 42, 18, 15, 70, 72.3, 28, 10.8, 2, 0, 0),
(11, 'Luka Modric', 'Real Madrid', 89.5, 160, 1950, 18, 8, 40, 25, 55, 65, 68.7, 25, 11.0, 4, 0, 1),
(12, 'N''Golo Kanté', 'Al-Ittihad', 84.7, 90, 1700, 5, 3, 36, 30, 25, 30, 82.4, 5, 13.2, 6, 0, 0); 