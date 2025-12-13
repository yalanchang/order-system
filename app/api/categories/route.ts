
import { NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { Category } from '@/lib/types';

export async function GET() {
  try {
    const categories = await query<Category[]>(`
      SELECT id, name, description, icon, sort_order, is_active
      FROM categories 
      WHERE is_active = 1 
      ORDER BY sort_order ASC
    `);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: '無法取得分類資料' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, icon, sort_order } = body;

    const id = await insert(
      `INSERT INTO categories (name, description, icon, sort_order) VALUES (?, ?, ?, ?)`,
      [name, description || null, icon || null, sort_order || 0]
    );

    return NextResponse.json({ id, name, description, icon, sort_order }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: '無法建立分類' },
      { status: 500 }
    );
  }
}