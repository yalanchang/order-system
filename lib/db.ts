
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'self_order_kiosk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// 查詢方法
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// 取得單一結果
export async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T[]>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// 插入資料並回傳 insertId
export async function insert(sql: string, params?: any[]): Promise<number> {
  const [result] = await pool.execute(sql, params);
  return (result as any).insertId;
}

// 更新/刪除並回傳影響筆數
export async function execute(sql: string, params?: any[]): Promise<number> {
  const [result] = await pool.execute(sql, params);
  return (result as any).affectedRows;
}

// 交易處理
export async function transaction<T>(
  callback: (connection: mysql.Connection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection as any);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;