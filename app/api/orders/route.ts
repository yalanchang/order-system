import { NextResponse } from 'next/server';
import { query, queryOne, transaction } from '@/lib/db';
import { generateOrderNumber } from '@/lib/utils';
import { Order, MenuItem } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '50';

    let sql = `
      SELECT id, order_number, status, total_amount, payment_method,
             customer_name, table_number, notes, created_at, paid_at
      FROM orders
    `;
    const params: any[] = [];

    if (status) {
      sql += ` WHERE status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const orders = await query<Order[]>(sql, params);

    const formattedOrders = orders.map(order => ({
      ...order,
      total_amount: Number(order.total_amount),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: '無法取得訂單資料' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, paymentMethod, customerName, tableNumber, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: '訂單項目不能為空' },
        { status: 400 }
      );
    }

    const result = await transaction(async (conn) => {
      // 計算總金額並準備訂單項目
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const [rows] = await conn.execute(
          'SELECT id, name, price FROM menu_items WHERE id = ?',
          [item.menuItemId]
        );
        const menuItem = (rows as any[])[0];

        if (!menuItem) {
          throw new Error(`找不到餐點 ID: ${item.menuItemId}`);
        }

        const unitPrice = Number(menuItem.price);
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice,
          subtotal,
          options: item.options ? JSON.stringify(item.options) : null,
          notes: item.notes || null,
        });
      }

      // 建立訂單
      const orderNumber = generateOrderNumber();
      const [orderResult] = await conn.execute(
        `INSERT INTO orders (order_number, total_amount, payment_method, customer_name, table_number, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderNumber, totalAmount, paymentMethod || null, customerName || null, tableNumber || null, notes || null]
      );
      const orderId = (orderResult as any).insertId;

      // 建立訂單項目
      for (const item of orderItems) {
        await conn.execute(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, options, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.menuItemId, item.quantity, item.unitPrice, item.subtotal, item.options, item.notes]
        );
      }

      return {
        id: orderId,
        orderNumber,
        totalAmount,
        status: 'PENDING',
        paymentMethod,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || '無法建立訂單' },
      { status: 500 }
    );
  }
}