
import { NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { MenuItem } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        m.id, m.name, m.description, m.price, m.image,
        m.category_id, m.is_available, m.is_popular,
        c.name as category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.is_available = 1
    `;
    const params: any[] = [];

    if (categoryId) {
      sql += ` AND m.category_id = ?`;
      params.push(parseInt(categoryId));
    }

    if (search) {
      sql += ` AND (m.name LIKE ? OR m.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY m.is_popular DESC, m.sort_order ASC, m.name ASC`;

    const menuItems = await query<MenuItem[]>(sql, params);

    // 確保 price 是數字
    const items = menuItems.map(item => ({
      ...item,
      price: Number(item.price),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: '無法取得菜單資料' },
      { status: 500 }
    );
  }
}

// POST /api/menu - 新增菜單項目
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, image, category_id, is_available, is_popular } = body;

    const id = await insert(
      `INSERT INTO menu_items (name, description, price, image, category_id, is_available, is_popular) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        price,
        image || null,
        category_id,
        is_available ?? 1,
        is_popular ?? 0,
      ]
    );

    return NextResponse.json({ id, name, description, price, image, category_id }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: '無法建立菜單項目' },
      { status: 500 }
    );
  }
}