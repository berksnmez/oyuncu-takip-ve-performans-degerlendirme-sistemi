-- Gider tablosu oluşturma
CREATE TABLE IF NOT EXISTS gider_tablosu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    madde VARCHAR(100) NOT NULL,
    bu_ay DECIMAL(10,2) DEFAULT 0,
    gecen_ay DECIMAL(10,2) DEFAULT 0,
    bu_sezon DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Örnek gider verilerini ekle
INSERT INTO gider_tablosu (madde, bu_ay, gecen_ay, bu_sezon) VALUES
('Oyuncu Maaşları', 2500000, 2400000, 15000000),
('Teknik Kadro Maaşları', 350000, 340000, 2100000),
('İdari Personel Maaşları', 180000, 175000, 1080000),
('Tesis Giderleri', 120000, 110000, 720000),
('Ulaşım Giderleri', 80000, 75000, 480000),
('Malzeme Giderleri', 60000, 55000, 360000),
('Pazarlama Giderleri', 40000, 45000, 280000),
('Vergi', 0, 0, 0),
('KDV', 150000, 140000, 900000),
('İşveren Sigortası', 95000, 90000, 570000),
('Diğer', 45000, 42000, 270000),
('Diğer', 387, 400, 2500); 