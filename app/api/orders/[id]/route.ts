import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { Order, OrderItem } from '@/lib/types';

// GET /api/orders/[id] - 取得單一訂單
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // 取得訂單主檔
    const order = await queryOne<Order>(
      `SELECT id, order_number, status, total_amount, payment_method,
              customer_name, table_number, notes, created_at, paid_at
       FROM orders WHERE id = ?`,
      [id]
    );

    if (!order) {
      return NextResponse.json(
        { error: '找不到此訂單' },
        { status: 404 }
      );
    }

    // 取得訂單項目
    const items = await query<(OrderItem & { menu_item_name: string })[]>(
      `SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, 
              oi.unit_price, oi.subtotal, oi.options, oi.notes,
              m.name as menu_item_name
       FROM order_items oi
       LEFT JOIN menu_items m ON oi.menu_item_id = m.id
       WHERE oi.order_id = ?`,
      [id]
    );

    return NextResponse.json({
      ...order,
      total_amount: Number(order.total_amount),
      items: items.map(item => ({
        ...item,
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
      })),
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: '無法取得訂單資料' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { status, paymentMethod } = body;

    const updates: string[] = [];
    const values: any[] = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
      if (status === 'COMPLETED') {
        updates.push('paid_at = NOW()');
      }
    }

    if (paymentMethod) {
      updates.push('payment_method = ?');
      values.push(paymentMethod);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: '沒有要更新的欄位' },
        { status: 400 }
      );
    }

    values.push(id);
    await execute(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const order = await queryOne<Order>(
      `SELECT id, order_number, status, total_amount, payment_method,
              customer_name, table_number, notes, created_at, paid_at
       FROM orders WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      ...order,
      total_amount: Number(order!.total_amount),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: '無法更新訂單' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // 先刪除訂單項目
    await execute('DELETE FROM order_items WHERE order_id = ?', [id]);

    // 再刪除訂單
    await execute('DELETE FROM orders WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: '無法刪除訂單' },
      { status: 500 }
    );
  }
}