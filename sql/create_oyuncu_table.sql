-- bitirme_proje veritabanında oyuncu tablosunu oluştur
CREATE TABLE IF NOT EXISTS `oyuncu` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ad` VARCHAR(50) NOT NULL,
  `soyad` VARCHAR(50) NOT NULL,
  `yas` INT,
  `takim` VARCHAR(100),
  `pozisyon` VARCHAR(50),
  `forma_no` INT,
  `boy` INT COMMENT 'Santimetre cinsinden',
  `kilo` INT COMMENT 'Kilogram cinsinden',
  `uyruk` VARCHAR(50),
  `değer` DECIMAL(10, 2) COMMENT 'Milyon Euro cinsinden',
  `gol` INT DEFAULT 0,
  `asist` INT DEFAULT 0,
  `maç_sayisi` INT DEFAULT 0,
  `sarı_kart` INT DEFAULT 0,
  `kırmızı_kart` INT DEFAULT 0,
  `oluşturulma_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `güncelleme_tarihi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Önceki verileri temizle
TRUNCATE TABLE `oyuncu`;

-- Örnek oyuncu verileri ekle
INSERT INTO `oyuncu` 
(`ad`, `soyad`, `yas`, `takim`, `pozisyon`, `forma_no`, `boy`, `kilo`, `uyruk`, `değer`, `gol`, `asist`, `maç_sayisi`, `sarı_kart`, `kırmızı_kart`) 
VALUES
('Thibaut', 'Courtois', 32, 'Real Madrid', 'Kaleci', 1, 199, 96, 'Belçika', 40.00, 0, 0, 350, 10, 1),
('Gianluigi', 'Donnarumma', 25, 'PSG', 'Kaleci', 1, 196, 90, 'İtalya', 60.00, 0, 0, 280, 15, 0),
('Virgil', 'van Dijk', 33, 'Liverpool', 'Stoper', 4, 193, 92, 'Hollanda', 40.00, 25, 10, 420, 45, 3),
('Ronald', 'Araujo', 25, 'Barcelona', 'Stoper', 4, 188, 85, 'Uruguay', 70.00, 10, 3, 180, 25, 3),
('Trent', 'Alexander-Arnold', 25, 'Liverpool', 'Bek', 66, 175, 69, 'İngiltere', 80.00, 18, 65, 280, 20, 0),
('Achraf', 'Hakimi', 25, 'PSG', 'Bek', 2, 181, 73, 'Fas', 65.00, 25, 40, 300, 30, 1),
('Joshua', 'Kimmich', 29, 'Bayern Münih', 'DOS', 6, 177, 75, 'Almanya', 70.00, 30, 85, 450, 50, 3),
('Rodri', 'Hernandez', 28, 'Manchester City', 'DOS', 16, 191, 82, 'İspanya', 100.00, 25, 30, 350, 55, 2),
('N\'Golo', 'Kanté', 33, 'Al-Ittihad', 'Orta Saha', 7, 168, 68, 'Fransa', 20.00, 15, 35, 500, 40, 0),
('Luka', 'Modric', 38, 'Real Madrid', 'Orta Saha', 10, 172, 66, 'Hırvatistan', 10.00, 75, 150, 850, 60, 3),
('Kevin', 'De Bruyne', 33, 'Manchester City', 'Ofansif Orta Saha', 17, 181, 70, 'Belçika', 50.00, 110, 240, 620, 58, 4),
('Bruno', 'Fernandes', 29, 'Manchester United', 'Ofansif Orta Saha', 8, 179, 69, 'Portekiz', 70.00, 85, 120, 380, 45, 2),
('Vinicius', 'Junior', 24, 'Real Madrid', 'Kanat', 7, 176, 73, 'Brezilya', 180.00, 90, 65, 230, 25, 3),
('Mohamed', 'Salah', 32, 'Liverpool', 'Kanat', 11, 175, 71, 'Mısır', 65.00, 250, 100, 580, 20, 2),
('Jadon', 'Sancho', 24, 'Borussia Dortmund', 'Açık Kanat', 10, 180, 76, 'İngiltere', 60.00, 65, 85, 310, 15, 0),
('Serge', 'Gnabry', 29, 'Bayern Münih', 'Açık Kanat', 7, 175, 75, 'Almanya', 45.00, 105, 80, 380, 20, 1),
('Erling', 'Haaland', 23, 'Manchester City', 'Santrafor', 9, 194, 88, 'Norveç', 180.00, 215, 50, 280, 18, 0),
('Harry', 'Kane', 30, 'Bayern Münih', 'Santrafor', 9, 188, 86, 'İngiltere', 90.00, 320, 100, 520, 35, 0),
('Kylian', 'Mbappé', 25, 'Real Madrid', 'Santrafor', 9, 178, 73, 'Fransa', 180.00, 250, 105, 350, 40, 2),
('Robert', 'Lewandowski', 35, 'Barcelona', 'Santrafor', 9, 185, 81, 'Polonya', 35.00, 650, 150, 890, 50, 1); 