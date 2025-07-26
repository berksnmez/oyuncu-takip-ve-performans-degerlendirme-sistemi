import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // forvetler_grafik tablosundaki tüm verileri çek
    const forvetlerGrafik = await query('SELECT * FROM forvetler_grafik');
    return NextResponse.json({ success: true, data: forvetlerGrafik });
  } catch (error: any) {
    console.error('Forvet grafik verileri çekilirken hata oluştu:', error);
    return NextResponse.json(
      { success: false, message: 'Forvet grafik verileri çekilirken hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 