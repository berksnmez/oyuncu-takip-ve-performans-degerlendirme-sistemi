import mysql from 'mysql2/promise';

// MySQL bağlantı havuzu oluşturma
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // WAMP varsayılan şifre
  database: 'bitirme_proje',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Veritabanı bağlantısını test eden fonksiyon
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL veritabanı bağlantısı başarılı!');
    connection.release();
    return { success: true, message: 'Bağlantı başarılı!' };
  } catch (error: any) {
    console.error('MySQL bağlantı hatası:', error);
    return { success: false, message: 'Bağlantı hatası: ' + error.message };
  }
}

// Sorgu çalıştırma fonksiyonu
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error: any) {
    console.error('Sorgu hatası:', error);
    throw error;
  }
}

export default { query, testConnection }; 