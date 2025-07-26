-- bitirme_proje veritabanında kanat_istatistik tablosunu oluştur
CREATE TABLE IF NOT EXISTS `kanat_istatistik` (
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
  `top_kapma` INT DEFAULT 0,
  `hücum_katkısı` DECIMAL(5,2) COMMENT 'Yüzde olarak',
  `sarı_kart` INT DEFAULT 0,
  `kırmızı_kart` INT DEFAULT 0,
  `penaltı_golü` INT DEFAULT 0,
  `oluşturulma_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `güncelleme_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (oyuncu_id) REFERENCES oyuncu(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek kanat oyuncusu istatistik verileri
INSERT INTO `kanat_istatistik` 
(`oyuncu_id`, `oyuncu_adi`, `takım_adi`, `pas_isabeti`, `uzun_pas`, `kisa_pas`, `asist`, `gol`, `maç_sayisi`, 
`top_kaybi`, `şut`, `isabetli_şut`, `şut_isabeti`, `başarılı_dripling`, `başarılı_çalım`, `başarılı_orta`, 
`orta_sayısı`, `orta_isabeti`, `yaratılan_şans`, `sprint_sayısı`, `top_kapma`, `hücum_katkısı`, 
`sarı_kart`, `kırmızı_kart`, `penaltı_golü`) 
VALUES
(18, 'Mohamed Salah', 'Liverpool', 82.5, 95, 1200, 20, 28, 45, 60, 125, 65, 52.0, 85, 120, 50, 110, 45.5, 70, 210, 25, 88.5, 3, 0, 5),
(19, 'Vinicius Jr.', 'Real Madrid', 79.8, 80, 1100, 18, 22, 42, 75, 115, 55, 47.8, 110, 150, 40, 90, 44.4, 65, 230, 20, 87.2, 5, 1, 3),
(20, 'Bukayo Saka', 'Arsenal', 85.2, 85, 1300, 15, 20, 46, 55, 105, 50, 47.6, 90, 115, 65, 135, 48.1, 60, 195, 35, 82.8, 2, 0, 4),
(21, 'Rafael Leão', 'AC Milan', 77.5, 70, 950, 12, 18, 40, 65, 95, 45, 47.4, 95, 135, 35, 80, 43.8, 55, 220, 28, 84.5, 4, 0, 2),
(22, 'Kingsley Coman', 'Bayern Munich', 83.1, 90, 1150, 14, 15, 38, 58, 85, 40, 47.1, 80, 110, 45, 95, 47.4, 50, 200, 30, 81.2, 3, 0, 1); 